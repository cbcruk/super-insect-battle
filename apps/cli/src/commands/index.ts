import type { CommandResult, GameState, CommandHandler } from '../game/types'
import { getGameMode } from '../game/state'
import { getRoom } from '../world/rooms'
import type { ParsedCommand } from '../parser'

import {
  lookCommand,
  goCommand,
  teamCommand,
  healCommand,
  helpCommand,
  quitCommand,
} from './explore'

import { battleCommand, useCommand, runCommand } from './battle'

/** 탐색 모드에서 사용 가능한 명령어 */
const exploreCommands: Record<string, CommandHandler> = {
  look: lookCommand,
  go: goCommand,
  team: teamCommand,
  heal: healCommand,
  battle: battleCommand,
  help: helpCommand,
  quit: quitCommand,
}

/** 배틀 모드에서 사용 가능한 명령어 */
const battleCommands: Record<string, CommandHandler> = {
  use: useCommand,
  run: runCommand,
  team: teamCommand,
  help: helpCommand,
  quit: quitCommand,
}

/**
 * 탐색 모드 숫자 단축키 처리
 * 숫자로 출구 선택 (1, 2, 3...)
 * @param num - 입력된 숫자
 * @param state - 게임 상태
 * @returns 이동 결과
 */
function handleExploreNumeric(num: number, state: GameState): CommandResult {
  const room = getRoom(state.player.location)

  if (!room) {
    return { output: '현재 위치를 알 수 없습니다.', stateChanged: false }
  }

  const exits = Object.keys(room.exits)
  const exitIndex = num - 1

  if (exitIndex < 0 || exitIndex >= exits.length) {
    return {
      output: `1-${exits.length} 사이의 숫자를 입력하세요.`,
      stateChanged: false,
    }
  }

  const direction = exits[exitIndex]

  return goCommand([direction], state)
}

/**
 * 배틀 모드 숫자 단축키 처리
 * 0: 도망, 1-4: 스킬 선택
 * @param num - 입력된 숫자
 * @param state - 게임 상태
 * @returns 턴 결과
 */
function handleBattleNumeric(num: number, state: GameState): CommandResult {
  if (!state.battle) {
    return { output: '배틀 중이 아닙니다.', stateChanged: false }
  }

  if (num === 0) {
    return runCommand([], state)
  }

  return useCommand([num.toString()], state)
}

/**
 * 명령어 실행 라우터
 * 게임 모드에 따라 적절한 핸들러로 분기
 * @param command - 명령어
 * @param args - 인자 배열
 * @param state - 게임 상태
 * @param parsed - 파싱된 명령어 (숫자 단축키 정보 포함)
 * @returns 명령어 실행 결과
 */
export function executeCommand(
  command: string,
  args: string[],
  state: GameState,
  parsed?: ParsedCommand
): CommandResult {
  const mode = getGameMode(state)

  if (parsed?.isNumericShortcut && parsed.numericValue !== undefined) {
    if (mode === 'battle') {
      return handleBattleNumeric(parsed.numericValue, state)
    } else {
      return handleExploreNumeric(parsed.numericValue, state)
    }
  }

  const commands = mode === 'battle' ? battleCommands : exploreCommands

  const handler = commands[command]

  if (!handler) {
    if (command === '' || command === '__numeric__') {
      return {
        output: '',
        stateChanged: false,
      }
    }

    const modeText = mode === 'battle' ? '배틀' : '탐색'

    return {
      output: `알 수 없는 명령어입니다: "${command}"\n${modeText} 모드에서 사용 가능한 명령어는 "?" 로 확인하세요.`,
      stateChanged: false,
    }
  }

  return handler(args, state)
}
