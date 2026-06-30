export type Side = 'player' | 'opponent'

export interface FighterInfo {
  id: string
  nameKo: string
  style: string
  maxHp: number
}

export type RenderEvent =
  | { kind: 'intro'; player: FighterInfo; opponent: FighterInfo }
  | { kind: 'turn'; turn: number }
  | { kind: 'action'; actor: Side; text: string; actionId?: string }
  | {
      kind: 'hit'
      attacker: Side
      defender: Side
      damage: number
      critical: boolean
    }
  | { kind: 'status'; target: Side; text: string; damage?: number }
  | { kind: 'hp'; player: number; opponent: number }
  | { kind: 'faint'; side: Side }
  | { kind: 'end'; winner: Side | 'draw' | null }
