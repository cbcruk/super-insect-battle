import type { GridEvent } from '@super-insect-battle/roguelike'
import { statusConditionNames } from '@super-insect-battle/engine'
import type {
  CombatFeedback,
  FeedTone,
  HitEffect,
} from './combat-feedback.types.ts'

const EFFECT_STAGGER_MS = 140

/**
 * 코어 이벤트를 로그 줄·맵 연출·피격 요약으로 변환한다.
 *
 * 층을 내려간 명령에서는 이전 층 좌표의 연출이 의미가 없으므로 맵 연출을 버린다.
 */
export function toCombatFeedback(
  events: GridEvent[],
  playerId: string
): CombatFeedback {
  const feedback: CombatFeedback = {
    lines: [],
    effects: [],
    playerDamage: 0,
    playerCritical: false,
  }
  const pushEffect = (
    effect: Omit<HitEffect, 'id' | 'delayMs' | 'stack'>
  ): void => {
    feedback.effects.push({
      ...effect,
      delayMs: feedback.effects.length * EFFECT_STAGGER_MS,
      stack: feedback.effects.filter(
        (e) => e.pos.x === effect.pos.x && e.pos.y === effect.pos.y
      ).length,
    })
  }

  for (const event of events) {
    switch (event.type) {
      case 'attack': {
        const o = event.outcome
        const onPlayer = o.defenderId === playerId
        feedback.lines.push({
          text: o.note,
          tone: attackTone(o.hit, o.defeated, onPlayer),
          critical: o.critical,
        })
        if (!o.hit) {
          pushEffect({
            pos: o.defenderPos,
            label: 'MISS',
            kind: 'miss',
            onPlayer,
          })
          break
        }
        if (o.damage > 0) {
          pushEffect({
            pos: o.defenderPos,
            label: o.critical ? `-${o.damage}!` : `-${o.damage}`,
            kind: o.critical ? 'critical' : 'damage',
            onPlayer,
          })
        }
        if (o.statusApplied) {
          pushEffect({
            pos: o.defenderPos,
            label: statusConditionNames[o.statusApplied],
            kind: 'condition',
            onPlayer,
          })
        }
        if (onPlayer) {
          feedback.playerDamage += o.damage
          feedback.playerCritical ||= o.critical
        }
        break
      }
      case 'status': {
        const onPlayer = event.actorId === playerId
        feedback.lines.push({
          text: event.message,
          tone: onPlayer && event.damage > 0 ? 'taken' : 'status',
          critical: false,
        })
        if (event.damage > 0) {
          pushEffect({
            pos: event.pos,
            label: `-${event.damage}`,
            kind: 'venom',
            onPlayer,
          })
          if (onPlayer) feedback.playerDamage += event.damage
        }
        break
      }
      case 'pickup':
        feedback.lines.push({
          text: event.message,
          tone: 'pickup',
          critical: false,
        })
        break
      case 'message':
        feedback.lines.push({ text: event.text, tone: 'info', critical: false })
        break
      case 'descend':
        feedback.lines.push({
          text: '출구에 도달했다!',
          tone: 'info',
          critical: false,
        })
        feedback.effects = []
        break
    }
  }

  return feedback
}

function attackTone(
  hit: boolean,
  defeated: boolean,
  onPlayer: boolean
): FeedTone {
  if (onPlayer) return hit ? 'taken' : 'evaded'
  if (!hit) return 'missed'
  return defeated ? 'kill' : 'dealt'
}
