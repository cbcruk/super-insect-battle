import { describe, it, expect } from 'vitest'
import {
  ReplayRecorder,
  runReplayBattle,
  replayBattle,
  serializeReplay,
  deserializeReplay,
} from './replay'
import { createAIPlayer } from './ai-player'
import { arthropods } from '../data/arthropods'
import { actionList } from '../data/actions'
import type { Environment } from '../types/environment'

const testEnv: Environment = {
  terrain: 'forest_floor',
  timeOfDay: 'day',
  weather: 'clear',
}

describe('replay', () => {
  describe('ReplayRecorder', () => {
    it('creates replay with header info', () => {
      const recorder = new ReplayRecorder(
        arthropods.rhinoceros_beetle,
        arthropods.giant_hornet,
        testEnv
      )

      const replay = recorder.finalize('player')

      expect(replay.header.playerArthropodId).toBe('rhinoceros_beetle')
      expect(replay.header.opponentArthropodId).toBe('giant_hornet')
      expect(replay.header.environment).toEqual(testEnv)
      expect(replay.header.version).toBe('1.0.0')
      expect(replay.header.id).toMatch(/^replay_/)
      expect(replay.winner).toBe('player')
      expect(replay.turns).toHaveLength(0)
    })

    it('records turns', () => {
      const recorder = new ReplayRecorder(
        arthropods.rhinoceros_beetle,
        arthropods.giant_hornet,
        testEnv
      )

      const action1 = actionList[0]
      const action2 = actionList[1]

      recorder.recordTurn(1, action1, action2)
      recorder.recordTurn(2, action2, action1)

      const replay = recorder.finalize('opponent')

      expect(replay.turns).toHaveLength(2)
      expect(replay.turns[0].turn).toBe(1)
      expect(replay.turns[0].playerAction.actionId).toBe(action1.id)
      expect(replay.turns[0].opponentAction.actionId).toBe(action2.id)
      expect(replay.turns[1].turn).toBe(2)
      expect(replay.totalTurns).toBe(2)
      expect(replay.winner).toBe('opponent')
    })
  })

  describe('serializeReplay / deserializeReplay', () => {
    it('round-trips replay data', () => {
      const recorder = new ReplayRecorder(
        arthropods.rhinoceros_beetle,
        arthropods.giant_hornet,
        testEnv
      )

      const action1 = actionList[0]
      const action2 = actionList[1]
      recorder.recordTurn(1, action1, action2)

      const replay = recorder.finalize('draw')

      const serialized = serializeReplay(replay)
      const deserialized = deserializeReplay(serialized)

      expect(deserialized).toEqual(replay)
    })
  })

  describe('runReplayBattle', () => {
    it('runs battle and returns both state and replay', async () => {
      const player1 = createAIPlayer('easy')
      const player2 = createAIPlayer('easy')

      const { state, replay } = await runReplayBattle(
        arthropods.rhinoceros_beetle,
        arthropods.giant_hornet,
        player1,
        player2,
        testEnv
      )

      expect(state.status).toBe('finished')
      expect(state.winner).not.toBeNull()

      expect(replay.header.playerArthropodId).toBe('rhinoceros_beetle')
      expect(replay.header.opponentArthropodId).toBe('giant_hornet')
      expect(replay.header.environment).toEqual(testEnv)
      expect(replay.turns.length).toBeGreaterThan(0)
      expect(replay.winner).toBe(state.winner ?? 'draw')
      expect(replay.totalTurns).toBe(state.turn)
    })

    it('records correct actions per turn', async () => {
      const player1 = createAIPlayer('easy')
      const player2 = createAIPlayer('easy')

      const { replay } = await runReplayBattle(
        arthropods.rhinoceros_beetle,
        arthropods.giant_hornet,
        player1,
        player2,
        testEnv
      )

      for (const turn of replay.turns) {
        expect(turn.playerAction.actionId).toBeTruthy()
        expect(turn.playerAction.actionName).toBeTruthy()
        expect(turn.opponentAction.actionId).toBeTruthy()
        expect(turn.opponentAction.actionName).toBeTruthy()
      }
    })
  })

  describe('replayBattle', () => {
    it('replays a recorded battle', async () => {
      const player1 = createAIPlayer('easy')
      const player2 = createAIPlayer('easy')

      const { replay } = await runReplayBattle(
        arthropods.rhinoceros_beetle,
        arthropods.giant_hornet,
        player1,
        player2,
        testEnv
      )

      const replayedState = await replayBattle(replay)

      expect(replayedState.status).toBe('finished')
      expect(replayedState.winner).not.toBeNull()
    })

    it('reproduces the original battle exactly via stored seed', async () => {
      const { state, replay } = await runReplayBattle(
        arthropods.rhinoceros_beetle,
        arthropods.giant_hornet,
        createAIPlayer('easy'),
        createAIPlayer('easy'),
        testEnv
      )

      expect(replay.header.seed).toBeTypeOf('number')

      const replayed = await replayBattle(replay)

      // 승자·턴수·최종 HP·전체 로그까지 완전 일치 (데미지/명중/상태이상 재현)
      expect(replayed.winner).toBe(state.winner)
      expect(replayed.turn).toBe(state.turn)
      expect(replayed.player.currentHp).toBe(state.player.currentHp)
      expect(replayed.opponent.currentHp).toBe(state.opponent.currentHp)
      expect(replayed.log).toEqual(state.log)
    })

    it('reproduces after JSON round-trip', async () => {
      const { state, replay } = await runReplayBattle(
        arthropods.mantis,
        arthropods.scorpion,
        createAIPlayer('easy'),
        createAIPlayer('easy'),
        testEnv
      )

      const restored = deserializeReplay(serializeReplay(replay))
      const replayed = await replayBattle(restored)

      expect(replayed.winner).toBe(state.winner)
      expect(replayed.player.currentHp).toBe(state.player.currentHp)
      expect(replayed.opponent.currentHp).toBe(state.opponent.currentHp)
    })

    it('throws error for invalid arthropod id', async () => {
      const invalidReplay = {
        header: {
          id: 'test',
          version: '1.0.0',
          timestamp: Date.now(),
          playerArthropodId: 'nonexistent_bug',
          opponentArthropodId: 'rhinoceros_beetle',
          environment: testEnv,
        },
        turns: [],
        winner: 'player' as const,
        totalTurns: 0,
      }

      await expect(replayBattle(invalidReplay)).rejects.toThrow(
        'Arthropod not found in replay data'
      )
    })
  })
})
