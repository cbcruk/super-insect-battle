export type ItemCategory = 'healing' | 'status' | 'battle' | 'key'

export interface ItemEffect {
  type: 'heal_hp' | 'heal_status' | 'boost_stat' | 'capture'
  value?: number
  status?: string
  stat?: string
}

export interface Item {
  id: string
  name: string
  nameKo: string
  description: string
  category: ItemCategory
  price: number
  sellPrice: number
  effect: ItemEffect
  usableInBattle: boolean
  usableOutOfBattle: boolean
}

export interface InventoryItem {
  itemId: string
  quantity: number
}

export interface Inventory {
  items: InventoryItem[]
  money: number
}
