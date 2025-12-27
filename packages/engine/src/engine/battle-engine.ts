import type {
  BattleInsect,
  BattleLogEntry,
  BattleResult,
  BattleState,
  Insect,
  Move,
  StatModifiers,
} from '../types'
import { getMovesByIds } from '../data/moves'
import { getTypeEffectiveness, getEffectivenessLevel } from '../data/type-chart'
import {
  applyStatusCondition,
  checkCanMove,
  processEndOfTurnStatus,
  getBurnAttackMultiplier,
  getParalysisSpeedMultiplier,
  statusConditionNames,
} from './status-condition'
import {
  createBattleRecorder,
  createBattleSnapshot,
  recordTurnStart,
  recordMoveSelect,
  recordMoveExecute,
  recordDamage,
  recordStatusApplied,
  recordStatChanged,
  recordStatusDamage,
  recordFaint,
  recordTurnEnd,
  type BattleRecorder,
} from './battle-recorder'

/**
 * 곤충 데이터를 배틀용 상태로 변환
 * 레벨 50 기준으로 HP를 계산하고 초기 상태를 설정
 *
 * @param insect - 변환할 곤충 기본 데이터
 * @returns 배틀에 사용할 수 있는 곤충 상태
 *
 * @example
 * const battleInsect = createBattleInsect(insects.rhinoceros_beetle)
 */
export function createBattleInsect(insect: Insect): BattleInsect {
  const maxHp = insect.baseStats.hp * 2 + 110

  return {
    base: insect,
    currentHp: maxHp,
    maxHp,
    stats: {
      atk: insect.baseStats.atk,
      def: insect.baseStats.def,
      spAtk: insect.baseStats.spAtk,
      spDef: insect.baseStats.spDef,
      spd: insect.baseStats.spd,
    },
    statModifiers: { atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 },
    statusCondition: null,
    sleepTurns: 0,
    moves: getMovesByIds(insect.moves),
  }
}

function getStatMultiplier(stage: number): number {
  const clamped = Math.max(-6, Math.min(6, stage))

  if (clamped >= 0) {
    return (2 + clamped) / 2
  }

  return 2 / (2 - clamped)
}

/**
 * 스탯 단계 보정이 적용된 실제 스탯 값 계산
 *
 * @param base - 기본 스탯 값
 * @param stage - 스탯 변화 단계 (-6 ~ +6)
 * @returns 보정이 적용된 최종 스탯 값
 *
 * @example
 * getEffectiveStat(100, 0)   // 100 (변화 없음)
 * getEffectiveStat(100, 1)   // 150 (1.5배)
 * getEffectiveStat(100, -1)  // 66 (2/3배)
 */
export function getEffectiveStat(base: number, stage: number): number {
  return Math.floor(base * getStatMultiplier(stage))
}

/**
 * 스킬 사용 시 데미지 계산
 * 포켓몬 데미지 공식을 간소화하여 적용
 *
 * @param attacker - 공격하는 곤충
 * @param defender - 방어하는 곤충
 * @param move - 사용하는 스킬
 * @returns 데미지, 크리티컬 여부, 타입 상성 배율
 *
 * @example
 * const { damage, critical, effectiveness } = calculateDamage(attacker, defender, move)
 */
export function calculateDamage(
  attacker: BattleInsect,
  defender: BattleInsect,
  move: Move
): { damage: number; critical: boolean; effectiveness: number } {
  if (move.category === 'status' || move.power === 0) {
    return { damage: 0, critical: false, effectiveness: 1 }
  }

  const isPhysical = move.category === 'physical'
  const atkStat = isPhysical ? 'atk' : 'spAtk'
  const defStat = isPhysical ? 'def' : 'spDef'

  let attack = getEffectiveStat(
    attacker.stats[atkStat],
    attacker.statModifiers[atkStat]
  )

  if (isPhysical) {
    attack = Math.floor(attack * getBurnAttackMultiplier(attacker))
  }

  const defense = getEffectiveStat(
    defender.stats[defStat],
    defender.statModifiers[defStat]
  )

  const effectiveness = getTypeEffectiveness(move.type, defender.base.type)
  const critical = Math.random() < 0.0625
  const critMultiplier = critical ? 1.5 : 1
  const random = 0.85 + Math.random() * 0.15
  const baseDamage = (22 * move.power * (attack / defense)) / 50 + 2
  const finalDamage = Math.floor(
    baseDamage * effectiveness * critMultiplier * random
  )

  return {
    damage: Math.max(1, finalDamage),
    critical,
    effectiveness,
  }
}

