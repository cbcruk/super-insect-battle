import type { Arthropod, BattleArthropod } from '../types/arthropod'
import type { Action } from '../types/action'
import type { Environment } from '../types/environment'
import {
  getStyleMatchup,
  getWeightBonus,
  getWeaponVsArmorBonus,
  calculateTotalMultiplier,
  type DamageFactors,
} from '../data/matchup'
import {
  applyStatusCondition,
  checkCanMove,
  processEndOfTurnStatus,
  statusConditionNames,
} from './status-condition'
import {
  applyBattleMode,
  battleModeNames,
  canAttackInMode,
  getAttackPenalty,
  getBraceDamageReduction,
  getFleeEvasionBonus,
  processBattleModeEndOfTurn,
} from './battle-mode'
import { createStatStages, applyStatStageChange, getStatMultiplier } from './stat-stages'
import { selectStrategicAIAction } from './ai-strategy'
import { getEnvironmentBonus, getRandomEnvironment } from './environment'

export interface BattleLogEntry {
  turn: number
  actor: 'player' | 'opponent'
  action: string
  actionId?: string
  damage?: number
  critical?: boolean
  factors?: DamageFactors
  remainingHp?: { player: number; opponent: number }
}

export interface BattleState {
  turn: number
  player: BattleArthropod
  opponent: BattleArthropod
  environment: Environment
  log: BattleLogEntry[]
  status: 'idle' | 'ready' | 'running' | 'finished'
  winner: 'player' | 'opponent' | 'draw' | null
}

export function createBattleArthropod(arthropod: Arthropod): BattleArthropod {
  const baseHp = Math.floor(
    (arthropod.physical.strengthIndex + arthropod.defense.armorRating) * 1.5
  )
  const maxHp = Math.max(100, baseHp)

  return {
    base: arthropod,
    currentHp: maxHp,
    maxHp,
    statusCondition: null,
    bindTurns: 0,
    appliedVenomPotency: 0,
    battleMode: null,
    modeTurns: 0,
    actions: arthropod.actions,
    statStages: createStatStages(),
  }
}

export function calculateDamage(
  attacker: BattleArthropod,
  defender: BattleArthropod,
  action: Action,
  environment?: Environment
): { damage: number; critical: boolean; factors: DamageFactors } {
  if (action.category === 'defense' && action.power === 0) {
    return {
      damage: 0,
      critical: false,
      factors: {
        styleMatchup: 1,
        weightBonus: 1,
        weaponVsArmor: 1,
        critical: false,
        random: 1,
      },
    }
  }

  const strength = attacker.base.physical.strengthIndex
  const weaponPower = attacker.base.weapon.power
  const actionPower = action.power
  const armorRating = defender.base.defense.armorRating

  const baseDamage =
    (strength * weaponPower * actionPower) / (armorRating * 100)

  const styleMatchup = getStyleMatchup(
    attacker.base.behavior.style,
    defender.base.behavior.style
  )
  const weightBonus = getWeightBonus(
    attacker.base.physical.weightG,
    defender.base.physical.weightG
  )
  const weaponVsArmor = getWeaponVsArmorBonus(
    attacker.base.weapon.type,
    defender.base.defense.armorRating
  )
  const critical = Math.random() < 0.1
  const random = 0.85 + Math.random() * 0.15

  const attackerEnvBonus = environment
    ? getEnvironmentBonus(attacker.base, environment)
    : undefined
  const defenderEnvBonus = environment
    ? getEnvironmentBonus(defender.base, environment)
    : undefined

  const factors: DamageFactors = {
    styleMatchup,
    weightBonus,
    weaponVsArmor,
    critical,
    random,
    attackerEnvBonus,
    defenderEnvBonus,
  }

  const totalMultiplier = calculateTotalMultiplier(factors)

  const attackPenalty = getAttackPenalty(attacker)
  const damageReduction = getBraceDamageReduction(defender)

  const strengthMultiplier = getStatMultiplier(attacker.statStages.strength)
  const defenseMultiplier = getStatMultiplier(defender.statStages.defense)
  const stageFactor = strengthMultiplier / defenseMultiplier

  const finalDamage = Math.floor(
    baseDamage * totalMultiplier * attackPenalty * damageReduction * stageFactor
  )

  return {
    damage: Math.max(1, finalDamage),
    critical,
    factors,
  }
}

