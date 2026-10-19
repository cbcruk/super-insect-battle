import {
  chooseAIAction,
  getActionsByIds,
  getAvailableActions,
  getActionTargeting,
  getActionRange,
  type Action,
  type AIDifficulty,
  type AIPersonality,
} from '@super-insect-battle/engine'
import type { Actor, ActorBrain } from '../actor'
import type { Command } from '../command'
import type { RunState } from '../run'
import { chebyshev, dirToward, type Vec2 } from '../geometry'
import { stepAlongPath, fleeStep } from '../pathfind'
import { lineOfSight, SIGHT_RADIUS } from '../fov'
import {
  nearestEnemy,
  nearestEnemyInRange,
  nearestVisibleCube,
} from '../targeting'
import { isInGas } from '../zone'

/** {@linkcode createSmartBrain} 옵션. */
export interface SmartBrainOptions {
  /**
   * 아무도 발견하지 못했을 때 제자리에서 기다리지 않고 가장 가까운 적을 향해
   * 움직인다. 숨을 곳이 없는 난전에서 액터들이 서로를 찾아 나서게 한다.
   * 적이 안 보이는 동안 시야 안에 파워 큐브가 있으면 먼저 줍는다.
   */
  hunt?: boolean
  /** `hunt`가 찾아 나설 적의 최대 거리 (체비셰프). 기본은 제한 없음. */
  huntRadius?: number
  /** 기술 선택 난이도. 기본 `'medium'`. */
  difficulty?: AIDifficulty
  /**
   * 기술 선택과 도주 성향. 공격적이면 끝까지 버티고, 방어적이면 일찍 물러난다.
   * 기본 `'balanced'`.
   */
  personality?: AIPersonality
}

const FLEE_HP_RATIO: Record<AIPersonality, number> = {
  aggressive: 0,
  balanced: 0.25,
  defensive: 0.4,
}

// 강화 기술은 대상 능력치가 이 단계에 이르면 더 쓰지 않는다. 엔진 점수는 단계 상한을
// 모르므로, 막지 않으면 인접한 채 강화만 되풀이한다.
const SELF_BUFF_STAGE_CAP = 2

// 배틀 모드 전용이라 격자에서는 효과가 없다. 도주는 이동으로 대신한다.
const GRID_INERT_ACTIONS = new Set(['flee', 'brace'])

/**
 * P2b 브레인: 닿는 기술이 있으면 엔진 전략 AI({@linkcode chooseAIAction})로 기술을
 * 고르고, 저체력이면 도주, 아니면 rot.js 길찾기로 접근.
 *
 * 기술 후보는 지금 위치에서 쓸 수 있는 것으로 거른다: 사거리·시야선이 닿는 공격과
 * 자기 대상 기술. 닿는 공격이 하나도 없으면 자기 강화만 하며 서 있지 않고 다가간다.
 * 자기 능력치를 올리는 기술은 그 능력치가 2단계에 이르면 후보에서 빠진다. 피해를 주며
 * 자기를 강화하는 공격(구르기 등)도 마찬가지다.
 *
 * 적을 시야(반경 {@linkcode SIGHT_RADIUS}·시선)에서 처음 발견하기 전까지는
 * 제자리에 머문다. 한 번 발견한 적은 시야에서 사라져도 계속 추적하고, 시야 안에
 * 다른 적이 더 가까이 있으면 그쪽으로 갈아탄다. 층 전체의 적이 동시에 몰려오지
 * 않게 해서 은신·우회를 실제 선택지로 만든다.
 *
 * 레벨에 독가스 구역이 있으면, 인접한 적과 싸우는 중이 아닌 한 다음 턴 가스에
 * 덮일 자리에서 중심 쪽으로 물러난다.
 */
export function createSmartBrain(options: SmartBrainOptions = {}): ActorBrain {
  const personality = options.personality ?? 'balanced'
  let targetId: string | null = null
  return {
    decide(actor, run): Command {
      const seen = nearestEnemyInRange(run, actor, SIGHT_RADIUS)
      if (seen) targetId = seen.id
      let target =
        run.level.actors.find(
          (a) => a.id === targetId && a.combat.currentHp > 0
        ) ?? null
      const occupied = occupiedBy(run, actor)
      const stepTo = (to: Vec2): Command | null => {
        const dir = stepAlongPath(run.level.map, actor.pos, to, occupied)
        return dir ? { type: 'move', dir } : null
      }

      if (target && chebyshev(actor.pos, target.pos) === 1) {
        const skill = pickSkill(run, actor, target, options)
        if (skill) return skill
        const dir = dirToward(actor.pos, target.pos)
        return dir ? { type: 'move', dir } : { type: 'wait' }
      }

      // 다음 턴에 독가스가 덮칠 자리면 중심으로 피한다
      const { zone } = run.level
      if (zone && isInGas(zone, actor.pos, run.turn + 1)) {
        const escape = stepTo(zone.center)
        if (escape) return escape
      }

      if (options.hunt && !seen) {
        const cube = nearestVisibleCube(run, actor)
        const grab = cube && stepTo(cube)
        if (grab) return grab
      }

      if (!target && options.hunt) {
        target = nearestEnemy(run, actor, options.huntRadius)
        targetId = target?.id ?? null
      }
      if (!target) return { type: 'wait' }
      const foe = target

      const hpRatio = actor.combat.currentHp / actor.combat.maxHp

      const skill = pickSkill(run, actor, foe, options)
      if (skill) return skill

      if (hpRatio < FLEE_HP_RATIO[personality]) {
        const flee = fleeStep(run.level.map, actor.pos, foe.pos, occupied)
        if (flee) return { type: 'move', dir: flee }
      }

      return stepTo(foe.pos) ?? { type: 'wait' }
    },
  }
}

function pickSkill(
  run: RunState,
  actor: Actor,
  foe: Actor,
  options: SmartBrainOptions
): Command | null {
  const distance = chebyshev(actor.pos, foe.pos)
  const inSight = lineOfSight(run.level.map, actor.pos, foe.pos)
  const usable = getAvailableActions(
    getActionsByIds(actor.combat.actions),
    actor.combat
  ).filter((a) => !GRID_INERT_ACTIONS.has(a.id) && !isSelfBuffCapped(actor, a))

  const reaching = usable.filter(
    (a) =>
      getActionTargeting(a) !== 'self' &&
      distance <= getActionRange(a) &&
      inSight
  )
  if (reaching.length === 0) return null

  const self = usable.filter((a) => getActionTargeting(a) === 'self')
  const action = chooseAIAction(
    actor.combat,
    foe.combat,
    [...reaching, ...self],
    options,
    run.rng
  )
  const at = getActionTargeting(action) === 'self' ? actor.pos : foe.pos
  return { type: 'ability', actionId: action.id, target: { ...at } }
}

function isSelfBuffCapped(actor: Actor, action: Action): boolean {
  const effect = action.effect
  if (effect?.target !== 'self' || !effect.statChange) return false
  return actor.combat.statStages[effect.statChange.stat] >= SELF_BUFF_STAGE_CAP
}

function occupiedBy(
  run: RunState,
  self: Actor
): (x: number, y: number) => boolean {
  return (x, y) =>
    run.level.actors.some(
      (a) =>
        a !== self && a.combat.currentHp > 0 && a.pos.x === x && a.pos.y === y
    )
}
