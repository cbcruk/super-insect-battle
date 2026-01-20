import type { GameState, PlayerInsect, BattleSession } from '../game/types'
import type { BattleInsect } from '@insect-battle/engine'
import { getRoom } from '../world/rooms'

const LINE_WIDTH = 50

const directionEmoji: Record<string, string> = {
  북: '⬆️',
  남: '⬇️',
  동: '➡️',
  서: '⬅️',
}

export function line(char = '─'): string {
  return char.repeat(LINE_WIDTH)
}

export function titleBox(title: string): string {
  const padding = Math.floor((LINE_WIDTH - title.length - 2) / 2)
  const leftPad = ' '.repeat(Math.max(0, padding))
  const rightPad = ' '.repeat(
    Math.max(0, LINE_WIDTH - title.length - 2 - padding)
  )

  return [
    '╔' + '═'.repeat(LINE_WIDTH - 2) + '╗',
    '║' + leftPad + title + rightPad + '║',
    '╚' + '═'.repeat(LINE_WIDTH - 2) + '╝',
  ].join('\n')
}

export function hpBar(current: number, max: number, width = 20): string {
  const ratio = Math.max(0, Math.min(1, current / max))
  const filled = Math.round(ratio * width)
  const empty = width - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)

  return `[${bar}] ${current}/${max}`
}

export function formatInsectStatus(
  insect: PlayerInsect,
  index?: number
): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ''
  const name = insect.nickname ?? insect.species.nameKo
  const hp = hpBar(insect.currentHp, insect.maxHp, 10)

  return `${prefix}${name} (${insect.species.type}) ${hp}`
}

export function formatBattleInsect(
  insect: BattleInsect,
  label: string
): string {
  const name = insect.base.nameKo
  const hp = hpBar(insect.currentHp, insect.maxHp, 15)
  const status = insect.statusCondition ? ` [${insect.statusCondition}]` : ''

  return `${label}: ${name}${status}\n   ${hp}`
}

export function formatBattleScreen(session: BattleSession): string {
  const { state, opponent } = session
  const lines: string[] = []

  lines.push(line('═'))
  lines.push(`⚔️  vs ${opponent.name}${opponent.isWild ? ' (야생)' : ''}`)
  lines.push(line('─'))
  lines.push('')
  lines.push(formatBattleInsect(state.opponent, '상대'))
  lines.push('')
  lines.push(formatBattleInsect(state.player, '나'))
  lines.push('')
  lines.push(line('─'))

  if (session.awaitingInput) {
    const moveOptions = session.availableMoves
      .map((move, i) => `[${i + 1}] ${move.name}`)
      .join('  ')

    lines.push(moveOptions)
    lines.push('')
    lines.push('[0] 도망')
  }

  return lines.join('\n')
}

export function formatExploreHints(state: GameState): string {
  const room = getRoom(state.player.location)

  if (!room) return ''

  const lines: string[] = []

  const exits = Object.entries(room.exits)

  if (exits.length > 0) {
    const exitOptions = exits
      .map(([dir, roomId], i) => {
        const targetRoom = getRoom(roomId)
        const emoji = directionEmoji[dir] || '▶️'
        return `[${i + 1}] ${emoji} ${dir}-${targetRoom?.name || roomId}`
      })
      .join('  ')

    lines.push(exitOptions)
  }

  const actions: string[] = []

  if (room.hasWildEncounters) {
    actions.push('[b] 배틀')
  }

  if (state.player.location === 'insect_center') {
    actions.push('[h] 회복')
  }

  actions.push('[t] 팀')
  actions.push('[?] 도움말')

  lines.push(actions.join('  '))

  return lines.join('\n')
}

export function formatPostBattleHints(): string {
  return '[Enter] 계속...'
}

export function formatTeam(state: GameState): string {
  const { team, activeIndex } = state.player
  const lines: string[] = []

  lines.push(line('─'))
  lines.push('🪲 나의 팀')
  lines.push(line('─'))

  if (team.length === 0) {
    lines.push('  (팀에 곤충이 없습니다)')
  } else {
    team.forEach((insect, i) => {
      const marker = i === activeIndex ? '▶ ' : '  '
      lines.push(marker + formatInsectStatus(insect, i))
    })
  }

  lines.push(line('─'))

  return lines.join('\n')
}

export function getPrompt(state: GameState): string {
  if (state.battle) {
    return '배틀> '
  }

  return `[${state.player.name}]> `
}

export function welcomeMessage(playerName: string): string {
  return [
    '',
    titleBox('🪲 슈퍼곤충대전 🪲'),
    '',
    `환영합니다, ${playerName} 트레이너님!`,
    '',
    '당신은 장수풍뎅이와 함께 모험을 시작합니다.',
    '명령어가 궁금하면 "help"를 입력하세요.',
    '',
    line('─'),
  ].join('\n')
}
