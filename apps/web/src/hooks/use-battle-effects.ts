import { useState, useCallback } from 'react'
import type { BattleLogEntry } from '@super-insect-battle/engine'
import type {
  DamagePopupEffect,
  ActionTextEffect,
  BlockParticleEffect,
} from '../components/battle-scene/battle-field-3d/battle-field-3d.types.ts'
import type { HpEmphasis } from '../components/battle-scene/status-bar/hp-bar.tsx'

interface BattleEffectsState {
  damagePopups: DamagePopupEffect[]
  actionTexts: ActionTextEffect[]
  blockParticles: BlockParticleEffect[]
  playerHpEmphasis: HpEmphasis
  opponentHpEmphasis: HpEmphasis
  screenShake: boolean
  screenFlash: 'none' | 'hit' | 'critical'
}

interface BattleEffectsHandlers {
  triggerEffectsFromLog: (entry: BattleLogEntry) => void
  removeDamagePopup: (id: string) => void
  removeActionText: (id: string) => void
  removeBlockParticle: (id: string) => void
  clearPlayerHpEmphasis: () => void
  clearOpponentHpEmphasis: () => void
  clearScreenEffects: () => void
  reset: () => void
}

const PLAYER_POSITION: [number, number, number] = [-1.5, 0.8, 0]
const OPPONENT_POSITION: [number, number, number] = [1.5, 0.8, 0]

const TERRAIN_COLORS: Record<string, string> = {
  forest: '#4a7c4e',
  desert: '#c4a35a',
  wetland: '#5a7a6a',
  cave: '#5a5a6a',
}

function extractSkillName(action: string): string | null {
  const match = action.match(/의\s+(.+?)!/)
  return match ? match[1] : null
}

export function useBattleEffects(): BattleEffectsState & BattleEffectsHandlers {
  const [damagePopups, setDamagePopups] = useState<DamagePopupEffect[]>([])
  const [actionTexts, setActionTexts] = useState<ActionTextEffect[]>([])
  const [blockParticles, setBlockParticles] = useState<BlockParticleEffect[]>([])
  const [playerHpEmphasis, setPlayerHpEmphasis] = useState<HpEmphasis>('none')
  const [opponentHpEmphasis, setOpponentHpEmphasis] = useState<HpEmphasis>('none')
  const [screenShake, setScreenShake] = useState(false)
  const [screenFlash, setScreenFlash] = useState<'none' | 'hit' | 'critical'>('none')

  const triggerEffectsFromLog = useCallback((entry: BattleLogEntry) => {
    const effectId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

    if (entry.damage !== undefined && entry.damage > 0) {
      const target = entry.actor === 'player' ? 'opponent' : 'player'
      const isCritical = entry.critical ?? false

      const skillName = entry.action ? extractSkillName(entry.action) : null
      if (skillName) {
        setActionTexts((prev) => [
          ...prev,
          {
            id: `action-${effectId}`,
            text: skillName,
            actor: entry.actor,
          },
        ])
      }

      setDamagePopups((prev) => [
        ...prev,
        {
          id: `damage-${effectId}`,
          damage: entry.damage!,
          critical: isCritical,
          target,
        },
      ])

      const targetPosition = target === 'player' ? PLAYER_POSITION : OPPONENT_POSITION
      setBlockParticles((prev) => [
        ...prev,
        {
          id: `particle-${effectId}`,
          position: targetPosition,
          color: TERRAIN_COLORS.forest,
          count: isCritical ? 12 : 6,
        },
      ])

      if (target === 'player') {
        setPlayerHpEmphasis(isCritical ? 'critical' : 'damage')
      } else {
        setOpponentHpEmphasis(isCritical ? 'critical' : 'damage')
      }

      setScreenShake(true)
      setScreenFlash(isCritical ? 'critical' : 'hit')
    }
  }, [])

  const removeDamagePopup = useCallback((id: string) => {
    setDamagePopups((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const removeActionText = useCallback((id: string) => {
    setActionTexts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const removeBlockParticle = useCallback((id: string) => {
    setBlockParticles((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const clearPlayerHpEmphasis = useCallback(() => {
    setPlayerHpEmphasis('none')
  }, [])

  const clearOpponentHpEmphasis = useCallback(() => {
    setOpponentHpEmphasis('none')
  }, [])

  const clearScreenEffects = useCallback(() => {
    setScreenShake(false)
    setScreenFlash('none')
  }, [])

  const reset = useCallback(() => {
    setDamagePopups([])
    setActionTexts([])
    setBlockParticles([])
    setPlayerHpEmphasis('none')
    setOpponentHpEmphasis('none')
    setScreenShake(false)
    setScreenFlash('none')
  }, [])

  return {
    damagePopups,
    actionTexts,
    blockParticles,
    playerHpEmphasis,
    opponentHpEmphasis,
    screenShake,
    screenFlash,
    triggerEffectsFromLog,
    removeDamagePopup,
    removeActionText,
    removeBlockParticle,
    clearPlayerHpEmphasis,
    clearOpponentHpEmphasis,
    clearScreenEffects,
    reset,
  }
}
