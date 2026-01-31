import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { arthropodList } from '@super-insect-battle/engine'
import type { Arthropod, BehaviorStyle } from '@super-insect-battle/engine'

const styleFilters: { label: string; value: BehaviorStyle | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Grappler', value: 'grappler' },
  { label: 'Striker', value: 'striker' },
  { label: 'Venomous', value: 'venomous' },
  { label: 'Defensive', value: 'defensive' },
]

const styleColors: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  grappler: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', badge: 'bg-red-500/20 text-red-400' },
  striker: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-400' },
  venomous: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', badge: 'bg-purple-500/20 text-purple-400' },
  defensive: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', badge: 'bg-blue-500/20 text-blue-400' },
}

const spriteHex: Record<string, string> = {
  grappler: '#DC2626',
  striker: '#059669',
  venomous: '#9333EA',
  defensive: '#2563EB',
}

export function EncyclopediaPage(): React.ReactNode {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<BehaviorStyle | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = arthropodList.filter((a) => {
    if (filter !== 'all' && a.behavior.style !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return a.nameKo.includes(q) || a.name.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-amber-400">
        Arthropod Encyclopedia
      </h1>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-700 bg-gray-900/60">
          {styleFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-bold transition-colors first:rounded-l-lg last:rounded-r-lg ${
                filter === f.value
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="rounded-lg border border-gray-700 bg-gray-900/60 px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-amber-500/50"
        />

        <span className="ml-auto text-xs text-gray-500">
          {filtered.length} / {arthropodList.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((arthropod) => (
          <EncyclopediaCard
            key={arthropod.id}
            arthropod={arthropod}
            onClick={() => navigate(`/encyclopedia/${arthropod.id}`)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center text-gray-500">
          No arthropods found.
        </div>
      )}
    </div>
  )
}

function EncyclopediaCard({
  arthropod,
  onClick,
}: {
  arthropod: Arthropod
  onClick: () => void
}): React.ReactNode {
  const style = styleColors[arthropod.behavior.style] ?? styleColors.grappler
  const color = spriteHex[arthropod.behavior.style] ?? '#6B7280'
  const size = 56

  return (
    <button
      onClick={onClick}
      className={`group rounded-lg border p-3 text-left transition-all hover:scale-[1.03] hover:shadow-lg ${style.bg} ${style.border}`}
    >
      <div className="mb-2 flex justify-center">
        <div
          className="flex items-center justify-center rounded-full border-2 border-white/20"
          style={{
            width: size,
            height: size,
            backgroundColor: `${color}20`,
            borderColor: `${color}60`,
          }}
        >
          <span
            className="text-center text-[10px] font-bold leading-tight"
            style={{ color }}
          >
            {arthropod.nameKo}
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-bold text-gray-200">{arthropod.nameKo}</p>
        <p className="text-[10px] text-gray-500">{arthropod.name}</p>
      </div>

      <div className="mt-2 flex justify-center">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${style.badge}`}>
          {arthropod.behavior.style}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[9px] text-gray-400">
        <span>STR {arthropod.physical.strengthIndex}</span>
        <span>ARM {arthropod.defense.armorRating}</span>
        <span>EVA {arthropod.defense.evasion}</span>
      </div>
    </button>
  )
}
