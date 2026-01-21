import type { CommandResult, GameState } from '../game/types'
import { getActiveInsect } from '../game/state'
import { line } from '../ui/display'
import { getItem, getAllItems, hasItem, removeItem } from '../items'

export function itemCommand(_args: string[], state: GameState): CommandResult {
  const { inventory } = state
  const lines: string[] = []

  lines.push('')
  lines.push('🎒 인벤토리')
  lines.push(line('─'))
  lines.push(`💰 소지금: ${inventory.money} G`)
  lines.push('')

  if (inventory.items.length === 0) {
    lines.push('  (아이템이 없습니다)')
  } else {
    inventory.items.forEach((invItem, i) => {
      const item = getItem(invItem.itemId)
      if (item) {
        lines.push(`  ${i + 1}. ${item.nameKo} x${invItem.quantity}`)
      }
    })
  }

  lines.push('')
  lines.push('아이템 사용: use <번호|이름>')
  lines.push(line('─'))

  return {
    output: lines.join('\n'),
    stateChanged: false,
  }
}

export function useItemCommand(args: string[], state: GameState): CommandResult {
  if (args.length === 0) {
    return {
      output: '어떤 아이템을 사용할까요? (예: use 1, use 포션)',
      stateChanged: false,
    }
  }

  const { inventory } = state
  const input = args.join(' ')

  let targetItemId: string | null = null

  const num = parseInt(input)
  if (!isNaN(num) && num >= 1 && num <= inventory.items.length) {
    targetItemId = inventory.items[num - 1].itemId
  } else {
    const allItems = getAllItems()
    const matchedItem = allItems.find(
      (item) =>
        item.nameKo.toLowerCase() === input.toLowerCase() ||
        item.name.toLowerCase() === input.toLowerCase() ||
        item.id === input.toLowerCase()
    )
    if (matchedItem && hasItem(inventory, matchedItem.id)) {
      targetItemId = matchedItem.id
    }
  }

  if (!targetItemId) {
    return {
      output: '해당 아이템을 찾을 수 없습니다.',
      stateChanged: false,
    }
  }

  const item = getItem(targetItemId)
  if (!item) {
    return {
      output: '알 수 없는 아이템입니다.',
      stateChanged: false,
    }
  }

  if (!item.usableOutOfBattle) {
    return {
      output: `${item.nameKo}은(는) 배틀 중에만 사용할 수 있습니다.`,
      stateChanged: false,
    }
  }

  const activeInsect = getActiveInsect(state)
  if (!activeInsect) {
    return {
      output: '사용할 곤충이 없습니다.',
      stateChanged: false,
    }
  }

  const result = applyItemEffect(item, activeInsect, state)
  if (result.success) {
    removeItem(inventory, targetItemId)
  }

  return {
    output: result.message,
    stateChanged: result.success,
  }
}

interface ItemUseResult {
  success: boolean
  message: string
}

function applyItemEffect(
  item: ReturnType<typeof getItem>,
  insect: NonNullable<ReturnType<typeof getActiveInsect>>,
  _state: GameState
): ItemUseResult {
  if (!item) {
    return { success: false, message: '알 수 없는 아이템입니다.' }
  }

  switch (item.effect.type) {
    case 'heal_hp': {
      if (insect.currentHp >= insect.maxHp) {
        return {
          success: false,
          message: `${insect.species.nameKo}은(는) 이미 HP가 최대입니다.`,
        }
      }
      const healAmount = item.effect.value ?? 0
      const oldHp = insect.currentHp
      insect.currentHp = Math.min(insect.maxHp, insect.currentHp + healAmount)
      const actualHeal = insect.currentHp - oldHp
      return {
        success: true,
        message: `${item.nameKo}을(를) 사용했다! ${insect.species.nameKo}의 HP가 ${actualHeal} 회복되었다! (${insect.currentHp}/${insect.maxHp})`,
      }
    }

    case 'heal_status': {
      return {
        success: false,
        message: '상태이상 회복 아이템은 배틀 중에 사용하세요.',
      }
    }

    default:
      return {
        success: false,
        message: '이 아이템은 지금 사용할 수 없습니다.',
      }
  }
}
