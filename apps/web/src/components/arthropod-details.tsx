import React from 'react'
import type { Arthropod } from '@super-insect-battle/engine'
import { terrainNames, timeOfDayNames } from '@super-insect-battle/engine'
import { useKeyboard } from '../hooks/use-keyboard'
import { getStyleColor } from '../utils/colors'

interface ArthropodDetailsProps {
  arthropod: Arthropod
  onBack: () => void
}

export function ArthropodDetails({
  arthropod,
  onBack,
}: ArthropodDetailsProps): React.ReactNode {
  useKeyboard((e) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === 'q') {
      onBack()
    }
  })

  const styleColor = getStyleColor(arthropod.behavior.style)

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ color: 'var(--tui-yellow)', fontWeight: 'bold' }}>
        === {arthropod.nameKo} ===
      </span>
      <span style={{ color: 'var(--tui-gray)' }}>{arthropod.name}</span>
      <div style={{ margin: '0.5rem 0' }}>
        <span>{arthropod.description}</span>
      </div>

      <span style={{ color: 'var(--tui-cyan)', fontWeight: 'bold' }}>
        Physical Characteristics:
      </span>
      <span> Weight: {arthropod.physical.weightG}g</span>
      <span> Length: {arthropod.physical.lengthMm}mm</span>
      <span> Strength Index: {arthropod.physical.strengthIndex}</span>

      <div style={{ marginTop: '0.5rem' }}>
        <span style={{ color: 'var(--tui-cyan)', fontWeight: 'bold' }}>
          Weapon:
        </span>
      </div>
      <span> Type: {arthropod.weapon.type}</span>
      <span> Power: {arthropod.weapon.power}</span>
      <span> Venomous: {arthropod.weapon.venomous ? 'Yes' : 'No'}</span>
      {arthropod.weapon.venomPotency && (
        <span> Venom Potency: {arthropod.weapon.venomPotency}</span>
      )}

      <div style={{ marginTop: '0.5rem' }}>
        <span style={{ color: 'var(--tui-cyan)', fontWeight: 'bold' }}>
          Behavior:
        </span>
      </div>
      <span> Aggression: {arthropod.behavior.aggression}</span>
      <div style={{ display: 'flex' }}>
        <span> Style: </span>
        <span style={{ color: styleColor }}>{arthropod.behavior.style}</span>
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        <span style={{ color: 'var(--tui-cyan)', fontWeight: 'bold' }}>
          Defense:
        </span>
      </div>
      <span> Armor Rating: {arthropod.defense.armorRating}</span>
      <span> Evasion: {arthropod.defense.evasion}</span>

      <div style={{ marginTop: '0.5rem' }}>
        <span style={{ color: 'var(--tui-cyan)', fontWeight: 'bold' }}>
          Habitat:
        </span>
      </div>
      <span>
        {' '}
        Preferred Terrain:{' '}
        {arthropod.habitat.preferredTerrains
          .map((t) => terrainNames[t])
          .join(', ')}
      </span>
      <span>
        {' '}
        Active Time:{' '}
        {arthropod.habitat.preferredTime === 'both'
          ? 'Day and Night'
          : timeOfDayNames[arthropod.habitat.preferredTime]}
      </span>

      <div style={{ marginTop: '1rem' }}>
        <span style={{ color: 'var(--tui-gray)' }}>
          Press Enter or Esc to go back
        </span>
      </div>
    </div>
  )
}
