import React, { useEffect, useRef } from 'react'
import { createGame, destroyGame } from '../game/game'

export function GameCanvas(): React.ReactNode {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!canvasRef.current || initializedRef.current) return

    initializedRef.current = true
    const game = createGame(canvasRef.current)

    game.start().then(() => {
      game.goToScene('battle')
    })

    return () => {
      destroyGame()
      initializedRef.current = false
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  )
}
