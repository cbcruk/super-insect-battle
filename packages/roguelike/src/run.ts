import type { Environment, Action, Rng } from '@super-insect-battle/engine'
import {
  createRng,
  getActionById,
  getActionsByIds,
  getAvailableActions,
  getActionTargeting,
  getActionRange,
  isActionOnCooldown,
  startCooldown,
  tickCooldowns,
  checkCanMove,
  processEndOfTurnStatus,
  applyActionEffect,
  type BattleLogEntry,
} from '@super-insect-battle/engine'
import type { Actor } from './actor'
import type { Command } from './command'
import type { GridEvent } from './events'
import type { TileMap } from './map'
import { inBounds, isWalkable, tileAt } from './map'
import { addDir, chebyshev, equals, type Vec2 } from './geometry'
import { resolveAttack } from './combat'
import { isHostile } from './faction'
import { isEventVisible } from './event-visibility'
import { decayVenom } from './venom'
import { lineOfSight } from './fov'
import { ITEMS } from './items'
import { nextActor, grantEnergy, spendTurn } from './scheduler'
import { refreshFov, enterLevel } from './generate'
import { absorbCubes } from './power-cube'
import { gasDamage, isInGas, type SafeZone } from './zone'

const DESCEND_HEAL_RATIO = 0.3

export interface Level {
  depth: number
  map: TileMap
  actors: Actor[] // 플레이어 포함
  environment: Environment // 바이옴 — 엔진 환경 보너스에 사용
  /** 다음 존 하강 지점. 쇼다운 아레나처럼 출구가 없는 레벨은 null. */
  exit: Vec2 | null
  /** FOV: 현재 보이는 / 한번이라도 본 타일 키. 미설정 시 안개 없음(테스트용). */
  visible?: Set<string>
  discovered?: Set<string>
  /** 독가스 안전 구역. 없으면 가스 없음. */
  zone?: SafeZone
}

export type RunStatus = 'playing' | 'won' | 'dead'

/**
 * 런의 승리 규칙.
 *
 * - `descent`: 층을 내려가 마지막 층 출구에 도달하면 승리.
 * - `showdown`: 한 아레나에서 플레이어에게 적대적인 액터가 모두 쓰러지면 승리.
 */
export type RunMode = 'descent' | 'showdown'

export interface RunState {
  seed: number
  rng: Rng // seed로 1회 생성, 런 전체 공유 → 완전 결정론
  turn: number
  status: RunStatus
  mode: RunMode
  level: Level
  player: Actor // level.actors 에도 포함; HP는 존을 넘어 지속
  maxDepth: number // 이 깊이의 출구 도달 시 런 승리
  log: string[]
}

const LOG_LIMIT = 50

export function createRun(opts: {
  player: Actor
  level: Level
  seed: number
  maxDepth?: number
  mode?: RunMode
}): RunState {
  const run: RunState = {
    seed: opts.seed,
    rng: createRng(opts.seed),
    turn: 0,
    status: 'playing',
    mode: opts.mode ?? 'descent',
    level: opts.level,
    player: opts.player,
    maxDepth: opts.maxDepth ?? opts.level.depth,
    log: [],
  }
  refreshFov(run)
  return run
}

/** 지금이 플레이어가 명령할 차례인가. */
export function isPlayerTurn(run: RunState): boolean {
  return (
    run.status === 'playing' &&
    nextActor(run.level.actors)?.id === run.player.id
  )
}

/**
 * 플레이어 명령을 처리하고, 스케줄러를 진행하며 적 턴을 자동 해결한 뒤
 * 다음 플레이어 차례까지 나아간다. RunState를 제자리 변경하고 이벤트를 반환.
 */
export function applyCommand(run: RunState, command: Command): GridEvent[] {
  const events: GridEvent[] = []
  if (run.status !== 'playing') return events

  run.turn++
  resolveActorTurn(run, run.player, command, events)
  advance(run, events)

  refreshFov(run)
  record(run, events)
  return events
}

/** 다음 플레이어 차례가 될 때까지 적 액터들의 턴을 처리. */
function advance(run: RunState, events: GridEvent[]): void {
  while (run.status === 'playing') {
    const actor = nextActor(run.level.actors)
    if (!actor) {
      grantEnergy(run.level.actors)
      continue
    }
    if (actor.id === run.player.id) return // 플레이어 차례
    const command = actor.brain
      ? actor.brain.decide(actor, run, run.rng)
      : ({ type: 'wait' } as const)
    resolveActorTurn(run, actor, command, events)
  }
}

