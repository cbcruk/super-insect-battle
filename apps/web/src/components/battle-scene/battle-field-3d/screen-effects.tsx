import React, { useEffect, useState } from 'react'

interface ScreenEffectsProps {
  shake: boolean
  flash: 'none' | 'hit' | 'critical'
  onEffectComplete: () => void
}

export function ScreenEffects({
  shake,
  flash,
  onEffectComplete,
}: ScreenEffectsProps): React.ReactNode {
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 })
  const [flashOpacity, setFlashOpacity] = useState(0)

  useEffect(() => {
    if (!shake) {
      setShakeOffset({ x: 0, y: 0 })
      return
    }

    let frame = 0
    const maxFrames = 10
    const intensity = 4

    const interval = setInterval(() => {
      frame++
      if (frame >= maxFrames) {
        clearInterval(interval)
        setShakeOffset({ x: 0, y: 0 })
        if (flash === 'none') onEffectComplete()
        return
      }

      const decay = 1 - frame / maxFrames
      setShakeOffset({
        x: (Math.random() - 0.5) * intensity * decay,
        y: (Math.random() - 0.5) * intensity * decay,
      })
    }, 30)

    return () => clearInterval(interval)
  }, [shake])

  useEffect(() => {
    if (flash === 'none') {
      setFlashOpacity(0)
      return
    }

    const startOpacity = flash === 'critical' ? 0.5 : 0.3
    setFlashOpacity(startOpacity)

    const duration = flash === 'critical' ? 300 : 200
    const startTime = Date.now()

    const animate = (): void => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / duration

      if (progress >= 1) {
        setFlashOpacity(0)
        onEffectComplete()
        return
      }

      setFlashOpacity(startOpacity * (1 - progress))
      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [flash])

  return (
    <>
      {(shake || shakeOffset.x !== 0 || shakeOffset.y !== 0) && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`,
          }}
        />
      )}
      {flashOpacity > 0 && (
        <div
          className="pointer-events-none absolute inset-0 rounded-lg"
          style={{
            backgroundColor: flash === 'critical' ? '#ff0000' : '#ff4444',
            opacity: flashOpacity,
          }}
        />
      )}
    </>
  )
}
