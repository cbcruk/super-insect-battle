import { create } from 'zustand'
import type { BattleInsect, BattleState, Move } from '@insect-battle/engine'
import {
  createBattleInsect,
  executeTurn,
  selectAIMove,
  insects,
} from '@insect-battle/engine'
import { getGame } from '../game/game'
import { BattleScene } from '../game/scenes/battle-scene'

type BattlePhase = 'idle' | 'selecting' | 'animating' | 'ended'

interface AnimationAction {
  type: 'player-attack' | 'opponent-attack' | 'player-faint' | 'opponent-faint'
}

interface BattleStore {
  playerInsect: BattleInsect | null
  opponentInsect: BattleInsect | null
  battleState: BattleState | null
  phase: BattlePhase
  animationQueue: AnimationAction[]
  battleResult: 'player' | 'opponent' | 'draw' | null

  startBattle: (playerId: string, opponentId: string) => void
  selectMove: (move: Move) => void
  startNewBattle: () => void
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  playerInsect: null,
  opponentInsect: null,
  battleState: null,
  phase: 'idle',
  animationQueue: [],
  battleResult: null,

  startBattle: (playerId: string, opponentId: string) => {
    const playerInsectData = insects[playerId]
    const opponentInsectData = insects[opponentId]

    if (!playerInsectData || !opponentInsectData) {
      console.error('Invalid insect IDs')
      return
    }

    const player = createBattleInsect(playerInsectData)
    const opponent = createBattleInsect(opponentInsectData)

    const initialState: BattleState = {
      turn: 0,
      player,
      opponent,
      log: [],
      status: 'running',
      winner: null,
    }

    set({
      playerInsect: player,
      opponentInsect: opponent,
      battleState: initialState,
      phase: 'selecting',
      animationQueue: [],
      battleResult: null,
    })
  },

  selectMove: async (move: Move) => {
    const { battleState, phase } = get()
    if (!battleState || phase !== 'selecting') return

    set({ phase: 'animating' })

    const aiMove = selectAIMove(battleState.opponent, battleState.player)
    const newState = executeTurn(battleState, move, aiMove)

    const animations: AnimationAction[] = []

    const playerWentFirst =
      newState.log.find(
        (log) => log.turn === newState.turn && log.actor === 'player' && log.move
      )?.turn === newState.turn

    const opponentWentFirst =
      newState.log.find(
        (log) => log.turn === newState.turn && log.actor === 'opponent' && log.move
      )?.turn === newState.turn

    if (playerWentFirst && opponentWentFirst) {
      const playerLogIndex = newState.log.findIndex(
        (log) => log.turn === newState.turn && log.actor === 'player' && log.move
      )
      const opponentLogIndex = newState.log.findIndex(
        (log) => log.turn === newState.turn && log.actor === 'opponent' && log.move
      )

      if (playerLogIndex < opponentLogIndex) {
        animations.push({ type: 'player-attack' })
        if (newState.opponent.currentHp > 0) {
          animations.push({ type: 'opponent-attack' })
        }
      } else {
        animations.push({ type: 'opponent-attack' })
        if (newState.player.currentHp > 0) {
          animations.push({ type: 'player-attack' })
        }
      }
    } else if (playerWentFirst) {
      animations.push({ type: 'player-attack' })
    } else if (opponentWentFirst) {
      animations.push({ type: 'opponent-attack' })
    }

    if (newState.player.currentHp <= 0) {
      animations.push({ type: 'player-faint' })
    }
    if (newState.opponent.currentHp <= 0) {
      animations.push({ type: 'opponent-faint' })
    }

    set({ animationQueue: animations })

    await playAnimations(animations)

    set({
      playerInsect: newState.player,
      opponentInsect: newState.opponent,
      battleState: newState,
      phase: newState.status === 'finished' ? 'ended' : 'selecting',
      battleResult: newState.winner,
      animationQueue: [],
    })
  },

  startNewBattle: () => {
    const game = getGame()
    if (game) {
      const scene = game.currentScene as BattleScene
      if (scene.resetBattle) {
        scene.resetBattle()
      }
    }

    get().startBattle('rhinoceros_beetle', 'stag_beetle')
  },
}))

async function playAnimations(animations: AnimationAction[]): Promise<void> {
  const game = getGame()
  if (!game) return

  const scene = game.currentScene as BattleScene

  for (const action of animations) {
    switch (action.type) {
      case 'player-attack':
        await scene.playPlayerAttack()
        break
      case 'opponent-attack':
        await scene.playOpponentAttack()
        break
      case 'player-faint':
        await scene.playPlayerFaint()
        break
      case 'opponent-faint':
        await scene.playOpponentFaint()
        break
    }
  }
}

if (typeof window !== 'undefined') {
  setTimeout(() => {
    useBattleStore.getState().startBattle('rhinoceros_beetle', 'stag_beetle')
  }, 100)
}
