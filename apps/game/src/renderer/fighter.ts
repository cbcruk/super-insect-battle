import { Container, Graphics, Sprite, Text, type Texture } from 'pixi.js'
import type { Ticker } from 'pixi.js'
import type { FighterInfo, Side } from '../event-stream/event-stream.types'
import { colorForStyle } from './style-colors'
import { tween, easeOutCubic } from './tween'

const BODY_W = 120
const BODY_H = 150
const SPRITE_H = 200

export class Fighter {
  readonly view = new Container()
  readonly nameKo: string
  private readonly facing: number
  private readonly tintTarget: Sprite | Graphics

  constructor(info: FighterInfo, side: Side, texture: Texture | null) {
    this.nameKo = info.nameKo
    this.facing = side === 'player' ? 1 : -1

    this.tintTarget = texture
      ? this.buildSprite(texture)
      : this.buildPlaceholder(info)
    this.view.addChild(this.tintTarget)

    const name = new Text({
      text: info.nameKo,
      style: { fill: 0xffffff, fontSize: 18, fontWeight: 'bold' },
    })
    name.anchor.set(0.5, 0.5)
    name.y = 22
    this.view.addChild(name)
  }

  private buildSprite(texture: Texture): Sprite {
    const sprite = new Sprite(texture)
    sprite.anchor.set(0.5, 1)
    const scale = SPRITE_H / texture.height
    sprite.scale.set(this.facing * scale, scale)
    return sprite
  }

  private buildPlaceholder(info: FighterInfo): Graphics {
    const body = new Graphics()
    body
      .roundRect(-BODY_W / 2, -BODY_H, BODY_W, BODY_H, 16)
      .fill(colorForStyle(info.style))
      .stroke({ width: 4, color: 0x000000, alpha: 0.3 })

    const eyeX = this.facing * 22
    body.circle(eyeX, -BODY_H + 40, 12).fill(0xffffff)
    body.circle(eyeX + this.facing * 4, -BODY_H + 40, 6).fill(0x111111)
    return body
  }

  async lunge(ticker: Ticker): Promise<void> {
    const baseX = this.view.x
    const reach = this.facing * 70

    await tween(ticker, {
      duration: 110,
      ease: easeOutCubic,
      onUpdate: (t) => {
        this.view.x = baseX + reach * t
      },
    })
    await tween(ticker, {
      duration: 180,
      onUpdate: (t) => {
        this.view.x = baseX + reach * (1 - t)
      },
    })
    this.view.x = baseX
  }

  async takeHit(ticker: Ticker, critical: boolean): Promise<void> {
    const baseX = this.view.x
    const shake = critical ? 26 : 16

    this.tintTarget.tint = 0xff5555
    await tween(ticker, {
      duration: 260,
      onUpdate: (t) => {
        this.view.x = baseX + Math.sin(t * Math.PI * 6) * shake * (1 - t)
      },
    })
    this.view.x = baseX
    this.tintTarget.tint = 0xffffff
  }

  async faint(ticker: Ticker): Promise<void> {
    await tween(ticker, {
      duration: 500,
      onUpdate: (t) => {
        this.view.alpha = 1 - t
        this.view.angle = this.facing * -80 * t
      },
    })
  }
}
