import type { Item } from './types'

export const items: Record<string, Item> = {
  potion: {
    id: 'potion',
    name: 'Potion',
    nameKo: '포션',
    description: 'HP를 20 회복한다.',
    category: 'healing',
    price: 100,
    sellPrice: 50,
    effect: { type: 'heal_hp', value: 20 },
    usableInBattle: true,
    usableOutOfBattle: true,
  },

  super_potion: {
    id: 'super_potion',
    name: 'Super Potion',
    nameKo: '고급 포션',
    description: 'HP를 50 회복한다.',
    category: 'healing',
    price: 300,
    sellPrice: 150,
    effect: { type: 'heal_hp', value: 50 },
    usableInBattle: true,
    usableOutOfBattle: true,
  },

  hyper_potion: {
    id: 'hyper_potion',
    name: 'Hyper Potion',
    nameKo: '최고급 포션',
    description: 'HP를 100 회복한다.',
    category: 'healing',
    price: 600,
    sellPrice: 300,
    effect: { type: 'heal_hp', value: 100 },
    usableInBattle: true,
    usableOutOfBattle: true,
  },

  antidote: {
    id: 'antidote',
    name: 'Antidote',
    nameKo: '해독제',
    description: '독 상태를 치료한다.',
    category: 'status',
    price: 50,
    sellPrice: 25,
    effect: { type: 'heal_status', status: 'poison' },
    usableInBattle: true,
    usableOutOfBattle: true,
  },

  awakening: {
    id: 'awakening',
    name: 'Awakening',
    nameKo: '잠깨는약',
    description: '수면 상태를 치료한다.',
    category: 'status',
    price: 50,
    sellPrice: 25,
    effect: { type: 'heal_status', status: 'sleep' },
    usableInBattle: true,
    usableOutOfBattle: true,
  },

  paralyze_heal: {
    id: 'paralyze_heal',
    name: 'Paralyze Heal',
    nameKo: '마비치료제',
    description: '마비 상태를 치료한다.',
    category: 'status',
    price: 50,
    sellPrice: 25,
    effect: { type: 'heal_status', status: 'paralysis' },
    usableInBattle: true,
    usableOutOfBattle: true,
  },

  burn_heal: {
    id: 'burn_heal',
    name: 'Burn Heal',
    nameKo: '화상치료제',
    description: '화상 상태를 치료한다.',
    category: 'status',
    price: 50,
    sellPrice: 25,
    effect: { type: 'heal_status', status: 'burn' },
    usableInBattle: true,
    usableOutOfBattle: true,
  },

  full_heal: {
    id: 'full_heal',
    name: 'Full Heal',
    nameKo: '만병통치약',
    description: '모든 상태이상을 치료한다.',
    category: 'status',
    price: 200,
    sellPrice: 100,
    effect: { type: 'heal_status', status: 'all' },
    usableInBattle: true,
    usableOutOfBattle: true,
  },
}

export function getItem(id: string): Item | undefined {
  return items[id]
}

export function getAllItems(): Item[] {
  return Object.values(items)
}

export function getItemsByCategory(category: string): Item[] {
  return Object.values(items).filter((item) => item.category === category)
}
