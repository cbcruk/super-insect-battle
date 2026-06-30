import type { RenderEvent } from '../event-stream/event-stream.types'
import type { BattleScene } from './battle-scene'
import { delay } from './tween'

export async function playEvents(
  scene: BattleScene,
  events: RenderEvent[]
): Promise<void> {
  for (const event of events) {
    switch (event.kind) {
      case 'intro':
        scene.intro(event.player, event.opponent)
        await delay(600)
        break
      case 'turn':
        scene.showTurn(event.turn)
        await delay(400)
        break
      case 'action':
        scene.showAction(event.text)
        await delay(500)
        break
      case 'hit':
        await scene.hit(
          event.attacker,
          event.defender,
          event.damage,
          event.critical
        )
        break
      case 'status':
        scene.status(event.text)
        await delay(600)
        break
      case 'hp':
        await Promise.all([
          scene.setHp('player', event.player),
          scene.setHp('opponent', event.opponent),
        ])
        break
      case 'faint':
        await scene.faint(event.side)
        await delay(300)
        break
      case 'end':
        scene.end(event.winner)
        break
    }
  }
}