export function checkAccuracy(
  action: Action,
  defender: BattleArthropod,
  attackerLength: number
): boolean {
  const evasionMultiplier = getStatMultiplier(defender.statStages.evasion)
  const defenderEvasion = defender.base.defense.evasion * evasionMultiplier
  const fleeBonus = getFleeEvasionBonus(defender)
  const lengthRatio = attackerLength / defender.base.physical.lengthMm
  const lengthBonus = (lengthRatio - 1) * 10

  const hitChance =
    action.accuracy - (defenderEvasion + fleeBonus) * 0.5 + lengthBonus
  const finalHitChance = Math.max(10, Math.min(95, hitChance))

  return Math.random() * 100 < finalHitChance
}

export function determineFirstAttacker(
  player: BattleArthropod,
  opponent: BattleArthropod,
  playerAction: Action,
  opponentAction: Action
): 'player' | 'opponent' {
  if (playerAction.priority !== opponentAction.priority) {
    return playerAction.priority > opponentAction.priority
      ? 'player'
      : 'opponent'
  }

  const playerAggression = player.base.behavior.aggression
  const opponentAggression = opponent.base.behavior.aggression

  if (playerAggression !== opponentAggression) {
    return playerAggression > opponentAggression ? 'player' : 'opponent'
  }

  return Math.random() < 0.5 ? 'player' : 'opponent'
}

export function applyActionEffect(
  attacker: BattleArthropod,
  defender: BattleArthropod,
  action: Action,
  logEntry: BattleLogEntry
): void {
  if (!action.effect) {
    return
  }

  const effectTarget = action.effect.target === 'self' ? attacker : defender

  if (action.effect.type === 'status' && action.effect.condition) {
    const venomPotency = attacker.base.weapon.venomPotency ?? 50
    const applied = applyStatusCondition(
      effectTarget,
      action.effect.condition,
      venomPotency
    )

    if (applied) {
      const conditionName = statusConditionNames[action.effect.condition]
      logEntry.action += ` ${effectTarget.base.nameKo}은(는) ${conditionName} 상태가 되었다!`
    }
  }

  if (
    (action.effect.type === 'buff' || action.effect.type === 'debuff') &&
    action.effect.statChange
  ) {
    const { stat, stages } = action.effect.statChange
    const result = applyStatStageChange(effectTarget, stat, stages)
    logEntry.action += ` ${result.message}`
  }
}

