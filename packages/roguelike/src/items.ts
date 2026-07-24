import { applyStatStageChange } from '@super-insect-battle/engine'
import type { Actor } from './actor'

export interface ItemDef {
  id: string
  nameKo: string
  glyph: string
  /** 액터에게 적용하고 로그 문구 반환. */
  apply(actor: Actor): string
}

function heal(actor: Actor, amount: number): number {
  const before = actor.combat.currentHp
  actor.combat.currentHp = Math.min(actor.combat.maxHp, before + amount)
  return actor.combat.currentHp - before
}

export const ITEMS: Record<string, ItemDef> = {
  nectar: {
    id: 'nectar',
    nameKo: '꽃꿀',
    glyph: '*',
    apply(actor) {
      const healed = heal(actor, Math.floor(actor.combat.maxHp * 0.35))
      return `꽃꿀을 마셨다 (+${healed} HP)`
    },
  },
  royal_jelly: {
    id: 'royal_jelly',
    nameKo: '로열젤리',
    glyph: '!',
    apply(actor) {
      // 런 내내 지속되는 힘 강화 (combat.statStages 는 리셋되지 않음)
      const result = applyStatStageChange(actor.combat, 'strength', 1)
      return `로열젤리! ${result.message}`
    },
  },
}

export const ITEM_IDS = Object.keys(ITEMS)
