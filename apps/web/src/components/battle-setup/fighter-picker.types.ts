import type { Arthropod } from '@super-insect-battle/engine'

export type FighterColor = 'text-cyan-400' | 'text-pink-400'

export interface FighterPickerProps {
  label: string
  selected: Arthropod | null
  onSelect: (a: Arthropod | null) => void
  color: FighterColor
}
