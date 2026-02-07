import React from 'react'
import type { BattleMode } from '../../stores/game-store.types.ts'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group.tsx'
import { Label } from '../ui/label.tsx'
import { cn } from '../../lib/utils.ts'
import type { ModeToggleProps } from './mode-toggle.types.ts'

const modeOptions: { value: BattleMode; label: string }[] = [
  { value: 'player-vs-ai', label: 'Player vs AI' },
  { value: 'ai-vs-ai', label: 'AI vs AI' },
]

export function ModeToggle({
  mode,
  onChange,
}: ModeToggleProps): React.ReactNode {
  return (
    <RadioGroup
      value={mode}
      onValueChange={(v) => onChange(v as BattleMode)}
      className="flex items-center gap-4"
    >
      {modeOptions.map((option) => (
        <Label
          key={option.value}
          className={cn(
            'flex cursor-pointer items-center gap-2 transition-colors',
            mode === option.value ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          <RadioGroupItem value={option.value} />
          {option.label}
        </Label>
      ))}
    </RadioGroup>
  )
}