/**
 * 스킬 명중 판정
 *
 * @param move - 판정할 스킬
 * @returns 명중 시 true, 빗나감 시 false
 */
export function checkAccuracy(move: Move): boolean {
  if (move.accuracy === 0 || move.accuracy >= 100) {
    return true
  }

  return Math.random() * 100 < move.accuracy
}

/**
 * 선공권 결정
 * 우선도 > 스피드 > 랜덤 순으로 판정
 *
 * @param player - 플레이어 곤충
 * @param opponent - 상대 곤충
 * @param playerMove - 플레이어가 선택한 스킬
 * @param opponentMove - 상대가 선택한 스킬
 * @returns 먼저 행동할 주체
 */
export function determineFirstAttacker(
  player: BattleInsect,
  opponent: BattleInsect,
  playerMove: Move,
  opponentMove: Move
): 'player' | 'opponent' {
  if (playerMove.priority !== opponentMove.priority) {
    return playerMove.priority > opponentMove.priority ? 'player' : 'opponent'
  }

  const playerSpeed = Math.floor(
    getEffectiveStat(player.stats.spd, player.statModifiers.spd) *
      getParalysisSpeedMultiplier(player)
  )
  const opponentSpeed = Math.floor(
    getEffectiveStat(opponent.stats.spd, opponent.statModifiers.spd) *
      getParalysisSpeedMultiplier(opponent)
  )

  if (playerSpeed !== opponentSpeed) {
    return playerSpeed > opponentSpeed ? 'player' : 'opponent'
  }

  return Math.random() < 0.5 ? 'player' : 'opponent'
}

/**
 * 능력치 변화 적용
 * -6 ~ +6 범위 내에서 스탯 단계를 변경
 *
 * @param target - 능력치를 변경할 곤충
 * @param stat - 변경할 스탯 종류
 * @param stages - 변화량 (양수: 상승, 음수: 하락)
 * @returns 새로운 단계와 변화 발생 여부
 */
export function applyStatChange(
  target: BattleInsect,
  stat: keyof StatModifiers,
  stages: number
): { newStage: number; changed: boolean } {
  const currentStage = target.statModifiers[stat]
  const newStage = Math.max(-6, Math.min(6, currentStage + stages))

  if (newStage === currentStage) {
    return { newStage, changed: false }
  }

  target.statModifiers[stat] = newStage

  return { newStage, changed: true }
}

/**
 * 단일 턴 실행
 * 양측의 스킬을 선공 순서에 따라 처리하고 결과를 반환
 *
 * @param state - 현재 배틀 상태
 * @param playerMove - 플레이어가 선택한 스킬
 * @param opponentMove - 상대가 선택한 스킬
 * @returns 턴 실행 후의 새로운 배틀 상태
 */
