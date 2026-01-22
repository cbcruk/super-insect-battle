import * as ex from 'excalibur'
import { TILE_SIZE } from '../constants'
import type { Npc, NpcType } from '@insect-battle/cli-core'

const NPC_COLORS: Record<NpcType, string> = {
  healer: '#ec4899',
  shopkeeper: '#f97316',
  trainer: '#8b5cf6',
  villager: '#6b7280',
}

export class NpcActor extends ex.Actor {
  readonly npcData: Npc

  constructor(npc: Npc, gridX: number, gridY: number) {
    const color = ex.Color.fromHex(NPC_COLORS[npc.type])

    super({
      x: gridX * TILE_SIZE + TILE_SIZE / 2,
      y: gridY * TILE_SIZE + TILE_SIZE / 2,
      width: TILE_SIZE - 4,
      height: TILE_SIZE - 4,
      color,
      anchor: ex.vec(0.5, 0.5),
      z: 5,
    })

    this.npcData = npc
  }
}
