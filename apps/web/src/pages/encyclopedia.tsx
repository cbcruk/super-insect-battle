import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { arthropodList } from '@super-insect-battle/engine'
import type { Arthropod, BehaviorStyle } from '@super-insect-battle/engine'
import { Input } from '../components/ui/input.tsx'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs.tsx'
import { DataTable } from '../components/ui/data-table.tsx'
import type { Column } from '../components/ui/data-table.tsx'
import { StatBar } from '../components/ui/stat-bar.tsx'
import { STYLE_COLORS, WEAPON_TYPE_NAMES } from '../lib/style-colors.ts'
import { cn } from '../lib/utils.ts'

const styleFilters: { label: string; value: BehaviorStyle | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Grappler', value: 'grappler' },
  { label: 'Striker', value: 'striker' },
  { label: 'Venomous', value: 'venomous' },
  { label: 'Defensive', value: 'defensive' },
]

const columns: Column<Arthropod>[] = [
  {
    key: 'index',
    header: '#',
    align: 'center',
    width: 'w-10',
    render: (_item, index) => (
      <span className="text-muted-foreground">{index + 1}</span>
    ),
  },
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    sortValue: (item) => item.nameKo,
    render: (item) => (
      <div>
        <span className="font-medium text-foreground">{item.nameKo}</span>
        <span className="ml-2 text-xs text-muted-foreground">{item.name}</span>
      </div>
    ),
  },
  {
    key: 'style',
    header: 'Style',
    sortable: true,
    sortValue: (item) => item.behavior.style,
    render: (item) => (
      <span
        className={cn(
          'rounded px-1.5 py-0.5 text-[10px] font-bold',
          STYLE_COLORS[item.behavior.style].badge
        )}
      >
        {item.behavior.style}
      </span>
    ),
  },
  {
    key: 'weight',
    header: 'WT(g)',
    align: 'right',
    sortable: true,
    sortValue: (item) => item.physical.weightG,
    hideBelow: 'md',
    render: (item) => item.physical.weightG,
  },
  {
    key: 'length',
    header: 'LEN(mm)',
    align: 'right',
    sortable: true,
    sortValue: (item) => item.physical.lengthMm,
    hideBelow: 'lg',
    render: (item) => item.physical.lengthMm,
  },
  {
    key: 'strength',
    header: 'STR',
    align: 'right',
    sortable: true,
    sortValue: (item) => item.physical.strengthIndex,
    render: (item) => (
      <div className="flex items-center justify-end gap-2">
        <StatBar
          value={item.physical.strengthIndex}
          max={100}
          color="bg-red-500"
          className="hidden w-12 sm:flex"
        />
        <span className="w-6 text-right">{item.physical.strengthIndex}</span>
      </div>
    ),
  },
  {
    key: 'armor',
    header: 'ARM',
    align: 'right',
    sortable: true,
    sortValue: (item) => item.defense.armorRating,
    render: (item) => (
      <div className="flex items-center justify-end gap-2">
        <StatBar
          value={item.defense.armorRating}
          max={100}
          color="bg-blue-500"
          className="hidden w-12 sm:flex"
        />
        <span className="w-6 text-right">{item.defense.armorRating}</span>
      </div>
    ),
  },
  {
    key: 'evasion',
    header: 'EVA',
    align: 'right',
    sortable: true,
    sortValue: (item) => item.defense.evasion,
    render: (item) => (
      <div className="flex items-center justify-end gap-2">
        <StatBar
          value={item.defense.evasion}
          max={100}
          color="bg-emerald-500"
          className="hidden w-12 sm:flex"
        />
        <span className="w-6 text-right">{item.defense.evasion}</span>
      </div>
    ),
  },
  {
    key: 'weaponPower',
    header: 'WPN',
    align: 'right',
    sortable: true,
    sortValue: (item) => item.weapon.power,
    hideBelow: 'sm',
    render: (item) => item.weapon.power,
  },
  {
    key: 'weaponType',
    header: 'Type',
    sortable: true,
    sortValue: (item) => item.weapon.type,
    hideBelow: 'md',
    render: (item) => (
      <span className="text-muted-foreground">
        {WEAPON_TYPE_NAMES[item.weapon.type] ?? item.weapon.type}
      </span>
    ),
  },
  {
    key: 'venom',
    header: 'VNM',
    align: 'center',
    sortable: true,
    sortValue: (item) => item.weapon.venomPotency ?? 0,
    hideBelow: 'lg',
    render: (item) =>
      item.weapon.venomous ? (
        <span className="text-purple-400">{item.weapon.venomPotency}</span>
      ) : (
        <span className="text-muted-foreground/50">—</span>
      ),
  },
]

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
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="mb-6 text-2xl text-foreground sm:text-3xl">Roster</h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as BehaviorStyle | 'all')}
        >
          <TabsList variant="line">
            {styleFilters.map((f) => (
              <TabsTrigger key={f.value} value={f.value}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-auto max-w-48"
        />

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {arthropodList.length} species
        </span>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(item) => item.id}
        onRowClick={(item) => navigate(`/encyclopedia/${item.id}`)}
        defaultSort={{ key: 'strength', direction: 'desc' }}
        emptyMessage="No arthropods found."
      />
    </div>
  )
}
