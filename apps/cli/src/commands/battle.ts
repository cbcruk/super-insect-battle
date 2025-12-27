import {
  createBattleInsect,
  executeTurn,
  selectAIMove,
  getInsectById,
  getMovesByIds,
} from '@insect-battle/engine'
import type { BattleState, Move } from '@insect-battle/engine'
import type { CommandResult, GameState } from '../game/types'
import { getRoom } from '../world/rooms'
import { syncTeamHpFromBattle, getActiveInsect } from '../game/state'
import { formatBattleScreen, line } from '../ui/display'

/**
 * battle 명령어 - 야생 곤충과 배틀 시작
 * 야생 곤충이 출현하는 지역에서만 사용 가능
 * @param _args - 사용하지 않음
 * @param state - 게임 상태
 * @returns 배틀 시작 화면 또는 에러 메시지
 */
export function battleCommand(
  _args: string[],
  state: GameState
): CommandResult {
  if (state.battle) {
    return {
      output: '이미 배틀 중입니다!',
      stateChanged: false,
    }
  }

  const room = getRoom(state.player.location)
  if (!room || !room.hasWildEncounters || !room.wildInsects?.length) {
    return {
      output: '이 지역에는 야생 곤충이 없습니다.',
      stateChanged: false,
    }
  }

  const activeInsect = getActiveInsect(state)
  if (!activeInsect || activeInsect.currentHp <= 0) {
    return {
      output: '싸울 수 있는 곤충이 없습니다! 곤충 센터에서 회복하세요.',
      stateChanged: false,
    }
  }

  const wildInsectId =
    room.wildInsects[Math.floor(Math.random() * room.wildInsects.length)]
  const wildInsect = getInsectById(wildInsectId)

  if (!wildInsect) {
    return {
      output: '야생 곤충을 찾을 수 없습니다.',
      stateChanged: false,
    }
  }

  const playerBattleInsect = createBattleInsect(activeInsect.species)
  playerBattleInsect.currentHp = activeInsect.currentHp

  const opponentBattleInsect = createBattleInsect(wildInsect)

  const battleState: BattleState = {
    turn: 0,
    player: playerBattleInsect,
    opponent: opponentBattleInsect,
    log: [],
    status: 'running',
    winner: null,
  }

  state.battle = {
    state: battleState,
    opponent: {
      name: `야생 ${wildInsect.nameKo}`,
      isWild: true,
    },
    awaitingInput: true,
    availableMoves: getMovesByIds(activeInsect.species.moves),
  }

  const lines: string[] = []
  lines.push('')
  lines.push(`🌿 야생 ${wildInsect.nameKo}이(가) 나타났다!`)
  lines.push('')
  lines.push(formatBattleScreen(state.battle))

  return {
    output: lines.join('\n'),
    stateChanged: true,
  }
}

/**
 * use 명령어 - 배틀 중 스킬 사용
 * @param args - [스킬번호 또는 스킬명]
 * @param state - 게임 상태
 * @returns 턴 실행 결과
 */
export function useCommand(args: string[], state: GameState): CommandResult {
  if (!state.battle) {
    return {
      output: '배틀 중이 아닙니다.',
      stateChanged: false,
    }
  }

  if (args.length === 0) {
    return {
      output: '어떤 스킬을 사용할까요? (예: use 1)',
      stateChanged: false,
    }
  }

  const { availableMoves } = state.battle
  let selectedMove: Move | undefined

  const moveIndex = parseInt(args[0], 10)
  if (
    !isNaN(moveIndex) &&
    moveIndex >= 1 &&
    moveIndex <= availableMoves.length
  ) {
    selectedMove = availableMoves[moveIndex - 1]
  } else {
    const moveName = args.join(' ').toLowerCase()
    selectedMove = availableMoves.find(
      (m) => m.name.toLowerCase() === moveName || m.id === moveName
    )
  }

  if (!selectedMove) {
    return {
      output: '알 수 없는 스킬입니다. 번호나 스킬명을 입력하세요.',
      stateChanged: false,
    }
  }

  const opponentMove = selectAIMove(
    state.battle.state.opponent,
    state.battle.state.player
  )

  state.battle.state = executeTurn(
    state.battle.state,
    selectedMove,
    opponentMove
  )

  const turnLogs = state.battle.state.log.filter(
    (log) => log.turn === state.battle!.state.turn
  )

  const lines: string[] = []
  lines.push('')

  for (const log of turnLogs) {
    lines.push(`[턴 ${log.turn}] ${log.action}`)
  }

  lines.push('')

  if (state.battle.state.status === 'finished') {
    const result = finishBattle(state)
    lines.push(result.output)

    return {
      output: lines.join('\n'),
      stateChanged: true,
    }
  }

  lines.push(formatBattleScreen(state.battle))

  return {
    output: lines.join('\n'),
    stateChanged: true,
  }
}

/**
 * run 명령어 - 배틀에서 도망
 * 50% 확률로 성공, 실패시 상대만 공격
 * @param _args - 사용하지 않음
 * @param state - 게임 상태
 * @returns 도망 결과
 */
export function runCommand(_args: string[], state: GameState): CommandResult {
  if (!state.battle) {
    return {
      output: '배틀 중이 아닙니다.',
      stateChanged: false,
    }
  }

  const escaped = Math.random() < 0.5

  if (escaped) {
    state.battle = null

    return {
      output: '무사히 도망쳤다!',
      stateChanged: true,
    }
  }

  const opponentMove = selectAIMove(
    state.battle.state.opponent,
    state.battle.state.player
  )

  const noOpMove = state.battle.availableMoves[0]
  state.battle.state = executeTurn(state.battle.state, noOpMove, opponentMove)

  syncTeamHpFromBattle(state)

  const lines: string[] = []
  lines.push('도망치지 못했다!')
  lines.push('')

  if (state.battle.state.status === 'finished') {
    const result = finishBattle(state)
    lines.push(result.output)
  } else {
    lines.push(formatBattleScreen(state.battle))
  }

  return {
    output: lines.join('\n'),
    stateChanged: true,
  }
}

/**
 * 배틀 종료 처리
 * 승패 메시지 표시 및 HP 동기화
 * @param state - 게임 상태
 * @returns 배틀 결과 메시지
 */
function finishBattle(state: GameState): CommandResult {
  if (!state.battle) {
    return { output: '', stateChanged: false }
  }

  const { winner } = state.battle.state
  const lines: string[] = []

  lines.push(line('═'))

  if (winner === 'player') {
    lines.push('🎉 승리!')
    lines.push(`${state.battle.opponent.name}을(를) 물리쳤다!`)
  } else if (winner === 'opponent') {
    lines.push('💀 패배...')
    lines.push('눈앞이 캄캄해졌다...')
  } else {
    lines.push('무승부!')
  }

  lines.push(line('═'))

  syncTeamHpFromBattle(state)
  state.battle = null

  return {
    output: lines.join('\n'),
    stateChanged: true,
  }
}
