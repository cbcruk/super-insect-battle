import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createGeneratedRun,
  createShowdownRun,
  createDuelRun,
  createDuelReplay,
  startDuelReplay,
  nextReplayCommand,
  isAutopilot,
  applyCommand,
  canSpectate,
  isEventVisible,
  spectateTurn,
  type GridEvent,
  nearestEnemyInRange,
  type RunMode,
  type RunState,
  type Command,
  type DuelReplay,
} from '@super-insect-battle/roguelike'
import {
  getArthropodById,
  getActionsByIds,
  getActionTargeting,
  getActionRange,
  isActionOnCooldown,
} from '@super-insect-battle/engine'
import { toCombatFeedback } from '../lib/combat-feedback.ts'
import { nextFacings } from '../lib/facing.ts'
import type { FeedLine, HitEffect } from '../lib/combat-feedback.types.ts'
import type { AttackMotion } from '../lib/attack-motion.types.ts'
import type { Fall } from '../lib/fall-motion.types.ts'

const FEED_LIMIT = 60
const EFFECT_LIFETIME_MS = 900

/** 플레이어가 피해를 입을 때마다 바뀌는 신호. `key`가 바뀌면 피격 연출을 다시 재생한다. */
export interface HurtPulse {
  key: number
  damage: number
  heavy: boolean
}

export interface NewRunOptions {
  speciesId: string
  seed: number
  /** 데일리 챌린지로 시작한 경우 해당 날짜('YYYY-MM-DD'). */
  dailyDate?: string | null
  /** 기본 `'descent'`. */
  mode?: RunMode
  /** 격자 매치업(`'duel'`)의 상대 종 id. */
  opponentId?: string
  /** 격자 매치업에서 플레이어 쪽도 AI가 조종한다 (AI 대 AI). */
  autopilot?: boolean
  /** 주어지면 새 판 대신 이 격자 매치업 리플레이를 재생한다. 다른 옵션은 무시한다. */
  replay?: DuelReplay
}

export interface RoguelikeController {
  run: RunState | null
  version: number
  notice: string
  dailyDate: string | null
  feed: FeedLine[]
  effects: HitEffect[]
  /** 가장 최근 명령에서 나온 공격 움직임. 무대는 처음 보는 `id`만 재생한다. */
  motions: AttackMotion[]
  /** 가장 최근 명령에서 쓰러진 액터들. 무대는 처음 보는 `id`만 재생한다. */
  falls: Fall[]
  /** 액터 id별 바라보는 방향(라디안, 위가 0). 명령마다 갱신된다. */
  facings: ReadonlyMap<string, number>
  hurt: HurtPulse
  newRun: (opts: NewRunOptions) => void
  reset: () => void
  dispatch: (command: Command) => void
  useAbility: (index: number) => void
  /** 플레이어 쪽 곤충을 AI가 조종하는 중인가 (AI 대 AI 격자 매치업). */
  autoplaying: boolean
  /** 리플레이를 재생하는 중인가. */
  replaying: boolean
  /** 끝난 격자 매치업의 리플레이 기록. 재생한 판이거나 진행 중이면 null. */
  recording: DuelReplay | null
  /** AI가 플레이어 쪽 곤충의 한 턴을 대신 진행한다. */
  autoStep: () => void
  /** 쇼다운에서 쓰러진 뒤 남은 라이벌들의 싸움을 지켜볼 수 있는가. */
  spectating: boolean
  /** 관전 한 턴을 진행하고 연출을 재생한다. */
  spectate: () => void
  /** 관전을 끝까지 건너뛰어 우승자를 가린다. 연출은 생략한다. */
  skipSpectate: () => void
}

