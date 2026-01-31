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
import { BattleScene } from '@super-insect-battle/web-ui'

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

export function ReplayPage(): React.ReactNode {
  const [replays, setReplays] = useState<SavedReplay[]>([])
  const [activeReplay, setActiveReplay] = useState<BattleReplay | null>(null)
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

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-amber-400">
        Battle Replays
      </h1>

      <div className="mb-6 flex gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-gray-700 bg-gray-900/60 px-4 py-2 text-sm font-bold text-gray-300 transition-colors hover:text-amber-400"
        >
          Import Replay File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {replays.length === 0 ? (
        <div className="rounded-lg border border-gray-700/50 bg-gray-900/40 p-8 text-center">
          <p className="text-gray-500">No saved replays yet.</p>
          <p className="mt-2 text-xs text-gray-600">
            Complete a battle and click &quot;Save Replay&quot; to store it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {replays.map((saved) => (
            <div
              key={saved.id}
              className="flex items-center justify-between rounded-lg border border-gray-700/50 bg-gray-900/40 p-4"
            >
              <div>
                <p className="text-sm font-bold text-gray-200">
                  {saved.playerName} vs {saved.opponentName}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(saved.timestamp).toLocaleString()} · {saved.totalTurns} turns · Winner: {saved.winner}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleLoad(saved)}
                  className="rounded bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 transition-colors hover:bg-amber-500/30"
                >
                  Play
                </button>
                <button
                  onClick={() => handleDelete(saved.id)}
                  className="rounded bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/30"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
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
        <p className="text-gray-400">Invalid replay data.</p>
      </div>
    )
  }

  const lastLog = displayedLogs[displayedLogs.length - 1]
  const currentTurn = lastLog?.turn ?? 1
  const totalLogs = battleState.log.length
  const winner = done ? battleState.winner : null

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <BattleScene
          player={player}
          opponent={opponent}
          playerBattle={battleState.player}
          opponentBattle={battleState.opponent}
          environment={battleState.environment}
          displayedPlayerHp={displayedPlayerHp}
          displayedOpponentHp={displayedOpponentHp}
          displayedLogs={displayedLogs}
          turnNumber={currentTurn}
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
    <div className="border-t border-gray-700 bg-gray-900/80 px-4 py-3 backdrop-blur-sm">
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-gray-700">
        <div
          className="h-full rounded-full bg-amber-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            disabled={done}
            className="rounded bg-gray-800 px-3 py-1 text-sm font-bold text-gray-300 transition-colors hover:text-white disabled:opacity-40"
          >
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>

          <div className="flex gap-1">
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`rounded px-2 py-0.5 text-xs font-bold transition-colors ${
                  speed === s
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-gray-500">
          {progress} / {total} {done ? '(Complete)' : ''}
        </span>
      </div>
    </div>
  )
}
