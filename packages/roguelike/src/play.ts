import readline from 'node:readline'
import {
  arthropodList,
  getArthropodById,
  getActionsByIds,
  getActionTargeting,
  getActionRange,
  isActionOnCooldown,
  type AIPlayerOptions,
  type Arthropod,
} from '@super-insect-battle/engine'
import { parsePlayArgs, PLAY_USAGE } from './cli-args'
import type { Command } from './command'
import type { Direction } from './geometry'
import { createGeneratedRun } from './generate'
import { createShowdownRun } from './showdown'
import { createDuelRun } from './duel'
import { duelBatch, runAutoDuel } from './duel-sim'
import { applyCommand, canSpectate, spectateTurn, type RunState } from './run'
import { nearestEnemyInRange } from './targeting'
import { duelReport, renderFrame, renderLevel, showdownReport } from './render'

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

const parsed = parsePlayArgs(
  process.argv.slice(2),
  Math.floor(Math.random() * 1_000_000_000)
)
if ('error' in parsed) {
  console.error(`${parsed.error}\n\n${PLAY_USAGE}`)
  process.exit(1)
}
const args = parsed
const { seed } = args
const showdown = args.mode === 'showdown'
const duel = args.mode === 'duel'

function speciesOrExit(id: string): Arthropod {
  const species = getArthropodById(id)
  if (species) return species
  console.error(
    `알 수 없는 종: ${id}\n가능한 종: ${arthropodList.map((a) => a.id).join(', ')}`
  )
  process.exit(1)
}

function opponentAILabel(ai: AIPlayerOptions): string {
  const parts = [ai.difficulty, ai.personality].filter(Boolean)
  return parts.length > 0 ? ` · 상대 AI ${parts.join('/')}` : ''
}

function createPlayRun(): RunState {
  if (args.mode === 'duel') {
    return createDuelRun({
      playerSpecies: speciesOrExit(args.playerId),
      opponentSpecies: speciesOrExit(args.opponentId),
      seed,
      opponentAI: args.opponentAI,
    })
  }
  const mantis = speciesOrExit('mantis')
  return args.mode === 'showdown'
    ? createShowdownRun({ playerSpecies: mantis, seed })
    : createGeneratedRun({ playerSpecies: mantis, seed, maxDepth: 3 })
}

if (args.mode === 'duel' && args.batch !== null) {
  const player = speciesOrExit(args.playerId)
  const opponent = speciesOrExit(args.opponentId)
  const result = duelBatch(player, opponent, args.batch, seed, args.opponentAI)
  const rate = Math.round((result.playerWins / result.games) * 100)
  console.log(
    `${player.nameKo} vs ${opponent.nameKo} · 시드 ${seed}~${seed + result.games - 1}${opponentAILabel(args.opponentAI)}`
  )
  console.log(
    `1P 승률 ${rate}% (${result.playerWins}/${result.games}, 무승부 ${result.draws}) · 평균 ${result.averageTurns.toFixed(1)}턴`
  )
  process.exit(0)
}

if (args.mode === 'duel' && args.auto) {
  const finished = runAutoDuel(
    speciesOrExit(args.playerId),
    speciesOrExit(args.opponentId),
    seed,
    args.opponentAI
  )
  console.log(`격자 매치업 AI 대 AI (seed=${seed})\n`)
  console.log(renderLevel(finished))
  console.log(`\n${duelReport(finished)}`)
  process.exit(0)
}

const run = createPlayRun()

let notice = ''

function draw(): void {
  console.clear()
  const title = duel ? '격자 매치업' : showdown ? '쇼다운' : '로그라이크'
  console.log(`슈퍼곤충 ${title} (seed=${seed})`)
  console.log(
    '이동: hjkl · 대각 yubn · 방향키 / 대기: . / 스킬: 숫자키 / 종료: q'
  )
  console.log(
    duel
      ? '먼저 쓰러지는 쪽이 집니다. 독가스가 조여 옵니다.\n'
      : showdown
        ? '모두가 적입니다. 마지막까지 살아남으세요.\n'
        : '> 칸에 도달하면 다음 층으로 내려갑니다.\n'
  )
  console.log(renderFrame(run))
  if (notice) console.log(`\n※ ${notice}`)
  if (duel && run.status !== 'playing') {
    console.log(`\n${duelReport(run)} (q로 종료)`)
    return
  }
  if (run.status === 'won') {
    console.log(
      showdown ? '\n최후의 1마리! (q로 종료)' : '\n밀림 탈출 성공! (q로 종료)'
    )
  }
  if (run.status === 'dead') {
    console.log(
      canSpectate(run)
        ? '\n쓰러졌다... 관전: 스페이스 1턴 · f 끝까지 · q 종료'
        : '\n쓰러졌다... (q로 종료)'
    )
  }
  if (showdown && run.status !== 'playing' && !canSpectate(run)) {
    console.log(showdownReport(run))
  }
}

/** 숫자키 → 스킬 명령. 대상 없음/쿨다운이면 notice 설정 후 null. */
function abilityCommand(index: number): Command | null {
  const actions = getActionsByIds(run.player.combat.actions)
  const action = actions[index]
  if (!action) return null
  if (isActionOnCooldown(run.player.combat, action)) {
    notice = `${action.nameKo}: 쿨다운 중`
    return null
  }
  if (getActionTargeting(action) === 'self') {
    return {
      type: 'ability',
      actionId: action.id,
      target: { ...run.player.pos },
    }
  }
  const target = nearestEnemyInRange(run, run.player, getActionRange(action))
  if (!target) {
    notice = `${action.nameKo}: 사거리 내 대상 없음`
    return null
  }
  return { type: 'ability', actionId: action.id, target: { ...target.pos } }
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
  if (canSpectate(run)) {
    if (key.name === 'space' || key.sequence === '.') spectateTurn(run)
    if (key.name === 'f') while (canSpectate(run)) spectateTurn(run)
    draw()
    return
  }
  if (run.status !== 'playing') return

  notice = ''
  let command: Command | null = null
  const digit =
    key.sequence && /^[1-9]$/.test(key.sequence) ? Number(key.sequence) : 0

  if (key.name === 'space' || key.sequence === '.') {
    command = { type: 'wait' }
  } else if (key.name && KEY_DIR[key.name]) {
    command = { type: 'move', dir: KEY_DIR[key.name] }
  } else if (digit > 0) {
    command = abilityCommand(digit - 1)
  }
  if (!command) {
    draw() // notice 갱신 반영
    return
  }

  applyCommand(run, command)
  draw()
})
