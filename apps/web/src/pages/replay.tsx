import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  getArthropodById,
  deserializeReplay,
  simulateBattle,
} from '@super-insect-battle/engine'
import type {
  BattleState,
  BattleLogEntry,
  BattleReplay,
} from '@super-insect-battle/engine'
import { BattleCommentary } from '../components/battle-commentary/battle-commentary.tsx'
import { Button } from '../components/ui/button.tsx'
import { DataTable } from '../components/ui/data-table.tsx'
import type { Column } from '../components/ui/data-table.tsx'
import { Progress } from '../components/ui/progress.tsx'
import { cn } from '../lib/utils.ts'

const REPLAY_STORAGE_KEY = 'sib-replays'
const SPEED_OPTIONS = [0.5, 1, 2, 4]

interface SavedReplay {
  id: string
  timestamp: number
  playerName: string
  opponentName: string
  winner: string
  totalTurns: number
  data: string
}

function loadSavedReplays(): SavedReplay[] {
  try {
    const raw = localStorage.getItem(REPLAY_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedReplay[]) : []
  } catch {
    return []
  }
}

function deleteSavedReplay(id: string): void {
  const replays = loadSavedReplays().filter((r) => r.id !== id)
  localStorage.setItem(REPLAY_STORAGE_KEY, JSON.stringify(replays))
}

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
    key: 'date',
    header: 'Date',
    sortable: true,
    sortValue: (item) => item.timestamp,
    render: (item) => (
      <span className="text-xs text-muted-foreground">
        {new Date(item.timestamp).toLocaleString()}
      </span>
    ),
  },
  {
    key: 'player',
    header: 'Player',
    render: (item) => (
      <span className="font-medium text-cyan-400">{item.playerName}</span>
    ),
  },
  {
    key: 'opponent',
    header: 'Opponent',
    render: (item) => (
      <span className="font-medium text-pink-400">{item.opponentName}</span>
    ),
  },
  {
    key: 'turns',
    header: 'Turns',
    align: 'right',
    sortable: true,
    sortValue: (item) => item.totalTurns,
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
]