export function executeTurn(
  state: BattleState,
  playerMove: Move,
  opponentMove: Move
): BattleState {
  const newState = { ...state, turn: state.turn + 1, log: [...state.log] }

  const first = determineFirstAttacker(
    state.player,
    state.opponent,
    playerMove,
    opponentMove
  )

  const order: Array<{
    actor: 'player' | 'opponent'
    attacker: BattleInsect
    defender: BattleInsect
    move: Move
  }> =
    first === 'player'
      ? [
          {
            actor: 'player',
            attacker: newState.player,
            defender: newState.opponent,
            move: playerMove,
          },
          {
            actor: 'opponent',
            attacker: newState.opponent,
            defender: newState.player,
            move: opponentMove,
          },
        ]
      : [
          {
            actor: 'opponent',
            attacker: newState.opponent,
            defender: newState.player,
            move: opponentMove,
          },
          {
            actor: 'player',
            attacker: newState.player,
            defender: newState.opponent,
            move: playerMove,
          },
        ]

  for (const { actor, attacker, defender, move } of order) {
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

    const logEntry: BattleLogEntry = {
      turn: newState.turn,
      actor,
      action: `${attacker.base.nameKo}의 ${move.name}!`,
      move: move.id,
    }

    if (!checkAccuracy(move)) {
      logEntry.action += ' 그러나 빗나갔다!'
      newState.log.push(logEntry)
      continue
    }

    if (move.category !== 'status') {
      const { damage, critical, effectiveness } = calculateDamage(
        attacker,
        defender,
        move
      )

      defender.currentHp = Math.max(0, defender.currentHp - damage)

      logEntry.damage = damage
      logEntry.critical = critical
      logEntry.effectiveness = getEffectivenessLevel(effectiveness)
      logEntry.remainingHp = {
        player: newState.player.currentHp,
        opponent: newState.opponent.currentHp,
      }

      if (critical) logEntry.action += ' 급소에 맞았다!'
      if (effectiveness > 1) logEntry.action += ' 효과가 굉장했다!'
      if (effectiveness < 1 && effectiveness > 0)
        logEntry.action += ' 효과가 별로인 것 같다...'
    }

    if (move.effect) {
      const effectTarget = move.effect.target === 'self' ? attacker : defender

      if (
        move.effect.type === 'stat_change' &&
        move.effect.stat &&
        move.effect.stages
      ) {
        const { changed } = applyStatChange(
          effectTarget,
          move.effect.stat,
          move.effect.stages
        )

        if (changed) {
          const direction = move.effect.stages > 0 ? '올랐다' : '떨어졌다'
          const intensity = Math.abs(move.effect.stages) >= 2 ? '크게 ' : ''
          logEntry.action += ` ${effectTarget.base.nameKo}의 ${move.effect.stat}이(가) ${intensity}${direction}!`
        }
      }

      if (move.effect.type === 'status_condition' && move.effect.condition) {
        const applied = applyStatusCondition(
          effectTarget,
          move.effect.condition
        )

        if (applied) {
          const conditionName = statusConditionNames[move.effect.condition]
          logEntry.action += ` ${effectTarget.base.nameKo}은(는) ${conditionName} 상태가 되었다!`
        }
      }
    }

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
    for (const { actor, insect } of [
      { actor: 'player' as const, insect: newState.player },
      { actor: 'opponent' as const, insect: newState.opponent },
    ]) {
      if (insect.currentHp <= 0) continue

      const statusResult = processEndOfTurnStatus(insect)

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

        if (insect.currentHp <= 0) {
          const winner = actor === 'player' ? 'opponent' : 'player'
          newState.winner = winner
          newState.status = 'finished'
          newState.log.push({
            turn: newState.turn,
            actor: winner,
            action: `${insect.base.nameKo}은(는) 쓰러졌다!`,
          })
          break
        }
      }
    }
  }

  return newState
}

/**
 * AI 스킬 선택
 * 상성이 좋은 스킬을 우선 선택, 없으면 랜덤
 *
 * @param attacker - 스킬을 선택할 곤충
 * @param defender - 상대 곤충
 * @returns 선택된 스킬
 */
export function selectAIMove(
  attacker: BattleInsect,
  defender: BattleInsect
): Move {
  const validMoves = attacker.moves.filter((m) => m.power > 0)

  if (validMoves.length === 0) {
    return attacker.moves[0]
  }

  const effectiveMoves = validMoves.filter(
    (m) => getTypeEffectiveness(m.type, defender.base.type) > 1
  )

  if (effectiveMoves.length > 0) {
    return effectiveMoves[Math.floor(Math.random() * effectiveMoves.length)]
  }

  return validMoves[Math.floor(Math.random() * validMoves.length)]
}

/**
 * 1판 배틀 시뮬레이션 (AI vs AI)
 * 양측 모두 AI가 스킬을 선택하여 배틀 진행
 *
 * @param insect1 - 플레이어 측 곤충
 * @param insect2 - 상대 측 곤충
 * @returns 배틀 종료 후 최종 상태
 *
 * @example
 * const result = simulateBattle(insects.rhinoceros_beetle, insects.stag_beetle)
 * console.log(result.winner) // 'player' | 'opponent' | 'draw'
 */
