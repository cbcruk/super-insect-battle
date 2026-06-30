import { Container, Graphics, Text } from 'pixi.js'
import type { Ticker } from 'pixi.js'
import { tween, easeOutCubic } from './tween'

const BAR_W = 220
const BAR_H = 18

function hpColor(ratio: number): number {
  if (ratio > 0.5) return 0x4caf50
  if (ratio > 0.25) return 0xffc107
  return 0xf44336
}

export class HpBar {
  readonly view = new Container()
  private readonly fill = new Graphics()
  private readonly label = new Text({
    text: '',
    style: { fill: 0xffffff, fontSize: 14, fontWeight: 'bold' },
  })

  private current: number

  constructor(
    name: string,
    private readonly maxHp: number
  ) {
    this.current = maxHp

    const bg = new Graphics()
    bg.roundRect(0, 0, BAR_W, BAR_H, 6).fill(0x000000)
    bg.alpha = 0.5

    const nameText = new Text({
      text: name,
      style: { fill: 0xffffff, fontSize: 16, fontWeight: 'bold' },
    })
    nameText.y = -24

    this.label.anchor.set(1, 0)
    this.label.position.set(BAR_W, -24)

    this.view.addChild(bg, this.fill, nameText, this.label)
    this.redraw()
  }

  private redraw(): void {
    const ratio = Math.max(0, this.current / this.maxHp)
    this.fill.clear()
    this.fill
      .roundRect(2, 2, (BAR_W - 4) * ratio, BAR_H - 4, 4)
      .fill(hpColor(ratio))
    this.label.text = `${Math.max(0, Math.round(this.current))} / ${this.maxHp}`
  }

  async setHp(ticker: Ticker, value: number): Promise<void> {
    const from = this.current
    const to = Math.max(0, value)
    if (from === to) return

    await tween(ticker, {
      duration: 400,
      ease: easeOutCubic,
      onUpdate: (t) => {
        this.current = from + (to - from) * t
        this.redraw()
      },
    })
    this.current = to
    this.redraw()
  }
}
