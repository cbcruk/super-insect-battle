import { formatEnvironment, type BattleState } from '@super-insect-battle/engine'
import { deriveEvents } from './events'
import { createNarrator } from './narrator'
import type { FeedItem, Hp, MatchFeed } from './types'

export function buildFeed(state: BattleState): MatchFeed {
  const maxHp: Hp = {
    player: state.player.maxHp,
    opponent: state.opponent.maxHp,
  }

  const events = deriveEvents(state)
  const narrator = createNarrator()
  const items: FeedItem[] = []
  const hp: Hp = { ...maxHp }

  for (const event of events) {
    const lines = narrator.next(event)

    if ('hpAfter' in event && event.hpAfter) {
      hp.player = Math.max(0, event.hpAfter.player)
      hp.opponent = Math.max(0, event.hpAfter.opponent)
    }

    for (const line of lines) {
      items.push({ line, hp: { ...hp } })
    }
  }

  return {
    player: state.player.base.nameKo,
    opponent: state.opponent.base.nameKo,
    maxHp,
    environment: formatEnvironment(state.environment),
    items,
  }
}
