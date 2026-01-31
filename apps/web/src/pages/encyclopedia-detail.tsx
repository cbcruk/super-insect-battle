import React from 'react'
import { useParams, useNavigate } from 'react-router'
import {
  getArthropodById,
  getActionsByIds,
} from '@super-insect-battle/engine'
import type { Arthropod, Action } from '@super-insect-battle/engine'

const styleColors: Record<string, { text: string; bg: string; border: string }> = {
  grappler: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  striker: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  venomous: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  defensive: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
}

const spriteHex: Record<string, string> = {
  grappler: '#DC2626',
  striker: '#059669',
  venomous: '#9333EA',
  defensive: '#2563EB',
}

const weaponTypeNames: Record<string, string> = {
  horn: 'Horn',
  mandible: 'Mandible',
  stinger: 'Stinger',
  fang: 'Fang',
  foreleg: 'Foreleg',
  leg: 'Leg',
}

const categoryColors: Record<string, string> = {
  attack: 'bg-red-500/20 text-red-400 border-red-500/30',
  defense: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  special: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

export function EncyclopediaDetailPage(): React.ReactNode {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const arthropod = id ? getArthropodById(id) : undefined

  if (!arthropod) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-gray-400">Arthropod not found.</p>
          <button
            onClick={() => navigate('/encyclopedia')}
            className="text-amber-400 underline hover:text-amber-300"
          >
            Back to Encyclopedia
          </button>
        </div>
      </div>
    )
  }

  const actions = getActionsByIds(arthropod.actions)

  return (
    <div className="mx-auto max-w-4xl p-6">
      <button
        onClick={() => navigate('/encyclopedia')}
        className="mb-6 text-sm text-gray-400 transition-colors hover:text-amber-400"
      >
        ← Encyclopedia
      </button>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <ProfileCard arthropod={arthropod} />
        <div className="space-y-4">
          <StatsPanel arthropod={arthropod} />
          <WeaponPanel arthropod={arthropod} />
          <HabitatPanel arthropod={arthropod} />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-lg font-bold text-gray-200">Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((action) => (
            <ActionCard key={action.id} action={action} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ProfileCard({ arthropod }: { arthropod: Arthropod }): React.ReactNode {
  const style = styleColors[arthropod.behavior.style] ?? styleColors.grappler
  const color = spriteHex[arthropod.behavior.style] ?? '#6B7280'

  return (
    <div className={`rounded-lg border p-4 ${style.bg} ${style.border}`}>
      <div className="mb-4 flex justify-center">
        <div
          className="flex items-center justify-center rounded-full border-2 border-white/20"
          style={{
            width: 96,
            height: 96,
            backgroundColor: `${color}20`,
            borderColor: `${color}60`,
          }}
        >
          <span
            className="text-center text-sm font-bold leading-tight"
            style={{ color }}
          >
            {arthropod.nameKo}
          </span>
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-100">{arthropod.nameKo}</h1>
        <p className="text-sm text-gray-400">{arthropod.name}</p>

        <div className="mt-2 flex justify-center">
          <span className={`rounded px-2 py-0.5 text-xs font-bold ${style.text} ${style.bg}`}>
            {arthropod.behavior.style}
          </span>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-gray-400">
        {arthropod.description}
      </p>

      <div className="mt-4 space-y-1 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Weight</span>
          <span className="text-gray-300">{arthropod.physical.weightG}g</span>
        </div>
        <div className="flex justify-between">
          <span>Length</span>
          <span className="text-gray-300">{arthropod.physical.lengthMm}mm</span>
        </div>
        <div className="flex justify-between">
          <span>Aggression</span>
          <span className="text-gray-300">{arthropod.behavior.aggression}</span>
        </div>
      </div>
    </div>
  )
}

function StatBar({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number
  max: number
  color: string
}): React.ReactNode {
  const percent = Math.round((value / max) * 100)

  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-right text-xs text-gray-400">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="w-8 text-right font-mono text-xs text-gray-300">{value}</span>
    </div>
  )
}

