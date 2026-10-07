import {
  Application,
  Container,
  Graphics,
  GraphicsContext,
  Text,
  TextStyle,
  type Ticker,
} from 'pixi.js'
import type { RunState, ThreatLevel } from '@super-insect-battle/roguelike'
import { describeCell, CELL_SIZE, UNKNOWN_BG } from './roguelike-cell.ts'
import { particleFade, spawnBurst, stepParticle } from './hit-particles.ts'
import type { HitParticle } from './hit-particles.types.ts'
import {
  createFlash,
  cueForHit,
  flashAlpha,
  stepFlash,
} from './stage-effects.ts'
import type { CellFlash } from './stage-effects.types.ts'
import type { HitEffect } from './combat-feedback.types.ts'

interface LiveParticle {
  state: HitParticle
  sprite: Graphics
}

const DEADLY_STROKE = '#ef4444'

/**
 * 로그라이크 맵을 PixiJS로 그리는 무대.
 *
 * 게임 상태는 들고 있지 않는다. {@linkcode RoguelikeStage.draw}에 런 상태를 넘길 때마다
 * 타일과 글리프를 다시 그리고, 칸 번쩍임·입자처럼 프레임 단위로 움직이는 연출이 남아 있는
 * 동안에만 ticker를 돌린다. 화면이 멈춰 있을 때는 다시 그리지 않는다.
 */
export class RoguelikeStage {
  private readonly tiles = new Graphics()
  private readonly glyphLayer = new Container()
  private readonly flashLayer = new Graphics()
  private readonly particleLayer = new Container()
  private readonly glyphPool: Text[] = []
  private readonly particles: LiveParticle[] = []
  private readonly flashes: CellFlash[] = []
  private readonly reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches
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
    app.stage.addChild(
      this.tiles,
      this.glyphLayer,
      this.flashLayer,
      this.particleLayer
    )
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
      autoStart: false,
    })
    // 맵은 키보드로만 조작하므로 포인터 이벤트와 그 호버 검사를 끈다.
    // null로 떼는 것은 Pixi 문서의 공식 사용법이지만 타입 선언이 이를 빠뜨렸다.
    app.renderer.events.setTargetElement(null as unknown as HTMLElement)
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

    this.app.render()
  }

  /**
   * 피격 연출 하나를 칸 번쩍임과 입자로 재생한다.
   *
   * 움직임 줄이기 설정이 켜져 있으면 입자는 생략하고 번쩍임만 보인다.
   */
  playHit(effect: HitEffect): void {
    const { cell } = this
    const cue = cueForHit(effect)
    if (cue.flash) {
      this.flashes.push(
        createFlash(effect.pos.x, effect.pos.y, cue.flash, effect.delayMs)
      )
    }
    if (cue.burst && !this.reducedMotion) {
      for (const state of spawnBurst(
        cue.burst,
        effect.pos.x * cell + cell / 2,
        effect.pos.y * cell + cell / 2,
        effect.delayMs
      )) {
        const sprite = new Graphics(this.dot)
        sprite.tint = state.color
        sprite.visible = false
        this.particleLayer.addChild(sprite)
        this.particles.push({ state, sprite })
      }
    }
    if (!this.app.ticker.started) this.app.ticker.start()
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
    const dt = ticker.deltaMS
    const { cell } = this

    this.flashLayer.clear()
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const flash = this.flashes[i]
      if (!stepFlash(flash, dt)) {
        this.flashes.splice(i, 1)
        continue
      }
      const alpha = flashAlpha(flash)
      if (alpha <= 0) continue
      this.flashLayer
        .rect(flash.x * cell, flash.y * cell, cell, cell)
        .fill({ color: flash.color, alpha })
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const { state, sprite } = this.particles[i]
      if (!stepParticle(state, dt)) {
        sprite.destroy()
        this.particles.splice(i, 1)
        continue
      }
      if (state.delayMs > 0) continue
      const fade = particleFade(state)
      sprite.visible = true
      sprite.position.set(state.x, state.y)
      sprite.scale.set(state.radius * (0.6 + 0.4 * fade))
      sprite.alpha = fade
    }

    if (this.flashes.length === 0 && this.particles.length === 0) {
      ticker.stop()
    }
  }
}
