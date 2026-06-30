import { Application, type Texture } from 'pixi.js'
import {
  arthropodList,
  getArthropodById,
  simulateBattle,
  type Arthropod,
} from '@super-insect-battle/engine'
import { buildEventStream } from './event-stream/event-stream'
import { BattleScene } from './renderer/battle-scene'
import { playEvents } from './renderer/play-events'
import { loadSprite } from './renderer/sprite-loader'

async function main(): Promise<void> {
  const app = new Application()
  await app.init({
    background: 0x0b0e14,
    resizeTo: window,
    antialias: true,
  })

  const container = document.getElementById('app')
  if (!container) throw new Error('#app not found')
  container.appendChild(app.canvas)

  await runBattle(app)

  app.canvas.addEventListener('pointerdown', () => {
    void runBattle(app)
  })
}

function pickFighters(): [Arthropod, Arthropod] {
  const params = new URLSearchParams(window.location.search)
  const fromParam = (key: string): Arthropod | undefined => {
    const id = params.get(key)
    return id ? getArthropodById(id) : undefined
  }
  const random = (): Arthropod =>
    arthropodList[Math.floor(Math.random() * arthropodList.length)]

  const player = fromParam('p') ?? random()
  let opponent = fromParam('o') ?? random()
  while (opponent.id === player.id) opponent = random()
  return [player, opponent]
}

async function runBattle(app: Application): Promise<void> {
  const [player, opponent] = pickFighters()

  const textures = new Map<string, Texture | null>()
  for (const a of [player, opponent]) {
    textures.set(a.id, await loadSprite(a.id))
  }

  app.stage.removeChildren()
  const scene = new BattleScene(app, (id) => textures.get(id) ?? null)
  app.stage.addChild(scene.stage)

  const fit = (): void => {
    const { width, height } = scene.logicalSize
    const scale = Math.min(app.screen.width / width, app.screen.height / height)
    scene.stage.scale.set(scale)
    scene.stage.position.set(
      (app.screen.width - width * scale) / 2,
      (app.screen.height - height * scale) / 2
    )
  }
  fit()
  app.renderer.on('resize', fit)

  const state = simulateBattle(player, opponent)
  await playEvents(scene, buildEventStream(state))
}

void main()
