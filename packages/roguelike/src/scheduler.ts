import type { Actor } from './actor'

/**
 * 에너지 기반 턴 스케줄러.
 *
 * 매 라운드 각 액터는 energy += speed 를 받고, energy >= THRESHOLD 인 액터가
 * 배열 순서대로 한 번씩 행동하며 THRESHOLD 만큼 소모한다. P1은 모든 speed 를
 * 동일(=THRESHOLD)하게 두어 사실상 라운드로빈이지만, 속도 차만 주면 빠른
 * 곤충이 한 라운드에 여러 번 행동하도록 자연히 확장된다 (P2).
 */
export const ENERGY_THRESHOLD = 100

function isAlive(actor: Actor): boolean {
  return actor.combat.currentHp > 0
}

/** 지금 행동할 수 있는(에너지가 찬) 첫 액터. 없으면 undefined. */
export function nextActor(actors: Actor[]): Actor | undefined {
  return actors.find((a) => isAlive(a) && a.energy >= ENERGY_THRESHOLD)
}

/** 살아있는 모든 액터에게 speed 만큼 에너지 지급 (시간 경과 1틱). */
export function grantEnergy(actors: Actor[]): void {
  for (const a of actors) {
    if (isAlive(a)) a.energy += a.speed
  }
}

/** 액터가 한 턴을 소모. */
export function spendTurn(actor: Actor): void {
  actor.energy -= ENERGY_THRESHOLD
}
