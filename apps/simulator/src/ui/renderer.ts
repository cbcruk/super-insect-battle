import chalk from 'chalk'
import type { BattleLogEntry, BattleState } from '@super-insect-battle/engine'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function renderHpBar(
  current: number,
  max: number,
  width: number = 20
): string {
  const ratio = current / max
  const filled = Math.round(ratio * width)
  const empty = width - filled

  let color: (text: string) => string
  if (ratio > 0.5) {
    color = chalk.green
  } else if (ratio > 0.25) {
    color = chalk.yellow
  } else {
    color = chalk.red
  }

  const bar = color('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
  return `[${bar}] ${current}/${max}`
}

export function renderBattleHeader(state: BattleState): void {
  console.log(chalk.yellow('\n════════════════════════════════════════'))
  console.log(
    chalk.cyan(state.player.base.nameKo) +
      ' vs ' +
      chalk.magenta(state.opponent.base.nameKo)
  )
  console.log(chalk.yellow('════════════════════════════════════════\n'))
}

export function renderStatus(state: BattleState): void {
  console.log(chalk.cyan(state.player.base.nameKo))
  console.log(
    '  HP: ' + renderHpBar(state.player.currentHp, state.player.maxHp)
  )
  if (state.player.statusCondition) {
    console.log('  상태: ' + chalk.red(state.player.statusCondition))
  }
  console.log()
  console.log(chalk.magenta(state.opponent.base.nameKo))
  console.log(
    '  HP: ' + renderHpBar(state.opponent.currentHp, state.opponent.maxHp)
  )
  if (state.opponent.statusCondition) {
    console.log('  상태: ' + chalk.red(state.opponent.statusCondition))
  }
  console.log()
}

export async function renderLogEntry(
  entry: BattleLogEntry,
  delay: number = 500
): Promise<void> {
  const actorColor = entry.actor === 'player' ? chalk.cyan : chalk.magenta
  const prefix = entry.actor === 'player' ? '▶' : '◀'

  process.stdout.write(actorColor(`${prefix} `))

  for (const char of entry.action) {
    process.stdout.write(char)
    await sleep(20)
  }
  console.log()

  if (entry.damage !== undefined && entry.damage > 0) {
    console.log(chalk.red(`  → ${entry.damage} 데미지!`))

    if (entry.remainingHp) {
      const target = entry.actor === 'player' ? 'opponent' : 'player'
      const hp =
        target === 'player'
          ? entry.remainingHp.player
          : entry.remainingHp.opponent
      const maxHp = target === 'player' ? 277 : 277
      console.log('  ' + renderHpBar(hp, maxHp, 15))
    }
  }

  await sleep(delay)
}

export async function renderBattle(
  state: BattleState,
  fast: boolean = false
): Promise<void> {
  const delay = fast ? 100 : 500

  renderBattleHeader(state)

  let currentTurn = 0

  for (const entry of state.log) {
    if (entry.turn !== currentTurn) {
      currentTurn = entry.turn
      console.log(chalk.yellow(`\n[턴 ${currentTurn}]`))
    }

    await renderLogEntry(entry, delay)
  }

  console.log()
  renderResult(state)
}

export function renderResult(state: BattleState): void {
  console.log(chalk.yellow('\n════════════════════════════════════════'))

  if (state.winner === 'draw') {
    console.log(chalk.yellow.bold('무승부!'))
  } else {
    const winnerName =
      state.winner === 'player'
        ? state.player.base.nameKo
        : state.opponent.base.nameKo
    console.log(chalk.green.bold(`승자: ${winnerName}!`))
  }

  console.log()
  console.log(`총 ${state.turn}턴 소요`)
  console.log()
  console.log(
    chalk.cyan(state.player.base.nameKo) +
      `: ${state.player.currentHp}/${state.player.maxHp} HP`
  )
  console.log(
    chalk.magenta(state.opponent.base.nameKo) +
      `: ${state.opponent.currentHp}/${state.opponent.maxHp} HP`
  )
  console.log(chalk.yellow('════════════════════════════════════════\n'))
}

export function renderStatistics(
  name1: string,
  name2: string,
  stats: {
    playerWins: number
    opponentWins: number
    draws: number
    winRate: number
    avgTurns: number
  },
  count: number
): void {
  console.log(chalk.yellow('\n════════════════════════════════════════'))
  console.log(chalk.yellow.bold(`${count}회 시뮬레이션 결과`))
  console.log(chalk.yellow('════════════════════════════════════════\n'))

  console.log(
    chalk.cyan(name1) +
      ` 승리: ${stats.playerWins}회 (${stats.winRate.toFixed(1)}%)`
  )
  console.log(
    chalk.magenta(name2) +
      ` 승리: ${stats.opponentWins}회 (${(100 - stats.winRate - (stats.draws / count) * 100).toFixed(1)}%)`
  )
  console.log(`무승부: ${stats.draws}회`)
  console.log()
  console.log(`평균 턴: ${stats.avgTurns.toFixed(1)}턴`)
  console.log()
}
