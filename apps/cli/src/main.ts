import * as readline from 'readline'
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

function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
}

async function askPlayerName(rl: readline.Interface): Promise<string> {
  return new Promise((resolve) => {
    rl.question('트레이너 이름을 입력하세요: ', (answer: string) => {
      const name = answer.trim() || '트레이너'
      resolve(name)
    })
  })
}

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

function showHints(state: GameState): void {
  const mode = getGameMode(state)

  if (mode === 'explore') {
    console.log('')
    console.log(formatExploreHints(state))
  }
}

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