/** 한 액터의 한 턴: 행동 가능 판정 → 행동 → 턴종료 상태 처리 → 에너지 소모. */
function resolveActorTurn(
  run: RunState,
  actor: Actor,
  command: Command,
  events: GridEvent[]
): void {
  const moveCheck = checkCanMove(actor.combat, run.rng)
  if (moveCheck.message) {
    events.push({
      type: 'message',
      text: moveCheck.message,
      pos: { ...actor.pos },
    })
  }
  if (actor.combat.currentHp <= 0) {
    killActor(run, actor, events)
    spendTurn(actor)
    return
  }
  if (moveCheck.canMove) {
    actOnce(run, actor, command, events)
  }

  if (actor.combat.currentHp > 0) {
    const status = processEndOfTurnStatus(actor.combat)
    if (status.message) {
      events.push({
        type: 'status',
        actorId: actor.id,
        message: status.message,
        damage: status.damage,
        pos: { ...actor.pos },
      })
      if (actor.combat.currentHp <= 0) killActor(run, actor, events)
    }
    if (actor.combat.currentHp > 0) applyGas(run, actor, events)
    const cured = decayVenom(actor.combat)
    if (cured && actor.combat.currentHp > 0) {
      events.push({ type: 'message', text: cured, pos: { ...actor.pos } })
    }
    tickCooldowns(actor.combat)
  }

  spendTurn(actor)
}

function actOnce(
  run: RunState,
  actor: Actor,
  command: Command,
  events: GridEvent[]
): void {
  if (command.type === 'wait') return
  if (command.type === 'ability') {
    resolveAbility(run, actor, command.actionId, command.target, events)
    return
  }

  // move (bump 전투 포함)
  const target = addDir(actor.pos, command.dir)
  const occupant = actorAt(run.level, target)

  if (occupant) {
    if (isHostile(actor, occupant)) {
      const action = pickMeleeAction(actor)
      const outcome = resolveAttack(actor, occupant, action, run.level, run.rng)
      startCooldown(actor.combat, action)
      events.push({ type: 'attack', outcome })
      if (outcome.defeated) killActor(run, occupant, events)
    } else {
      events.push({ type: 'blocked', actorId: actor.id, pos: target })
    }
    return
  }

  if (
    inBounds(run.level.map, target.x, target.y) &&
    isWalkable(run.level.map, target.x, target.y)
  ) {
    const from = actor.pos
    actor.pos = target
    events.push({ type: 'move', actorId: actor.id, from, to: target })

    pickUpCubes(run, actor, events)

    // 바닥 아이템 획득 (플레이어)
    if (actor.id === run.player.id) {
      const tile = tileAt(run.level.map, target.x, target.y)
      if (tile?.itemId) {
        const item = ITEMS[tile.itemId]
        if (item) {
          const message = item.apply(actor)
          tile.itemId = undefined
          events.push({
            type: 'pickup',
            actorId: actor.id,
            itemId: item.id,
            message,
          })
        }
      }
    }

    if (
      actor.id === run.player.id &&
      run.level.exit &&
      equals(target, run.level.exit)
    ) {
      events.push({ type: 'descend', depth: run.level.depth })
      if (run.level.depth >= run.maxDepth) {
        run.status = 'won'
      } else {
        enterLevel(run, run.level.depth + 1) // 다음 존 생성 + 플레이어 이동
        const recovery = recoverOnDescend(actor)
        if (recovery) events.push({ type: 'message', text: recovery })
      }
    }
  } else {
    events.push({ type: 'blocked', actorId: actor.id, pos: target })
  }
}

function resolveAbility(
  run: RunState,
  actor: Actor,
  actionId: string,
  target: Vec2,
  events: GridEvent[]
): void {
  const action = getActionById(actionId)
  if (!action) return
  if (isActionOnCooldown(actor.combat, action)) return

  // 자기 대상 버프/특수 — 명중 판정 없이 효과 직접 적용
  if (getActionTargeting(action) === 'self') {
    const scratch: BattleLogEntry = { turn: 0, actor: 'player', action: '' }
    applyActionEffect(actor.combat, actor.combat, action, scratch, run.rng)
    startCooldown(actor.combat, action)
    events.push({
      type: 'message',
      text: `${actor.species.nameKo}: ${action.nameKo}`,
      pos: { ...actor.pos },
    })
    return
  }

  // 근접/원거리 공격 — 사거리·시야선 검증
  const occupant = actorAt(run.level, target)
  if (!occupant || !isHostile(actor, occupant)) return
  if (chebyshev(actor.pos, occupant.pos) > getActionRange(action)) return
  if (!lineOfSight(run.level.map, actor.pos, occupant.pos)) return

  const outcome = resolveAttack(actor, occupant, action, run.level, run.rng)
  startCooldown(actor.combat, action)
  events.push({ type: 'attack', outcome })
  if (outcome.defeated) killActor(run, occupant, events)
}

