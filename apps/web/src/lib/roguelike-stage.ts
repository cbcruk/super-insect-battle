import {
  Application,
  Container,
  Graphics,
  GraphicsContext,
  Text,
  TextStyle,
  type Ticker,
} from 'pixi.js'
import type { Arthropod } from '@super-insect-battle/engine'
import type {
  RunState,
  ThreatLevel,
  Vec2,
} from '@super-insect-battle/roguelike'
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
import { motionFrame } from './attack-motion.ts'
import type { AttackMotion } from './attack-motion.types.ts'
import { fallFrame } from './fall-motion.ts'
import type { Fall } from './fall-motion.types.ts'
import { silhouetteFor } from './insect-silhouette.ts'
import { drawShapes, silhouetteContext } from './silhouette-context.ts'

interface LiveParticle {
  state: HitParticle
  sprite: Graphics
}

interface GlyphSnapshot {
  glyph: string
  tint: number
  rotation: number
  species?: Arthropod
}

interface LiveFall {
  fall: Fall
  ghost: Container
  /** 잔상이 서 있던 칸 중심(px). */
  home: Vec2
  /** 쓰러지기 전 바라보던 방향(라디안). 쓰러짐 기울기는 여기에 더한다. */
  facing: number
  /** 마지막 피해가 닿은 뒤 흐른 시간(ms). 닿기 전이면 음수. */
  sinceImpactMs: number
}

interface LiveMotion {
  motion: AttackMotion
  /** 움직임 시작 후 흐른 시간(ms). 지연 중이면 음수. */
  elapsedMs: number
}

const DEADLY_STROKE = '#ef4444'
const PLAYER_SHOT = '#22d3ee'
const ENEMY_SHOT = '#f87171'

/**
 * 로그라이크 맵을 PixiJS로 그리는 무대.
 *
 * 게임 상태는 들고 있지 않는다. {@linkcode RoguelikeStage.draw}에 런 상태를 넘길 때마다
 * 타일·글리프·곤충 실루엣을 다시 그리고, 공격 움직임·쓰러짐·칸 번쩍임·입자처럼 프레임 단위로 움직이는
 * 연출이 남아 있는 동안에만 ticker를 돌린다. 화면이 멈춰 있을 때는 다시 그리지 않는다.
 */