export function useRoguelike(): RoguelikeController {
  const runRef = useRef<RunState | null>(null)
  const [version, setVersion] = useState(0)
  const [notice, setNotice] = useState('')
  const [dailyDate, setDailyDate] = useState<string | null>(null)
  const [feed, setFeed] = useState<FeedLine[]>([])
  const [effects, setEffects] = useState<HitEffect[]>([])
  const [motions, setMotions] = useState<AttackMotion[]>([])
  const [falls, setFalls] = useState<Fall[]>([])
  const [hurt, setHurt] = useState<HurtPulse>({
    key: 0,
    damage: 0,
    heavy: false,
  })
  const recordingRef = useRef<DuelReplay | null>(null)
  const playbackRef = useRef<{
    replay: DuelReplay
    step: number
    ended: boolean
  } | null>(null)
  const nextId = useRef(0)
  const facingsRef = useRef<ReadonlyMap<string, number>>(new Map())
  const timers = useRef<number[]>([])

  const bump = useCallback(() => setVersion((v) => v + 1), [])

  const clearFeedback = useCallback(() => {
    for (const timer of timers.current) window.clearTimeout(timer)
    timers.current = []
    setFeed([])
    setEffects([])
    setMotions([])
    setFalls([])
  }, [])

  useEffect(() => clearFeedback, [clearFeedback])

  const newRun = useCallback(
    (opts: NewRunOptions) => {
      recordingRef.current = null
      playbackRef.current = null
      if (opts.replay) {
        const replayed = startDuelReplay(opts.replay)
        if (!replayed) return
        runRef.current = replayed
        playbackRef.current = { replay: opts.replay, step: 0, ended: false }
      } else {
        const species = getArthropodById(opts.speciesId)
        if (!species) return
        const opponent =
          opts.opponentId !== undefined
            ? getArthropodById(opts.opponentId)
            : undefined
        if (opts.mode === 'duel' && !opponent) return
        if (opts.mode === 'duel' && opponent) {
          const duel = {
            playerSpecies: species,
            opponentSpecies: opponent,
            seed: opts.seed,
            autopilot: opts.autopilot,
          }
          runRef.current = createDuelRun(duel)
          recordingRef.current = createDuelReplay(duel)
        } else {
          runRef.current =
            opts.mode === 'showdown'
              ? createShowdownRun({ playerSpecies: species, seed: opts.seed })
              : createGeneratedRun({
                  playerSpecies: species,
                  seed: opts.seed,
                  maxDepth: 3,
                })
        }
      }
      facingsRef.current = new Map()
      setDailyDate(opts.dailyDate ?? null)
      setNotice('')
      clearFeedback()
      bump()
    },
    [bump, clearFeedback]
  )

  const reset = useCallback(() => {
    runRef.current = null
    recordingRef.current = null
    playbackRef.current = null
    facingsRef.current = new Map()
    setDailyDate(null)
    setNotice('')
    clearFeedback()
    bump()
  }, [bump, clearFeedback])

  const present = useCallback(
    (run: RunState, events: GridEvent[]) => {
      const feedback = toCombatFeedback(
        events.filter((event) => isEventVisible(event, run.level.visible)),
        run.player.id
      )
      facingsRef.current = nextFacings(facingsRef.current, events)

      if (feedback.lines.length > 0) {
        setFeed((prev) =>
          [
            ...prev,
            ...feedback.lines.map((line) => ({
              ...line,
              id: nextId.current++,
            })),
          ].slice(-FEED_LIMIT)
        )
      }

      if (feedback.motions.length > 0) {
        setMotions(
          feedback.motions.map((motion) => ({
            ...motion,
            id: nextId.current++,
          }))
        )
      }

      if (feedback.falls.length > 0) {
        setFalls(
          feedback.falls.map((fall) => ({ ...fall, id: nextId.current++ }))
        )
      }

      if (feedback.effects.length > 0) {
        const spawned = feedback.effects.map((effect) => ({
          ...effect,
          id: nextId.current++,
        }))
        const ids = new Set(spawned.map((e) => e.id))
        const lifetime =
          EFFECT_LIFETIME_MS + Math.max(...spawned.map((e) => e.delayMs))
        setEffects((prev) => [
          ...prev,
          ...spawned.map((effect) => ({
            ...effect,
            stack:
              effect.stack +
              prev.filter(
                (e) => e.pos.x === effect.pos.x && e.pos.y === effect.pos.y
              ).length,
          })),
        ])
        const timer = window.setTimeout(() => {
          timers.current = timers.current.filter((t) => t !== timer)
          setEffects((prev) => prev.filter((e) => !ids.has(e.id)))
        }, lifetime)
        timers.current.push(timer)
      }

      if (feedback.playerDamage > 0) {
        setHurt((prev) => ({
          key: prev.key + 1,
          damage: feedback.playerDamage,
          heavy:
            feedback.playerCritical ||
            feedback.playerDamage >= run.player.combat.maxHp * 0.25,
        }))
      }

      setNotice('')
      bump()
    },
    [bump]
  )

  const dispatch = useCallback(
    (command: Command) => {
      const run = runRef.current
      if (
        !run ||
        run.status !== 'playing' ||
        playbackRef.current ||
        isAutopilot(run)
      ) {
        return
      }
      recordingRef.current?.commands.push(command)
      present(run, applyCommand(run, command))
    },
    [present]
  )

  const autoStep = useCallback(() => {
    const run = runRef.current
    if (!run) return
    const playback = playbackRef.current
    if (playback) {
      const command = nextReplayCommand(run, playback.replay, playback.step)
      if (!command) {
        playback.ended = true
        setNotice(
          '기록이 끝났습니다. 규칙이 바뀌어 원본과 달라졌을 수 있습니다.'
        )
        bump()
        return
      }
      playback.step++
      present(run, applyCommand(run, command))
      return
    }
    if (!isAutopilot(run) || !run.player.brain) return
    present(
      run,
      applyCommand(run, run.player.brain.decide(run.player, run, run.rng))
    )
  }, [bump, present])

  const spectate = useCallback(() => {
    const run = runRef.current
    if (!run || !canSpectate(run)) return
    present(run, spectateTurn(run))
  }, [present])

  const skipSpectate = useCallback(() => {
    const run = runRef.current
    if (!run) return
    while (canSpectate(run)) spectateTurn(run)
    bump()
  }, [bump])

  const useAbility = useCallback(
    (index: number) => {
      const run = runRef.current
      if (!run || run.status !== 'playing') return
      const action = getActionsByIds(run.player.combat.actions)[index]
      if (!action) return
      if (isActionOnCooldown(run.player.combat, action)) {
        setNotice(`${action.nameKo}: 쿨다운 중`)
        return
      }
      if (getActionTargeting(action) === 'self') {
        dispatch({
          type: 'ability',
          actionId: action.id,
          target: { ...run.player.pos },
        })
        return
      }
      const target = nearestEnemyInRange(
        run,
        run.player,
        getActionRange(action)
      )
      if (!target) {
        setNotice(`${action.nameKo}: 사거리 내 대상 없음`)
        return
      }
      dispatch({
        type: 'ability',
        actionId: action.id,
        target: { ...target.pos },
      })
    },
    [dispatch]
  )

  return {
    run: runRef.current,
    version,
    notice,
    dailyDate,
    feed,
    effects,
    motions,
    falls,
    facings: facingsRef.current,
    hurt,
    newRun,
    reset,
    dispatch,
    useAbility,
    autoplaying: runRef.current
      ? playbackRef.current !== null
        ? runRef.current.status === 'playing' && !playbackRef.current.ended
        : isAutopilot(runRef.current)
      : false,
    replaying: playbackRef.current !== null,
    recording:
      runRef.current && runRef.current.status !== 'playing'
        ? recordingRef.current
        : null,
    autoStep,
    spectating: runRef.current ? canSpectate(runRef.current) : false,
    spectate,
    skipSpectate,
  }
}
