export type Side = 'player' | 'opponent'

export type Magnitude = 'glance' | 'solid' | 'heavy' | 'crushing'
export type Matchup = 'up' | 'down' | 'neutral'

export interface IntroEvent {
  kind: 'intro'
  player: string
  opponent: string
  environment: string
}

export interface TurnEvent {
  kind: 'turn'
  turn: number
}

export interface Hp {
  player: number
  opponent: number
}

export interface AttackEvent {
  kind: 'attack'
  turn: number
  attacker: Side
  attackerName: string
  defenderName: string
  move: string
  damage: number
  magnitude: Magnitude
  critical: boolean
  matchup: Matchup
  defenderHpRatio: number
  appliedStatus?: string
  hpAfter?: Hp
}

export interface MissEvent {
  kind: 'miss'
  turn: number
  attacker: Side
  attackerName: string
  defenderName: string
  move: string
}

export type MoveIntent =
  | 'guard'
  | 'brace'
  | 'flee'
  | 'defenseUp'
  | 'evasionUp'
  | 'strengthUp'
  | 'weaken'
  | 'blind'
  | 'ensnare'
  | 'confuse'
  | 'envenom'

export interface MoveEvent {
  kind: 'move'
  turn: number
  actor: Side
  actorName: string
  move: string
  intent: MoveIntent
}

export interface NoteEvent {
  kind: 'note'
  turn: number
  side: Side
  text: string
  damage?: number
  hpAfter?: Hp
}

export interface FaintEvent {
  kind: 'faint'
  turn: number
  side: Side
  name: string
  hpAfter?: Hp
}

export interface EndEvent {
  kind: 'end'
  winner: Side | 'draw' | null
  winnerName: string | null
  turns: number
}

export type BattleEvent =
  | IntroEvent
  | TurnEvent
  | AttackEvent
  | MissEvent
  | MoveEvent
  | NoteEvent
  | FaintEvent
  | EndEvent

export type Emphasis = 'normal' | 'strong' | 'critical' | 'system' | 'header'

export interface CommentaryLine {
  text: string
  emphasis: Emphasis
  actor?: Side
  turn?: number
}

export interface FeedItem {
  line: CommentaryLine
  hp: Hp
}

export interface MatchFeed {
  player: string
  opponent: string
  maxHp: Hp
  environment: string
  items: FeedItem[]
}
