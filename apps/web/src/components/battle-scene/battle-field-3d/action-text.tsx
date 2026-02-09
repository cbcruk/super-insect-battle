import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

interface ActionTextProps {
  text: string
  position: [number, number, number]
  actor: 'player' | 'opponent'
  onComplete: () => void
}

const TEXT_DURATION = 1.0

const ACTOR_STYLES = {
  player: {
    textColor: 'text-cyan-300',
    textShadow: '0 0 8px rgba(0, 200, 255, 0.6)',
    borderColor: 'rgba(0, 200, 255, 0.6)',
  },
  opponent: {
    textColor: 'text-pink-300',
    textShadow: '0 0 8px rgba(255, 100, 150, 0.6)',
    borderColor: 'rgba(255, 100, 150, 0.6)',
  },
}

export function ActionText({
  text,
  position,
  actor,
  onComplete,
}: ActionTextProps): React.ReactNode {
  const startTime = useRef(0)
  const [opacity, setOpacity] = useState(0)
  const [scale, setScale] = useState(0.5)
  const style = ACTOR_STYLES[actor]

  useEffect(() => {
    startTime.current = 0
  }, [])

  useFrame((state) => {
    if (startTime.current === 0) {
      startTime.current = state.clock.elapsedTime
    }

    const elapsed = state.clock.elapsedTime - startTime.current
    const progress = elapsed / TEXT_DURATION

    if (progress >= 1) {
      onComplete()
      return
    }

    if (progress < 0.2) {
      const easeIn = progress / 0.2
      setOpacity(easeIn)
      setScale(0.5 + easeIn * 0.5)
    } else if (progress > 0.7) {
      const easeOut = (1 - progress) / 0.3
      setOpacity(easeOut)
    } else {
      setOpacity(1)
      setScale(1)
    }
  })

  return (
    <Html
      position={[position[0], position[1] + 2, position[2]]}
      center
      style={{ pointerEvents: 'none' }}
    >
      <div
        className={`whitespace-nowrap rounded-lg bg-black/80 px-4 py-2 font-bold ${style.textColor}`}
        style={{
          opacity,
          transform: `scale(${scale})`,
          textShadow: style.textShadow,
          fontSize: '16px',
          border: `2px solid ${style.borderColor}`,
        }}
      >
        {text}
      </div>
    </Html>
  )
}

interface ActionTextManagerProps {
  actions: Array<{
    id: string
    text: string
    actor: 'player' | 'opponent'
  }>
  onActionComplete: (id: string) => void
}

export function ActionTextManager({
  actions,
  onActionComplete,
}: ActionTextManagerProps): React.ReactNode {
  return (
    <>
      {actions.map((action) => (
        <ActionText
          key={action.id}
          text={action.text}
          position={action.actor === 'player' ? [-1.5, 0.8, 0] : [1.5, 0.8, 0]}
          actor={action.actor}
          onComplete={() => onActionComplete(action.id)}
        />
      ))}
    </>
  )
}
