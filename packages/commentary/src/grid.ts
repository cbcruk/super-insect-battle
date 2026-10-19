import {
  formatEnvironment,
  getActionById,
  getStyleMatchup,
  statusConditionNames,
} from '@super-insect-battle/engine'
import {
  chebyshev,
  zoneRadius,
  type GridEvent,
  type RunState,
} from '@super-insect-battle/roguelike'
import {
  classifyNote,
  fixSubjectParticle,
  magnitudeOf,
  matchupOf,
  moveIntentOf,
} from './events'
import { createNarrator, Rotation } from './narrator'
import { INTRO_LINES } from './phrases'
import { enteredGrass, inGrass, seenLeaving } from './grid.utils'
import {
  AMBUSH_LINES,
  ARENA_INTRO_LINES,
  GAS_DAMAGE_LINES,
  GAS_LAST_LINES,
  GAS_SHRINK_LINES,
  HIDE_LINES,
  NO_EFFECT_LINES,
  RANGED_LINES,
} from './grid-phrases'
import type { BattleEvent, CommentaryLine, Side } from './types'

/** 격자 매치업 한 판을 중계하는 상태 있는 내레이터. */
export interface GridNarrator {
  /** 판 시작 문구. */
  intro(): CommentaryLine[]
  /**
   * 한 스텝의 이벤트를 중계 문장으로 바꾼다.
   *
   * @param events 이번 스텝 이벤트. 플레이어 시야로 거른 뒤 넘긴다.
   * @param run 이벤트가 적용된 뒤의 런 상태.
   */
  next(events: GridEvent[], run: RunState): CommentaryLine[]
}

/**
 * 격자 매치업(`createDuelRun`) 런의 CM3식 내레이터를 만든다.
 *
 * 공격·빗나감·기술·상태이상·쓰러짐은 텍스트 매치업과 같은 문구를 쓰고, 수풀 매복,
 * 원거리 견제, 수풀 은신, 독가스 축소·피해는 격자 전용 문구로 중계한다. 문구는
 * 차례로 돌려 쓰므로 같은 이벤트 열은 항상 같은 문장이 된다.
 *
 * @example
 * ```ts
 * import { getArthropodById } from '@super-insect-battle/engine'
 * import {
 *   applyCommand,
 *   createDuelRun,
 *   isEventVisible,
 * } from '@super-insect-battle/roguelike'
 * import { createGridNarrator } from '@super-insect-battle/commentary'
 *
 * const run = createDuelRun({
 *   playerSpecies: getArthropodById('mantis')!,
 *   opponentSpecies: getArthropodById('scorpion')!,
 *   seed: 7,
 * })
 * const narrator = createGridNarrator(run)
 * const lines = [...narrator.intro()]
 * const events = applyCommand(run, { type: 'wait' }).filter((e) =>
 *   isEventVisible(e, run.level.visible)
 * )
 * lines.push(...narrator.next(events, run))
 * ```
 */
