import React, { useEffect, useState, useRef } from 'react'
import { cn } from '../../../lib/utils.ts'
import { Progress } from '../../ui/progress.tsx'

export type HpEmphasis = 'none' | 'damage' | 'critical' | 'heal'

interface HpBarProps {
  current: number
  max: number
  emphasis?: HpEmphasis
  onEmphasisComplete?: () => void
}

function getHpColor(ratio: number): string {
  if (ratio > 0.5) return '[&_[data-slot=progress-indicator]]:bg-green-500'
  if (ratio > 0.25) return '[&_[data-slot=progress-indicator]]:bg-yellow-500'
  return '[&_[data-slot=progress-indicator]]:bg-red-500'
}

export function HpBar({
  current,
  max,
  emphasis = 'none',
  onEmphasisComplete,
}: HpBarProps): React.ReactNode {
  const ratio = max > 0 ? Math.max(0, current) / max : 0
  const percent = Math.round(ratio * 100)
  const prevCurrent = useRef(current)

  const [isFlashing, setIsFlashing] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [flashColor, setFlashColor] = useState<string>('')

  useEffect(() => {
    if (emphasis === 'none') {
      setIsFlashing(false)
      setIsShaking(false)
      return
    }

    if (emphasis === 'critical') {
      setFlashColor('shadow-[0_0_20px_rgba(255,0,0,0.8)]')
      setIsFlashing(true)
      setIsShaking(true)
    } else if (emphasis === 'damage') {
      setFlashColor('shadow-[0_0_12px_rgba(255,100,100,0.6)]')
      setIsFlashing(true)
      setIsShaking(true)
    } else if (emphasis === 'heal') {
      setFlashColor('shadow-[0_0_12px_rgba(100,255,100,0.6)]')
      setIsFlashing(true)
      setIsShaking(false)
    }

    const timer = setTimeout(() => {
      setIsFlashing(false)
      setIsShaking(false)
      onEmphasisComplete?.()
    }, emphasis === 'critical' ? 500 : 300)

    return () => clearTimeout(timer)
  }, [emphasis, onEmphasisComplete])

  useEffect(() => {
    prevCurrent.current = current
  }, [current])

  return (
    <div
      className={cn(
        'flex items-center gap-2 transition-transform',
        isShaking && 'animate-hp-shake'
      )}
    >
      <Progress
        value={percent}
        className={cn(
          'h-3 flex-1 bg-gray-700 transition-shadow duration-150',
          getHpColor(ratio),
          isFlashing && flashColor
        )}
      />
      <span
        className={cn(
          'min-w-16 text-right text-xs font-mono transition-all duration-150',
          isFlashing && emphasis === 'critical'
            ? 'text-red-400 font-bold scale-110'
            : isFlashing && emphasis === 'damage'
              ? 'text-red-300'
              : isFlashing && emphasis === 'heal'
                ? 'text-green-300'
                : 'text-gray-300'
        )}
      >
        {current}/{max}
      </span>
    </div>
  )
}
