import React, { useState, useCallback } from 'react'
import {
  arthropodList,
  simulateMultipleBattles,
} from '@super-insect-battle/engine'
import type { Arthropod } from '@super-insect-battle/engine'
import {
  battleApi,
  type CumulativeStatsResponse,
} from '../bridge/api-client.ts'
import { Button } from '../components/ui/button.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select.tsx'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../components/ui/tabs.tsx'
import { StatBar } from '../components/ui/stat-bar.tsx'
import { STYLE_COLORS } from '../lib/style-colors.ts'
import { cn } from '../lib/utils.ts'

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
  const [selectedOpponent, setSelectedOpponent] = useState<Arthropod | null>(
    null
  )
  const [simCount, setSimCount] = useState('1000')
  const [result, setResult] = useState<MatchupResult | null>(null)
  const [matrixResults, setMatrixResults] = useState<Record<
    string,
    number
  > | null>(null)
  const [running, setRunning] = useState(false)
  const [source, setSource] = useState<'local' | 'server'>('local')
  const [cumulative, setCumulative] =
    useState<CumulativeStatsResponse | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const runMatchup = useCallback((): void => {
    if (!selectedPlayer || !selectedOpponent) return
    setRunning(true)
    setServerError(null)

    if (source === 'local') {
      setCumulative(null)
      setTimeout(() => {
        const stats = simulateMultipleBattles(
          selectedPlayer,
          selectedOpponent,
          Number(simCount)
        )
        setResult({
          player: selectedPlayer,
          opponent: selectedOpponent,
          ...stats,
        })
        setRunning(false)
      }, 0)
      return
    }

    // 서버 모드: 서버에서 배틀을 돌리고 결과를 D1에 누적 저장한다.
    // 서버는 1회 요청당 최대 1,000회로 제한한다.
    void (async () => {
      try {
        const res = await battleApi.getStats(
          selectedPlayer.id,
          selectedOpponent.id,
          Math.min(Number(simCount), 1000)
        )
        setResult({
          player: selectedPlayer,
          opponent: selectedOpponent,
          playerWins: res.stats.playerWins,
          opponentWins: res.stats.opponentWins,
          draws: res.stats.draws,
          winRate: res.stats.winRate,
          avgTurns: res.stats.avgTurns,
        })
        const cum = await battleApi.getCumulativeStats(
          selectedPlayer.id,
          selectedOpponent.id
        )
        setCumulative(cum)
      } catch (e) {
        setServerError(
          e instanceof Error ? e.message : '서버에 연결할 수 없습니다.'
        )
        setCumulative(null)
      } finally {
        setRunning(false)
      }
    })()
  }, [selectedPlayer, selectedOpponent, simCount, source])

  const matrixSimCount = Math.min(Number(simCount), 200).toString()

  const runMatrix = useCallback((): void => {
    setRunning(true)
    setTimeout(() => {
      const results: Record<string, number> = {}
      const count = Math.min(Number(simCount), 200)
      for (const a of arthropodList) {
        for (const b of arthropodList) {
          if (a.id === b.id) {
            results[`${a.id}:${b.id}`] = 50
            continue
          }
          const stats = simulateMultipleBattles(a, b, count)
          results[`${a.id}:${b.id}`] = Math.round(stats.winRate)
        }
      }
      setMatrixResults(results)
      setRunning(false)
    }, 0)
  }, [simCount])

  return (
    <div className="max-w-6xl p-6">
      <Tabs defaultValue="matchup">
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="matchup">1v1 Matchup</TabsTrigger>
          <TabsTrigger value="matrix">Win Rate Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="matchup">
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
            source={source}
            onSourceChange={setSource}
            cumulative={cumulative}
            serverError={serverError}
          />
        </TabsContent>

        <TabsContent value="matrix">
          <MatrixMode
            simCount={matrixSimCount}
            onSimCountChange={setSimCount}
            onRun={runMatrix}
            running={running}
            results={matrixResults}
          />
        </TabsContent>
      </Tabs>
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
  source,
  onSourceChange,
  cumulative,
  serverError,
}: {
  selectedPlayer: Arthropod | null
  selectedOpponent: Arthropod | null
  onSelectPlayer: (a: Arthropod | null) => void
  onSelectOpponent: (a: Arthropod | null) => void
  simCount: string
  onSimCountChange: (n: string) => void
  onRun: () => void
  running: boolean
  result: MatchupResult | null
  source: 'local' | 'server'
  onSourceChange: (s: 'local' | 'server') => void
  cumulative: CumulativeStatsResponse | null
  serverError: string | null
}): React.ReactNode {
  return (
    <div>
      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        <ArthropodPicker
          label="Player"
          selected={selectedPlayer}
          onSelect={onSelectPlayer}
          color="text-cyan-400"
        />

        <div className="flex items-center justify-center text-2xl font-bold text-muted-foreground/50">
          VS
        </div>

        <ArthropodPicker
          label="Opponent"
          selected={selectedOpponent}
          onSelect={onSelectOpponent}
          color="text-pink-400"
        />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-xs text-muted-foreground">Simulations</span>
        <Select value={simCount} onValueChange={onSimCountChange}>
          <SelectTrigger className="h-8 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="500">500</SelectItem>
            <SelectItem value="1000">1,000</SelectItem>
            <SelectItem value="5000">5,000</SelectItem>
            <SelectItem value="10000">10,000</SelectItem>
          </SelectContent>
        </Select>

        <div className="inline-flex overflow-hidden rounded-md border border-white/10">
          <Button
            size="xs"
            variant={source === 'local' ? 'default' : 'ghost'}
            className="rounded-none"
            onClick={() => onSourceChange('local')}
          >
            브라우저
          </Button>
          <Button
            size="xs"
            variant={source === 'server' ? 'default' : 'ghost'}
            className="rounded-none"
            onClick={() => onSourceChange('server')}
          >
            서버(누적)
          </Button>
        </div>

        <Button
          size="sm"
          onClick={onRun}
          disabled={!selectedPlayer || !selectedOpponent || running}
        >
          {running ? 'Running...' : 'Simulate'}
        </Button>

        {source === 'server' && (
          <span className="text-[11px] text-muted-foreground">
            서버는 요청당 최대 1,000회, 결과를 누적 저장합니다
          </span>
        )}
      </div>

      {serverError && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          서버 연결 실패: {serverError} — 브라우저 모드로 실행할 수 있습니다.
        </div>
      )}

      {result && <MatchupResultCard result={result} />}

      {cumulative && cumulative.stats.totalBattles > 0 && (
        <CumulativeStatsCard cumulative={cumulative} />
      )}
    </div>
  )
}

