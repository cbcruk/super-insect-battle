import { insects } from '@insect-battle/engine'
import type { GameState, PlayerInsect } from './types'
import { eventBus } from '../events'

function createStarterInsect(): PlayerInsect {
  const species = insects.rhinoceros_beetle
  const maxHp = species.baseStats.hp * 2 + 110

  return {
    species,
    nickname: null,
    currentHp: maxHp,
    maxHp,
  }
}

export function createInitialGameState(playerName: string): GameState {
  return {
    player: {
      name: playerName,
      location: 'training_grounds',
      team: [createStarterInsect()],
      activeIndex: 0,
    },
    battle: null,
    isRunning: true,
  }
}

export function getGameMode(state: GameState): 'explore' | 'battle' {
  return state.battle !== null ? 'battle' : 'explore'
}

export function getActiveInsect(state: GameState): PlayerInsect | null {
  const { team, activeIndex } = state.player
  return team[activeIndex] ?? null
}

export function addInsectToTeam(
  state: GameState,
  insect: PlayerInsect
): boolean {
  if (state.player.team.length >= 3) {
    return false
  }

  state.player.team.push(insect)
  return true
}

export function movePlayer(state: GameState, roomId: string): void {
  const previousRoomId = state.player.location

  eventBus.emit('playerLeave', { roomId: previousRoomId, nextRoomId: roomId })

  state.player.location = roomId

  eventBus.emit('playerEnter', { roomId, previousRoomId })
}

export function syncTeamHpFromBattle(state: GameState): void {
  if (!state.battle) return

  const playerBattleInsect = state.battle.state.player
  const activeInsect = state.player.team[state.player.activeIndex]

  if (activeInsect) {
    activeInsect.currentHp = playerBattleInsect.currentHp
  }
}

export function healTeam(state: GameState): void {
  for (const insect of state.player.team) {
    insect.currentHp = insect.maxHp
  }
}
