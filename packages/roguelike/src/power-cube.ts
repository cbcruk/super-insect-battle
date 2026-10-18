import {
  applyStatStageChange,
  createBattleArthropod,
} from '@super-insect-battle/engine'
import type { Actor } from './actor'

/** 큐브 하나가 올려 주는 최대 HP의 기본 최대 HP 대비 비율. */
export const CUBE_HP_RATIO = 0.1

/** 이 개수를 모을 때마다 힘이 1단계 오른다. */
export const CUBES_PER_STRENGTH = 3

/** 바닥 큐브 글리프. */
export const CUBE_GLYPH = '◆'

/**
 * 액터가 파워 큐브 count 개를 먹는다: 큐브마다 최대 HP와 현재 HP가 기본 최대 HP의
 * {@linkcode CUBE_HP_RATIO}만큼 오르고, {@linkcode CUBES_PER_STRENGTH}개마다 힘이 오른다.
 *
 * @returns 로그 문구.
 */
export function absorbCubes(actor: Actor, count: number): string {
  const before = actor.cubes
  const hpPerCube = Math.max(
    1,
    Math.round(createBattleArthropod(actor.species).maxHp * CUBE_HP_RATIO)
  )
  actor.cubes += count
  actor.combat.maxHp += hpPerCube * count
  actor.combat.currentHp += hpPerCube * count

  const strength =
    Math.floor(actor.cubes / CUBES_PER_STRENGTH) -
    Math.floor(before / CUBES_PER_STRENGTH)
  if (strength > 0) applyStatStageChange(actor.combat, 'strength', strength)

  const parts = [`최대 HP +${hpPerCube * count}`]
  if (strength > 0) parts.push('힘 상승')
  return `${actor.species.nameKo}: 파워 큐브 ${count}개 (${parts.join(', ')}) · 보유 ${actor.cubes}`
}
