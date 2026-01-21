import * as ex from 'excalibur'
import { InsectActor } from '../actors/insect-actor'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants'

const PLAYER_X = 200
const OPPONENT_X = GAME_WIDTH - 200
const INSECT_Y = GAME_HEIGHT / 2 - 50

export class BattleScene extends ex.Scene {
  private playerInsect!: InsectActor
  private opponentInsect!: InsectActor

  onInitialize(): void {
    this.playerInsect = new InsectActor('player', PLAYER_X, INSECT_Y)
    this.opponentInsect = new InsectActor('opponent', OPPONENT_X, INSECT_Y)

    this.add(this.playerInsect)
    this.add(this.opponentInsect)

    this.drawVsText()
  }

  private drawVsText(): void {
    const vsLabel = new ex.Label({
      text: 'VS',
      pos: ex.vec(GAME_WIDTH / 2, INSECT_Y),
      font: new ex.Font({
        size: 36,
        bold: true,
        family: 'Arial',
        color: ex.Color.White,
        textAlign: ex.TextAlign.Center,
      }),
    })
    this.add(vsLabel)
  }

  async playPlayerAttack(): Promise<void> {
    await this.playerInsect.playAttackAnimation()
    await this.opponentInsect.playHitAnimation()
  }

  async playOpponentAttack(): Promise<void> {
    await this.opponentInsect.playAttackAnimation()
    await this.playerInsect.playHitAnimation()
  }

  async playPlayerFaint(): Promise<void> {
    await this.playerInsect.playFaintAnimation()
  }

  async playOpponentFaint(): Promise<void> {
    await this.opponentInsect.playFaintAnimation()
  }

  resetBattle(): void {
    this.playerInsect.reset()
    this.opponentInsect.reset()
  }
}
