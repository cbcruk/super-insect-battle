import { insects } from '@insect-battle/engine'
import type { GameState, PlayerInsect } from './types'

/**
 * 초기 플레이어 곤충 (장수풍뎅이) 생성
 * @returns 장수풍뎅이 PlayerInsect
 */
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

/**
 * 새 게임 상태 생성
 * @param playerName - 플레이어 이름
 * @returns 초기화된 GameState
 */
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

/**
 * 현재 게임 모드 확인
 * @param state - 게임 상태
 * @returns 'explore' (탐색) 또는 'battle' (배틀)
 */
export function getGameMode(state: GameState): 'explore' | 'battle' {
  return state.battle !== null ? 'battle' : 'explore'
}

/**
 * 활성 곤충 가져오기
 * @param state - 게임 상태
 * @returns 현재 선두 곤충 또는 null
 */
export function getActiveInsect(state: GameState): PlayerInsect | null {
  const { team, activeIndex } = state.player
  return team[activeIndex] ?? null
}

/**
 * 팀에 곤충 추가 (최대 3마리)
 * @param state - 게임 상태
 * @param insect - 추가할 곤충
 * @returns 추가 성공 여부
 */
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

/**
 * 플레이어 위치 변경
 * @param state - 게임 상태
 * @param roomId - 이동할 방 ID
 */
export function movePlayer(state: GameState, roomId: string): void {
  state.player.location = roomId
}

/**
 * 배틀 후 팀 HP 동기화
 * 배틀 상태의 HP를 팀 곤충에 반영
 * @param state - 게임 상태
 */
export function syncTeamHpFromBattle(state: GameState): void {
  if (!state.battle) return

  const playerBattleInsect = state.battle.state.player
  const activeInsect = state.player.team[state.player.activeIndex]

  if (activeInsect) {
    activeInsect.currentHp = playerBattleInsect.currentHp
  }
}

/**
 * 팀 전체 회복
 * 모든 곤충의 HP를 최대치로 회복
 * @param state - 게임 상태
 */
export function healTeam(state: GameState): void {
  for (const insect of state.player.team) {
    insect.currentHp = insect.maxHp
  }
}
