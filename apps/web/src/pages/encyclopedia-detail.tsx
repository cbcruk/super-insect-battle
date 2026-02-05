import React from 'react'
import { useParams, useNavigate } from 'react-router'
import {
  getArthropodById,
  getActionsByIds,
  getStyleMatchup,
} from '@super-insect-battle/engine'
import type { Arthropod, Action, BehaviorStyle } from '@super-insect-battle/engine'
import { Button } from '../components/ui/button.tsx'
import { DataTable } from '../components/ui/data-table.tsx'
import type { Column } from '../components/ui/data-table.tsx'
import { StatBar } from '../components/ui/stat-bar.tsx'
import { STYLE_COLORS, WEAPON_TYPE_NAMES } from '../lib/style-colors.ts'
import { cn } from '../lib/utils.ts'

const STYLES: BehaviorStyle[] = ['grappler', 'striker', 'venomous', 'defensive']

const categoryColors: Record<string, string> = {
  attack: 'bg-red-500/20 text-red-400',
  defense: 'bg-blue-500/20 text-blue-400',
  special: 'bg-amber-500/20 text-amber-400',
}

const actionColumns: Column<Action>[] = [
  {
    key: 'index',
    header: '#',
    align: 'center',
    width: 'w-8',
    render: (_item, index) => (
      <span className="text-muted-foreground">{index + 1}</span>
    ),
  },
  {
    key: 'name',
    header: 'Name',
    render: (item) => (
      <div>
        <span className="font-medium text-foreground">{item.nameKo}</span>
        <span className="ml-2 text-xs text-muted-foreground">{item.name}</span>
      </div>
    ),
  },
  {
    key: 'category',
    header: 'Cat',
    render: (item) => (
      <span
        className={cn(
          'rounded px-1.5 py-0.5 text-[10px] font-bold',
          categoryColors[item.category] ?? categoryColors.attack
        )}
      >
        {item.category}
      </span>
    ),
  },
  {
    key: 'power',
    header: 'PWR',
    align: 'right',
    sortable: true,
    sortValue: (item) => item.power,
    render: (item) => (
      <span className={item.power > 0 ? 'text-foreground' : 'text-muted-foreground/50'}>
        {item.power || '—'}
      </span>
    ),
  },
  {
    key: 'accuracy',
    header: 'ACC',
    align: 'right',
    render: (item) => `${item.accuracy}%`,
  },
  {
    key: 'priority',
    header: 'PRI',
    align: 'center',
    hideBelow: 'sm',
    render: (item) =>
      item.priority > 0 ? (
        <span className="text-emerald-400">+{item.priority}</span>
      ) : (
        <span className="text-muted-foreground">{item.priority}</span>
      ),
  },
  {
    key: 'cooldown',
    header: 'CD',
    align: 'center',
    hideBelow: 'sm',
    render: (item) =>
      item.cooldown > 0 ? (
        <span className="text-foreground">{item.cooldown}</span>
      ) : (
        <span className="text-muted-foreground/50">—</span>
      ),
  },
  {
    key: 'effect',
    header: 'Effect',
    hideBelow: 'sm',
    render: (item) => {
      if (!item.effect) return <span className="text-muted-foreground/50">—</span>
      if (item.effect.type === 'status' && item.effect.condition) {
        return (
          <span className="rounded bg-purple-500/15 px-1.5 py-0.5 text-[10px] text-purple-400">
            {item.effect.condition}
          </span>
        )
      }
      if (
        (item.effect.type === 'buff' || item.effect.type === 'debuff') &&
        item.effect.statChange
      ) {
        const isPositive = item.effect.type === 'buff'
        return (
          <span
            className={cn(
              'rounded px-1.5 py-0.5 text-[10px]',
              isPositive
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-red-500/15 text-red-400'
            )}
          >
            {item.effect.statChange.stat}{' '}
            {isPositive ? '+' : ''}
            {item.effect.statChange.stages}
          </span>
        )
      }
      return <span className="text-muted-foreground/50">—</span>
    },
  },
]

export function EncyclopediaDetailPage(): React.ReactNode {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const arthropod = id ? getArthropodById(id) : undefined

  if (!arthropod) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">Species not found.</p>
          <Button variant="link" onClick={() => navigate('/encyclopedia')}>
            Back to Roster
          </Button>
        </div>
      </div>
    )
  }

  const actions = getActionsByIds(arthropod.actions)
  const style = STYLE_COLORS[arthropod.behavior.style]

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/encyclopedia')}
        className="mb-6 text-muted-foreground"
      >
        ← Back to Roster
      </Button>

      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl text-foreground sm:text-3xl">
          {arthropod.nameKo}
        </h1>
        <span className="text-lg text-muted-foreground">{arthropod.name}</span>
        <span
          className={cn(
            'rounded px-2 py-0.5 text-xs font-bold',
            style.badge
          )}
        >
          {arthropod.behavior.style}
        </span>
      </div>

      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        {arthropod.description}
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <CombatStatsTable arthropod={arthropod} />
        <WeaponTable arthropod={arthropod} />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-lg text-foreground">Actions</h2>
        <DataTable
          columns={actionColumns}
          data={actions}
          rowKey={(item) => item.id}
          compact
        />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-lg text-foreground">Style Matchups</h2>
        <StyleMatchupTable arthropod={arthropod} />
      </div>
    </div>
  )
}

