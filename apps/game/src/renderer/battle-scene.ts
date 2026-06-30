import { Application, Container, Graphics, Text, type Texture } from 'pixi.js'
import type { FighterInfo, Side } from '../event-stream/event-stream.types'
import { Fighter } from './fighter'
import { HpBar } from './hp-bar'
import { spawnDamagePopup } from './damage-popup'
import { tween } from './tween'

const WIDTH = 960
const HEIGHT = 540
const GROUND_Y = 400

export class BattleScene {
  readonly stage = new Container()

  private readonly fightersLayer = new Container()
  private readonly fxLayer = new Container()
  private readonly uiLayer = new Container()

  private fighters!: Record<Side, Fighter>
  private hpBars!: Record<Side, HpBar>
  private readonly banner: Text

  constructor(
    private readonly app: Application,
    private readonly textureFor: (id: string) => Texture | null = () => null
  ) {
    this.buildBackground()
    this.stage.addChild(this.fightersLayer, this.fxLayer, this.uiLayer)

    this.banner = new Text({
      text: '',
      style: {
        fill: 0xffffff,
        fontSize: 24,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 4 },
        align: 'center',
      },
    })
    this.banner.anchor.set(0.5)
    this.banner.position.set(WIDTH / 2, 60)
    this.uiLayer.addChild(this.banner)
  }

  get logicalSize(): { width: number; height: number } {
    return { width: WIDTH, height: HEIGHT }
  }

  private buildBackground(): void {
    const sky = new Graphics().rect(0, 0, WIDTH, GROUND_Y).fill(0x2a3a5a)
    const mid = new Graphics()
      .rect(0, GROUND_Y - 80, WIDTH, 80)
      .fill(0x35506b)
    const ground = new Graphics()
      .rect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y)
      .fill(0x3e6b3a)
    this.stage.addChild(sky, mid, ground)
  }

  intro(player: FighterInfo, opponent: FighterInfo): void {
    this.fighters = {
      player: new Fighter(player, 'player', this.textureFor(player.id)),
      opponent: new Fighter(opponent, 'opponent', this.textureFor(opponent.id)),
    }
    this.fighters.player.view.position.set(260, GROUND_Y + 20)
    this.fighters.opponent.view.position.set(WIDTH - 260, GROUND_Y + 20)
    this.fightersLayer.addChild(
      this.fighters.player.view,
      this.fighters.opponent.view
    )

    this.hpBars = {
      player: new HpBar(player.nameKo, player.maxHp),
      opponent: new HpBar(opponent.nameKo, opponent.maxHp),
    }
    this.hpBars.player.view.position.set(60, 120)
    this.hpBars.opponent.view.position.set(WIDTH - 280, 120)
    this.uiLayer.addChild(this.hpBars.player.view, this.hpBars.opponent.view)
  }

  showTurn(turn: number): void {
    this.banner.text = `— ${turn}턴 —`
  }

  showAction(text: string): void {
    this.banner.text = text
  }

  async hit(
    attacker: Side,
    defender: Side,
    damage: number,
    critical: boolean
  ): Promise<void> {
    await this.fighters[attacker].lunge(this.app.ticker)

    const target = this.fighters[defender].view
    spawnDamagePopup(
      this.fxLayer,
      this.app.ticker,
      target.x,
      target.y - 170,
      damage,
      critical
    )
    if (critical) await this.flash()
    await this.fighters[defender].takeHit(this.app.ticker, critical)
  }

  status(text: string): void {
    this.banner.text = text
  }

  async setHp(side: Side, value: number): Promise<void> {
    await this.hpBars[side].setHp(this.app.ticker, value)
  }

  async faint(side: Side): Promise<void> {
    await this.fighters[side].faint(this.app.ticker)
  }

  end(winner: Side | 'draw' | null): void {
    if (winner === 'draw' || winner === null) {
      this.banner.text = '무승부!'
      return
    }
    this.banner.text = `${this.fighters[winner].nameKo} 승리!`
  }

  private async flash(): Promise<void> {
    const overlay = new Graphics().rect(0, 0, WIDTH, HEIGHT).fill(0xffffff)
    this.fxLayer.addChild(overlay)
    await tween(this.app.ticker, {
      duration: 160,
      onUpdate: (t) => {
        overlay.alpha = 0.6 * (1 - t)
      },
    })
    overlay.destroy()
  }
}
