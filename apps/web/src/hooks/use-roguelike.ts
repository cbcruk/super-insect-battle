import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createGeneratedRun,
  createShowdownRun,
  createDuelRun,
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
} from '@super-insect-battle/roguelike'
import {
  getArthropodById,
  getActionsByIds,
  getActionTargeting,
  getActionRange,
  isActionOnCooldown,
  type AIPlayerOptions,
} from '@super-insect-battle/engine'
import {
  createGridNarrator,
  type GridNarrator,
} from '@super-insect-battle/commentary'
import type { CommentaryItem } from '../components/roguelike/grid-commentary.types.ts'
import { toCombatFeedback } from '../lib/combat-feedback.ts'
import { nextFacings } from '../lib/facing.ts'
import type { FeedLine, HitEffect } from '../lib/combat-feedback.types.ts'
import type { AttackMotion } from '../lib/attack-motion.types.ts'
import type { Fall } from '../lib/fall-motion.types.ts'

const FEED_LIMIT = 60
const COMMENTARY_LIMIT = 200
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
  /** 격자 매치업 상대 AI의 난이도·성격. */
  opponentAI?: AIPlayerOptions
}

export interface RoguelikeController {
  run: RunState | null
  version: number
  notice: string
  dailyDate: string | null
  feed: FeedLine[]
  /** 격자 매치업 중계 문장. 다른 모드에서는 비어 있다. */
  commentary: CommentaryItem[]
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
  const [commentary, setCommentary] = useState<CommentaryItem[]>([])
  const narratorRef = useRef<GridNarrator | null>(null)
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
      const species = getArthropodById(opts.speciesId)
      if (!species) return
      const opponent =
        opts.opponentId !== undefined
          ? getArthropodById(opts.opponentId)
          : undefined
      if (opts.mode === 'duel' && !opponent) return
      runRef.current =
        opts.mode === 'duel' && opponent
          ? createDuelRun({
              playerSpecies: species,
              opponentSpecies: opponent,
              seed: opts.seed,
              autopilot: opts.autopilot,
              opponentAI: opts.opponentAI,
            })
          : opts.mode === 'showdown'
            ? createShowdownRun({ playerSpecies: species, seed: opts.seed })
            : createGeneratedRun({
                playerSpecies: species,
                seed: opts.seed,
                maxDepth: 3,
              })
      facingsRef.current = new Map()
      narratorRef.current =
        runRef.current.mode === 'duel'
          ? createGridNarrator(runRef.current)
          : null
      setCommentary(
        (narratorRef.current?.intro() ?? []).map((line) => ({
          line,
          id: nextId.current++,
        }))
      )
      setDailyDate(opts.dailyDate ?? null)
      setNotice('')
      clearFeedback()
      bump()
    },
    [bump, clearFeedback]
  )

  const reset = useCallback(() => {
    runRef.current = null
    facingsRef.current = new Map()
    narratorRef.current = null
    setCommentary([])
    setDailyDate(null)
    setNotice('')
    clearFeedback()
    bump()
  }, [bump, clearFeedback])

  const present = useCallback(
    (run: RunState, events: GridEvent[]) => {
      const visible = events.filter((event) =>
        isEventVisible(event, run.level.visible)
      )
      const feedback = toCombatFeedback(visible, run.player.id)
      const narrated = narratorRef.current?.next(visible, run) ?? []
      if (narrated.length > 0) {
        const items = narrated.map((line) => ({ line, id: nextId.current++ }))
        setCommentary((prev) => [...prev, ...items].slice(-COMMENTARY_LIMIT))
      }
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
      if (!run || run.status !== 'playing') return
      present(run, applyCommand(run, command))
    },
    [present]
  )

  const autoStep = useCallback(() => {
    const run = runRef.current
    if (!run || !isAutopilot(run) || !run.player.brain) return
    present(
      run,
      applyCommand(run, run.player.brain.decide(run.player, run, run.rng))
    )
  }, [present])

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
    commentary,
    effects,
    motions,
    falls,
    facings: facingsRef.current,
    hurt,
    newRun,
    reset,
    dispatch,
    useAbility,
    autoplaying: runRef.current ? isAutopilot(runRef.current) : false,
    autoStep,
    spectating: runRef.current ? canSpectate(runRef.current) : false,
    spectate,
    skipSpectate,
  }
}
