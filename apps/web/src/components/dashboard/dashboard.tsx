import * as React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { arthropodList } from '@super-insect-battle/engine'
import type { Arthropod, BehaviorStyle } from '@super-insect-battle/engine'

import { cn } from '../../lib/utils'
import { STYLE_COLORS } from '../../lib/style-colors'
import { StatCard } from '../ui/stat-card'
import { DataTable } from '../ui/data-table'
import type { Column } from '../ui/data-table'
import { StatBar } from '../ui/stat-bar'
import { ComparisonTable } from '../ui/comparison-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Button } from '../ui/button'

const REPLAY_STORAGE_KEY = 'sib-replays'

interface SavedReplay {
  id: string
  timestamp: number
  playerName: string
  opponentName: string
  winner: string
  totalTurns: number
}

function loadReplayCount(): number {
  try {
    const raw = localStorage.getItem(REPLAY_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as unknown[]).length : 0
  } catch {
    return 0
  }
}

function loadRecentReplays(limit: number): SavedReplay[] {
  try {
    const raw = localStorage.getItem(REPLAY_STORAGE_KEY)
    if (!raw) return []
    const all = JSON.parse(raw) as SavedReplay[]
    return all.slice(0, limit)
  } catch {
    return []
  }
}

function getStyleCounts(): Record<BehaviorStyle, number> {
  const counts: Record<BehaviorStyle, number> = {
    grappler: 0,
    striker: 0,
    venomous: 0,
    defensive: 0,
  }
  for (const a of arthropodList) {
    counts[a.behavior.style]++
  }
  return counts
}

function getTopByStrength(count: number): Arthropod[] {
  return [...arthropodList]
    .sort((a, b) => b.physical.strengthIndex - a.physical.strengthIndex)
    .slice(0, count)
}

const leaderboardColumns: Column<Arthropod>[] = [
  {
    key: 'rank',
    header: '#',
    align: 'center',
    width: 'w-8',
    render: (_item, index) => (
      <span className="text-muted-foreground">{index + 1}</span>
    ),
  },
  {
    key: 'name',
    header: 'Name',
    render: (item) => (
      <div>
        <span className="font-medium text-foreground">{item.nameKo}</span>
        <span className="ml-2 text-xs text-muted-foreground">{item.name}</span>
      </div>
    ),
  },
  {
    key: 'style',
    header: 'Style',
    render: (item) => (
      <span
        className={cn(
          'rounded px-1.5 py-0.5 text-[10px] font-bold',
          STYLE_COLORS[item.behavior.style].badge
        )}
      >
        {item.behavior.style}
      </span>
    ),
  },
  {
    key: 'strength',
    header: 'STR',
    align: 'right',
    render: (item) => (
      <div className="flex items-center justify-end gap-2">
        <StatBar
          value={item.physical.strengthIndex}
          max={100}
          color="bg-red-500"
          className="w-12"
        />
        <span className="w-6 text-right tabular-nums">
          {item.physical.strengthIndex}
        </span>
      </div>
    ),
  },
]

const replayColumns: Column<SavedReplay>[] = [
  {
    key: 'index',
    header: '#',
    align: 'center',
    width: 'w-8',
    render: (_item, index) => (
      <span className="text-muted-foreground">{index + 1}</span>
    ),
  },
  {
    key: 'matchup',
    header: 'Matchup',
    render: (item) => (
      <span className="text-foreground">
        <span className="text-cyan-400">{item.playerName}</span>
        <span className="mx-1.5 text-muted-foreground">vs</span>
        <span className="text-pink-400">{item.opponentName}</span>
      </span>
    ),
  },
  {
    key: 'turns',
    header: 'Turns',
    align: 'right',
    hideBelow: 'sm',
    render: (item) => (
      <span className="tabular-nums text-muted-foreground">
        {item.totalTurns}
      </span>
    ),
  },
  {
    key: 'winner',
    header: 'Winner',
    align: 'right',
    render: (item) => (
      <span
        className={cn(
          'text-xs font-medium',
          item.winner === 'player'
            ? 'text-cyan-400'
            : item.winner === 'opponent'
              ? 'text-pink-400'
              : 'text-muted-foreground'
        )}
      >
        {item.winner === 'player'
          ? item.playerName
          : item.winner === 'opponent'
            ? item.opponentName
            : 'Draw'}
      </span>
    ),
  },
  {
    key: 'date',
    header: 'Date',
    align: 'right',
    hideBelow: 'sm',
    render: (item) => (
      <span className="text-xs text-muted-foreground">
        {new Date(item.timestamp).toLocaleDateString()}
      </span>
    ),
  },
]

