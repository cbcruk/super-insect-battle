import readline from 'node:readline'
import type { Command } from './command'
import type { Direction } from './geometry'
import { makeDemoLevel } from './demo-level'
import { createRun, applyCommand } from './run'
import { renderFrame } from './render'

const KEY_DIR: Record<string, Direction> = {
  k: 'n',
  j: 's',
  h: 'w',
  l: 'e',
  y: 'nw',
  u: 'ne',
  b: 'sw',
  n: 'se',
  up: 'n',
  down: 's',
  left: 'w',
  right: 'e',
}

const seed = Number(
  process.argv[2] ?? Math.floor(Math.random() * 1_000_000_000)
)
const { level, player } = makeDemoLevel()
const run = createRun({ player, level, seed })

function draw(): void {
  console.clear()
  console.log(`슈퍼곤충 로그라이크 (seed=${seed})`)
  console.log('이동: hjkl · 대각 yubn · 방향키 / 대기: . / 종료: q\n')
  console.log(renderFrame(run))
  if (run.status === 'won') console.log('\n탈출 성공! (q로 종료)')
  if (run.status === 'dead') console.log('\n쓰러졌다... (q로 종료)')
}

readline.emitKeypressEvents(process.stdin)
if (process.stdin.isTTY) process.stdin.setRawMode(true)
draw()

process.stdin.on('keypress', (_str, key) => {
  if (!key) return
  if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
    if (process.stdin.isTTY) process.stdin.setRawMode(false)
    process.exit(0)
  }
  if (run.status !== 'playing') return

  let command: Command | null = null
  const seq = key.sequence
  if (key.name === 'space' || seq === '.') {
    command = { type: 'wait' }
  } else if (key.name && KEY_DIR[key.name]) {
    command = { type: 'move', dir: KEY_DIR[key.name] }
  }
  if (!command) return

  applyCommand(run, command)
  draw()
})
