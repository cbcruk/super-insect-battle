import type { Actor } from './actor'

/**
 * 두 액터가 서로를 적으로 대하는지 판정한다.
 *
 * 진영이 다르면 적이다. 전투·타겟팅·AI가 모두 이 함수 하나로 적대를 판정하므로,
 * 먹이사슬 같은 적대 규칙은 여기만 바꾸면 된다.
 */
export function isHostile(a: Actor, b: Actor): boolean {
  return a.faction !== b.faction
}
