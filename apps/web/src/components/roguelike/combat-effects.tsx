import React from 'react'
import type {
  HitEffect,
  HitEffectKind,
} from '../../lib/combat-feedback.types.ts'
import { cn } from '../../lib/utils.ts'

const LABEL_CLASS: Record<HitEffectKind, string> = {
  damage: 'text-[13px] text-white',
  critical: 'text-[16px] text-amber-300',
  miss: 'text-[9px] text-slate-400',
  venom: 'text-[12px] text-purple-300',
  condition: 'text-[10px] text-purple-300',
}

/**
 * 맵 캔버스 위에 겹쳐 떠오르는 피해 숫자를 그린다.
 *
 * 칸 번쩍임과 입자는 Pixi 무대가 맡고, 글자는 선명하게 보이도록 DOM에 남긴다.
 */
export function CombatEffects({
  effects,
  cell,
}: {
  effects: HitEffect[]
  cell: number
}): React.ReactNode {
  return (
    <div className="pointer-events-none absolute inset-0">
      {effects.map((effect) => (
        <span
          key={effect.id}
          className={cn(
            'absolute animate-float-damage whitespace-nowrap font-mono font-bold [text-shadow:0_1px_2px_#000,0_0_4px_#000]',
            LABEL_CLASS[effect.kind],
            effect.onPlayer &&
              (effect.kind === 'damage' || effect.kind === 'critical') &&
              'text-red-400'
          )}
          style={{
            animationDelay: `${effect.delayMs}ms`,
            left: effect.pos.x * cell + cell / 2,
            top: effect.pos.y * cell - cell * (0.3 + effect.stack * 0.7),
          }}
        >
          {effect.label}
        </span>
      ))}
    </div>
  )
}
