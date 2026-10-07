import type { BurstKind, HitParticle } from './hit-particles.types.ts'

interface BurstRecipe {
  count: number
  colors: number[]
  /** 기준 방향(라디안)과 퍼지는 폭. 폭이 2π면 사방으로 튄다. */
  angle: number
  spread: number
  speed: [number, number]
  radius: [number, number]
  life: [number, number]
  gravity: number
  drag: number
}

const RECIPES: Record<BurstKind, BurstRecipe> = {
  venom: {
    count: 14,
    colors: [0xa855f7, 0xc084fc, 0x7e22ce, 0x84cc16],
    angle: -Math.PI / 2,
    spread: Math.PI * 0.9,
    speed: [18, 50],
    radius: [1.2, 3],
    life: [550, 950],
    gravity: -40,
    drag: 1.5,
  },
  critical: {
    count: 16,
    colors: [0xfde68a, 0xfbbf24, 0xf59e0b, 0xffffff],
    angle: 0,
    spread: Math.PI * 2,
    speed: [70, 140],
    radius: [0.8, 1.8],
    life: [250, 450],
    gravity: 160,
    drag: 4,
  },
}

const between = (rand: () => number, [min, max]: [number, number]): number =>
  min + rand() * (max - min)

/**
 * 칸 중심에서 퍼지는 입자 묶음을 만든다.
 *
 * @param rand 0 이상 1 미만을 돌려주는 난수원. 테스트에서 고정값을 주입한다.
 */
export function spawnBurst(
  kind: BurstKind,
  centerX: number,
  centerY: number,
  delayMs: number,
  rand: () => number = Math.random
): HitParticle[] {
  const recipe = RECIPES[kind]
  return Array.from({ length: recipe.count }, () => {
    const angle = recipe.angle + (rand() - 0.5) * recipe.spread
    const speed = between(rand, recipe.speed)
    return {
      x: centerX + (rand() - 0.5) * 8,
      y: centerY + (rand() - 0.5) * 8,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: recipe.gravity,
      drag: recipe.drag,
      radius: between(rand, recipe.radius),
      color: recipe.colors[Math.floor(rand() * recipe.colors.length)],
      delayMs,
      ageMs: 0,
      lifeMs: between(rand, recipe.life),
    }
  })
}

/**
 * 입자를 `dtMs`만큼 진행시킨다. 대기 중이면 대기 시간만 줄인다.
 *
 * @returns 수명이 다해 제거할 입자면 `false`.
 */
export function stepParticle(p: HitParticle, dtMs: number): boolean {
  if (p.delayMs > 0) {
    p.delayMs = Math.max(0, p.delayMs - dtMs)
    return true
  }
  const dt = dtMs / 1000
  p.ageMs += dtMs
  p.vy += p.gravity * dt
  const damping = Math.max(0, 1 - p.drag * dt)
  p.vx *= damping
  p.vy *= damping
  p.x += p.vx * dt
  p.y += p.vy * dt
  return p.ageMs < p.lifeMs
}

/** 남은 수명 비율(1 → 0). 투명도와 크기를 줄이는 데 쓴다. */
export function particleFade(p: HitParticle): number {
  return Math.max(0, 1 - p.ageMs / p.lifeMs)
}
