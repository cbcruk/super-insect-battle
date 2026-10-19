import { describe, it, expect } from 'vitest'
import {
  arthropods,
  deserializeReplay,
  replayBattle,
  serializeReplay,
  type BattleReplay,
  type BattleState,
} from '@super-insect-battle/engine'
import { createInteractiveBattle } from './interactive-battle-runner'

function playRecordedBattle(): Promise<{
  state: BattleState
  replay: BattleReplay
}> {
  return new Promise((resolve) => {
    let pick = 0
    const handle = createInteractiveBattle({
      arthropod1: arthropods.mantis,
      arthropod2: arthropods.scorpion,
      aiDifficulty: 'medium',
      aiPersonality: 'balanced',
      callbacks: {
        onTurnStart: () => {},
        onTurnEnd: () => {},
        onWaitingForAction: (context) => {
          const actions = context.availableActions
          handle.resolverRef.current?.(actions[pick++ % actions.length])
        },
        onBattleEnd: (state, replay) => resolve({ state, replay }),
      },
    })
    void handle.start()
  })
}

describe('createInteractiveBattle replay', () => {
  it('replays a saved web battle exactly', async () => {
    const { state, replay } = await playRecordedBattle()
    const replayed = await replayBattle(
      deserializeReplay(serializeReplay(replay))
    )

    expect(replayed.winner).toBe(state.winner)
    expect(replayed.turn).toBe(state.turn)
    expect(replayed.log).toEqual(state.log)
  })
})
