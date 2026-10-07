import React from 'react'
import {
  THREAT_LABELS,
  type Actor,
  type ThreatAssessment,
} from '@super-insect-battle/roguelike'
import { THREAT_COLORS } from '../../lib/threat-colors.ts'
import { STYLE_COLORS, STYLE_LABELS_KO } from '../../lib/style-colors.ts'
import { cn } from '../../lib/utils.ts'

export interface SightedEnemy {
  actor: Actor
  threat: ThreatAssessment
}

/** 시야 안 적의 정체·HP·위협도를 보여주는 HUD 패널. */
export function EnemyPanel({
  enemies,
}: {
  enemies: SightedEnemy[]
}): React.ReactNode {
  if (enemies.length === 0) {
    return (
      <div className="rounded-md border border-table-border px-2 py-1.5 text-[11px] text-muted-foreground">
        시야 안에 적 없음
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      {enemies.map(({ actor, threat }) => (
        <EnemyRow key={actor.id} actor={actor} threat={threat} />
      ))}
    </div>
  )
}

function EnemyRow({ actor, threat }: SightedEnemy): React.ReactNode {
  const colors = THREAT_COLORS[threat.level]
  const style = actor.species.behavior.style
  const hpPct = Math.round((actor.combat.currentHp / actor.combat.maxHp) * 100)

  return (
    <div
      className={cn(
        'rounded-md border bg-white/[0.02] px-2 py-1.5 text-[11px]',
        threat.level === 'deadly' ? 'border-red-500/50' : 'border-white/10'
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="w-3 text-center font-mono font-bold"
          style={{ color: colors.hex }}
        >
          {actor.glyph}
        </span>
        <span className="font-medium">{actor.species.nameKo}</span>
        <span
          className={cn('rounded px-1 text-[10px]', STYLE_COLORS[style].badge)}
        >
          {STYLE_LABELS_KO[style]}
        </span>
        <span
          className={cn(
            'ml-auto rounded px-1.5 text-[10px] font-semibold',
            colors.badge
          )}
        >
          {THREAT_LABELS[threat.level]}
        </span>
      </div>

      <div className="mt-1 flex items-center gap-1.5">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-table-row-even">
          <div
            className="h-full bg-red-400/80 transition-all"
            style={{ width: `${hpPct}%` }}
          />
        </div>
        <span className="tabular-nums text-muted-foreground">
          {actor.combat.currentHp}/{actor.combat.maxHp}
        </span>
      </div>

      <div className="mt-1 flex flex-wrap gap-x-2 text-muted-foreground">
        {Number.isFinite(threat.hitsToKillPlayer) && (
          <span className={colors.text}>
            {threat.hitsToKillPlayer}대 맞으면 쓰러짐
          </span>
        )}
        <span>승산 {Math.round(threat.winChance * 100)}%</span>
        {threat.matchup > 1 && (
          <span className="text-emerald-400">상성 유리</span>
        )}
        {threat.matchup < 1 && <span className="text-red-400">상성 불리</span>}
        {threat.venomous && <span className="text-purple-400">독 공격</span>}
      </div>
    </div>
  )
}
