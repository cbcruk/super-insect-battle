import React, { useState, useCallback } from 'react'
import {
  arthropodList,
  simulateMultipleBattles,
} from '@super-insect-battle/engine'
import type { Arthropod } from '@super-insect-battle/engine'

const styleColors: Record<string, string> = {
  grappler: 'text-red-400',
  striker: 'text-emerald-400',
  venomous: 'text-purple-400',
  defensive: 'text-blue-400',
}

interface MatchupResult {
  player: Arthropod
  opponent: Arthropod
  playerWins: number
  opponentWins: number
  draws: number
  winRate: number
  avgTurns: number
}

export function StatisticsPage(): React.ReactNode {
  const [selectedPlayer, setSelectedPlayer] = useState<Arthropod | null>(null)
  const [selectedOpponent, setSelectedOpponent] = useState<Arthropod | null>(null)
  const [simCount, setSimCount] = useState(1000)
  const [result, setResult] = useState<MatchupResult | null>(null)
  const [matrixResults, setMatrixResults] = useState<Record<string, number> | null>(null)
  const [running, setRunning] = useState(false)
  const [mode, setMode] = useState<'matchup' | 'matrix'>('matchup')

  const runMatchup = useCallback((): void => {
    if (!selectedPlayer || !selectedOpponent) return
    setRunning(true)
    setTimeout(() => {
      const stats = simulateMultipleBattles(selectedPlayer, selectedOpponent, simCount)
      setResult({
        player: selectedPlayer,
        opponent: selectedOpponent,
        ...stats,
      })
      setRunning(false)
    }, 0)
  }, [selectedPlayer, selectedOpponent, simCount])

  const runMatrix = useCallback((): void => {
    setRunning(true)
    setTimeout(() => {
      const results: Record<string, number> = {}
      for (const a of arthropodList) {
        for (const b of arthropodList) {
          if (a.id === b.id) {
            results[`${a.id}:${b.id}`] = 50
            continue
          }
          const stats = simulateMultipleBattles(a, b, Math.min(simCount, 200))
          results[`${a.id}:${b.id}`] = Math.round(stats.winRate)
        }
      }
      setMatrixResults(results)
      setRunning(false)
    }, 0)
  }, [simCount])

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-amber-400">
        Battle Statistics
      </h1>

      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setMode('matchup')}
          className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
            mode === 'matchup'
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-gray-900/60 text-gray-500 hover:text-gray-300'
          }`}
        >
          1v1 Matchup
        </button>
        <button
          onClick={() => setMode('matrix')}
          className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
            mode === 'matrix'
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-gray-900/60 text-gray-500 hover:text-gray-300'
          }`}
        >
          Win Rate Matrix
        </button>
      </div>

      {mode === 'matchup' ? (
        <MatchupMode
          selectedPlayer={selectedPlayer}
          selectedOpponent={selectedOpponent}
          onSelectPlayer={setSelectedPlayer}
          onSelectOpponent={setSelectedOpponent}
          simCount={simCount}
          onSimCountChange={setSimCount}
          onRun={runMatchup}
          running={running}
          result={result}
        />
      ) : (
        <MatrixMode
          simCount={simCount}
          onSimCountChange={setSimCount}
          onRun={runMatrix}
          running={running}
          results={matrixResults}
        />
      )}
    </div>
  )
}

function MatchupMode({
  selectedPlayer,
  selectedOpponent,
  onSelectPlayer,
  onSelectOpponent,
  simCount,
  onSimCountChange,
  onRun,
  running,
  result,
}: {
  selectedPlayer: Arthropod | null
  selectedOpponent: Arthropod | null
  onSelectPlayer: (a: Arthropod | null) => void
  onSelectOpponent: (a: Arthropod | null) => void
  simCount: number
  onSimCountChange: (n: number) => void
  onRun: () => void
  running: boolean
  result: MatchupResult | null
}): React.ReactNode {
  return (
    <div>
      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        <ArthropodPicker
          label="Player"
          selected={selectedPlayer}
          onSelect={onSelectPlayer}
        />

        <div className="flex items-center justify-center text-2xl font-bold text-gray-600">
          VS
        </div>

        <ArthropodPicker
          label="Opponent"
          selected={selectedOpponent}
          onSelect={onSelectOpponent}
        />
      </div>

      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm text-gray-400">Simulations:</label>
        <select
          value={simCount}
          onChange={(e) => onSimCountChange(Number(e.target.value))}
          className="rounded border border-gray-700 bg-gray-900/60 px-3 py-1.5 text-sm text-gray-200"
        >
          <option value={100}>100</option>
          <option value={500}>500</option>
          <option value={1000}>1,000</option>
          <option value={5000}>5,000</option>
          <option value={10000}>10,000</option>
        </select>

        <button
          onClick={onRun}
          disabled={!selectedPlayer || !selectedOpponent || running}
          className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-bold text-black transition-colors hover:bg-amber-400 disabled:opacity-40"
        >
          {running ? 'Running...' : 'Simulate'}
        </button>
      </div>

      {result && <MatchupResultCard result={result} />}
    </div>
  )
}

