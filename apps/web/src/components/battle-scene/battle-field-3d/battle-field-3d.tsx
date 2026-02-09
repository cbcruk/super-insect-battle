import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { formatEnvironment } from '@super-insect-battle/engine'
import type { BattleField3DProps } from './battle-field-3d.types.ts'
import { ArenaGround } from './arena-ground.tsx'
import { ArenaLighting } from './arena-lighting.tsx'
import { Character3D } from './character-3d.tsx'
import { CameraController } from './camera-controller.tsx'
import { AmbientParticles } from './ambient-particles.tsx'
import { ArenaSky } from './arena-sky.tsx'
import { GlassBox } from './glass-box.tsx'
import { BlockDecorations } from './block-decorations.tsx'
import { DamagePopupManager } from './damage-popup.tsx'
import { ActionTextManager } from './action-text.tsx'
import { BlockParticleManager } from './block-particles.tsx'
import { isMobileDevice } from '../../../lib/webgl-support.ts'

export function BattleField3D({
  player,
  opponent,
  environment,
  playerFainted = false,
  opponentFainted = false,
  playerAnimation = 'idle',
  opponentAnimation = 'idle',
  turnNumber,
  message,
  damagePopups = [],
  actionTexts = [],
  blockParticles = [],
  onDamagePopupComplete,
  onActionTextComplete,
  onBlockParticleComplete,
}: BattleField3DProps): React.ReactNode {
  const isMobile = isMobileDevice()
  const [debug, setDebug] = useState(import.meta.env.DEV)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'd' && e.ctrlKey) {
        e.preventDefault()
        setDebug((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{ height: 320 }}
    >
      <Leva hidden={!debug} collapsed />
      <Canvas
        shadows={!isMobile}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{
          antialias: !isMobile,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
        }}
      >
        <CameraController debug={debug} />
        <ArenaSky
          timeOfDay={environment.timeOfDay}
          weather={environment.weather}
        />
        <ArenaLighting
          timeOfDay={environment.timeOfDay}
          weather={environment.weather}
        />
        <ArenaGround terrain={environment.terrain} />
        <GlassBox />
        <BlockDecorations terrain={environment.terrain} />
        <AmbientParticles
          terrain={environment.terrain}
          weather={environment.weather}
        />
        <Character3D
          arthropod={player}
          side="player"
          fainted={playerFainted}
          animation={playerAnimation}
        />
        <Character3D
          arthropod={opponent}
          side="opponent"
          fainted={opponentFainted}
          animation={opponentAnimation}
        />
        <DamagePopupManager
          popups={damagePopups}
          onPopupComplete={onDamagePopupComplete ?? (() => {})}
        />
        <ActionTextManager
          actions={actionTexts}
          onActionComplete={onActionTextComplete ?? (() => {})}
        />
        <BlockParticleManager
          effects={blockParticles}
          onEffectComplete={onBlockParticleComplete ?? (() => {})}
        />
      </Canvas>

      {turnNumber != null && (
        <div className="absolute left-4 top-4 rounded-md bg-black/50 px-3 py-1 text-sm font-bold text-white">
          Turn {turnNumber}
        </div>
      )}

      <div className="absolute right-4 top-4 rounded-md bg-black/40 px-2 py-1 text-xs text-gray-300">
        {formatEnvironment(environment)}
      </div>

      {message && (
        <div className="absolute inset-x-0 bottom-0 bg-black/70 px-4 py-3 text-sm text-white">
          {message}
        </div>
      )}
    </div>
  )
}

export default BattleField3D
