import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createGeneratedRun,
  applyCommand,
  nearestEnemyInRange,
  type RunState,
  type Command,
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
      runRef.current = createGeneratedRun({
        playerSpecies: species,
        seed: opts.seed,
        maxDepth: 3,
      })
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
    facingsRef.current = new Map()
    setDailyDate(null)
    setNotice('')
    clearFeedback()
    bump()
  }, [bump, clearFeedback])

  const dispatch = useCallback(
    (command: Command) => {
      const run = runRef.current
      if (!run || run.status !== 'playing') return
      const events = applyCommand(run, command)
      const feedback = toCombatFeedback(events, run.player.id)
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
  }
}
