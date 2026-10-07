import type { BattleArthropod } from '@super-insect-battle/engine'

/**
 * 격자 런에서 독이 걸릴 때 엔진 독성에 곱하는 배율.
 *
 * 엔진 독은 1:1 단기전용이라 해제되지 않고 틱마다 최대 HP의 최대 1/3을 깎는다.
 * 행동 하나가 한 턴인 런에서는 걸리는 순간 사망 확정이 되므로 약하게 시작한다.
 */
export const RUN_VENOM_SCALE = 0.4

/** 독 틱이 지날 때마다 남는 독성 비율. */
export const VENOM_DECAY = 0.65

/** 이 값 미만으로 약해진 독은 풀린다. */
export const VENOM_CURE_BELOW = 10

/** 방금 걸린 독의 독성을 런 기준으로 낮춘다. */
export function scaleAppliedVenom(combat: BattleArthropod): void {
  combat.appliedVenomPotency = Math.round(
    combat.appliedVenomPotency * RUN_VENOM_SCALE
  )
}

/**
 * 독 틱 이후 독성을 감쇠시키고, 충분히 약해지면 독을 해제한다.
 *
 * @returns 독이 풀렸을 때의 로그 문구, 아니면 `null`.
 */
export function decayVenom(combat: BattleArthropod): string | null {
  if (combat.statusCondition !== 'poison') return null
  combat.appliedVenomPotency = Math.floor(
    combat.appliedVenomPotency * VENOM_DECAY
  )
  if (combat.appliedVenomPotency >= VENOM_CURE_BELOW) return null
  combat.statusCondition = null
  combat.appliedVenomPotency = 0
  return `${combat.base.nameKo}의 독이 풀렸다.`
}