function StatsPanel({ arthropod }: { arthropod: Arthropod }): React.ReactNode {
  return (
    <div className="rounded-lg border border-gray-700/50 bg-gray-900/40 p-4">
      <h2 className="mb-3 text-sm font-bold text-gray-300">Combat Stats</h2>
      <div className="space-y-2">
        <StatBar label="STR" value={arthropod.physical.strengthIndex} max={100} color="bg-red-500" />
        <StatBar label="ARM" value={arthropod.defense.armorRating} max={100} color="bg-blue-500" />
        <StatBar label="EVA" value={arthropod.defense.evasion} max={100} color="bg-green-500" />
        <StatBar label="WPN" value={arthropod.weapon.power} max={100} color="bg-amber-500" />
      </div>
    </div>
  )
}

function WeaponPanel({ arthropod }: { arthropod: Arthropod }): React.ReactNode {
  return (
    <div className="rounded-lg border border-gray-700/50 bg-gray-900/40 p-4">
      <h2 className="mb-3 text-sm font-bold text-gray-300">Weapon</h2>
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm font-bold text-gray-200">
            {weaponTypeNames[arthropod.weapon.type] ?? arthropod.weapon.type}
          </p>
          <p className="text-xs text-gray-400">Power: {arthropod.weapon.power}</p>
        </div>
        {arthropod.weapon.venomous && (
          <div className="rounded bg-purple-500/20 px-2 py-1 text-xs font-bold text-purple-400">
            Venomous ({arthropod.weapon.venomPotency ?? 0})
          </div>
        )}
      </div>
    </div>
  )
}

function HabitatPanel({ arthropod }: { arthropod: Arthropod }): React.ReactNode {
  return (
    <div className="rounded-lg border border-gray-700/50 bg-gray-900/40 p-4">
      <h2 className="mb-3 text-sm font-bold text-gray-300">Habitat</h2>
      <div className="flex flex-wrap gap-2">
        {arthropod.habitat.preferredTerrains.map((t) => (
          <span
            key={t}
            className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400"
          >
            {t}
          </span>
        ))}
        <span className="rounded bg-gray-700/50 px-2 py-0.5 text-xs text-gray-400">
          {arthropod.habitat.preferredTime}
        </span>
      </div>
    </div>
  )
}

function ActionCard({ action }: { action: Action }): React.ReactNode {
  const catColor = categoryColors[action.category] ?? categoryColors.attack

  return (
    <div className="rounded-lg border border-gray-700/50 bg-gray-900/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-200">{action.nameKo}</span>
        <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${catColor}`}>
          {action.category}
        </span>
      </div>
      <p className="text-[10px] text-gray-500">{action.name}</p>

      <div className="mt-2 flex gap-3 text-[10px] text-gray-400">
        <span>PWR {action.power}</span>
        <span>ACC {action.accuracy}%</span>
        <span>PRI {action.priority > 0 ? `+${action.priority}` : action.priority}</span>
        {action.cooldown > 0 && <span>CD {action.cooldown}</span>}
      </div>

      {action.effect && (
        <div className="mt-1.5 text-[10px] text-gray-500">
          {action.effect.type === 'status' && action.effect.condition && (
            <span className="rounded bg-purple-500/15 px-1 py-0.5 text-purple-400">
              {action.effect.condition}
            </span>
          )}
          {action.effect.type === 'buff' && action.effect.statChange && (
            <span className="rounded bg-green-500/15 px-1 py-0.5 text-green-400">
              {action.effect.statChange.stat} +{action.effect.statChange.stages}
            </span>
          )}
          {action.effect.type === 'debuff' && action.effect.statChange && (
            <span className="rounded bg-red-500/15 px-1 py-0.5 text-red-400">
              {action.effect.statChange.stat} {action.effect.statChange.stages}
            </span>
          )}
        </div>
      )}

      <p className="mt-2 text-[10px] leading-relaxed text-gray-500">
        {action.description}
      </p>
    </div>
  )
}
