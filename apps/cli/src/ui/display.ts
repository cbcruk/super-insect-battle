import type { GameState, PlayerInsect, BattleSession } from '../game/types'
import type { BattleInsect } from '@insect-battle/engine'
import { getRoom } from '../world/rooms'

const LINE_WIDTH = 50

/** 방향별 이모지 매핑 */
const directionEmoji: Record<string, string> = {
  북: '⬆️',
  남: '⬇️',
  동: '➡️',
  서: '⬅️',
}

/**
 * 구분선 생성
 * @param char - 구분선 문자 (기본값: '─')
 * @returns LINE_WIDTH 길이의 구분선
 */
export function line(char = '─'): string {
  return char.repeat(LINE_WIDTH)
}

/**
 * 제목 박스 생성 (╔═══╗ 스타일)
 * @param title - 박스 안에 표시할 제목
 * @returns 박스 형태의 문자열
 */
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

/**
 * HP 바 생성 ([████░░░░] 100/200 형식)
 * @param current - 현재 HP
 * @param max - 최대 HP
 * @param width - 바 너비 (기본값: 20)
 * @returns HP 바 문자열
 */
export function hpBar(current: number, max: number, width = 20): string {
  const ratio = Math.max(0, Math.min(1, current / max))
  const filled = Math.round(ratio * width)
  const empty = width - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)

  return `[${bar}] ${current}/${max}`
}

/**
 * 곤충 상태 한 줄 표시 (팀 목록용)
 * @param insect - 플레이어 곤충
 * @param index - 팀 내 인덱스 (선택)
 * @returns "1. 장수풍뎅이 (beetle) [████] 100/100" 형식
 */
export function formatInsectStatus(
  insect: PlayerInsect,
  index?: number
): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ''
  const name = insect.nickname ?? insect.species.nameKo
  const hp = hpBar(insect.currentHp, insect.maxHp, 10)

  return `${prefix}${name} (${insect.species.type}) ${hp}`
}

/**
 * 배틀 중 곤충 상태 표시 (라벨 + HP바)
 * @param insect - 배틀 곤충
 * @param label - 라벨 (예: "나", "상대")
 * @returns 여러 줄 상태 문자열
 */
export function formatBattleInsect(
  insect: BattleInsect,
  label: string
): string {
  const name = insect.base.nameKo
  const hp = hpBar(insect.currentHp, insect.maxHp, 15)
  const status = insect.statusCondition ? ` [${insect.statusCondition}]` : ''

  return `${label}: ${name}${status}\n   ${hp}`
}

/**
 * 배틀 화면 전체 표시
 * 상대/나의 상태 + 스킬 선택지 표시
 * @param session - 배틀 세션
 * @returns 배틀 화면 문자열
 */
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

/**
 * 탐색 모드 힌트 표시
 * 숫자 단축키로 이동 가능한 출구 + 액션 힌트 표시
 * @param state - 게임 상태
 * @returns 힌트 문자열
 */
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

/**
 * 배틀 후 액션 힌트
 * @returns "[Enter] 계속..." 문자열
 */
export function formatPostBattleHints(): string {
  return '[Enter] 계속...'
}

/**
 * 팀 목록 표시
 * 선두 곤충에 ▶ 표시
 * @param state - 게임 상태
 * @returns 팀 목록 문자열
 */
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

/**
 * 프롬프트 생성
 * @param state - 게임 상태
 * @returns 배틀 중이면 "배틀> ", 아니면 "[플레이어명]> "
 */
export function getPrompt(state: GameState): string {
  if (state.battle) {
    return '배틀> '
  }

  return `[${state.player.name}]> `
}

/**
 * 환영 메시지 생성
 * @param playerName - 플레이어 이름
 * @returns 게임 시작 환영 메시지
 */
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
