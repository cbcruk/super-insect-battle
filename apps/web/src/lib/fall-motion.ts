import type { Vec2 } from '@super-insect-battle/roguelike'
import type { FallFrame } from './fall-motion.types.ts'
import { unitDirection } from './attack-motion.ts'

/** 맞은 뒤 잔상이 완전히 사라지기까지의 시간(ms). */
export const FALL_DURATION_MS = 380

const PUSH_DISTANCE = 0.3
const DROP_DISTANCE = 0.15
const TILT = 0.9

const STANDING: FallFrame = {
  offset: { x: 0, y: 0 },
  alpha: 1,
  rotation: 0,
  scale: 1,
  done: false,
}

/**
 * 맞은 뒤 `sinceImpactMs` 시점의 잔상 프레임을 계산한다.
 *
 * 공격 방향으로 밀리며 그쪽으로 기울어지고, 살짝 가라앉으며 흐려진다. 출처가 없으면
 * 제자리에서 가라앉기만 한다. `reducedMotion`이면 움직임 없이 흐려지기만 한다.
 */
export function fallFrame(
  sinceImpactMs: number,
  pos: Vec2,
  from: Vec2 | null,
  reducedMotion = false
): FallFrame {
  if (sinceImpactMs <= 0) return STANDING
  const t = Math.min(1, sinceImpactMs / FALL_DURATION_MS)
  const done = sinceImpactMs >= FALL_DURATION_MS
  if (reducedMotion) {
    return { ...STANDING, alpha: 1 - t, done }
  }

  const ease = 1 - (1 - t) * (1 - t)
  const dir = from ? unitDirection(from, pos) : { x: 0, y: 0 }
  const side = dir.x === 0 ? 1 : Math.sign(dir.x)
  return {
    offset: {
      x: dir.x * PUSH_DISTANCE * ease,
      y: dir.y * PUSH_DISTANCE * ease + DROP_DISTANCE * ease,
    },
    alpha: 1 - t * t,
    rotation: side * TILT * ease,
    scale: 1 - 0.35 * ease,
    done,
  }
}
