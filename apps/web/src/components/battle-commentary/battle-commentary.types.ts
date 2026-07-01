import type {
  Arthropod,
  BattleArthropod,
  BattleLogEntry,
  Environment,
} from '@super-insect-battle/engine'

export interface PlaybackControls {
  paused: boolean
  speedIndex: number
  onTogglePause: () => void
  onCycleSpeed: () => void
  onSkip: () => void
}

export interface BattleCommentaryProps {
  player: Arthropod
  opponent: Arthropod
  playerBattle: BattleArthropod | null
  opponentBattle: BattleArthropod | null
  environment: Environment
  displayedPlayerHp: number
  displayedOpponentHp: number
  displayedLogs: BattleLogEntry[]
  winner: 'player' | 'opponent' | 'draw' | null
  finished: boolean
  onClose: () => void
  onSaveReplay?: () => void
  onDownloadReplay?: () => void
  replaySaved?: boolean
  controls?: PlaybackControls
}
