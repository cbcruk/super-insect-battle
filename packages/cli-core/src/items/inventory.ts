import type { Inventory } from './types'
import { getItem } from './items'

export function createInventory(startingMoney: number = 500): Inventory {
  return {
    items: [
      { itemId: 'potion', quantity: 3 },
    ],
    money: startingMoney,
  }
}

export function addItem(inventory: Inventory, itemId: string, quantity: number = 1): boolean {
  const item = getItem(itemId)
  if (!item) return false

  const existing = inventory.items.find((i) => i.itemId === itemId)
  if (existing) {
    existing.quantity += quantity
  } else {
    inventory.items.push({ itemId, quantity })
  }

  return true
}

export function removeItem(inventory: Inventory, itemId: string, quantity: number = 1): boolean {
  const existing = inventory.items.find((i) => i.itemId === itemId)
  if (!existing || existing.quantity < quantity) return false

  existing.quantity -= quantity

  if (existing.quantity <= 0) {
    inventory.items = inventory.items.filter((i) => i.itemId !== itemId)
  }

  return true
}

export function hasItem(inventory: Inventory, itemId: string, quantity: number = 1): boolean {
  const existing = inventory.items.find((i) => i.itemId === itemId)
  return existing !== undefined && existing.quantity >= quantity
}

export function getItemQuantity(inventory: Inventory, itemId: string): number {
  const existing = inventory.items.find((i) => i.itemId === itemId)
  return existing?.quantity ?? 0
}

export function canAfford(inventory: Inventory, price: number): boolean {
  return inventory.money >= price
}

export function spendMoney(inventory: Inventory, amount: number): boolean {
  if (!canAfford(inventory, amount)) return false
  inventory.money -= amount
  return true
}

export function earnMoney(inventory: Inventory, amount: number): void {
  inventory.money += amount
}

export function buyItem(inventory: Inventory, itemId: string, quantity: number = 1): boolean {
  const item = getItem(itemId)
  if (!item) return false

  const totalCost = item.price * quantity
  if (!canAfford(inventory, totalCost)) return false

  spendMoney(inventory, totalCost)
  addItem(inventory, itemId, quantity)

  return true
}

export function sellItem(inventory: Inventory, itemId: string, quantity: number = 1): boolean {
  const item = getItem(itemId)
  if (!item) return false
  if (!hasItem(inventory, itemId, quantity)) return false

  removeItem(inventory, itemId, quantity)
  earnMoney(inventory, item.sellPrice * quantity)

  return true
}