export function simulateBattle(insect1: Insect, insect2: Insect): BattleState {
  let state: BattleState = {
    turn: 0,
    player: createBattleInsect(insect1),
    opponent: createBattleInsect(insect2),
    log: [],
    status: 'running',
    winner: null,
  }

  const maxTurns = 100

  while (state.status !== 'finished' && state.turn < maxTurns) {
    const playerMove = selectAIMove(state.player, state.opponent)
    const opponentMove = selectAIMove(state.opponent, state.player)
    state = executeTurn(state, playerMove, opponentMove)
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

/**
 * 1판 배틀 시뮬레이션 + 다시보기 데이터 생성
 * 모든 액션을 기록하여 리플레이 가능
 *
 * @param insect1 - 플레이어 측 곤충
 * @param insect2 - 상대 측 곤충
 * @returns 배틀 결과와 리플레이 데이터
 *
 * @example
 * const result = simulateBattleWithReplay(insects.rhinoceros_beetle, insects.stag_beetle)
 * console.log(`총 ${result.replay.totalActions}개 액션 기록됨`)
 */
export function simulateBattleWithReplay(
  insect1: Insect,
  insect2: Insect
): BattleResult {
  const player = createBattleInsect(insect1)
  const opponent = createBattleInsect(insect2)
  const recorder = createBattleRecorder(player, opponent)

  let state: BattleState = {
    turn: 0,
    player,
    opponent,
    log: [],
    status: 'running',
    winner: null,
  }

  const maxTurns = 100

  while (state.status !== 'finished' && state.turn < maxTurns) {
    const playerMove = selectAIMove(state.player, state.opponent)
    const opponentMove = selectAIMove(state.opponent, state.player)

    state = executeTurnWithRecording(state, playerMove, opponentMove, recorder)
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

  return {
    state,
    replay: {
      initialSnapshot: recorder.initialSnapshot,
      actions: recorder.actions,
      totalActions: recorder.actions.length,
    },
  }
}

/**
 * 턴 실행 + 리플레이 기록
 * executeTurn의 확장 버전으로 모든 액션을 recorder에 기록
 */
function executeTurnWithRecording(
  state: BattleState,
  playerMove: Move,
  opponentMove: Move,
  recorder: BattleRecorder
): BattleState {
  const newState = { ...state, turn: state.turn + 1, log: [...state.log] }

  recordTurnStart(recorder, newState.turn)

  recordMoveSelect(recorder, newState.turn, 1, playerMove.id)
  recordMoveSelect(recorder, newState.turn, 2, opponentMove.id)

  const first = determineFirstAttacker(
    state.player,
    state.opponent,
    playerMove,
    opponentMove
  )

  const order: Array<{
    actor: 'player' | 'opponent'
    actorNum: 1 | 2
    attacker: BattleInsect
    defender: BattleInsect
    move: Move
  }> =
    first === 'player'
      ? [
          {
            actor: 'player',
            actorNum: 1,
            attacker: newState.player,
            defender: newState.opponent,
            move: playerMove,
          },
          {
            actor: 'opponent',
            actorNum: 2,
            attacker: newState.opponent,
            defender: newState.player,
            move: opponentMove,
          },
        ]
      : [
          {
            actor: 'opponent',
            actorNum: 2,
            attacker: newState.opponent,
            defender: newState.player,
            move: opponentMove,
          },
          {
            actor: 'player',
            actorNum: 1,
            attacker: newState.player,
            defender: newState.opponent,
            move: playerMove,
          },
        ]

  for (const { actor, actorNum, attacker, defender, move } of order) {
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
      recordMoveExecute(recorder, newState.turn, actorNum, move.id, false)
      continue
    }

    const logEntry: BattleLogEntry = {
      turn: newState.turn,
      actor,
      action: `${attacker.base.nameKo}의 ${move.name}!`,
      move: move.id,
    }

    const hit = checkAccuracy(move)

    recordMoveExecute(recorder, newState.turn, actorNum, move.id, hit)

    if (!hit) {
      logEntry.action += ' 그러나 빗나갔다!'
      newState.log.push(logEntry)
      continue
    }

    if (move.category !== 'status') {
      const { damage, critical, effectiveness } = calculateDamage(
        attacker,
        defender,
        move
      )

      defender.currentHp = Math.max(0, defender.currentHp - damage)

      logEntry.damage = damage
      logEntry.critical = critical
      logEntry.effectiveness = getEffectivenessLevel(effectiveness)
      logEntry.remainingHp = {
        player: newState.player.currentHp,
        opponent: newState.opponent.currentHp,
      }

      // 데미지 기록
      const snapshot = createBattleSnapshot(
        newState.turn,
        newState.player,
        newState.opponent
      )
      recordDamage(
        recorder,
        newState.turn,
        actorNum,
        move.id,
        damage,
        critical,
        effectiveness,
        0.85, // randomFactor 근사값
        snapshot
      )

      if (critical) logEntry.action += ' 급소에 맞았다!'
      if (effectiveness > 1) logEntry.action += ' 효과가 굉장했다!'
      if (effectiveness < 1 && effectiveness > 0)
        logEntry.action += ' 효과가 별로인 것 같다...'
    }

    if (move.effect) {
      const effectTarget = move.effect.target === 'self' ? attacker : defender
      const effectTargetNum: 1 | 2 =
        move.effect.target === 'self' ? actorNum : actorNum === 1 ? 2 : 1

      if (
        move.effect.type === 'stat_change' &&
        move.effect.stat &&
        move.effect.stages
      ) {
        const { newStage, changed } = applyStatChange(
          effectTarget,
          move.effect.stat,
          move.effect.stages
        )

        if (changed) {
          recordStatChanged(
            recorder,
            newState.turn,
            effectTargetNum,
            move.effect.stat as 'atk' | 'def' | 'spAtk' | 'spDef' | 'spd',
            move.effect.stages,
            newStage
          )

          const direction = move.effect.stages > 0 ? '올랐다' : '떨어졌다'
          const intensity = Math.abs(move.effect.stages) >= 2 ? '크게 ' : ''
          logEntry.action += ` ${effectTarget.base.nameKo}의 ${move.effect.stat}이(가) ${intensity}${direction}!`
        }
      }

      if (move.effect.type === 'status_condition' && move.effect.condition) {
        const applied = applyStatusCondition(
          effectTarget,
          move.effect.condition
        )

        if (applied) {
          recordStatusApplied(
            recorder,
            newState.turn,
            effectTargetNum,
            move.effect.condition,
            move.effect.condition === 'sleep'
              ? effectTarget.sleepTurns
              : undefined
          )

          const conditionName = statusConditionNames[move.effect.condition]

          logEntry.action += ` ${effectTarget.base.nameKo}은(는) ${conditionName} 상태가 되었다!`
        }
      }
    }

    newState.log.push(logEntry)

    if (defender.currentHp <= 0) {
      const defenderNum: 1 | 2 = actorNum === 1 ? 2 : 1

      recordFaint(recorder, newState.turn, defenderNum, 0)

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

  // 턴 종료 시 상태이상 데미지
  if (newState.status !== 'finished') {
    for (const { actor, actorNum, insect } of [
      {
        actor: 'player' as const,
        actorNum: 1 as const,
        insect: newState.player,
      },
      {
        actor: 'opponent' as const,
        actorNum: 2 as const,
        insect: newState.opponent,
      },
    ]) {
      if (insect.currentHp <= 0) continue

      const statusResult = processEndOfTurnStatus(insect)

      if (statusResult.message) {
        const snapshot = createBattleSnapshot(
          newState.turn,
          newState.player,
          newState.opponent
        )

        if (
          insect.statusCondition === 'poison' ||
          insect.statusCondition === 'burn'
        ) {
          recordStatusDamage(
            recorder,
            newState.turn,
            actorNum,
            insect.statusCondition,
            statusResult.damage,
            snapshot
          )
        }

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

        if (insect.currentHp <= 0) {
          recordFaint(recorder, newState.turn, actorNum, 0)

          const winner = actor === 'player' ? 'opponent' : 'player'
          newState.winner = winner
          newState.status = 'finished'
          newState.log.push({
            turn: newState.turn,
            actor: winner,
            action: `${insect.base.nameKo}은(는) 쓰러졌다!`,
          })

          break
        }
      }
    }
  }

  // 턴 종료 기록
  const endSnapshot = createBattleSnapshot(
    newState.turn,
    newState.player,
    newState.opponent
  )

  recordTurnEnd(recorder, newState.turn, endSnapshot)

  return newState
}

/**
 * N판 배틀 시뮬레이션
 * 지정된 횟수만큼 배틀을 반복하여 통계 산출
 *
 * @param insect1 - 플레이어 측 곤충
 * @param insect2 - 상대 측 곤충
 * @param count - 시뮬레이션 횟수
 * @returns 승패 통계 및 평균 턴 수
 *
 * @example
 * const stats = simulateMultipleBattles(insects.rhinoceros_beetle, insects.stag_beetle, 1000)
 * console.log(`승률: ${stats.winRate.toFixed(1)}%`)
 */
export function simulateMultipleBattles(
  insect1: Insect,
  insect2: Insect,
  count: number
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
    const result = simulateBattle(insect1, insect2)

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
