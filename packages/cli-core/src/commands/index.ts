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

const exploreCommands: Record<string, CommandHandler> = {
  look: lookCommand,
  go: goCommand,
  team: teamCommand,
  heal: healCommand,
  battle: battleCommand,
  help: helpCommand,
  quit: quitCommand,
}

const battleCommands: Record<string, CommandHandler> = {
  use: useCommand,
  run: runCommand,
  team: teamCommand,
  help: helpCommand,
  quit: quitCommand,
}

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

function handleBattleNumeric(num: number, state: GameState): CommandResult {
  if (!state.battle) {
    return { output: '배틀 중이 아닙니다.', stateChanged: false }
  }

  if (num === 0) {
    return runCommand([], state)
  }

  return useCommand([num.toString()], state)
}

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

export {
  lookCommand,
  goCommand,
  teamCommand,
  healCommand,
  helpCommand,
  quitCommand,
  battleCommand,
  useCommand,
  runCommand,
}
