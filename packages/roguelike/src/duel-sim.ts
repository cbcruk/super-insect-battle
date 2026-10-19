import type { Arthropod } from '@super-insect-battle/engine'
import { createDuelRun } from './duel'
import { applyCommand, type RunState } from './run'

const MAX_TURNS = 1000

/** {@linkcode duelBatch}의 집계. */
export interface DuelBatchResult {
  games: number
  /** 1P가 이긴 판 수. */
  playerWins: number
  /** 판당 평균 턴. */
  averageTurns: number
}

/**
 * AI 대 AI 격자 매치업 한 판을 화면 없이 끝까지 돌린다.
 *
 * @returns 끝난 런. 독가스가 판을 끝내므로 보통 수십 턴 안에 결판이 난다.
 */
export function runAutoDuel(
  playerSpecies: Arthropod,
  opponentSpecies: Arthropod,
  seed: number
): RunState {
  const run = createDuelRun({
    playerSpecies,
    opponentSpecies,
    seed,
    autopilot: true,
  })
  while (run.status === 'playing' && run.turn < MAX_TURNS && run.player.brain) {
    applyCommand(run, run.player.brain.decide(run.player, run, run.rng))
  }
  return run
}

/**
 * 시드 `firstSeed`부터 `games`판을 AI 대 AI로 돌려 1P 승률과 평균 턴을 낸다.
 *
 * @example
 * ```ts
 * import { getArthropodById } from '@super-insect-battle/engine'
 * import { duelBatch } from '@super-insect-battle/roguelike'
 *
 * const result = duelBatch(
 *   getArthropodById('mantis')!,
 *   getArthropodById('scorpion')!,
 *   60
 * )
 * console.log(result.playerWins / result.games)
 * ```
 */
export function duelBatch(
  playerSpecies: Arthropod,
  opponentSpecies: Arthropod,
  games: number,
  firstSeed = 1
): DuelBatchResult {
  let playerWins = 0
  let turns = 0
  for (let i = 0; i < games; i++) {
    const run = runAutoDuel(playerSpecies, opponentSpecies, firstSeed + i)
    if (run.status === 'won') playerWins++
    turns += run.stats.endTurn ?? run.turn
  }
  return {
    games,
    playerWins,
    averageTurns: games > 0 ? turns / games : 0,
  }
}
