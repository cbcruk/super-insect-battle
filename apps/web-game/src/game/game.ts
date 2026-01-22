import * as ex from 'excalibur'
import { BattleScene } from './scenes/battle-scene'
import { VillageScene } from './scenes/village-scene'
import { GAME_WIDTH, GAME_HEIGHT } from './constants'

export { GAME_WIDTH, GAME_HEIGHT }

let gameInstance: ex.Engine | null = null

export function createGame(canvas: HTMLCanvasElement): ex.Engine {
  if (gameInstance) {
    return gameInstance
  }

  const game = new ex.Engine({
    canvasElement: canvas,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: ex.Color.fromHex('#2d2d44'),
    displayMode: ex.DisplayMode.Fixed,
    antialiasing: false,
  })

  game.addScene('village', new VillageScene())
  game.addScene('battle', new BattleScene())

  gameInstance = game
  return game
}

export function getGame(): ex.Engine | null {
  return gameInstance
}

export function destroyGame(): void {
  if (gameInstance) {
    gameInstance.stop()
    gameInstance = null
  }
}
