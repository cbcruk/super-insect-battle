import {
  getArthropodById,
  arthropodList,
  simulateBattle,
  type Arthropod,
} from '@super-insect-battle/engine'
import { deriveEvents, narrate, type CommentaryLine } from '../src/index'

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  white: '\x1b[97m',
}

function colorize(line: CommentaryLine): string {
  const actorColor =
    line.actor === 'player'
      ? COLORS.cyan
      : line.actor === 'opponent'
        ? COLORS.magenta
        : COLORS.white
  switch (line.emphasis) {
    case 'header':
      return `${COLORS.bold}${COLORS.yellow}${line.text}${COLORS.reset}`
    case 'critical':
      return `${COLORS.bold}${COLORS.red}${line.text}${COLORS.reset}`
    case 'strong':
      return `${COLORS.bold}${actorColor}${line.text}${COLORS.reset}`
    case 'system':
      return `${COLORS.gray}${line.text}${COLORS.reset}`
    default:
      return `${actorColor}${line.text}${COLORS.reset}`
  }
}

function resolve(id: string | undefined, fallback: () => Arthropod): Arthropod {
  if (id) {
    const found = getArthropodById(id)
    if (!found) throw new Error(`Unknown arthropod id: ${id}`)
    return found
  }
  return fallback()
}

const [playerId, opponentId] = process.argv.slice(2)
const player = resolve(playerId, () => arthropodList[0])
const opponent = resolve(opponentId, () => arthropodList[2])

const state = simulateBattle(player, opponent)
const lines = narrate(deriveEvents(state))

for (const line of lines) {
  console.log(colorize(line))
}
