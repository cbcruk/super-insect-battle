import { create } from 'zustand'
import { npcs, type Npc } from '@insect-battle/cli-core'

export type VillageUIMode = 'explore' | 'dialogue' | 'shop'

interface VillageStore {
  uiMode: VillageUIMode
  currentNpc: Npc | null
  dialogueIndex: number
  showActions: boolean

  startDialogue: (npcId: string) => void
  advanceDialogue: () => void
  closeUI: () => void
  openShop: () => void
  executeAction: (actionType: string) => void
}

export const useVillageStore = create<VillageStore>((set, get) => ({
  uiMode: 'explore',
  currentNpc: null,
  dialogueIndex: 0,
  showActions: false,

  startDialogue: (npcId: string) => {
    const npc = npcs[npcId]
    if (!npc) return

    set({
      uiMode: 'dialogue',
      currentNpc: npc,
      dialogueIndex: 0,
      showActions: false,
    })
  },

  advanceDialogue: () => {
    const { currentNpc, dialogueIndex, showActions } = get()
    if (!currentNpc) return

    if (showActions) return

    const nextIndex = dialogueIndex + 1
    if (nextIndex >= currentNpc.dialogue.length) {
      if (currentNpc.actions && currentNpc.actions.length > 0) {
        set({ showActions: true })
      } else {
        get().closeUI()
      }
    } else {
      set({ dialogueIndex: nextIndex })
    }
  },

  closeUI: () => {
    set({
      uiMode: 'explore',
      currentNpc: null,
      dialogueIndex: 0,
      showActions: false,
    })
  },

  openShop: () => {
    set({ uiMode: 'shop' })
  },

  executeAction: (actionType: string) => {
    const { currentNpc } = get()
    if (!currentNpc) return

    switch (actionType) {
      case 'heal':
        console.log('Healing team...')
        get().closeUI()
        break
      case 'shop':
        get().openShop()
        break
      default:
        get().closeUI()
    }
  },
}))
