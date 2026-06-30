import type { Ticker } from 'pixi.js'

export type Easing = (t: number) => number

export const easeOutCubic: Easing = (t) => 1 - Math.pow(1 - t, 3)
export const easeInOutQuad: Easing = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

interface TweenOptions {
  duration: number
  onUpdate: (value: number) => void
  ease?: Easing
}

export function tween(ticker: Ticker, opts: TweenOptions): Promise<void> {
  const ease = opts.ease ?? easeOutCubic

  return new Promise((resolve) => {
    let elapsed = 0

    const update = (tk: Ticker): void => {
      elapsed += tk.deltaMS
      const t = Math.min(1, elapsed / opts.duration)
      opts.onUpdate(ease(t))

      if (t >= 1) {
        ticker.remove(update)
        resolve()
      }
    }

    ticker.add(update)
  })
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
