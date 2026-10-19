import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { getArthropodById } from '@super-insect-battle/engine'
import type { RunState } from '@super-insect-battle/roguelike'
import { useRoguelike } from '../hooks/use-roguelike.ts'
import { RoguelikeGame } from '../components/roguelike/roguelike-game.tsx'
import { DuelResult } from '../components/roguelike/duel-result.tsx'
import { Button } from '../components/ui/button.tsx'
import {
  findGridReplay,
  getReplayStorage,
  saveGridReplay,
} from '../lib/grid-replays.ts'

/**
 * 격자 매치업 화면. 매치업 설정에서 고른 두 곤충을 로그라이크 규칙의 작은 아레나에
 * 세운다. `mode=ai-vs-ai`면 양쪽 모두 AI가 싸우고, 아니면 플레이어가 1P를 조종한다.
 *
 * `replay=<id>`면 저장된 리플레이를 재생한다. 끝난 판은 결과 화면에서 저장할 수 있다.
 */
export function ArenaPage(): React.ReactNode {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const controller = useRoguelike()
  const { newRun } = controller
  const [savedRun, setSavedRun] = useState<RunState | null>(null)
  const [saveFailed, setSaveFailed] = useState<RunState | null>(null)

  const replayId = params.get('replay')
  const saved = useMemo(() => {
    const storage = getReplayStorage()
    return replayId && storage ? findGridReplay(storage, replayId) : undefined
  }, [replayId])
  const playerId = params.get('player') ?? ''
  const opponentId = params.get('opponent') ?? ''
  const autopilot = params.get('mode') === 'ai-vs-ai'
  const valid = replayId
    ? saved !== undefined
    : getArthropodById(playerId) !== undefined &&
      getArthropodById(opponentId) !== undefined

  useEffect(() => {
    if (!valid) return
    if (saved) {
      newRun({ speciesId: '', seed: saved.replay.seed, replay: saved.replay })
      return
    }
    newRun({
      speciesId: playerId,
      opponentId,
      mode: 'duel',
      autopilot,
      seed: Math.floor(Math.random() * 1_000_000_000),
    })
  }, [valid, saved, playerId, opponentId, autopilot, newRun])

  const exitTo = replayId ? '/replay' : '/matchup'
  const exitLabel = replayId ? '리플레이 목록으로' : '매치업으로'

  if (!valid) {
    return (
      <div className="space-y-3 p-6 text-sm">
        <p className="text-muted-foreground">
          {replayId
            ? '리플레이를 찾을 수 없습니다.'
            : '곤충 선택이 올바르지 않습니다.'}
        </p>
        <Button onClick={() => navigate(exitTo)}>{exitLabel}</Button>
      </div>
    )
  }

  const { run, recording } = controller
  if (!run) return null

  function handleSave(): void {
    const storage = getReplayStorage()
    if (!run || !recording) return
    try {
      if (!storage) throw new Error('storage unavailable')
      saveGridReplay(storage, run, recording)
      setSavedRun(run)
    } catch {
      setSaveFailed(run)
    }
  }

  return (
    <RoguelikeGame
      controller={controller}
      onExit={() => navigate(exitTo)}
      exitLabel={exitLabel}
      resultSlot={
        <>
          <DuelResult run={run} />
          {recording && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSave}
              disabled={savedRun === run}
            >
              {savedRun === run ? '리플레이 저장됨' : '리플레이 저장'}
            </Button>
          )}
          {saveFailed === run && savedRun !== run && (
            <p className="text-[11px] text-red-400">
              저장하지 못했습니다. 브라우저 저장소를 확인하세요.
            </p>
          )}
        </>
      }
    />
  )
}
