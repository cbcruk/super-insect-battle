import {
  getArthropodById,
  type AIPlayerOptions,
} from '@super-insect-battle/engine'
import type { Command } from './command'
import { createDuelRun, type DuelOptions } from './duel'
import { applyCommand, type RunState } from './run'

/**
 * 격자 매치업 한 판을 그대로 다시 재생하는 기록.
 *
 * 런은 시드로 결정되므로 시작 옵션과 플레이어 명령만 담는다. AI 대 AI 판은 플레이어
 * 쪽 AI가 같은 RNG로 같은 결정을 다시 내리므로 명령을 담지 않는다.
 */
export interface DuelReplay {
  version: 1
  seed: number
  playerSpeciesId: string
  opponentSpeciesId: string
  autopilot: boolean
  /** 상대 AI의 난이도·성격. 없으면 기본값으로 재생한다. */
  opponentAI?: AIPlayerOptions
  /** 플레이어가 직접 내린 명령, 턴 순. AI 대 AI면 비어 있다. */
  commands: Command[]
}

/** 아직 명령이 없는 리플레이 기록을 시작 옵션에서 만든다. */
export function createDuelReplay(opts: DuelOptions): DuelReplay {
  return {
    version: 1,
    seed: opts.seed,
    playerSpeciesId: opts.playerSpecies.id,
    opponentSpeciesId: opts.opponentSpecies.id,
    autopilot: opts.autopilot ?? false,
    ...(opts.opponentAI && { opponentAI: { ...opts.opponentAI } }),
    commands: [],
  }
}

/**
 * 리플레이의 시작 상태를 만든다.
 *
 * @returns 종 id를 알 수 없으면 null.
 */
export function startDuelReplay(replay: DuelReplay): RunState | null {
  const playerSpecies = getArthropodById(replay.playerSpeciesId)
  const opponentSpecies = getArthropodById(replay.opponentSpeciesId)
  if (!playerSpecies || !opponentSpecies) return null
  return createDuelRun({
    playerSpecies,
    opponentSpecies,
    seed: replay.seed,
    autopilot: replay.autopilot,
    opponentAI: replay.opponentAI,
  })
}

/**
 * 리플레이의 step번째 플레이어 명령. AI 대 AI면 플레이어 쪽 AI에게 다시 묻는다.
 *
 * @returns 기록이 끝났으면 null.
 */
export function nextReplayCommand(
  run: RunState,
  replay: DuelReplay,
  step: number
): Command | null {
  if (run.status !== 'playing') return null
  if (replay.autopilot) {
    return run.player.brain?.decide(run.player, run, run.rng) ?? null
  }
  return replay.commands[step] ?? null
}

/**
 * 리플레이를 끝까지 돌린 최종 상태.
 *
 * @returns 종 id를 알 수 없으면 null.
 */
export function playDuelReplay(replay: DuelReplay): RunState | null {
  const run = startDuelReplay(replay)
  if (!run) return null
  for (let step = 0; ; step++) {
    const command = nextReplayCommand(run, replay, step)
    if (!command) return run
    applyCommand(run, command)
  }
}

/**
 * JSON 값이 {@linkcode DuelReplay} 형태인지 확인한다.
 *
 * 헤더 필드만 검사하고 명령 하나하나의 모양까지는 보지 않는다.
 */
export function isDuelReplay(value: unknown): value is DuelReplay {
  if (typeof value !== 'object' || value === null) return false
  const r = value as Record<string, unknown>
  return (
    r.version === 1 &&
    typeof r.seed === 'number' &&
    typeof r.playerSpeciesId === 'string' &&
    typeof r.opponentSpeciesId === 'string' &&
    typeof r.autopilot === 'boolean' &&
    Array.isArray(r.commands)
  )
}