function CombatStatsTable({
  arthropod,
}: {
  arthropod: Arthropod
}): React.ReactNode {
  const stats = [
    {
      label: 'Strength',
      value: arthropod.physical.strengthIndex,
      color: 'bg-red-500',
    },
    {
      label: 'Armor',
      value: arthropod.defense.armorRating,
      color: 'bg-blue-500',
    },
    {
      label: 'Evasion',
      value: arthropod.defense.evasion,
      color: 'bg-emerald-500',
    },
    {
      label: 'WPN Power',
      value: arthropod.weapon.power,
      color: 'bg-amber-500',
    },
    { label: 'Aggression', value: arthropod.behavior.aggression, color: 'bg-orange-500' },
  ]

  return (
    <div className="overflow-hidden rounded-md border border-table-border">
      <div className="bg-table-header px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Combat Stats
      </div>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {stats.map((s, i) => (
            <tr
              key={s.label}
              className={
                i % 2 === 0 ? 'bg-table-row-even' : 'bg-table-row-odd'
              }
            >
              <td className="border-b border-table-border/50 px-3 py-2 text-muted-foreground">
                {s.label}
              </td>
              <td className="border-b border-table-border/50 px-3 py-2 text-right tabular-nums font-medium">
                {s.value}
              </td>
              <td className="border-b border-table-border/50 px-3 py-2">
                <StatBar value={s.value} max={100} color={s.color} size="md" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-table-border/50 bg-table-row-even px-3 py-2 text-xs text-muted-foreground">
        Weight: {arthropod.physical.weightG}g · Length: {arthropod.physical.lengthMm}mm
        {' · '}
        Habitat: {arthropod.habitat.preferredTerrains.join(', ')}
        {' · '}
        Active: {arthropod.habitat.preferredTime}
      </div>
    </div>
  )
}

function WeaponTable({
  arthropod,
}: {
  arthropod: Arthropod
}): React.ReactNode {
  return (
    <div className="overflow-hidden rounded-md border border-table-border">
      <div className="bg-table-header px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Weapon Info
      </div>
      <table className="w-full border-collapse text-sm">
        <tbody>
          <tr className="bg-table-row-even">
            <td className="border-b border-table-border/50 px-3 py-2 text-muted-foreground">
              Type
            </td>
            <td className="border-b border-table-border/50 px-3 py-2 text-right font-medium">
              {WEAPON_TYPE_NAMES[arthropod.weapon.type] ?? arthropod.weapon.type}
            </td>
          </tr>
          <tr className="bg-table-row-odd">
            <td className="border-b border-table-border/50 px-3 py-2 text-muted-foreground">
              Power
            </td>
            <td className="border-b border-table-border/50 px-3 py-2 text-right tabular-nums font-medium">
              {arthropod.weapon.power}
            </td>
          </tr>
          <tr className="bg-table-row-even">
            <td className="border-b border-table-border/50 px-3 py-2 text-muted-foreground">
              Venomous
            </td>
            <td className="border-b border-table-border/50 px-3 py-2 text-right">
              {arthropod.weapon.venomous ? (
                <span className="text-purple-400">
                  Yes (potency: {arthropod.weapon.venomPotency ?? 0})
                </span>
              ) : (
                <span className="text-muted-foreground">No</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function StyleMatchupTable({
  arthropod,
}: {
  arthropod: Arthropod
}): React.ReactNode {
  return (
    <div className="overflow-hidden rounded-md border border-table-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-table-header">
            <th className="border-b border-table-border px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              vs Style
            </th>
            <th className="border-b border-table-border px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Multiplier
            </th>
            <th className="border-b border-table-border px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Rating
            </th>
          </tr>
        </thead>
        <tbody>
          {STYLES.map((targetStyle, i) => {
            const multiplier = getStyleMatchup(
              arthropod.behavior.style,
              targetStyle
            )
            return (
              <tr
                key={targetStyle}
                className={
                  i % 2 === 0 ? 'bg-table-row-even' : 'bg-table-row-odd'
                }
              >
                <td className="border-b border-table-border/50 px-3 py-2">
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px] font-bold',
                      STYLE_COLORS[targetStyle].badge
                    )}
                  >
                    {targetStyle}
                  </span>
                </td>
                <td className="border-b border-table-border/50 px-3 py-2 text-right tabular-nums font-medium">
                  <span
                    className={cn(
                      multiplier > 1
                        ? 'text-emerald-400'
                        : multiplier < 1
                          ? 'text-red-400'
                          : 'text-muted-foreground'
                    )}
                  >
                    {multiplier}x
                  </span>
                </td>
                <td className="border-b border-table-border/50 px-3 py-2 text-right text-xs">
                  <span
                    className={cn(
                      multiplier > 1
                        ? 'text-emerald-400'
                        : multiplier < 1
                          ? 'text-red-400'
                          : 'text-muted-foreground'
                    )}
                  >
                    {multiplier > 1
                      ? 'Advantage'
                      : multiplier < 1
                        ? 'Disadvantage'
                        : 'Neutral'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
