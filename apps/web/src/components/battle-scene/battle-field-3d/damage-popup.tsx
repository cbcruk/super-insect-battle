import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

interface DamagePopupProps {
  damage: number
  critical: boolean
  position: [number, number, number]
  onComplete: () => void
}

const POPUP_DURATION = 1.2

export function DamagePopup({
  damage,
  critical,
  position,
  onComplete,
}: DamagePopupProps): React.ReactNode {
  const startTime = useRef(0)
  const [offset, setOffset] = useState(0)
  const [opacity, setOpacity] = useState(1)
  const [scale, setScale] = useState(critical ? 1.5 : 1)

  useEffect(() => {
    startTime.current = 0
  }, [])

  useFrame((state) => {
    if (startTime.current === 0) {
      startTime.current = state.clock.elapsedTime
    }

    const elapsed = state.clock.elapsedTime - startTime.current
    const progress = elapsed / POPUP_DURATION

    if (progress >= 1) {
      onComplete()
      return
    }

    setOffset(progress * 1.5)
    setOpacity(1 - progress * progress)

    if (critical) {
      setScale(1.5 - progress * 0.5)
    }
  })

  return (
    <Html
      position={[position[0], position[1] + 1 + offset, position[2]]}
      center
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="whitespace-nowrap font-bold"
        style={{
          opacity,
          transform: `scale(${scale})`,
          color: critical ? '#ff4444' : '#ffffff',
          textShadow: critical
            ? '0 0 10px #ff0000, 2px 2px 0 #000'
            : '2px 2px 0 #000',
          fontSize: critical ? '28px' : '22px',
        }}
      >
        -{damage}
      </div>
    </Html>
  )
}

interface DamagePopupManagerProps {
  popups: Array<{
    id: string
    damage: number
    critical: boolean
    target: 'player' | 'opponent'
  }>
  onPopupComplete: (id: string) => void
}

export function DamagePopupManager({
  popups,
  onPopupComplete,
}: DamagePopupManagerProps): React.ReactNode {
  return (
    <>
      {popups.map((popup) => (
        <DamagePopup
          key={popup.id}
          damage={popup.damage}
          critical={popup.critical}
          position={popup.target === 'player' ? [-1.5, 0.8, 0] : [1.5, 0.8, 0]}
          onComplete={() => onPopupComplete(popup.id)}
        />
      ))}
    </>
  )
}
