import * as ex from 'excalibur'
import { TILE_SIZE } from '../constants'
import { PlayerActor } from '../actors/player-actor'
import { NpcActor } from '../actors/npc-actor'
import {
  TILE_COLORS,
  WALKABLE_TILES,
  type RoomMap,
  type DoorData,
} from '../tilemaps/tile-types'
import { getRoomMap } from '../tilemaps/village-map'
import { useGameStore } from '../../store/game-store'
import { useVillageStore } from '../../store/village-store'
import { useBattleStore } from '../../store/battle-store'
import { npcs } from '@insect-battle/cli-core'

const WILD_INSECTS = [
  'stag_beetle',
  'praying_mantis',
  'giant_water_bug',
  'cicada',
]

export class VillageScene extends ex.Scene {
  private player!: PlayerActor
  private currentMap!: RoomMap
  private npcActors: Map<string, NpcActor> = new Map()
  private inputEnabled = true

  onInitialize(engine: ex.Engine): void {
    this.loadRoom('training_grounds', 10, 10)
    this.setupInput(engine)
  }

  loadRoom(roomId: string, spawnX: number, spawnY: number): void {
    const map = getRoomMap(roomId)
    if (!map) {
      console.error(`Room not found: ${roomId}`)
      return
    }

    this.clear()
    this.npcActors.clear()
    this.currentMap = map

    useGameStore.getState().setRoom(roomId, spawnX, spawnY)

    this.renderTilemap()
    this.spawnPlayer(spawnX, spawnY)
    this.spawnNpcs()
  }

  private renderTilemap(): void {
    const { tiles } = this.currentMap

    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const tileType = tiles[y][x]
        const color = TILE_COLORS[tileType]

        const tile = new ex.Actor({
          x: x * TILE_SIZE + TILE_SIZE / 2,
          y: y * TILE_SIZE + TILE_SIZE / 2,
          width: TILE_SIZE,
          height: TILE_SIZE,
          color,
          anchor: ex.vec(0.5, 0.5),
          z: 0,
        })

        this.add(tile)
      }
    }
  }

  private spawnPlayer(x: number, y: number): void {
    this.player = new PlayerActor(x, y)
    this.add(this.player)
  }

  private spawnNpcs(): void {
    for (const npcSpawn of this.currentMap.npcs) {
      const npcData = npcs[npcSpawn.npcId]
      if (!npcData) continue

      const npcActor = new NpcActor(npcData, npcSpawn.x, npcSpawn.y)
      this.npcActors.set(npcSpawn.npcId, npcActor)
      this.add(npcActor)
    }
  }

  private setupInput(engine: ex.Engine): void {
    engine.input.keyboard.on('hold', (evt) => {
      if (!this.inputEnabled || this.player.isCurrentlyMoving()) return
      if (useVillageStore.getState().uiMode !== 'explore') return

      const { x, y } = this.player.getGridPosition()
      let targetX = x
      let targetY = y

      switch (evt.key) {
        case ex.Keys.W:
        case ex.Keys.Up:
          targetY = y - 1
          break
        case ex.Keys.S:
        case ex.Keys.Down:
          targetY = y + 1
          break
        case ex.Keys.A:
        case ex.Keys.Left:
          targetX = x - 1
          break
        case ex.Keys.D:
        case ex.Keys.Right:
          targetX = x + 1
          break
      }

      if (targetX !== x || targetY !== y) {
        this.tryMove(targetX, targetY)
      }
    })

    engine.input.keyboard.on('press', (evt) => {
      if (evt.key === ex.Keys.Space || evt.key === ex.Keys.Enter) {
        this.handleInteraction()
      }

      if (evt.key === ex.Keys.Escape) {
        const villageStore = useVillageStore.getState()
        if (villageStore.uiMode !== 'explore') {
          villageStore.closeUI()
        }
      }
    })
  }

  private tryMove(targetX: number, targetY: number): void {
    if (!this.canMoveTo(targetX, targetY)) return

    const door = this.getDoorAt(targetX, targetY)
    if (door) {
      this.handleDoor(door)
      return
    }

    if (this.hasNpcAt(targetX, targetY)) return

    this.player.moveTo(targetX, targetY)
    useGameStore.getState().setPlayerPosition(targetX, targetY)

    if (this.currentMap.hasWildEncounters) {
      this.checkWildEncounter()
    }
  }

  private canMoveTo(x: number, y: number): boolean {
    if (x < 0 || y < 0) return false
    if (y >= this.currentMap.tiles.length) return false
    if (x >= this.currentMap.tiles[0].length) return false

    const tileType = this.currentMap.tiles[y][x]
    return WALKABLE_TILES.has(tileType)
  }

  private getDoorAt(x: number, y: number): DoorData | undefined {
    return this.currentMap.doors.find((door) => door.x === x && door.y === y)
  }

  private hasNpcAt(x: number, y: number): boolean {
    return this.currentMap.npcs.some((npc) => npc.x === x && npc.y === y)
  }

  private handleDoor(door: DoorData): void {
    this.loadRoom(door.targetRoom, door.spawnX, door.spawnY)
  }

  private handleInteraction(): void {
    const villageStore = useVillageStore.getState()

    if (villageStore.uiMode === 'dialogue') {
      villageStore.advanceDialogue()
      return
    }

    if (villageStore.uiMode !== 'explore') return

    const adjacentNpc = this.getAdjacentNpc()
    if (adjacentNpc) {
      villageStore.startDialogue(adjacentNpc.id)
    }
  }

  private getAdjacentNpc(): typeof npcs[keyof typeof npcs] | null {
    const { x, y } = this.player.getGridPosition()
    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ]

    for (const { dx, dy } of directions) {
      const npcSpawn = this.currentMap.npcs.find(
        (npc) => npc.x === x + dx && npc.y === y + dy
      )
      if (npcSpawn) {
        return npcs[npcSpawn.npcId] ?? null
      }
    }

    return null
  }

  private checkWildEncounter(): void {
    const rate = this.currentMap.encounterRate ?? 0.1
    if (Math.random() < rate) {
      this.triggerWildBattle()
    }
  }

  private triggerWildBattle(): void {
    const wildInsect = WILD_INSECTS[Math.floor(Math.random() * WILD_INSECTS.length)]
    useBattleStore.getState().startBattle('rhinoceros_beetle', wildInsect)
    useGameStore.getState().setScene('battle')
    this.engine.goToScene('battle')
  }

  setInputEnabled(enabled: boolean): void {
    this.inputEnabled = enabled
  }
}
