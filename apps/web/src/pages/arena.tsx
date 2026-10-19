import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { getArthropodById } from '@super-insect-battle/engine'
import { useRoguelike } from '../hooks/use-roguelike.ts'
import { RoguelikeGame } from '../components/roguelike/roguelike-game.tsx'
import { DuelResult } from '../components/roguelike/duel-result.tsx'
import { Button } from '../components/ui/button.tsx'

/**
 * 격자 매치업 화면. 매치업 설정에서 고른 두 곤충을 로그라이크 규칙의 작은 아레나에
 * 세운다. `mode=ai-vs-ai`면 양쪽 모두 AI가 싸우고, 아니면 플레이어가 1P를 조종한다.
 */
export function ArenaPage(): React.ReactNode {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const controller = useRoguelike()
  const { newRun } = controller

  const playerId = params.get('player') ?? ''
  const opponentId = params.get('opponent') ?? ''
  const autopilot = params.get('mode') === 'ai-vs-ai'
  const valid =
    getArthropodById(playerId) !== undefined &&
    getArthropodById(opponentId) !== undefined

  useEffect(() => {
    if (!valid) return
    newRun({
      speciesId: playerId,
      opponentId,
      mode: 'duel',
      autopilot,
      seed: Math.floor(Math.random() * 1_000_000_000),
    })
  }, [valid, playerId, opponentId, autopilot, newRun])

  if (!valid) {
    return (
      <div className="space-y-3 p-6 text-sm">
        <p className="text-muted-foreground">곤충 선택이 올바르지 않습니다.</p>
        <Button onClick={() => navigate('/matchup')}>매치업으로</Button>
      </div>
    )
  }

  if (!controller.run) return null

  return (
    <RoguelikeGame
      controller={controller}
      onExit={() => navigate('/matchup')}
      exitLabel="매치업으로"
      resultSlot={<DuelResult run={controller.run} />}
    />
  )
}
