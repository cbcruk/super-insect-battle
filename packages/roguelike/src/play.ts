import readline from 'node:readline'
import { getArthropodById } from '@super-insect-battle/engine'
import type { Command } from './command'
import type { Direction } from './geometry'
import { createGeneratedRun } from './generate'
import { applyCommand } from './run'
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
const mantis = getArthropodById('mantis')
if (!mantis) throw new Error('mantis 데이터 없음')

const run = createGeneratedRun({ playerSpecies: mantis, seed, maxDepth: 3 })

function draw(): void {
  console.clear()
  console.log(`슈퍼곤충 로그라이크 (seed=${seed})`)
  console.log('이동: hjkl · 대각 yubn · 방향키 / 대기: . / 종료: q')
  console.log('> 칸에 도달하면 다음 층으로 내려갑니다.\n')
  console.log(renderFrame(run))
  if (run.status === 'won') console.log('\n밀림 탈출 성공! (q로 종료)')
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
  if (key.name === 'space' || key.sequence === '.') {
    command = { type: 'wait' }
  } else if (key.name && KEY_DIR[key.name]) {
    command = { type: 'move', dir: KEY_DIR[key.name] }
  }
  if (!command) return

  applyCommand(run, command)
  draw()
})
