import {
  simulateMultipleBattles,
  getRandomEnvironment,
  arthropodList,
} from '../src/index'

const arthropods = arthropodList
console.log('=== 밸런스 검증: 모든 절지동물 상대 전적 ===\n')

const results: Record<string, { wins: number; losses: number }> = {}
arthropods.forEach((a) => (results[a.id] = { wins: 0, losses: 0 }))

for (let i = 0; i < arthropods.length; i++) {
  for (let j = i + 1; j < arthropods.length; j++) {
    const a1 = arthropods[i]
    const a2 = arthropods[j]
    const result = simulateMultipleBattles(a1, a2, 50, getRandomEnvironment())

    results[a1.id].wins += result.playerWins
    results[a1.id].losses += result.opponentWins
    results[a2.id].wins += result.opponentWins
    results[a2.id].losses += result.playerWins

    const winRate = ((result.playerWins / 50) * 100).toFixed(0)
    console.log(
      `${a1.nameKo} vs ${a2.nameKo}: ${result.playerWins}-${result.opponentWins} (${winRate}%)`
    )
  }
}

console.log('\n=== 종합 성적 ===\n')
const sorted = Object.entries(results)
  .map(([id, r]) => ({
    id,
    name: arthropods.find((a) => a.id === id)!.nameKo,
    total: r.wins + r.losses,
    wins: r.wins,
    rate: ((r.wins / (r.wins + r.losses)) * 100).toFixed(1),
  }))
  .sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate))

sorted.forEach((s, i) => {
  console.log(`${i + 1}. ${s.name}: ${s.wins}/${s.total} (${s.rate}%)`)
})
