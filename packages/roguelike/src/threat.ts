import {
  getStyleMatchup,
  type BattleArthropod,
  type Environment,
} from '@super-insect-battle/engine'
import { createActor, type Actor } from './actor'
import { createSmartBrain } from './ai/smart-brain'
import { chebyshev, posKey } from './geometry'
import { tileMapFromStrings } from './map'
import { applyCommand, createRun, type Level, type RunState } from './run'

/** 적이 플레이어에게 주는 위협 단계. 낮음 → 치명 순. */
export type ThreatLevel = 'low' | 'moderate' | 'high' | 'deadly'

/** 위협 단계의 한국어 표기. */
export const THREAT_LABELS: Record<ThreatLevel, string> = {
  low: '약함',
  moderate: '호적수',
  high: '위험',
  deadly: '치명',
}

/** 적 한 마리와 정면으로 맞붙었을 때의 교전 예측. 현재 HP 기준이라 전투 중 값이 변한다. */
export interface ThreatAssessment {
  level: ThreatLevel
  /** 근접 난타전에서 플레이어가 이길 확률 (0–1). */
  winChance: number
  /** 적의 공격이 명중했을 때 평균 피해. 독 등 지속 피해는 제외. */
  typicalHit: number
  /** 현재 HP로 버틸 수 있는 적 명중 횟수. 이 횟수째에 쓰러진다. */
  hitsToKillPlayer: number
  /** 플레이어 → 적 스타일 상성 배율. 1보다 크면 플레이어 유리. */
  matchup: number
  venomous: boolean
}

const SIMULATIONS = 60
const MAX_ROUNDS = 40
const ARENA = ['####', '#..#', '####']

/**
 * 플레이어 기준으로 적의 위협도를 평가한다.
 *
 * 두 액터의 현재 전투 상태를 복제해 실제 격자 전투 규칙으로 근접 난타전을
 * 여러 번 시뮬레이션한다. 독·급소·명중 분산이 커서 기대값 계산으로는 체감과
 * 어긋나기 때문이다. 고정 시드를 쓰므로 런 RNG와 결정론에 영향을 주지 않는다.
 * 어느 쪽이든 이미 쓰러져 있으면 시뮬레이션 없이 결과를 확정한다.
 */
export function assessThreat(
  player: Actor,
  enemy: Actor,
  environment: Environment
): ThreatAssessment {
  const matchup = getStyleMatchup(
    player.species.behavior.style,
    enemy.species.behavior.style
  )
  const venomous = enemy.species.weapon.venomous
  if (player.combat.currentHp <= 0 || enemy.combat.currentHp <= 0) {
    const won = enemy.combat.currentHp <= 0
    return {
      level: won ? 'low' : 'deadly',
      winChance: won ? 1 : 0,
      typicalHit: 0,
      hitsToKillPlayer: won ? Infinity : 0,
      matchup,
      venomous,
    }
  }

  let wins = 0
  let hits = 0
  let hitDamage = 0

  for (let seed = 1; seed <= SIMULATIONS; seed++) {
    const duel = simulateDuel(player, enemy, environment, seed)
    if (duel.won) wins++
    hits += duel.enemyHits
    hitDamage += duel.enemyHitDamage
  }

  const winChance = wins / SIMULATIONS
  const typicalHit = hits > 0 ? Math.round(hitDamage / hits) : 0
  const hitsToKillPlayer =
    typicalHit > 0
      ? Math.max(1, Math.ceil(player.combat.currentHp / typicalHit))
      : Infinity

  return {
    level: classify(winChance, hitsToKillPlayer),
    winChance,
    typicalHit,
    hitsToKillPlayer,
    matchup,
    venomous,
  }
}

/** 위협 평가를 `위험 · 3대면 쓰러짐` 같은 한 줄 요약으로 만든다. */
export function describeThreat(threat: ThreatAssessment): string {
  const parts = [THREAT_LABELS[threat.level]]
  if (Number.isFinite(threat.hitsToKillPlayer)) {
    parts.push(`${threat.hitsToKillPlayer}대면 쓰러짐`)
  }
  if (threat.venomous) parts.push('독')
  return parts.join(' · ')
}

/** 플레이어 시야 안의 살아있는 적을 가까운 순으로 반환한다. */
export function visibleEnemies(run: RunState): Actor[] {
  const { visible, actors } = run.level
  return actors
    .filter(
      (a) =>
        a.faction === 'hostile' &&
        a.combat.currentHp > 0 &&
        (!visible || visible.has(posKey(a.pos.x, a.pos.y)))
    )
    .sort(
      (a, b) =>
        chebyshev(run.player.pos, a.pos) - chebyshev(run.player.pos, b.pos)
    )
}

interface DuelResult {
  won: boolean
  enemyHits: number
  enemyHitDamage: number
}

function simulateDuel(
  player: Actor,
  enemy: Actor,
  environment: Environment,
  seed: number
): DuelResult {
  const p = cloneActor(player, { x: 1, y: 1 })
  const e = cloneActor(enemy, { x: 2, y: 1 })
  e.brain = createSmartBrain()

  const level: Level = {
    depth: 1,
    map: tileMapFromStrings(ARENA),
    actors: [p, e],
    environment,
    exit: { x: 0, y: 0 },
    visible: new Set(),
    discovered: new Set(),
  }
  const run = createRun({ player: p, level, seed })

  let enemyHits = 0
  let enemyHitDamage = 0
  for (let round = 0; round < MAX_ROUNDS; round++) {
    if (run.status !== 'playing' || e.combat.currentHp <= 0) break
    const dir = e.pos.x > p.pos.x ? 'e' : 'w'
    for (const event of applyCommand(run, { type: 'move', dir })) {
      if (
        event.type === 'attack' &&
        event.outcome.attackerId === e.id &&
        event.outcome.hit
      ) {
        enemyHits++
        enemyHitDamage += event.outcome.damage
      }
    }
  }

  return {
    won: e.combat.currentHp <= 0 && p.combat.currentHp > 0,
    enemyHits,
    enemyHitDamage,
  }
}

function cloneActor(actor: Actor, pos: { x: number; y: number }): Actor {
  const clone = createActor(actor.id, actor.species, pos, actor.faction, {
    speed: actor.speed,
    glyph: actor.glyph,
  })
  clone.combat = cloneCombat(actor.combat)
  return clone
}

function cloneCombat(combat: BattleArthropod): BattleArthropod {
  return {
    ...combat,
    statStages: { ...combat.statStages },
    actionCooldowns: { ...combat.actionCooldowns },
  }
}

function classify(winChance: number, hitsToKillPlayer: number): ThreatLevel {
  if (winChance < 0.35 || hitsToKillPlayer <= 1) return 'deadly'
  if (winChance < 0.6) return 'high'
  if (winChance < 0.8) return 'moderate'
  return 'low'
}
