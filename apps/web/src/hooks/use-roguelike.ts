import { useCallback, useRef, useState } from 'react'
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

export interface NewRunOptions {
  speciesId: string
  seed: number
}

export interface RoguelikeController {
  run: RunState | null
  version: number
  notice: string
  newRun: (opts: NewRunOptions) => void
  reset: () => void
  dispatch: (command: Command) => void
  useAbility: (index: number) => void
}

export function useRoguelike(): RoguelikeController {
  const runRef = useRef<RunState | null>(null)
  const [version, setVersion] = useState(0)
  const [notice, setNotice] = useState('')

  const bump = useCallback(() => setVersion((v) => v + 1), [])

  const newRun = useCallback(
    (opts: NewRunOptions) => {
      const species = getArthropodById(opts.speciesId)
      if (!species) return
      runRef.current = createGeneratedRun({
        playerSpecies: species,
        seed: opts.seed,
        maxDepth: 3,
      })
      setNotice('')
      bump()
    },
    [bump]
  )

  const reset = useCallback(() => {
    runRef.current = null
    setNotice('')
    bump()
  }, [bump])

  const dispatch = useCallback(
    (command: Command) => {
      const run = runRef.current
      if (!run || run.status !== 'playing') return
      applyCommand(run, command)
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
    newRun,
    reset,
    dispatch,
    useAbility,
  }
}