export function createGridNarrator(run: RunState): GridNarrator {
  const r = new Rotation()
  const battle = createNarrator(r)
  const actors = new Map(run.level.actors.map((a) => [a.id, a]))
  const opponent = run.level.actors.find((a) => a.id !== run.player.id)
  const sideOf = (id: string): Side =>
    id === run.player.id ? 'player' : 'opponent'
  const nameOf = (id: string): string => actors.get(id)?.species.nameKo ?? '???'

  let lastTurn = run.turn
  let lastRadius = run.level.zone ? zoneRadius(run.level.zone, run.turn) : null
  let ended = false
  // 수풀에 들어간 뒤 아직 공격하지 않은 액터 → 다음 공격이 매복
  const lurking = new Set<string>()
  // 직전 공격이 원거리였던 액터 → 견제 문구를 되풀이하지 않는다
  const sniping = new Set<string>()

  return {
    intro(): CommentaryLine[] {
      const lines: CommentaryLine[] = [
        {
          text: r.pick('intro', INTRO_LINES)(
            run.player.species.nameKo,
            opponent?.species.nameKo ?? '???',
            formatEnvironment(run.level.environment)
          ),
          emphasis: 'header',
        },
      ]
      if (run.level.zone) {
        lines.push({
          text: r.pick(
            'arenaIntro',
            ARENA_INTRO_LINES
          )(run.level.zone.shrinkStart),
          emphasis: 'system',
        })
      }
      return lines
    },

    next(events, state): CommentaryLine[] {
      if (ended) return []
      const lines: CommentaryLine[] = []
      const turn = state.turn
      const say = (event: BattleEvent): void => {
        lines.push(...battle.next(event))
      }

      const { zone } = state.level
      if (zone && lastRadius !== null) {
        const radius = zoneRadius(zone, turn)
        if (radius < lastRadius) {
          lines.push({
            text:
              radius === 0
                ? r.pick('gasLast', GAS_LAST_LINES)()
                : r.pick('gasShrink', GAS_SHRINK_LINES)(radius),
            emphasis: 'strong',
            turn,
          })
        }
        lastRadius = radius
      }

      for (const event of events) {
        if (event.type === 'move') {
          if (!inGrass(state, event.to)) lurking.delete(event.actorId)
          else if (!inGrass(state, event.from)) lurking.add(event.actorId)
          if (
            enteredGrass(state, event.from, event.to) &&
            seenLeaving(state, event)
          ) {
            lines.push({
              text: r.pick('hide', HIDE_LINES)(nameOf(event.actorId)),
              emphasis: 'normal',
              actor: sideOf(event.actorId),
              turn,
            })
          }
        } else if (event.type === 'attack') {
          lines.push(...narrateAttack(event.outcome, turn))
        } else if (event.type === 'status') {
          const side = sideOf(event.actorId)
          const name = nameOf(event.actorId)
          if (event.message.includes('독가스')) {
            lines.push({
              text: r.pick('gas', GAS_DAMAGE_LINES)(name),
              emphasis: 'normal',
              actor: side,
              turn,
            })
          } else {
            say({
              kind: 'note',
              turn,
              side,
              name,
              cause: classifyNote(event.message),
              text: fixSubjectParticle(event.message, name),
              damage: event.damage,
            })
          }
        } else if (
          event.type === 'message' &&
          event.actorId &&
          !event.actionId
        ) {
          const name = nameOf(event.actorId)
          say({
            kind: 'note',
            turn,
            side: sideOf(event.actorId),
            name,
            cause: event.text.includes('풀렸')
              ? 'other'
              : classifyNote(event.text),
            text: fixSubjectParticle(event.text, name),
          })
        } else if (event.type === 'message' && event.actionId) {
          const action = getActionById(event.actionId)
          if (action && event.actorId) {
            say({
              kind: 'move',
              turn,
              actor: sideOf(event.actorId),
              actorName: nameOf(event.actorId),
              move: action.nameKo,
              intent: moveIntentOf(action),
            })
          }
        } else if (event.type === 'death') {
          say({
            kind: 'faint',
            turn,
            side: sideOf(event.actorId),
            name: nameOf(event.actorId),
          })
        }
      }

      if (state.status !== 'playing') {
        ended = true
        const winner: Side = state.status === 'won' ? 'player' : 'opponent'
        say({
          kind: 'end',
          winner,
          winnerName:
            winner === 'player'
              ? state.player.species.nameKo
              : (opponent?.species.nameKo ?? null),
          turns: turn,
        })
      }

      if (lines.length > 0 && turn !== lastTurn) {
        lines.unshift({ text: `── ${turn}턴 ──`, emphasis: 'header', turn })
      }
      if (lines.length > 0) lastTurn = turn
      return lines
    },
  }

  function narrateAttack(
    outcome: Extract<GridEvent, { type: 'attack' }>['outcome'],
    turn: number
  ): CommentaryLine[] {
    const action = getActionById(outcome.actionId)
    const attacker = actors.get(outcome.attackerId)
    const defender = actors.get(outcome.defenderId)
    if (!action || !attacker || !defender) return []

    const side = sideOf(attacker.id)
    const atkName = attacker.species.nameKo
    const defName = defender.species.nameKo
    const lead: CommentaryLine[] = []
    const distance = chebyshev(outcome.attackerPos, outcome.defenderPos)

    const ambush = lurking.delete(attacker.id) && outcome.hit
    const ranged = distance > 1
    const opensFire = ranged && !sniping.has(attacker.id)
    if (ranged) sniping.add(attacker.id)
    else sniping.delete(attacker.id)

    if (ambush) {
      lead.push({
        text: r.pick('ambush', AMBUSH_LINES)(atkName),
        emphasis: 'strong',
        actor: side,
        turn,
      })
    } else if (opensFire) {
      lead.push({
        text: r.pick('ranged', RANGED_LINES)(atkName, distance),
        emphasis: 'normal',
        actor: side,
        turn,
      })
    }

    if (
      outcome.hit &&
      outcome.damage === 0 &&
      action.effect?.type === 'status' &&
      !outcome.statusApplied
    ) {
      return [
        ...lead,
        {
          text: r.pick('noEffect', NO_EFFECT_LINES)(atkName, action.nameKo),
          emphasis: 'normal',
          actor: side,
          turn,
        },
      ]
    }

    const body = battle.next(
      !outcome.hit
        ? {
            kind: 'miss',
            turn,
            attacker: side,
            attackerName: atkName,
            defenderName: defName,
            move: action.nameKo,
          }
        : outcome.damage > 0
          ? {
              kind: 'attack',
              turn,
              attacker: side,
              attackerName: atkName,
              defenderName: defName,
              move: action.nameKo,
              damage: outcome.damage,
              magnitude: magnitudeOf(outcome.damage, defender.combat.maxHp),
              critical: outcome.critical,
              matchup: matchupOf(
                getStyleMatchup(
                  attacker.species.behavior.style,
                  defender.species.behavior.style
                )
              ),
              defenderHpRatio: Math.max(
                0,
                outcome.defenderHp / defender.combat.maxHp
              ),
              appliedStatus:
                outcome.statusApplied && !outcome.defeated
                  ? statusConditionNames[outcome.statusApplied]
                  : undefined,
            }
          : {
              kind: 'move',
              turn,
              actor: side,
              actorName: atkName,
              move: action.nameKo,
              intent: moveIntentOf(action),
            }
    )
    return [...lead, ...body]
  }
}