export function Dashboard(): React.ReactNode {
  const navigate = useNavigate()
  const [replayCount, setReplayCount] = useState(0)
  const [recentReplays, setRecentReplays] = useState<SavedReplay[]>([])
  const [playerId, setPlayerId] = useState('')
  const [opponentId, setOpponentId] = useState('')

  useEffect(() => {
    setReplayCount(loadReplayCount())
    setRecentReplays(loadRecentReplays(5))
  }, [])

  const styleCounts = getStyleCounts()
  const topFighters = getTopByStrength(5)
  const topStr = topFighters[0]

  const playerArthropod = arthropodList.find((a) => a.id === playerId)
  const opponentArthropod = arthropodList.find((a) => a.id === opponentId)

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="mb-6 text-2xl text-foreground sm:text-3xl">Dashboard</h1>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Species"
          value={arthropodList.length}
          sublabel="Arthropod roster"
        />
        <StatCard
          label="Style Split"
          value={`${styleCounts.grappler}/${styleCounts.striker}/${styleCounts.venomous}/${styleCounts.defensive}`}
          sublabel="G / S / V / D"
        />
        <StatCard
          label="Top Strength"
          value={topStr?.physical.strengthIndex ?? 0}
          sublabel={topStr?.nameKo}
        />
        <StatCard
          label="Saved Battles"
          value={replayCount}
          sublabel="In local storage"
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg text-foreground">Top Fighters</h2>
          <DataTable
            columns={leaderboardColumns}
            data={topFighters}
            rowKey={(item) => item.id}
            onRowClick={(item) => navigate(`/encyclopedia/${item.id}`)}
            compact
          />
        </div>

        <div>
          <h2 className="mb-3 text-lg text-foreground">Quick Matchup</h2>
          <div className="overflow-hidden rounded-md border border-table-border">
            <div className="flex items-center gap-2 bg-table-header px-3 py-2">
              <Select value={playerId} onValueChange={setPlayerId}>
                <SelectTrigger className="h-8 flex-1 text-xs">
                  <SelectValue placeholder="Player" />
                </SelectTrigger>
                <SelectContent>
                  {arthropodList.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nameKo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">vs</span>
              <Select value={opponentId} onValueChange={setOpponentId}>
                <SelectTrigger className="h-8 flex-1 text-xs">
                  <SelectValue placeholder="Opponent" />
                </SelectTrigger>
                <SelectContent>
                  {arthropodList.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nameKo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => {
                  if (playerId && opponentId) {
                    navigate(
                      `/battle/setup?player=${playerId}&opponent=${opponentId}`
                    )
                  }
                }}
                disabled={!playerId || !opponentId}
              >
                Battle
              </Button>
            </div>
            {playerArthropod && opponentArthropod ? (
              <ComparisonTable
                player={playerArthropod}
                opponent={opponentArthropod}
                className="border-0 rounded-none"
              />
            ) : (
              <div className="bg-table-row-even px-3 py-8 text-center text-xs text-muted-foreground">
                Select two arthropods to compare stats
              </div>
            )}
          </div>
        </div>
      </div>

      {recentReplays.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg text-foreground">Recent Battles</h2>
            <Button
              variant="link"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => navigate('/replay')}
            >
              View all
            </Button>
          </div>
          <DataTable
            columns={replayColumns}
            data={recentReplays}
            rowKey={(item) => item.id}
            compact
          />
        </div>
      )}
    </div>
  )
}
