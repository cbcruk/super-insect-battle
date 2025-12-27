import * as readline from 'readline'
import { createInitialGameState, getGameMode } from './game/state'
import { parseCommand, isEmptyInput } from './parser'
import { executeCommand } from './commands'
import { lookCommand } from './commands/explore'
import { welcomeMessage, getPrompt, formatExploreHints } from './ui/display'
import type { GameState } from './game/types'

/**
 * readline 인터페이스 생성
 */
function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
}

/**
 * 플레이어 이름 입력 받기
 */
async function askPlayerName(rl: readline.Interface): Promise<string> {
  return new Promise((resolve) => {
    rl.question('트레이너 이름을 입력하세요: ', (answer: string) => {
      const name = answer.trim() || '트레이너'
      resolve(name)
    })
  })
}

/**
 * 한 줄 입력 받기
 */
async function prompt(
  rl: readline.Interface,
  promptText: string
): Promise<string> {
  return new Promise((resolve) => {
    rl.question(promptText, (answer: string) => {
      resolve(answer)
    })
  })
}

/**
 * 힌트 표시
 */
function showHints(state: GameState): void {
  const mode = getGameMode(state)

  if (mode === 'explore') {
    console.log('')
    console.log(formatExploreHints(state))
  }
}

/**
 * 게임 루프
 */
async function gameLoop(
  rl: readline.Interface,
  state: GameState
): Promise<void> {
  showHints(state)

  while (state.isRunning) {
    const promptText = getPrompt(state)
    const input = await prompt(rl, promptText)

    if (isEmptyInput(input)) {
      continue
    }

    const parsed = parseCommand(input)
    const result = executeCommand(parsed.command, parsed.args, state, parsed)

    if (result.output) {
      console.log(result.output)
    }

    if (result.stateChanged && getGameMode(state) === 'explore') {
      showHints(state)
    }

    if (result.shouldQuit) {
      state.isRunning = false
    }
  }
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  const rl = createReadlineInterface()

  console.log('')
  console.log('╔════════════════════════════════════════════════╗')
  console.log('║          🪲 슈퍼곤충대전 🪲                    ║')
  console.log('║              MUD Edition                        ║')
  console.log('╚════════════════════════════════════════════════╝')
  console.log('')

  const playerName = await askPlayerName(rl)
  const state = createInitialGameState(playerName)

  console.log(welcomeMessage(playerName))

  const initialLook = lookCommand([], state)
  console.log(initialLook.output)

  await gameLoop(rl, state)

  rl.close()
}

main().catch(console.error)
