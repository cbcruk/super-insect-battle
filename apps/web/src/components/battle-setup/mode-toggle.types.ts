import type { BattleMode } from '../../stores/game-store.types.ts'

export interface ModeToggleProps {
  mode: BattleMode
  onChange: (mode: BattleMode) => void
}
