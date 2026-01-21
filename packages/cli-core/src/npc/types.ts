export type NpcType = 'healer' | 'shopkeeper' | 'trainer' | 'villager'

export interface DialogueLine {
  text: string
  condition?: {
    type: 'hasItem' | 'teamHealth' | 'always'
    value?: string | number
  }
}

export interface Npc {
  id: string
  name: string
  type: NpcType
  description: string
  dialogue: DialogueLine[]
  actions?: NpcAction[]
}

export interface NpcAction {
  id: string
  label: string
  type: 'heal' | 'shop' | 'battle' | 'info'
}

export interface RoomNpc {
  npcId: string
  position?: string
}
