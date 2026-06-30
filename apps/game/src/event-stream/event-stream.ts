import type { BattleState } from '@super-insect-battle/engine'
import type { RenderEvent, Side } from './event-stream.types'

function other(side: Side): Side {
  return side === 'player' ? 'opponent' : 'player'
}

export function buildEventStream(state: BattleState): RenderEvent[] {
  const events: RenderEvent[] = []

  events.push({
    kind: 'intro',
    player: {
      id: state.player.base.id,
      nameKo: state.player.base.nameKo,
      style: state.player.base.behavior.style,
      maxHp: state.player.maxHp,
    },
    opponent: {
      id: state.opponent.base.id,
      nameKo: state.opponent.base.nameKo,
      style: state.opponent.base.behavior.style,
      maxHp: state.opponent.maxHp,
    },
  })

  const fainted: Record<Side, boolean> = { player: false, opponent: false }
  let lastTurn = 0

  for (const entry of state.log) {
    if (entry.turn !== lastTurn) {
      events.push({ kind: 'turn', turn: entry.turn })
      lastTurn = entry.turn
    }

    if (entry.actionId) {
      events.push({
        kind: 'action',
        actor: entry.actor,
        text: entry.action,
        actionId: entry.actionId,
      })

      if (entry.damage != null && entry.damage > 0) {
        events.push({
          kind: 'hit',
          attacker: entry.actor,
          defender: other(entry.actor),
          damage: entry.damage,
          critical: entry.critical ?? false,
        })
      }
    } else {
      events.push({
        kind: 'status',
        target: entry.actor,
        text: entry.action,
        damage: entry.damage,
      })
    }

    if (entry.remainingHp) {
      events.push({
        kind: 'hp',
        player: entry.remainingHp.player,
        opponent: entry.remainingHp.opponent,
      })

      for (const side of ['player', 'opponent'] as const) {
        if (!fainted[side] && entry.remainingHp[side] <= 0) {
          fainted[side] = true
          events.push({ kind: 'faint', side })
        }
      }
    }
  }

  events.push({ kind: 'end', winner: state.winner })

  return events
}
