import type { HitEffect, HitEffectKind } from './combat-feedback.types.ts'
import type { CellFlash, StageCue } from './stage-effects.types.ts'

const FLASH_LIFE_MS = 400

const ENEMY_FLASH: Partial<Record<HitEffectKind, StageCue['flash']>> = {
  damage: { color: '#ffffff', alpha: 0.7 },
  critical: { color: '#fcd34d', alpha: 0.8 },
  venom: { color: '#a855f7', alpha: 0.6 },
}

const PLAYER_FLASH: StageCue['flash'] = { color: '#ef4444', alpha: 0.8 }

/**
 * 피격 연출을 무대 동작(칸 번쩍임 · 입자)으로 바꾼다.
 *
 * 빗나감과 상태이상 표시는 글자만 띄우므로 번쩍이지 않는다.
 */
export function cueForHit(
  effect: Pick<HitEffect, 'kind' | 'onPlayer'>
): StageCue {
  const quiet = effect.kind === 'miss' || effect.kind === 'condition'
  const cue: StageCue = {}
  if (!quiet) {
    cue.flash = effect.onPlayer ? PLAYER_FLASH : ENEMY_FLASH[effect.kind]
  }
  if (effect.kind === 'venom') cue.burst = 'venom'
  if (effect.kind === 'critical') cue.burst = 'critical'
  return cue
}

/** 맵 좌표 칸에 번쩍임을 만든다. */
export function createFlash(
  x: number,
  y: number,
  flash: NonNullable<StageCue['flash']>,
  delayMs: number
): CellFlash {
  return { x, y, ...flash, delayMs, ageMs: 0, lifeMs: FLASH_LIFE_MS }
}

/**
 * 번쩍임을 `dtMs`만큼 진행시킨다.
 *
 * @returns 끝나서 제거할 번쩍임이면 `false`.
 */
export function stepFlash(f: CellFlash, dtMs: number): boolean {
  if (f.delayMs > 0) {
    f.delayMs = Math.max(0, f.delayMs - dtMs)
    return true
  }
  f.ageMs += dtMs
  return f.ageMs < f.lifeMs
}

/** 지금 그릴 불투명도. 대기 중이면 0, 이후 ease-out으로 사라진다. */
export function flashAlpha(f: CellFlash): number {
  if (f.delayMs > 0) return 0
  const t = Math.min(1, f.ageMs / f.lifeMs)
  return f.alpha * (1 - t) * (1 - t)
}
