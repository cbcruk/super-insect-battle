/**
 * 결정론적 난수 소스.
 *
 * 엔진 전반의 무작위 판정(데미지·명중·크리티컬·상태이상·AI 선택 등)은
 * 이 `Rng`를 주입받아 사용한다. 시드로 생성한 하나의 스트림을 전투 루프
 * 전체에 흘려보내면 같은 (개체, 환경, 행동 시퀀스, 시드)에 대해 완전히
 * 재현 가능한 결과가 나온다. 미주입 시 전역 `Math.random`으로 폴백하므로
 * 기존 호출부는 그대로 동작한다.
 *
 * 로그라이크 모드의 데일리 시드·재현 런·검증 리더보드의 토대.
 */
export type Rng = () => number

/** 시드 기반 PRNG (mulberry32). [0, 1) 범위 float 반환. */
export function createRng(seed: number): Rng {
  let s = seed >>> 0
  return function rng(): number {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * 미주입 시 사용하는 전역 난수 (비결정론적).
 * 매 호출마다 `Math.random`을 조회하므로 테스트의 스텁/스파이가 그대로 적용된다.
 */
export const defaultRng: Rng = () => Math.random()

/** minInclusive..maxInclusive 정수 (양끝 포함). */
export function randInt(
  rng: Rng,
  minInclusive: number,
  maxInclusive: number
): number {
  return minInclusive + Math.floor(rng() * (maxInclusive - minInclusive + 1))
}

/** 확률 p로 true. */
export function randChance(rng: Rng, p: number): boolean {
  return rng() < p
}

/** 배열에서 균등 추출. */
export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}
