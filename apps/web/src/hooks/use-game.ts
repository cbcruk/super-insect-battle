import { useCallback, useRef } from 'react'
import {
  createInitialGameState,
  getGameMode,
  parseCommand,
  isEmptyInput,
  executeCommand,
  lookCommand,
  welcomeMessage,
  getPrompt,
  formatExploreHints,
} from '@insect-battle/cli-core'
import type { GameState } from '@insect-battle/cli-core'

type GamePhase = 'name_input' | 'playing'

export interface UseGameReturn {
  processInput: (input: string) => string[]
  getInitialOutput: () => string[]
}

export function useGame(): UseGameReturn {
  const phaseRef = useRef<GamePhase>('name_input')
  const stateRef = useRef<GameState | null>(null)

  const getInitialOutput = useCallback((): string[] => {
    const lines: string[] = []
    lines.push('')
    lines.push('╔════════════════════════════════════════════════╗')
    lines.push('║          🪲 슈퍼곤충대전 🪲                    ║')
    lines.push('║              MUD Edition                        ║')
    lines.push('╚════════════════════════════════════════════════╝')
    lines.push('')
    lines.push('트레이너 이름을 입력하세요: ')
    return lines
  }, [])

  const processInput = useCallback((input: string): string[] => {
    const output: string[] = []

    if (phaseRef.current === 'name_input') {
      const playerName = input.trim() || '트레이너'
      stateRef.current = createInitialGameState(playerName)

      output.push(welcomeMessage(playerName))

      const initialLook = lookCommand([], stateRef.current)
      output.push(initialLook.output)
      output.push('')
      output.push(formatExploreHints(stateRef.current))
      output.push(getPrompt(stateRef.current))

      phaseRef.current = 'playing'
      return output
    }

    const state = stateRef.current
    if (!state) {
      output.push('Error: Game state not initialized')
      return output
    }

    if (isEmptyInput(input)) {
      output.push(getPrompt(state))
      return output
    }

    const parsed = parseCommand(input)
    const result = executeCommand(parsed.command, parsed.args, state, parsed)

    if (result.output) {
      output.push(result.output)
    }

    if (result.stateChanged && getGameMode(state) === 'explore') {
      output.push('')
      output.push(formatExploreHints(state))
    }

    if (result.shouldQuit) {
      state.isRunning = false
      return output
    }

    output.push(getPrompt(state))
    return output
  }, [])

  return {
    processInput,
    getInitialOutput,
  }
}
