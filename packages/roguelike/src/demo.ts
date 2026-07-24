import { chebyshev, dirToward } from './geometry'
import type { Command } from './command'
import { makeDemoLevel } from './demo-level'
import { createRun, applyCommand, type RunState } from './run'
import { renderFrame } from './render'

/** 데모용 스크립트 플레이어: 인접 적은 공격, 없으면 출구로 이동. */
function scriptedPlayer(run: RunState): Command {
  const { player, level } = run
  const enemy = level.actors.find(
    (a) =>
      a.faction === 'hostile' &&
      a.combat.currentHp > 0 &&
      chebyshev(a.pos, player.pos) === 1
  )
  const dir = enemy
    ? dirToward(player.pos, enemy.pos)
    : dirToward(player.pos, level.exit)
  return dir ? { type: 'move', dir } : { type: 'wait' }
}

const seed = Number(process.argv[2] ?? 1234)
const { level, player } = makeDemoLevel()
const run = createRun({ player, level, seed })

console.log(`\n=== 슈퍼곤충 로그라이크 데모 (seed=${seed}) ===\n`)
console.log(renderFrame(run))

let steps = 0
while (run.status === 'playing' && steps < 300) {
  applyCommand(run, scriptedPlayer(run))
  steps++
}

console.log('\n--- 최종 ---\n')
console.log(renderFrame(run))
console.log('\n로그:')
for (const line of run.log.slice(-12)) console.log(`  ${line}`)
console.log(`\n결과: ${run.status} · ${run.turn}턴 · seed=${seed}`)
