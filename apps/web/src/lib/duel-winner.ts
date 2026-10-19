import {
  duelOutcome,
  type Actor,
  type RunState,
} from '@super-insect-battle/roguelike'

/** 끝난 격자 매치업의 승자. 무승부거나 아직 진행 중이면 undefined. */
export function duelWinner(run: RunState): Actor | undefined {
  const outcome = duelOutcome(run)
  if (outcome === 'player') return run.player
  if (outcome === 'opponent') {
    return run.level.actors.find((a) => a !== run.player)
  }
  return undefined
}
