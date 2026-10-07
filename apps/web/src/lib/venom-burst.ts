import type { VenomParticle } from './venom-burst.types.ts'

const VENOM_COLORS = [0xa855f7, 0xc084fc, 0x7e22ce, 0x84cc16]
const PARTICLE_COUNT = 14
const RISE_ACCEL = -40

/**
 * 칸 중심에서 위로 흩어지는 독 입자 묶음을 만든다.
 *
 * @param rand 0 이상 1 미만을 돌려주는 난수원. 테스트에서 고정값을 주입한다.
 */
export function spawnVenomBurst(
  centerX: number,
  centerY: number,
  delayMs: number,
  rand: () => number = Math.random
): VenomParticle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => {
    const angle = -Math.PI / 2 + (rand() - 0.5) * Math.PI * 0.9
    const speed = 18 + rand() * 32
    return {
      x: centerX + (rand() - 0.5) * 8,
      y: centerY + (rand() - 0.5) * 8,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 1.2 + rand() * 1.8,
      color: VENOM_COLORS[Math.floor(rand() * VENOM_COLORS.length)],
      delayMs,
      ageMs: 0,
      lifeMs: 550 + rand() * 400,
    }
  })
}

/**
 * 입자를 `dtMs`만큼 진행시킨다. 대기 중이면 대기 시간만 줄인다.
 *
 * @returns 수명이 다해 제거할 입자면 `false`.
 */
export function stepVenomParticle(p: VenomParticle, dtMs: number): boolean {
  if (p.delayMs > 0) {
    p.delayMs = Math.max(0, p.delayMs - dtMs)
    return true
  }
  const dt = dtMs / 1000
  p.ageMs += dtMs
  p.vy += RISE_ACCEL * dt
  p.vx *= 1 - 1.5 * dt
  p.x += p.vx * dt
  p.y += p.vy * dt
  return p.ageMs < p.lifeMs
}

/** 남은 수명 비율(1 → 0). 투명도와 크기를 줄이는 데 쓴다. */
export function venomParticleFade(p: VenomParticle): number {
  return Math.max(0, 1 - p.ageMs / p.lifeMs)
}
