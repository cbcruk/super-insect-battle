import {
  simulateBattle,
  simulateMultipleBattles,
  type Arthropod,
  type BattleState,
} from '@super-insect-battle/engine'

export function runBattle(
  arthropod1: Arthropod,
  arthropod2: Arthropod
): BattleState {
  return simulateBattle(arthropod1, arthropod2)
}

export function runMultipleBattles(
  arthropod1: Arthropod,
  arthropod2: Arthropod,
  count: number
): {
  playerWins: number
  opponentWins: number
  draws: number
  winRate: number
  avgTurns: number
} {
  return simulateMultipleBattles(arthropod1, arthropod2, count)
}
