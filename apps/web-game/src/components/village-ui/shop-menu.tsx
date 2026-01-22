import React from 'react'
import { useVillageStore } from '../../store/village-store'

interface ShopItem {
  id: string
  name: string
  description: string
  price: number
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'potion', name: 'Potion', description: 'Restores 20 HP', price: 100 },
  { id: 'super_potion', name: 'Super Potion', description: 'Restores 50 HP', price: 300 },
  { id: 'antidote', name: 'Antidote', description: 'Cures poison', price: 50 },
  { id: 'repel', name: 'Repel', description: 'Prevents wild encounters', price: 200 },
]

export function ShopMenu(): React.ReactNode {
  const { closeUI } = useVillageStore()

  const handleBuy = (item: ShopItem): void => {
    console.log(`Buying ${item.name} for ${item.price}G`)
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900/95 border-2 border-gray-600 rounded-lg p-6 w-[400px]">
        <div className="text-xl font-bold text-yellow-400 mb-4">Shop</div>

        <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
          {SHOP_ITEMS.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 bg-gray-800 rounded hover:bg-gray-700"
            >
              <div>
                <div className="text-white font-medium">{item.name}</div>
                <div className="text-gray-400 text-sm">{item.description}</div>
              </div>
              <button
                onClick={() => handleBuy(item)}
                className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-white text-sm"
              >
                {item.price}G
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={closeUI}
          className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white font-medium"
        >
          Close
        </button>
      </div>
    </div>
  )
}