function ArthropodPicker({
  label,
  selected,
  onSelect,
}: {
  label: string
  selected: Arthropod | null
  onSelect: (a: Arthropod | null) => void
}): React.ReactNode {
  return (
    <div className="rounded-lg border border-gray-700/50 bg-gray-900/40 p-3">
      <label className="mb-2 block text-xs font-bold text-gray-400">{label}</label>
      <select
        value={selected?.id ?? ''}
        onChange={(e) => {
          const a = arthropodList.find((x) => x.id === e.target.value)
          onSelect(a ?? null)
        }}
        className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200"
      >
        <option value="">Select...</option>
        {arthropodList.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nameKo} ({a.name}) — {a.behavior.style}
          </option>
        ))}
      </select>

      {selected && (
        <div className="mt-3 text-xs text-gray-400">
          <span className={`font-bold ${styleColors[selected.behavior.style] ?? ''}`}>
            {selected.behavior.style}
          </span>
          {' · '}STR {selected.physical.strengthIndex}
          {' · '}ARM {selected.defense.armorRating}
          {' · '}EVA {selected.defense.evasion}
        </div>
      )}
    </div>
  )
}

function MatchupResultCard({ result }: { result: MatchupResult }): React.ReactNode {
  const total = result.playerWins + result.opponentWins + result.draws
  const playerPercent = total > 0 ? Math.round((result.playerWins / total) * 100) : 0
  const opponentPercent = total > 0 ? Math.round((result.opponentWins / total) * 100) : 0

  return (
    <div className="rounded-lg border border-gray-700/50 bg-gray-900/40 p-6">
      <div className="mb-4 flex items-center justify-between text-sm font-bold">
        <span className="text-cyan-400">{result.player.nameKo}</span>
        <span className="text-gray-500">vs</span>
        <span className="text-pink-400">{result.opponent.nameKo}</span>
      </div>

      <div className="mb-4 flex h-6 overflow-hidden rounded-full">
        <div
          className="flex items-center justify-center bg-cyan-500 text-[10px] font-bold text-black transition-all"
          style={{ width: `${playerPercent}%` }}
        >
          {playerPercent > 10 ? `${playerPercent}%` : ''}
        </div>
        {result.draws > 0 && (
          <div
            className="flex items-center justify-center bg-gray-500 text-[10px] font-bold text-black"
            style={{ width: `${100 - playerPercent - opponentPercent}%` }}
          />
        )}
        <div
          className="flex items-center justify-center bg-pink-500 text-[10px] font-bold text-black transition-all"
          style={{ width: `${opponentPercent}%` }}
        >
          {opponentPercent > 10 ? `${opponentPercent}%` : ''}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-cyan-400">{result.playerWins}</p>
          <p className="text-[10px] text-gray-500">Player Wins</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-400">{result.draws}</p>
          <p className="text-[10px] text-gray-500">Draws</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-pink-400">{result.opponentWins}</p>
          <p className="text-[10px] text-gray-500">Opponent Wins</p>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-gray-500">
        Average {result.avgTurns.toFixed(1)} turns per battle
      </div>
    </div>
  )
}

function MatrixMode({
  simCount,
  onSimCountChange,
  onRun,
  running,
  results,
}: {
  simCount: number
  onSimCountChange: (n: number) => void
  onRun: () => void
  running: boolean
  results: Record<string, number> | null
}): React.ReactNode {
  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm text-gray-400">Simulations per matchup:</label>
        <select
          value={Math.min(simCount, 200)}
          onChange={(e) => onSimCountChange(Number(e.target.value))}
          className="rounded border border-gray-700 bg-gray-900/60 px-3 py-1.5 text-sm text-gray-200"
        >
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
        </select>

        <button
          onClick={onRun}
          disabled={running}
          className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-bold text-black transition-colors hover:bg-amber-400 disabled:opacity-40"
        >
          {running ? 'Computing...' : 'Generate Matrix'}
        </button>

        <span className="text-xs text-gray-500">
          {arthropodList.length}×{arthropodList.length} = {arthropodList.length * arthropodList.length} matchups
        </span>
      </div>

      {results && <WinRateMatrix results={results} />}
    </div>
  )
}

function getWinRateColor(rate: number): string {
  if (rate >= 70) return 'bg-cyan-500/80 text-black'
  if (rate >= 55) return 'bg-cyan-500/40 text-cyan-200'
  if (rate >= 45) return 'bg-gray-700/50 text-gray-300'
  if (rate >= 30) return 'bg-pink-500/40 text-pink-200'
  return 'bg-pink-500/80 text-black'
}

function WinRateMatrix({
  results,
}: {
  results: Record<string, number>
}): React.ReactNode {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[9px]">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-gray-950 p-1 text-left text-gray-400">
              P1 ↓ / P2 →
            </th>
            {arthropodList.map((a) => (
              <th
                key={a.id}
                className="min-w-[40px] p-1 text-center text-gray-400"
                title={a.name}
              >
                <span className="block truncate">{a.nameKo.slice(0, 3)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {arthropodList.map((row) => (
            <tr key={row.id}>
              <td
                className={`sticky left-0 z-10 bg-gray-950 p-1 font-bold ${styleColors[row.behavior.style] ?? 'text-gray-400'}`}
                title={row.name}
              >
                <span className="block max-w-[60px] truncate">{row.nameKo}</span>
              </td>
              {arthropodList.map((col) => {
                const rate = results[`${row.id}:${col.id}`] ?? 50
                const isSelf = row.id === col.id
                return (
                  <td
                    key={col.id}
                    className={`p-1 text-center font-mono ${
                      isSelf ? 'bg-gray-800/30 text-gray-600' : getWinRateColor(rate)
                    }`}
                    title={`${row.nameKo} vs ${col.nameKo}: ${rate}%`}
                  >
                    {isSelf ? '—' : rate}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
