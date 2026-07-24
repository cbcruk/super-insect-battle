import type {
  Arthropod,
  BattleArthropod,
  Rng,
} from '@super-insect-battle/engine'
import { createBattleArthropod } from '@super-insect-battle/engine'
import type { Vec2 } from './geometry'
import type { Command } from './command'
import type { RunState } from './run'
import { ENERGY_THRESHOLD } from './scheduler'

export type Faction = 'player' | 'hostile'

export interface Actor {
  id: string
  pos: Vec2
  faction: Faction
  species: Arthropod // 종 템플릿 (스탯·무기·스타일·기술 풀)
  combat: BattleArthropod // 살아있는 전투 상태 — 엔진 그대로 재사용, HP 지속
  speed: number // 스케줄러 에너지 획득량
  energy: number // 누적 에너지
  glyph: string // ASCII 렌더 글리프
  brain?: ActorBrain // 적 AI (플레이어는 없음)
}

export interface ActorBrain {
  /**
   * 이 액터의 이번 턴 명령을 결정.
   * P1: 그리디(접근/도주 + bump). P2: rot.js 길찾기 + 엔진 scoreAction.
   */
  decide(actor: Actor, run: RunState, rng: Rng): Command
}

export interface CreateActorOptions {
  brain?: ActorBrain
  glyph?: string
  /** 미지정 시 deriveSpeed(species). */
  speed?: number
}

/** 종 스탯에서 속도 유도. P1은 균일(=THRESHOLD), P2에서 체장/체중 반영 예정. */
export function deriveSpeed(_species: Arthropod): number {
  return ENERGY_THRESHOLD
}

export function createActor(
  id: string,
  species: Arthropod,
  pos: Vec2,
  faction: Faction,
  options: CreateActorOptions = {}
): Actor {
  return {
    id,
    pos: { x: pos.x, y: pos.y },
    faction,
    species,
    combat: createBattleArthropod(species),
    speed: options.speed ?? deriveSpeed(species),
    energy: ENERGY_THRESHOLD, // 시작부터 행동 가능
    glyph: options.glyph ?? (faction === 'player' ? '@' : 'e'),
    brain: options.brain,
  }
}
