import * as ex from 'excalibur'
import { TILE_SIZE } from '../constants'

const MOVE_DURATION = 150

export class PlayerActor extends ex.Actor {
  private gridX: number
  private gridY: number
  private isMoving = false

  constructor(gridX: number, gridY: number) {
    super({
      x: gridX * TILE_SIZE + TILE_SIZE / 2,
      y: gridY * TILE_SIZE + TILE_SIZE / 2,
      width: TILE_SIZE - 4,
      height: TILE_SIZE - 4,
      color: ex.Color.fromHex('#3b82f6'),
      anchor: ex.vec(0.5, 0.5),
      z: 10,
    })

    this.gridX = gridX
    this.gridY = gridY
  }

  getGridPosition(): { x: number; y: number } {
    return { x: this.gridX, y: this.gridY }
  }

  setGridPosition(x: number, y: number): void {
    this.gridX = x
    this.gridY = y
    this.pos.x = x * TILE_SIZE + TILE_SIZE / 2
    this.pos.y = y * TILE_SIZE + TILE_SIZE / 2
  }

  isCurrentlyMoving(): boolean {
    return this.isMoving
  }

  async moveTo(targetX: number, targetY: number): Promise<void> {
    if (this.isMoving) return

    this.isMoving = true
    this.gridX = targetX
    this.gridY = targetY

    const pixelX = targetX * TILE_SIZE + TILE_SIZE / 2
    const pixelY = targetY * TILE_SIZE + TILE_SIZE / 2

    await this.actions
      .easeTo(pixelX, pixelY, MOVE_DURATION, ex.EasingFunctions.Linear)
      .toPromise()

    this.isMoving = false
  }
}
