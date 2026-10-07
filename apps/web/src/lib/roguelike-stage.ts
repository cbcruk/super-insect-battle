import {
  Application,
  Container,
  Graphics,
  GraphicsContext,
  Text,
  TextStyle,
  type Ticker,
} from 'pixi.js'
import type {
  RunState,
  ThreatLevel,
  Vec2,
} from '@super-insect-battle/roguelike'
import { describeCell, CELL_SIZE, UNKNOWN_BG } from './roguelike-cell.ts'
import {
  spawnVenomBurst,
  stepVenomParticle,
  venomParticleFade,
} from './venom-burst.ts'
import type { VenomParticle } from './venom-burst.types.ts'

interface LiveParticle {
  state: VenomParticle
  sprite: Graphics
}

const DEADLY_STROKE = '#ef4444'

/**
 * 로그라이크 맵을 PixiJS로 그리는 무대.
 *
 * 게임 상태는 들고 있지 않는다. {@linkcode RoguelikeStage.draw}에 런 상태를 넘길 때마다
 * 타일과 글리프를 다시 그리고, 독 입자처럼 프레임 단위로 움직이는 연출만 내부 ticker로 진행한다.
 */
export class RoguelikeStage {
  private readonly tiles = new Graphics()
  private readonly glyphLayer = new Container()
  private readonly particleLayer = new Container()
  private readonly glyphPool: Text[] = []
  private readonly particles: LiveParticle[] = []
  private readonly dot = new GraphicsContext().circle(0, 0, 1).fill(0xffffff)
  private readonly glyphStyle: TextStyle

  private constructor(
    private readonly app: Application,
    private readonly cell: number
  ) {
    this.glyphStyle = new TextStyle({
      fontFamily: 'ui-monospace, "SFMono-Regular", monospace',
      fontWeight: 'bold',
      fontSize: Math.floor(cell * 0.78),
      fill: 0xffffff,
    })
    app.stage.addChild(this.tiles, this.glyphLayer, this.particleLayer)
    app.ticker.add(this.tick)
  }

  /** 무대를 만들고 캔버스를 `host` 안에 붙인다. */
  static async create(
    host: HTMLElement,
    cell: number = CELL_SIZE
  ): Promise<RoguelikeStage> {
    const app = new Application()
    await app.init({
      width: cell,
      height: cell,
      background: UNKNOWN_BG,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
    })
    app.canvas.style.display = 'block'
    host.appendChild(app.canvas)
    return new RoguelikeStage(app, cell)
  }

  /** 런 상태를 FOV·위협 단계를 반영해 다시 그린다. */
  draw(
    run: RunState,
    threats: ReadonlyMap<string, ThreatLevel> = new Map()
  ): void {
    const { cell } = this
    const { width, height } = run.level.map
    if (
      this.app.screen.width !== width * cell ||
      this.app.screen.height !== height * cell
    ) {
      this.app.renderer.resize(width * cell, height * cell)
    }

    this.tiles.clear()
    let used = 0

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const view = describeCell(run, x, y, threats)
        if (!view) continue

        const px = x * cell
        const py = y * cell
        this.tiles
          .rect(px, py, cell, cell)
          .fill({ color: view.bg, alpha: view.alpha })

        if (view.deadly) {
          this.tiles
            .rect(px + 1, py + 1, cell - 2, cell - 2)
            .stroke({ width: 1.5, color: DEADLY_STROKE })
        }

        if (view.glyph === '.') {
          this.tiles
            .rect(px + cell / 2 - 1, py + cell / 2, 2, 2)
            .fill({ color: view.fg, alpha: view.alpha })
        } else if (view.glyph && view.glyph !== ' ') {
          const text = this.glyphAt(used++)
          text.text = view.glyph
          text.tint = view.fg
          text.alpha = view.alpha
          text.position.set(px + cell / 2, py + cell / 2 + 1)
          text.visible = true
        }
      }
    }

    for (let i = used; i < this.glyphPool.length; i++) {
      this.glyphPool[i].visible = false
    }
  }

  /** 맵 좌표 `pos`에서 독 입자를 피워 올린다. */
  emitVenom(pos: Vec2, delayMs: number): void {
    const { cell } = this
    for (const state of spawnVenomBurst(
      pos.x * cell + cell / 2,
      pos.y * cell + cell / 2,
      delayMs
    )) {
      const sprite = new Graphics(this.dot)
      sprite.tint = state.color
      sprite.visible = false
      this.particleLayer.addChild(sprite)
      this.particles.push({ state, sprite })
    }
  }

  /** ticker와 GPU 자원을 해제하고 캔버스를 DOM에서 떼어낸다. */
  destroy(): void {
    this.app.ticker.remove(this.tick)
    this.app.destroy({ removeView: true }, { children: true })
    this.dot.destroy()
    this.glyphStyle.destroy()
  }

  private glyphAt(index: number): Text {
    let text = this.glyphPool[index]
    if (!text) {
      text = new Text({ text: '', style: this.glyphStyle })
      text.anchor.set(0.5)
      this.glyphPool.push(text)
      this.glyphLayer.addChild(text)
    }
    return text
  }

  private readonly tick = (ticker: Ticker): void => {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const { state, sprite } = this.particles[i]
      if (!stepVenomParticle(state, ticker.deltaMS)) {
        sprite.destroy()
        this.particles.splice(i, 1)
        continue
      }
      if (state.delayMs > 0) continue
      const fade = venomParticleFade(state)
      sprite.visible = true
      sprite.position.set(state.x, state.y)
      sprite.scale.set(state.radius * (0.6 + 0.4 * fade))
      sprite.alpha = fade
    }
  }
}