export function ReplayPage(): React.ReactNode {
  const [replays, setReplays] = useState<SavedReplay[]>([])
  const [activeReplay, setActiveReplay] = useState<BattleReplay | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setReplays(loadSavedReplays())
  }, [])

  function handleLoad(saved: SavedReplay): void {
    const replay = deserializeReplay(saved.data)
    setActiveReplay(replay)
  }

  function handleDelete(id: string): void {
    deleteSavedReplay(id)
    setReplays(loadSavedReplays())
    if (selectedId === id) setSelectedId(null)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (): void => {
      try {
        const replay = deserializeReplay(reader.result as string)
        setActiveReplay(replay)
      } catch {
        // invalid file
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (activeReplay) {
    return (
      <ReplayViewer
        replay={activeReplay}
        onClose={() => setActiveReplay(null)}
      />
    )
  }

  const selected = replays.find((r) => r.id === selectedId)

  return (
    <div className="max-w-5xl p-6">
      <div className="mb-4 flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          Import Replay
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {replays.length === 0 ? (
        <div className="rounded-md border border-table-border bg-table-row-even px-6 py-12 text-center">
          <p className="text-muted-foreground">No saved replays yet.</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Complete a battle and click &quot;Save Replay&quot; to store it
            here.
          </p>
        </div>
      ) : (
        <>
          <DataTable
            columns={replayColumns}
            data={replays}
            rowKey={(item) => item.id}
            onRowClick={(item) =>
              setSelectedId(item.id === selectedId ? null : item.id)
            }
            defaultSort={{ key: 'date', direction: 'desc' }}
          />

          {selected && (
            <div className="mt-4 flex items-center justify-between rounded-md border border-table-border bg-table-row-even px-4 py-3">
              <div className="text-sm">
                <span className="text-cyan-400">{selected.playerName}</span>
                <span className="mx-2 text-muted-foreground">vs</span>
                <span className="text-pink-400">{selected.opponentName}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({selected.totalTurns} turns)
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleLoad(selected)}>
                  Play
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selected.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ReplayViewer({
  replay,
  onClose,
}: {
  replay: BattleReplay
  onClose: () => void
}): React.ReactNode {
  const player = getArthropodById(replay.header.playerArthropodId)
  const opponent = getArthropodById(replay.header.opponentArthropodId)

  const [battleState, setBattleState] = useState<BattleState | null>(null)
  const [displayedLogs, setDisplayedLogs] = useState<BattleLogEntry[]>([])
  const [displayedPlayerHp, setDisplayedPlayerHp] = useState(0)
  const [displayedOpponentHp, setDisplayedOpponentHp] = useState(0)
  const [currentLogIndex, setCurrentLogIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [done, setDone] = useState(false)

  const playingRef = useRef(true)
  const speedRef = useRef(1)
  const abortRef = useRef(false)

  useEffect(() => {
    playingRef.current = playing
  }, [playing])

  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  useEffect(() => {
    if (!player || !opponent) return
    abortRef.current = false

    const result = simulateBattle(player, opponent, replay.header.environment)
    setBattleState(result)
    setDisplayedPlayerHp(result.player.maxHp)
    setDisplayedOpponentHp(result.opponent.maxHp)
    setDisplayedLogs([])
    setCurrentLogIndex(0)
    setDone(false)
    setPlaying(true)

    playLogs(result)

    return (): void => {
      abortRef.current = true
    }
  }, [replay])

  const playLogs = useCallback(async (result: BattleState): Promise<void> => {
    for (let i = 0; i < result.log.length; i++) {
      if (abortRef.current) return

      while (!playingRef.current && !abortRef.current) {
        await new Promise<void>((r) => setTimeout(r, 100))
      }
      if (abortRef.current) return

      const delay = Math.round(600 / speedRef.current)
      await new Promise<void>((r) => setTimeout(r, delay))
      if (abortRef.current) return

      const entry = result.log[i]
      setDisplayedLogs((prev) => [...prev, entry])
      setCurrentLogIndex(i + 1)

      if (entry.remainingHp) {
        setDisplayedPlayerHp(entry.remainingHp.player)
        setDisplayedOpponentHp(entry.remainingHp.opponent)
      }
    }
    setDone(true)
    setPlaying(false)
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      if (e.key === ' ') {
        e.preventDefault()
        setPlaying((p) => !p)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  if (!player || !opponent || !battleState) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Invalid replay data.</p>
      </div>
    )
  }

  const totalLogs = battleState.log.length
  const winner = done ? battleState.winner : null

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <BattleCommentary
          player={player}
          opponent={opponent}
          playerBattle={battleState.player}
          opponentBattle={battleState.opponent}
          environment={battleState.environment}
          displayedPlayerHp={displayedPlayerHp}
          displayedOpponentHp={displayedOpponentHp}
          displayedLogs={displayedLogs}
          winner={winner}
          finished={done}
          onClose={onClose}
        />
      </div>

      <ReplayControls
        playing={playing}
        speed={speed}
        progress={currentLogIndex}
        total={totalLogs}
        done={done}
        onTogglePlay={() => setPlaying((p) => !p)}
        onSpeedChange={setSpeed}
      />
    </div>
  )
}

function ReplayControls({
  playing,
  speed,
  progress,
  total,
  done,
  onTogglePlay,
  onSpeedChange,
}: {
  playing: boolean
  speed: number
  progress: number
  total: number
  done: boolean
  onTogglePlay: () => void
  onSpeedChange: (s: number) => void
}): React.ReactNode {
  const percent = total > 0 ? Math.round((progress / total) * 100) : 0

  return (
    <div className="border-t border-table-border bg-background px-4 py-3">
      <Progress
        value={percent}
        className="mb-2 h-1.5 bg-stat-bar-track **:data-[slot=progress-indicator]:bg-primary"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onTogglePlay}
            disabled={done}
          >
            {playing ? 'Pause' : 'Play'}
          </Button>

          <div className="flex gap-1">
            {SPEED_OPTIONS.map((s) => (
              <Button
                key={s}
                variant={speed === s ? 'default' : 'ghost'}
                size="xs"
                onClick={() => onSpeedChange(s)}
                className={cn(
                  speed === s
                    ? 'bg-primary/20 text-primary hover:bg-primary/30'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {s}x
              </Button>
            ))}
          </div>
        </div>

        <span className="text-xs tabular-nums text-muted-foreground">
          {progress} / {total} {done ? '(Complete)' : ''}
        </span>
      </div>
    </div>
  )
}
