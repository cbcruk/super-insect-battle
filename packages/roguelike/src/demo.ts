import { getArthropodById } from '@super-insect-battle/engine'
import { chebyshev, dirToward } from './geometry'
import type { Command } from './command'
import { createGeneratedRun } from './generate'
import { applyCommand, type RunState } from './run'
import { stepAlongPath } from './pathfind'
import { renderFrame, renderLevel } from './render'

/** 데모 스크립트 플레이어: 인접 적은 공격, 없으면 출구로 길찾기(전지적). */
function scriptedPlayer(run: RunState): Command {
  const { player, level } = run
  const enemy = level.actors.find(
    (a) =>
      a.faction === 'hostile' &&
      a.combat.currentHp > 0 &&
      chebyshev(a.pos, player.pos) === 1
  )
  if (enemy) {
    const dir = dirToward(player.pos, enemy.pos)
    if (dir) return { type: 'move', dir }
  }
  const occupied = (x: number, y: number): boolean =>
    level.actors.some(
      (a) =>
        a !== player && a.combat.currentHp > 0 && a.pos.x === x && a.pos.y === y
    )
  const dir = stepAlongPath(level.map, player.pos, level.exit, occupied)
  return dir ? { type: 'move', dir } : { type: 'wait' }
}

/** 안개 무시 전체 맵(생성 결과 확인용). */
function renderFull(run: RunState): string {
  const saved = run.level.visible
  run.level.visible = undefined
  const out = renderLevel(run)
  run.level.visible = saved
  return out
}

const seed = Number(process.argv[2] ?? 1234)
const mantis = getArthropodById('mantis')
if (!mantis) throw new Error('mantis 데이터 없음')

const run = createGeneratedRun({ playerSpecies: mantis, seed, maxDepth: 3 })

console.log(`\n=== 슈퍼곤충 로그라이크 P2 데모 (seed=${seed}) ===`)
console.log('\n[생성된 1층 전체 맵]\n')
console.log(renderFull(run))
console.log('\n[플레이어 시야(FOV)]\n')
console.log(renderFrame(run))

let steps = 0
let lastDepth = run.level.depth
while (run.status === 'playing' && steps < 3000) {
  applyCommand(run, scriptedPlayer(run))
  steps++
  if (run.level.depth !== lastDepth) {
    console.log(`\n>>> ${run.level.depth}층 진입 (${run.turn}턴)`)
    lastDepth = run.level.depth
  }
}

console.log('\n--- 최종 (전체 맵) ---\n')
console.log(renderFull(run))
console.log(
  `\n결과: ${run.status} · ${run.level.depth}층 · ${run.turn}턴 · seed=${seed}`
)
console.log('로그:')
for (const line of run.log.slice(-8)) console.log(`  ${line}`)