function CumulativeStatsCard({
  cumulative,
}: {
  cumulative: CumulativeStatsResponse
}): React.ReactNode {
  const { stats } = cumulative

  return (
    <div className="mt-4 overflow-hidden rounded-md border border-table-border">
      <div className="bg-table-header px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        누적 통계 (서버 저장 · 총 {stats.totalBattles.toLocaleString()}전)
      </div>
      <div className="grid grid-cols-2 gap-px bg-table-border sm:grid-cols-4">
        <StatCell label="Player Wins" value={stats.playerWins} accent="text-cyan-400" />
        <StatCell
          label="Opponent Wins"
          value={stats.opponentWins}
          accent="text-pink-400"
        />
        <StatCell label="Win Rate" value={`${stats.winRate}%`} />
        <StatCell label="Avg Turns" value={stats.avgTurns} />
      </div>
    </div>
  )
}

function StatCell({
  label,
  value,
  accent,
}: {
  label: string
  value: number | string
  accent?: string
}): React.ReactNode {
  return (
    <div className="bg-table-row-even px-3 py-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn('mt-1 text-lg font-bold tabular-nums', accent ?? 'text-foreground')}
      >
        {value}
      </div>
    </div>
  )
}

function ArthropodPicker({
  label,
  selected,
  onSelect,
  color,
}: {
  label: string
  selected: Arthropod | null
  onSelect: (a: Arthropod | null) => void
  color: string
}): React.ReactNode {
  return (
    <div className="overflow-hidden rounded-md border border-table-border">
      <div className="bg-table-header px-3 py-2">
        <span
          className={cn(
            'text-[11px] font-semibold uppercase tracking-wider',
            color
          )}
        >
          {label}
        </span>
      </div>
      <div className="bg-table-row-even p-3">
        <Select
          value={selected?.id ?? ''}
          onValueChange={(v) => {
            const a = arthropodList.find((x) => x.id === v)
            onSelect(a ?? null)
          }}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {arthropodList.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.nameKo} ({a.name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selected && (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-[10px] font-bold',
                  STYLE_COLORS[selected.behavior.style].badge
                )}
              >
                {selected.behavior.style}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
              <div>
                <span className="block uppercase">STR</span>
                <StatBar
                  value={selected.physical.strengthIndex}
                  max={100}
                  color="bg-red-500"
                  size="sm"
                />
                <span className="tabular-nums text-foreground">
                  {selected.physical.strengthIndex}
                </span>
              </div>
              <div>
                <span className="block uppercase">ARM</span>
                <StatBar
                  value={selected.defense.armorRating}
                  max={100}
                  color="bg-blue-500"
                  size="sm"
                />
                <span className="tabular-nums text-foreground">
                  {selected.defense.armorRating}
                </span>
              </div>
              <div>
                <span className="block uppercase">EVA</span>
                <StatBar
                  value={selected.defense.evasion}
                  max={100}
                  color="bg-emerald-500"
                  size="sm"
                />
                <span className="tabular-nums text-foreground">
                  {selected.defense.evasion}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MatchupResultCard({
  result,
}: {
  result: MatchupResult
}): React.ReactNode {
  const total = result.playerWins + result.opponentWins + result.draws
  const playerPercent =
    total > 0 ? Math.round((result.playerWins / total) * 100) : 0
  const opponentPercent =
    total > 0 ? Math.round((result.opponentWins / total) * 100) : 0

  return (
    <div className="overflow-hidden rounded-md border border-table-border">
      <div className="bg-table-header px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Simulation Results
      </div>

      <div className="bg-table-row-even p-4">
        <div className="mb-3 flex items-center justify-between text-sm font-bold">
          <span className="text-cyan-400">{result.player.nameKo}</span>
          <span className="text-muted-foreground/50">vs</span>
          <span className="text-pink-400">{result.opponent.nameKo}</span>
        </div>

        <div className="mb-4 flex h-5 overflow-hidden rounded-full">
          <div
            className="flex items-center justify-center bg-cyan-500 text-[10px] font-bold text-black transition-all"
            style={{ width: `${playerPercent}%` }}
          >
            {playerPercent > 10 ? `${playerPercent}%` : ''}
          </div>
          {result.draws > 0 && (
            <div
              className="flex items-center justify-center bg-muted-foreground/30 text-[10px] font-bold"
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

        <table className="w-full border-collapse text-sm">
          <tbody>
            <tr className="bg-table-row-odd">
              <td className="border-b border-table-border/50 px-3 py-2 text-muted-foreground">
                Player Wins
              </td>
              <td className="border-b border-table-border/50 px-3 py-2 text-right tabular-nums font-medium text-cyan-400">
                {result.playerWins}
              </td>
              <td className="border-b border-table-border/50 px-3 py-2 text-right tabular-nums text-muted-foreground">
                {playerPercent}%
              </td>
            </tr>
            <tr className="bg-table-row-even">
              <td className="border-b border-table-border/50 px-3 py-2 text-muted-foreground">
                Opponent Wins
              </td>
              <td className="border-b border-table-border/50 px-3 py-2 text-right tabular-nums font-medium text-pink-400">
                {result.opponentWins}
              </td>
              <td className="border-b border-table-border/50 px-3 py-2 text-right tabular-nums text-muted-foreground">
                {opponentPercent}%
              </td>
            </tr>
            <tr className="bg-table-row-odd">
              <td className="border-b border-table-border/50 px-3 py-2 text-muted-foreground">
                Draws
              </td>
              <td className="border-b border-table-border/50 px-3 py-2 text-right tabular-nums font-medium text-foreground">
                {result.draws}
              </td>
              <td className="border-b border-table-border/50 px-3 py-2 text-right tabular-nums text-muted-foreground">
                {100 - playerPercent - opponentPercent}%
              </td>
            </tr>
            <tr className="bg-table-row-even">
              <td className="px-3 py-2 text-muted-foreground">Avg Turns</td>
              <td
                colSpan={2}
                className="px-3 py-2 text-right tabular-nums font-medium text-foreground"
              >
                {result.avgTurns.toFixed(1)}
              </td>
            </tr>
          </tbody>
        </table>
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
  simCount: string
  onSimCountChange: (n: string) => void
  onRun: () => void
  running: boolean
  results: Record<string, number> | null
}): React.ReactNode {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Per matchup</span>
        <Select value={simCount} onValueChange={onSimCountChange}>
          <SelectTrigger className="h-8 w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="200">200</SelectItem>
          </SelectContent>
        </Select>

        <Button size="sm" onClick={onRun} disabled={running}>
          {running ? 'Computing...' : 'Generate Matrix'}
        </Button>

        <span className="text-xs text-muted-foreground">
          {arthropodList.length}&times;{arthropodList.length} ={' '}
          {arthropodList.length * arthropodList.length} matchups
        </span>
      </div>

      {results && <WinRateMatrix results={results} />}
    </div>
  )
}

function getWinRateColor(rate: number): string {
  if (rate >= 70) return 'bg-cyan-500/80 text-black'
  if (rate >= 55) return 'bg-cyan-500/40 text-cyan-200'
  if (rate >= 45) return 'bg-table-row-hover text-muted-foreground'
  if (rate >= 30) return 'bg-pink-500/40 text-pink-200'
  return 'bg-pink-500/80 text-black'
}

function WinRateMatrix({
  results,
}: {
  results: Record<string, number>
}): React.ReactNode {
  return (
    <div className="overflow-x-auto rounded-md border border-table-border">
      <table className="w-full border-collapse text-[9px]">
        <thead>
          <tr className="bg-table-header">
            <th className="sticky left-0 z-10 bg-table-header p-1 text-left text-[10px] text-muted-foreground">
              P1 &darr; / P2 &rarr;
            </th>
            {arthropodList.map((a) => (
              <th
                key={a.id}
                className="min-w-10 p-1 text-center text-muted-foreground"
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
                className={cn(
                  'sticky left-0 z-10 bg-table-row-even p-1 font-bold',
                  STYLE_COLORS[row.behavior.style].text
                )}
                title={row.name}
              >
                <span className="block max-w-15 truncate">{row.nameKo}</span>
              </td>
              {arthropodList.map((col) => {
                const rate = results[`${row.id}:${col.id}`] ?? 50
                const isSelf = row.id === col.id
                return (
                  <td
                    key={col.id}
                    className={cn(
                      'p-1 text-center font-mono',
                      isSelf
                        ? 'bg-table-row-odd text-muted-foreground/30'
                        : getWinRateColor(rate)
                    )}
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