/**
 * 새 층에 들어서며 숨을 고른다: 최대 HP 일부를 회복하고 독·화상을 털어낸다.
 * HP가 연전으로만 깎여 후반 층에 도달하기 전에 런이 끝나는 것을 완화한다.
 */
function recoverOnDescend(actor: Actor): string | null {
  const combat = actor.combat
  const before = combat.currentHp
  combat.currentHp = Math.min(
    combat.maxHp,
    before + Math.floor(combat.maxHp * DESCEND_HEAL_RATIO)
  )
  const cured =
    combat.statusCondition === 'poison' || combat.statusCondition === 'burn'
  if (cured) {
    combat.statusCondition = null
    combat.appliedVenomPotency = 0
  }

  const parts: string[] = []
  const healed = combat.currentHp - before
  if (healed > 0) parts.push(`HP +${healed}`)
  if (cured) parts.push('독이 빠졌다')
  return parts.length > 0 ? `숨을 고른다 (${parts.join(', ')})` : null
}

function applyGas(run: RunState, actor: Actor, events: GridEvent[]): void {
  const { zone } = run.level
  if (!zone || !isInGas(zone, actor.pos, run.turn)) return
  const damage = gasDamage(actor)
  actor.combat.currentHp = Math.max(0, actor.combat.currentHp - damage)
  events.push({
    type: 'status',
    actorId: actor.id,
    message: `${actor.species.nameKo}이(가) 독가스에 휩싸였다! (${damage} 데미지)`,
    damage,
    pos: { ...actor.pos },
  })
  if (actor.combat.currentHp <= 0) killActor(run, actor, events)
}

function pickUpCubes(run: RunState, actor: Actor, events: GridEvent[]): void {
  const tile = tileAt(run.level.map, actor.pos.x, actor.pos.y)
  if (!tile?.cubes) return
  const message = absorbCubes(actor, tile.cubes)
  tile.cubes = undefined
  if (actor.id === run.player.id) {
    events.push({
      type: 'pickup',
      actorId: actor.id,
      itemId: 'power_cube',
      message,
    })
  } else {
    events.push({ type: 'message', text: message, pos: { ...actor.pos } })
  }
}

function dropCubes(run: RunState, actor: Actor, events: GridEvent[]): void {
  if (actor.cubes <= 0) return
  const tile = tileAt(run.level.map, actor.pos.x, actor.pos.y)
  if (!tile) return
  tile.cubes = (tile.cubes ?? 0) + actor.cubes
  events.push({
    type: 'message',
    text: `파워 큐브 ${actor.cubes}개가 떨어졌다`,
    pos: { ...actor.pos },
  })
  actor.cubes = 0
}

function killActor(run: RunState, actor: Actor, events: GridEvent[]): void {
  events.push({ type: 'death', actorId: actor.id })
  dropCubes(run, actor, events)
  const index = run.level.actors.indexOf(actor)
  if (index >= 0) run.level.actors.splice(index, 1)
  if (actor.id === run.player.id) {
    run.status = 'dead'
    return
  }
  if (run.mode === 'showdown' && !hasRivals(run)) {
    run.status = 'won'
    events.push({ type: 'message', text: '최후의 1마리로 살아남았다!' })
  }
}

function hasRivals(run: RunState): boolean {
  return run.level.actors.some(
    (a) => a.combat.currentHp > 0 && isHostile(run.player, a)
  )
}

export function actorAt(level: Level, pos: Vec2): Actor | undefined {
  return level.actors.find((a) => a.combat.currentHp > 0 && equals(a.pos, pos))
}

/** 쿨다운 안 걸린 첫 공격 기술. 없으면 첫 기술. */
function pickMeleeAction(actor: Actor): Action {
  const all = getActionsByIds(actor.combat.actions)
  const available = getAvailableActions(all, actor.combat)
  const pool = available.length > 0 ? available : all
  const attacks = pool.filter((a) => a.category === 'attack' && a.power > 0)
  return attacks[0] ?? pool[0] ?? all[0]
}

function record(run: RunState, events: GridEvent[]): void {
  for (const event of events) {
    if (!isEventVisible(event, run.level.visible)) continue
    if (event.type === 'attack') run.log.push(event.outcome.note)
    else if (event.type === 'status') run.log.push(event.message)
    else if (event.type === 'pickup') run.log.push(event.message)
    else if (event.type === 'message') run.log.push(event.text)
    else if (event.type === 'descend') run.log.push('출구에 도달했다!')
  }
  if (run.log.length > LOG_LIMIT) {
    run.log.splice(0, run.log.length - LOG_LIMIT)
  }
}
