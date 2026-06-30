import type { BattleEvent, CommentaryLine } from './types'
import { iGa } from './particles'
import {
  INTRO_LINES,
  ACTION_LINES,
  RESULT_LINES,
  CRIT_PREFIXES,
  MATCHUP_UP,
  MATCHUP_DOWN,
  LOW_HP_LINES,
  STATUS_APPLIED_LINES,
  MISS_LINES,
  MOVE_LINES,
  FAINT_LINES,
} from './phrases'

const END_WIN_LINES = [
  (name: string, particle: string, turns: number): string =>
    `${name}${particle} 승리를 거머쥔다! ${turns}턴 만의 결판.`,
  (name: string, particle: string, turns: number): string =>
    `승부 끝! ${turns}턴의 혈투 끝에 ${name}${particle} 살아남았다.`,
  (name: string, particle: string, turns: number): string =>
    `${name}${particle} 최후의 승자다 — ${turns}턴 만에 막을 내린다.`,
]

const END_DRAW_LINES = [
  (turns: number): string =>
    `무승부! ${turns}턴의 혈투 끝에 승부를 가리지 못했다.`,
  (turns: number): string =>
    `${turns}턴을 싸우고도 우열을 가리지 못한다 — 무승부!`,
]

class Rotation {
  private readonly counters = new Map<string, number>()

  pick<T>(key: string, bank: T[]): T {
    const n = this.counters.get(key) ?? 0
    this.counters.set(key, n + 1)
    return bank[n % bank.length]
  }
}

function narrateEvent(event: BattleEvent, r: Rotation): CommentaryLine[] {
  switch (event.kind) {
    case 'intro':
      return [
        {
          text: r.pick('intro', INTRO_LINES)(
            event.player,
            event.opponent,
            event.environment
          ),
          emphasis: 'header',
        },
      ]

    case 'turn':
      return [{ text: `── ${event.turn}턴 ──`, emphasis: 'header', turn: event.turn }]

    case 'attack': {
      const lines: CommentaryLine[] = []
      const strong = event.magnitude === 'heavy' || event.magnitude === 'crushing'

      lines.push({
        text: r.pick('action', ACTION_LINES)(event.attackerName, event.move),
        emphasis: event.critical ? 'critical' : strong ? 'strong' : 'normal',
        actor: event.attacker,
        turn: event.turn,
      })

      const critPrefix = event.critical
        ? r.pick('crit', CRIT_PREFIXES) + ' '
        : ''
      const matchupSuffix =
        event.matchup === 'up'
          ? r.pick('matchupUp', MATCHUP_UP)
          : event.matchup === 'down'
            ? r.pick('matchupDown', MATCHUP_DOWN)
            : ''
      const resultBody = r.pick(
        `result:${event.magnitude}`,
        RESULT_LINES[event.magnitude]
      )(event.defenderName)

      lines.push({
        text: `${critPrefix}${resultBody}${matchupSuffix}`,
        emphasis: event.critical ? 'critical' : strong ? 'strong' : 'normal',
        actor: event.attacker,
        turn: event.turn,
      })

      if (event.appliedStatus) {
        lines.push({
          text: r.pick('statusApplied', STATUS_APPLIED_LINES)(
            event.defenderName,
            event.appliedStatus
          ),
          emphasis: 'strong',
          turn: event.turn,
        })
      }

      if (event.defenderHpRatio > 0 && event.defenderHpRatio < 0.25) {
        lines.push({
          text: r.pick('lowhp', LOW_HP_LINES)(event.defenderName),
          emphasis: 'strong',
          turn: event.turn,
        })
      }

      return lines
    }

    case 'miss':
      return [
        {
          text: r.pick('miss', MISS_LINES)(
            event.attackerName,
            event.move,
            event.defenderName
          ),
          emphasis: 'normal',
          actor: event.attacker,
          turn: event.turn,
        },
      ]

    case 'move':
      return [
        {
          text: r.pick(`move:${event.intent}`, MOVE_LINES[event.intent])(
            event.actorName,
            event.move
          ),
          emphasis: 'normal',
          actor: event.actor,
          turn: event.turn,
        },
      ]

    case 'note':
      return [{ text: event.text, emphasis: 'system', turn: event.turn }]

    case 'faint':
      return [
        {
          text: r.pick('faint', FAINT_LINES)(event.name),
          emphasis: 'critical',
          actor: event.side,
          turn: event.turn,
        },
      ]

    case 'end':
      if (event.winnerName) {
        return [
          {
            text: r.pick('endWin', END_WIN_LINES)(
              event.winnerName,
              iGa(event.winnerName),
              event.turns
            ),
            emphasis: 'header',
          },
        ]
      }
      return [
        {
          text: r.pick('endDraw', END_DRAW_LINES)(event.turns),
          emphasis: 'header',
        },
      ]
  }
}

export interface Narrator {
  next(event: BattleEvent): CommentaryLine[]
}

export function createNarrator(): Narrator {
  const r = new Rotation()
  return {
    next: (event) => narrateEvent(event, r),
  }
}

export function narrate(events: BattleEvent[]): CommentaryLine[] {
  const narrator = createNarrator()
  const lines: CommentaryLine[] = []
  for (const event of events) {
    lines.push(...narrator.next(event))
  }
  return lines
}
