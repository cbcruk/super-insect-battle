import * as React from 'react'
import type { Arthropod } from '@super-insect-battle/engine'
import { getStyleMatchup } from '@super-insect-battle/engine'

import { cn } from '../../lib/utils'
import { StatBar } from './stat-bar'
import { STYLE_COLORS, WEAPON_TYPE_NAMES } from '../../lib/style-colors'

interface ComparisonTableProps {
  player: Arthropod
  opponent: Arthropod
  className?: string
}

interface StatRow {
  label: string
  playerValue: number | string
  opponentValue: number | string
  max?: number
  color?: string
  numeric?: boolean
}

export function ComparisonTable({
  player,
  opponent,
  className,
}: ComparisonTableProps): React.ReactElement {
  const matchup = getStyleMatchup(
    player.behavior.style,
    opponent.behavior.style
  )

  const rows: StatRow[] = [
    {
      label: 'STR',
      playerValue: player.physical.strengthIndex,
      opponentValue: opponent.physical.strengthIndex,
      max: 100,
      color: 'bg-red-500',
      numeric: true,
    },
    {
      label: 'ARM',
      playerValue: player.defense.armorRating,
      opponentValue: opponent.defense.armorRating,
      max: 100,
      color: 'bg-blue-500',
      numeric: true,
    },
    {
      label: 'EVA',
      playerValue: player.defense.evasion,
      opponentValue: opponent.defense.evasion,
      max: 100,
      color: 'bg-emerald-500',
      numeric: true,
    },
    {
      label: 'WPN',
      playerValue: player.weapon.power,
      opponentValue: opponent.weapon.power,
      max: 100,
      color: 'bg-amber-500',
      numeric: true,
    },
    {
      label: 'Weight',
      playerValue: `${player.physical.weightG}g`,
      opponentValue: `${opponent.physical.weightG}g`,
    },
    {
      label: 'WPN Type',
      playerValue: WEAPON_TYPE_NAMES[player.weapon.type] ?? player.weapon.type,
      opponentValue:
        WEAPON_TYPE_NAMES[opponent.weapon.type] ?? opponent.weapon.type,
    },
  ]

  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border border-table-border',
        className
      )}
    >
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-table-header">
            <th className="border-b border-table-border px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Stat
            </th>
            <th className="border-b border-table-border px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
              {player.nameKo}
            </th>
            <th className="border-b border-table-border px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-pink-400">
              {opponent.nameKo}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-table-row-even">
            <td className="border-b border-table-border/50 px-3 py-2 text-muted-foreground">
              Style
            </td>
            <td className="border-b border-table-border/50 px-3 py-2 text-right">
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-[10px] font-bold',
                  STYLE_COLORS[player.behavior.style].badge
                )}
              >
                {player.behavior.style}
              </span>
            </td>
            <td className="border-b border-table-border/50 px-3 py-2 text-right">
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-[10px] font-bold',
                  STYLE_COLORS[opponent.behavior.style].badge
                )}
              >
                {opponent.behavior.style}
              </span>
            </td>
          </tr>
          {rows.map((row, i) => (
            <tr
              key={row.label}
              className={i % 2 === 0 ? 'bg-table-row-odd' : 'bg-table-row-even'}
            >
              <td className="border-b border-table-border/50 px-3 py-2 text-muted-foreground">
                {row.label}
              </td>
              <td className="border-b border-table-border/50 px-3 py-2 text-right">
                {row.numeric && row.max ? (
                  <div className="flex items-center justify-end gap-2">
                    <StatBar
                      value={row.playerValue as number}
                      max={row.max}
                      color={row.color}
                      className="w-16"
                    />
                    <span
                      className={cn(
                        'w-6 tabular-nums',
                        (row.playerValue as number) >=
                          (row.opponentValue as number)
                          ? 'text-foreground font-medium'
                          : 'text-muted-foreground'
                      )}
                    >
                      {row.playerValue}
                    </span>
                  </div>
                ) : (
                  <span className="tabular-nums">{row.playerValue}</span>
                )}
              </td>
              <td className="border-b border-table-border/50 px-3 py-2 text-right">
                {row.numeric && row.max ? (
                  <div className="flex items-center justify-end gap-2">
                    <StatBar
                      value={row.opponentValue as number}
                      max={row.max}
                      color={row.color}
                      className="w-16"
                    />
                    <span
                      className={cn(
                        'w-6 tabular-nums',
                        (row.opponentValue as number) >=
                          (row.playerValue as number)
                          ? 'text-foreground font-medium'
                          : 'text-muted-foreground'
                      )}
                    >
                      {row.opponentValue}
                    </span>
                  </div>
                ) : (
                  <span className="tabular-nums">{row.opponentValue}</span>
                )}
              </td>
            </tr>
          ))}
          <tr className="bg-table-header">
            <td className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Style Matchup
            </td>
            <td
              colSpan={2}
              className="px-3 py-2 text-center text-sm font-medium"
            >
              <span
                className={cn(
                  matchup > 1
                    ? 'text-emerald-400'
                    : matchup < 1
                      ? 'text-red-400'
                      : 'text-muted-foreground'
                )}
              >
                {matchup > 1
                  ? `${matchup}x (${player.nameKo} advantage)`
                  : matchup < 1
                    ? `${matchup}x (${opponent.nameKo} advantage)`
                    : `${matchup}x (neutral)`}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
