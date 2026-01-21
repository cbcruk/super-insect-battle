import * as ex from 'excalibur'

export type InsectSide = 'player' | 'opponent'

const ATTACK_DISTANCE = 100
const ATTACK_DURATION = 200
const HIT_BLINK_DURATION = 160
const HIT_BLINK_COUNT = 3
const FAINT_DISTANCE = 200
const FAINT_DURATION = 500

export class InsectActor extends ex.Actor {
  private side: InsectSide
  private originalX: number
  private originalY: number
  private isAnimating = false

  constructor(side: InsectSide, x: number, y: number) {
    const color = side === 'player' ? ex.Color.fromHex('#22c55e') : ex.Color.fromHex('#ef4444')

    super({
      x,
      y,
      width: 80,
      height: 80,
      color,
      anchor: ex.vec(0.5, 0.5),
    })

    this.side = side
    this.originalX = x
    this.originalY = y
  }

  async playAttackAnimation(): Promise<void> {
    if (this.isAnimating) return
    this.isAnimating = true

    const direction = this.side === 'player' ? 1 : -1
    const targetX = this.originalX + ATTACK_DISTANCE * direction

    await this.actions
      .easeTo(targetX, this.originalY, ATTACK_DURATION, ex.EasingFunctions.EaseInQuad)
      .toPromise()

    await this.actions
      .easeTo(this.originalX, this.originalY, ATTACK_DURATION, ex.EasingFunctions.EaseOutQuad)
      .toPromise()

    this.isAnimating = false
  }

  async playHitAnimation(): Promise<void> {
    if (this.isAnimating) return
    this.isAnimating = true

    for (let i = 0; i < HIT_BLINK_COUNT; i++) {
      this.graphics.opacity = 0.3
      await this.delay(HIT_BLINK_DURATION / 2)
      this.graphics.opacity = 1
      await this.delay(HIT_BLINK_DURATION / 2)
    }

    this.isAnimating = false
  }

  async playFaintAnimation(): Promise<void> {
    if (this.isAnimating) return
    this.isAnimating = true

    const targetY = this.originalY + FAINT_DISTANCE

    await this.actions
      .easeTo(this.originalX, targetY, FAINT_DURATION, ex.EasingFunctions.EaseInQuad)
      .toPromise()

    this.graphics.opacity = 0
    this.isAnimating = false
  }

  reset(): void {
    this.pos.x = this.originalX
    this.pos.y = this.originalY
    this.graphics.opacity = 1
    this.isAnimating = false
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