export function executeTurn(
  state: BattleState,
  playerAction: Action,
  opponentAction: Action
): BattleState {
  const newState = { ...state, turn: state.turn + 1, log: [...state.log] }

  const first = determineFirstAttacker(
    state.player,
    state.opponent,
    playerAction,
    opponentAction
  )

  const order: Array<{
    actor: 'player' | 'opponent'
    attacker: BattleArthropod
    defender: BattleArthropod
    action: Action
  }> =
    first === 'player'
      ? [
          {
            actor: 'player',
            attacker: newState.player,
            defender: newState.opponent,
            action: playerAction,
          },
          {
            actor: 'opponent',
            attacker: newState.opponent,
            defender: newState.player,
            action: opponentAction,
          },
        ]
      : [
          {
            actor: 'opponent',
            attacker: newState.opponent,
            defender: newState.player,
            action: opponentAction,
          },
          {
            actor: 'player',
            attacker: newState.player,
            defender: newState.opponent,
            action: playerAction,
          },
        ]

  for (const { actor, attacker, defender, action } of order) {
    if (attacker.currentHp <= 0) {
      continue
    }

    const moveCheck = checkCanMove(attacker)

    if (moveCheck.message) {
      newState.log.push({
        turn: newState.turn,
        actor,
        action: moveCheck.message,
      })
    }

    if (!moveCheck.canMove) {
      continue
    }

    if (action.id === 'flee' || action.id === 'brace') {
      const mode = action.id as 'flee' | 'brace'
      const applied = applyBattleMode(attacker, mode)
      const modeName = battleModeNames[mode]

      if (applied) {
        newState.log.push({
          turn: newState.turn,
          actor,
          action: `${attacker.base.nameKo}은(는) ${modeName} 상태가 되었다!`,
          actionId: action.id,
        })
      } else {
        newState.log.push({
          turn: newState.turn,
          actor,
          action: `${attacker.base.nameKo}은(는) 이미 특수 상태이다!`,
          actionId: action.id,
        })
      }
      continue
    }

    if (!canAttackInMode(attacker)) {
      newState.log.push({
        turn: newState.turn,
        actor,
        action: `${attacker.base.nameKo}은(는) 움츠리고 있어 공격할 수 없다!`,
      })
      continue
    }

    const logEntry: BattleLogEntry = {
      turn: newState.turn,
      actor,
      action: `${attacker.base.nameKo}의 ${action.nameKo}!`,
      actionId: action.id,
    }

    if (
      !checkAccuracy(action, defender, attacker.base.physical.lengthMm)
    ) {
      logEntry.action += ' 그러나 빗나갔다!'
      newState.log.push(logEntry)
      continue
    }

    if (action.power > 0) {
      const { damage, critical, factors } = calculateDamage(
        attacker,
        defender,
        action,
        newState.environment
      )

      defender.currentHp = Math.max(0, defender.currentHp - damage)

      logEntry.damage = damage
      logEntry.critical = critical
      logEntry.factors = factors
      logEntry.remainingHp = {
        player: newState.player.currentHp,
        opponent: newState.opponent.currentHp,
      }

      if (critical) logEntry.action += ' 급소에 맞았다!'
      if (factors.styleMatchup > 1) logEntry.action += ' 스타일 상성 우위!'
      if (factors.styleMatchup < 1) logEntry.action += ' 스타일 상성 불리...'
    }

    applyActionEffect(attacker, defender, action, logEntry)

    newState.log.push(logEntry)

    if (defender.currentHp <= 0) {
      newState.winner = actor
      newState.status = 'finished'
      newState.log.push({
        turn: newState.turn,
        actor,
        action: `${defender.base.nameKo}은(는) 쓰러졌다!`,
      })

      break
    }
  }

  if (newState.status !== 'finished') {
    for (const { actor, arthropod } of [
      { actor: 'player' as const, arthropod: newState.player },
      { actor: 'opponent' as const, arthropod: newState.opponent },
    ]) {
      if (arthropod.currentHp <= 0) continue

      const statusResult = processEndOfTurnStatus(arthropod)

      if (statusResult.message) {
        newState.log.push({
          turn: newState.turn,
          actor,
          action: statusResult.message,
          damage: statusResult.damage,
          remainingHp: {
            player: newState.player.currentHp,
            opponent: newState.opponent.currentHp,
          },
        })

        if (arthropod.currentHp <= 0) {
          const winner = actor === 'player' ? 'opponent' : 'player'
          newState.winner = winner
          newState.status = 'finished'
          newState.log.push({
            turn: newState.turn,
            actor: winner,
            action: `${arthropod.base.nameKo}은(는) 쓰러졌다!`,
          })
          break
        }
      }

      const modeResult = processBattleModeEndOfTurn(arthropod)

      if (modeResult.message) {
        newState.log.push({
          turn: newState.turn,
          actor,
          action: modeResult.message,
        })
      }
    }
  }

  return newState
}

export function selectAIAction(
  attacker: BattleArthropod,
  defender: BattleArthropod
): Action {
  return selectStrategicAIAction(attacker, defender)
}

export function simulateBattle(
  arthropod1: Arthropod,
  arthropod2: Arthropod,
  environment?: Environment
): BattleState {
  const env = environment ?? getRandomEnvironment()

  let state: BattleState = {
    turn: 0,
    player: createBattleArthropod(arthropod1),
    opponent: createBattleArthropod(arthropod2),
    environment: env,
    log: [],
    status: 'running',
    winner: null,
  }

  const maxTurns = 50

  while (state.status !== 'finished' && state.turn < maxTurns) {
    const playerAction = selectAIAction(state.player, state.opponent)
    const opponentAction = selectAIAction(state.opponent, state.player)
    state = executeTurn(state, playerAction, opponentAction)
  }

  if (state.status !== 'finished') {
    const playerRatio = state.player.currentHp / state.player.maxHp
    const opponentRatio = state.opponent.currentHp / state.opponent.maxHp

    if (playerRatio > opponentRatio) {
      state.winner = 'player'
    } else if (opponentRatio > playerRatio) {
      state.winner = 'opponent'
    } else {
      state.winner = 'draw'
    }
    state.status = 'finished'
  }

  return state
}

export function simulateMultipleBattles(
  arthropod1: Arthropod,
  arthropod2: Arthropod,
  count: number,
  environment?: Environment
): {
  playerWins: number
  opponentWins: number
  draws: number
  winRate: number
  avgTurns: number
} {
  let playerWins = 0
  let opponentWins = 0
  let draws = 0
  let totalTurns = 0

  for (let i = 0; i < count; i++) {
    const result = simulateBattle(arthropod1, arthropod2, environment)

    totalTurns += result.turn

    if (result.winner === 'player') playerWins++
    else if (result.winner === 'opponent') opponentWins++
    else draws++
  }

  return {
    playerWins,
    opponentWins,
    draws,
    winRate: (playerWins / count) * 100,
    avgTurns: totalTurns / count,
  }
}
