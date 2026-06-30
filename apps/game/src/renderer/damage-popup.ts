import { Container, Text } from 'pixi.js'
import type { Ticker } from 'pixi.js'
import { tween, easeOutCubic } from './tween'

export function spawnDamagePopup(
  layer: Container,
  ticker: Ticker,
  x: number,
  y: number,
  damage: number,
  critical: boolean
): void {
  const text = new Text({
    text: critical ? `${damage}!` : `${damage}`,
    style: {
      fill: critical ? 0xff3b3b : 0xffffff,
      fontSize: critical ? 44 : 32,
      fontWeight: 'bold',
      stroke: { color: 0x000000, width: 4 },
    },
  })
  text.anchor.set(0.5)
  text.position.set(x, y)
  layer.addChild(text)

  void tween(ticker, {
    duration: 800,
    ease: easeOutCubic,
    onUpdate: (t) => {
      text.y = y - 60 * t
      text.alpha = t > 0.6 ? 1 - (t - 0.6) / 0.4 : 1
    },
  }).then(() => {
    text.destroy()
  })
}