export class RoguelikeStage {
  private readonly tiles = new Graphics()
  private readonly glyphLayer = new Container()
  private readonly ghostLayer = new Container()
  private readonly flashLayer = new Graphics()
  private readonly shotLayer = new Graphics()
  private readonly particleLayer = new Container()
  private readonly glyphPool: Text[] = []
  private readonly spritePool: Graphics[] = []
  /** 종별 실루엣 그래픽. 같은 종의 곤충은 컨텍스트 하나를 함께 쓴다. */
  private readonly silhouettes = new Map<string, GraphicsContext>()
  /** 칸별 글리프 또는 곤충 실루엣. */
  private readonly glyphByCell = new Map<number, Container>()
  private readonly speciesByCell = new Map<number, Arthropod>()
  /** 직전 그리기의 칸별 글리프. 이번 그리기에서 사라진 액터의 잔상을 만들 때 쓴다. */
  private previousGlyphs = new Map<number, GlyphSnapshot>()
  /** 움직임 때문에 제자리를 벗어난 글리프와 그 원래 위치(px). */
  private readonly displaced = new Map<Container, Vec2>()
  private mapWidth = 0
  private readonly particles: LiveParticle[] = []
  private readonly flashes: CellFlash[] = []
  private readonly motions: LiveMotion[] = []
  private readonly falls: LiveFall[] = []
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
    // 지속 피해로 쓰러지면 잔상이 제자리에서 가라앉으므로, 같은 칸의 번쩍임에 가리지 않게 위에 둔다.
    app.stage.addChild(
      this.tiles,
      this.glyphLayer,
      this.flashLayer,
      this.ghostLayer,
      this.shotLayer,
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
    threats: ReadonlyMap<string, ThreatLevel> = new Map(),
    facings: ReadonlyMap<string, number> = new Map()
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
    this.previousGlyphs = new Map(
      [...this.glyphByCell].map(([key, glyph]) => [
        key,
        {
          glyph: glyph instanceof Text ? glyph.text : '',
          tint: glyph.tint,
          rotation: glyph.rotation,
          species: this.speciesByCell.get(key),
        },
      ])
    )
    this.glyphByCell.clear()
    this.speciesByCell.clear()
    this.displaced.clear()
    this.mapWidth = width
    let used = 0
    let usedSprites = 0

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

        if (view.species) {
          const sprite = this.spriteAt(usedSprites++, view.species)
          sprite.tint = view.fg
          sprite.alpha = view.glyphAlpha
          sprite.position.set(px + cell / 2, py + cell / 2)
          sprite.rotation = view.actorId ? (facings.get(view.actorId) ?? 0) : 0
          sprite.visible = true
          this.glyphByCell.set(y * width + x, sprite)
          this.speciesByCell.set(y * width + x, view.species)
        } else if (view.mark) {
          drawShapes(
            this.tiles.context,
            view.mark,
            px + cell / 2,
            py + cell / 2,
            cell,
            view.fg,
            view.glyphAlpha
          )
        } else if (view.glyph && view.glyph !== ' ') {
          const text = this.glyphAt(used++)
          text.text = view.glyph
          text.tint = view.fg
          text.alpha = view.glyphAlpha
          text.position.set(px + cell / 2, py + cell / 2 + 1)
          text.visible = true
          this.glyphByCell.set(y * width + x, text)
        }
      }
    }

    for (let i = used; i < this.glyphPool.length; i++) {
      this.glyphPool[i].visible = false
    }
    for (let i = usedSprites; i < this.spritePool.length; i++) {
      this.spritePool[i].visible = false
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

  /**
   * 공격 움직임 하나를 재생한다. 돌진이면 공격자가, 투사체면 탄이 대상까지 간다.
   *
   * 움직임 줄이기 설정이 켜져 있으면 재생하지 않는다.
   */
  playMotion(motion: AttackMotion): void {
    if (this.reducedMotion) return
    this.motions.push({ motion, elapsedMs: -motion.delayMs })
    if (!this.app.ticker.started) this.app.ticker.start()
  }

  /**
   * 쓰러진 액터의 잔상을 세워 두었다가 마지막 피해가 닿으면 쓰러뜨린다.
   *
   * 코어는 쓰러진 액터를 즉시 지우므로, 직전 그리기에서 그 칸에 있던 글리프나 실루엣으로 잔상을
   * 만든다. 기억된 글리프가 없으면 재생하지 않는다.
   */
  playFall(fall: Fall): void {
    const { cell } = this
    const snapshot = this.previousGlyphs.get(
      fall.pos.y * this.mapWidth + fall.pos.x
    )
    if (!snapshot) return
    const ghost = snapshot.species
      ? new Graphics(this.silhouetteOf(snapshot.species))
      : new Text({ text: snapshot.glyph, style: this.glyphStyle })
    if (ghost instanceof Text) ghost.anchor.set(0.5)
    ghost.tint = snapshot.tint
    const home = {
      x: fall.pos.x * cell + cell / 2,
      y: fall.pos.y * cell + cell / 2 + (snapshot.species ? 0 : 1),
    }
    ghost.position.set(home.x, home.y)
    this.ghostLayer.addChild(ghost)
    ghost.rotation = snapshot.rotation
    this.falls.push({
      fall,
      ghost,
      home,
      facing: snapshot.rotation,
      sinceImpactMs: -fall.delayMs,
    })
    if (!this.app.ticker.started) this.app.ticker.start()
  }

  /** ticker와 GPU 자원을 해제하고 캔버스를 DOM에서 떼어낸다. */
  destroy(): void {
    this.app.ticker.remove(this.tick)
    this.app.destroy({ removeView: true }, { children: true })
    this.dot.destroy()
    for (const ctx of this.silhouettes.values()) ctx.destroy()
    this.glyphStyle.destroy()
  }

  private silhouetteOf(species: Arthropod): GraphicsContext {
    let ctx = this.silhouettes.get(species.id)
    if (!ctx) {
      ctx = silhouetteContext(silhouetteFor(species), this.cell)
      this.silhouettes.set(species.id, ctx)
    }
    return ctx
  }

  private spriteAt(index: number, species: Arthropod): Graphics {
    const context = this.silhouetteOf(species)
    let sprite = this.spritePool[index]
    if (!sprite) {
      sprite = new Graphics(context)
      this.spritePool.push(sprite)
      this.glyphLayer.addChild(sprite)
    } else if (sprite.context !== context) {
      sprite.context = context
    }
    return sprite
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

    this.stepMotions(dt)
    this.stepFalls(dt)

    if (
      this.flashes.length === 0 &&
      this.particles.length === 0 &&
      this.motions.length === 0 &&
      this.falls.length === 0
    ) {
      ticker.stop()
    }
  }

  private stepMotions(dt: number): void {
    const { cell } = this
    for (const [glyph, home] of this.displaced) {
      glyph.position.set(home.x, home.y)
    }
    this.displaced.clear()
    this.shotLayer.clear()

    for (let i = this.motions.length - 1; i >= 0; i--) {
      const live = this.motions[i]
      live.elapsedMs += dt
      if (live.elapsedMs < 0) continue
      const { motion } = live
      const frame = motionFrame(motion, live.elapsedMs)
      if (frame.done) {
        this.motions.splice(i, 1)
        continue
      }
      this.nudgeGlyph(motion.from.x, motion.from.y, frame.attacker)
      this.nudgeGlyph(motion.to.x, motion.to.y, frame.defender)
      if (frame.projectile) {
        const color = motion.byPlayer ? PLAYER_SHOT : ENEMY_SHOT
        const { head, tail } = frame.projectile
        this.shotLayer
          .moveTo((tail.x + 0.5) * cell, (tail.y + 0.5) * cell)
          .lineTo((head.x + 0.5) * cell, (head.y + 0.5) * cell)
          .stroke({ width: 2, color, alpha: 0.5 })
          .circle((head.x + 0.5) * cell, (head.y + 0.5) * cell, 2.5)
          .fill(color)
      }
    }
  }

  private stepFalls(dt: number): void {
    const { cell } = this
    for (let i = this.falls.length - 1; i >= 0; i--) {
      const live = this.falls[i]
      live.sinceImpactMs += dt
      const frame = fallFrame(
        live.sinceImpactMs,
        live.fall.pos,
        live.fall.from,
        this.reducedMotion
      )
      if (frame.done) {
        live.ghost.destroy()
        this.falls.splice(i, 1)
        continue
      }
      live.ghost.position.set(
        live.home.x + frame.offset.x * cell,
        live.home.y + frame.offset.y * cell
      )
      live.ghost.alpha = frame.alpha
      live.ghost.rotation = live.facing + frame.rotation
      live.ghost.scale.set(frame.scale)
    }
  }

  private nudgeGlyph(x: number, y: number, offset: Vec2): void {
    if (offset.x === 0 && offset.y === 0) return
    const glyph = this.glyphByCell.get(y * this.mapWidth + x)
    if (!glyph) return
    if (!this.displaced.has(glyph)) {
      this.displaced.set(glyph, { x: glyph.position.x, y: glyph.position.y })
    }
    glyph.position.x += offset.x * this.cell
    glyph.position.y += offset.y * this.cell
  }
}
