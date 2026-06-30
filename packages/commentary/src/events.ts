import {
  getActionById,
  statusConditionNames,
  formatEnvironment,
  type BattleState,
} from '@super-insect-battle/engine'
import type { Action } from '@super-insect-battle/engine'
import type { BattleEvent, Magnitude, Matchup, MoveIntent, Side } from './types'
import { eunNeun } from './particles'

function moveIntentOf(action: Action): MoveIntent {
  if (action.id === 'flee') return 'flee'
  if (action.id === 'brace') return 'brace'

  const effect = action.effect
  if (!effect) return 'guard'

  if (effect.type === 'buff' && effect.statChange) {
    if (effect.statChange.stat === 'defense') return 'defenseUp'
    if (effect.statChange.stat === 'evasion') return 'evasionUp'
    if (effect.statChange.stat === 'strength') return 'strengthUp'
  }
  if (effect.type === 'debuff' && effect.statChange) {
    return effect.statChange.stat === 'evasion' ? 'blind' : 'weaken'
  }
  if (effect.type === 'status') {
    if (effect.condition === 'confusion') return 'confuse'
    if (effect.condition === 'poison') return 'envenom'
    return 'ensnare'
  }
  return 'guard'
}

function other(side: Side): Side {
  return side === 'player' ? 'opponent' : 'player'
}

const PLACEHOLDER = '은(는)'

function fixSubjectParticle(text: string, subject: string): string {
  const prefix = `${subject}${PLACEHOLDER}`
  if (text.startsWith(prefix)) {
    return `${subject}${eunNeun(subject)}${text.slice(prefix.length)}`
  }
  return text
}

function magnitudeOf(damage: number, maxHp: number): Magnitude {
  const ratio = maxHp > 0 ? damage / maxHp : 0
  if (ratio < 0.06) return 'glance'
  if (ratio < 0.13) return 'solid'
  if (ratio < 0.22) return 'heavy'
  return 'crushing'
}

function matchupOf(styleMatchup: number | undefined): Matchup {
  if (styleMatchup === undefined) return 'neutral'
  if (styleMatchup > 1) return 'up'
  if (styleMatchup < 1) return 'down'
  return 'neutral'
}

export function deriveEvents(state: BattleState): BattleEvent[] {
  const events: BattleEvent[] = []
  const name: Record<Side, string> = {
    player: state.player.base.nameKo,
    opponent: state.opponent.base.nameKo,
  }
  const maxHp: Record<Side, number> = {
    player: state.player.maxHp,
    opponent: state.opponent.maxHp,
  }

  events.push({
    kind: 'intro',
    player: name.player,
    opponent: name.opponent,
    environment: formatEnvironment(state.environment),
  })

  const fainted: Record<Side, boolean> = { player: false, opponent: false }
  let lastTurn = 0

  for (const entry of state.log) {
    if (entry.turn !== lastTurn) {
      events.push({ kind: 'turn', turn: entry.turn })
      lastTurn = entry.turn
    }

    const actor = entry.actor
    const action = entry.actionId ? getActionById(entry.actionId) : undefined

    if (entry.actionId && action) {
      const defender = other(actor)
      const move = action.nameKo

      if (entry.damage !== undefined && entry.damage > 0) {
        const appliedStatus =
          action.effect?.type === 'status' && action.effect.condition
            ? statusConditionNames[action.effect.condition]
            : undefined

        events.push({
          kind: 'attack',
          turn: entry.turn,
          attacker: actor,
          attackerName: name[actor],
          defenderName: name[defender],
          move,
          damage: entry.damage,
          magnitude: magnitudeOf(entry.damage, maxHp[defender]),
          critical: entry.critical ?? false,
          matchup: matchupOf(entry.factors?.styleMatchup),
          defenderHpRatio: entry.remainingHp
            ? Math.max(0, entry.remainingHp[defender] / maxHp[defender])
            : 1,
          appliedStatus,
          hpAfter: entry.remainingHp,
        })
      } else if (action.category === 'attack') {
        events.push({
          kind: 'miss',
          turn: entry.turn,
          attacker: actor,
          attackerName: name[actor],
          defenderName: name[defender],
          move,
        })
      } else {
        events.push({
          kind: 'move',
          turn: entry.turn,
          actor,
          actorName: name[actor],
          move,
          intent: moveIntentOf(action),
        })
      }
    } else if (!entry.action.includes('쓰러졌다')) {
      events.push({
        kind: 'note',
        turn: entry.turn,
        side: actor,
        text: fixSubjectParticle(entry.action, name[actor]),
        damage: entry.damage,
        hpAfter: entry.remainingHp,
      })
    }

    if (entry.remainingHp) {
      for (const side of ['player', 'opponent'] as const) {
        if (!fainted[side] && entry.remainingHp[side] <= 0) {
          fainted[side] = true
          events.push({
            kind: 'faint',
            turn: entry.turn,
            side,
            name: name[side],
            hpAfter: entry.remainingHp,
          })
        }
      }
    }
  }

  events.push({
    kind: 'end',
    winner: state.winner,
    winnerName:
      state.winner === 'player' || state.winner === 'opponent'
        ? name[state.winner]
        : null,
    turns: state.turn,
  })

  return events
}
