import { useCallback, useRef } from 'react'
import {
  arthropodList,
  simulateBattle,
  simulateMultipleBattles,
  type Arthropod,
  type BattleState,
} from '@super-insect-battle/engine'

type GamePhase = 'menu' | 'select_1' | 'select_2' | 'battle' | 'encyclopedia' | 'stats_select_1' | 'stats_select_2' | 'stats_count'

export interface UseGameReturn {
  processInput: (input: string) => string[]
  getInitialOutput: () => string[]
}

function formatArthropodList(): string[] {
  const lines: string[] = []
  lines.push('')
  lines.push('\x1b[33m=== 절지동물 목록 ===\x1b[0m')
  lines.push('')
  arthropodList.forEach((a, i) => {
    const styleColor = getStyleColor(a.behavior.style)
    lines.push(`\x1b[36m[${i + 1}]\x1b[0m ${a.nameKo} (${a.name}) - ${styleColor}${a.behavior.style}\x1b[0m`)
  })
  lines.push('')
  return lines
}

function getStyleColor(style: string): string {
  switch (style) {
    case 'grappler': return '\x1b[31m'
    case 'striker': return '\x1b[32m'
    case 'venomous': return '\x1b[35m'
    case 'defensive': return '\x1b[34m'
    default: return '\x1b[37m'
  }
}

function formatArthropodDetails(a: Arthropod): string[] {
  const lines: string[] = []
  const styleColor = getStyleColor(a.behavior.style)

  lines.push('')
  lines.push(`\x1b[33m=== ${a.nameKo} ===\x1b[0m`)
  lines.push(`\x1b[90m${a.name}\x1b[0m`)
  lines.push('')
  lines.push(a.description)
  lines.push('')
  lines.push('\x1b[36m물리적 특성:\x1b[0m')
  lines.push(`  체중: ${a.physical.weightG}g`)
  lines.push(`  체장: ${a.physical.lengthMm}mm`)
  lines.push(`  힘 지수: ${a.physical.strengthIndex}`)
  lines.push('')
  lines.push('\x1b[36m무기:\x1b[0m')
  lines.push(`  타입: ${a.weapon.type}`)
  lines.push(`  위력: ${a.weapon.power}`)
  lines.push(`  독: ${a.weapon.venomous ? '있음' : '없음'}`)
  if (a.weapon.venomPotency) {
    lines.push(`  독 강도: ${a.weapon.venomPotency}`)
  }
  lines.push('')
  lines.push('\x1b[36m행동:\x1b[0m')
  lines.push(`  공격성: ${a.behavior.aggression}`)
  lines.push(`  스타일: ${styleColor}${a.behavior.style}\x1b[0m`)
  lines.push('')
  lines.push('\x1b[36m방어:\x1b[0m')
  lines.push(`  갑각 강도: ${a.defense.armorRating}`)
  lines.push(`  회피력: ${a.defense.evasion}`)
  lines.push('')
  return lines
}

function formatBattleResult(state: BattleState): string[] {
  const lines: string[] = []

  lines.push('')
  lines.push('\x1b[33m════════════════════════════════════════\x1b[0m')
  lines.push(`\x1b[36m${state.player.base.nameKo}\x1b[0m vs \x1b[35m${state.opponent.base.nameKo}\x1b[0m`)
  lines.push('\x1b[33m════════════════════════════════════════\x1b[0m')
  lines.push('')

  let currentTurn = 0
  for (const entry of state.log) {
    if (entry.turn !== currentTurn) {
      currentTurn = entry.turn
      lines.push(`\x1b[33m[턴 ${currentTurn}]\x1b[0m`)
    }

    const color = entry.actor === 'player' ? '\x1b[36m' : '\x1b[35m'
    const prefix = entry.actor === 'player' ? '▶' : '◀'
    lines.push(`${color}${prefix}\x1b[0m ${entry.action}`)

    if (entry.damage !== undefined && entry.damage > 0) {
      lines.push(`  \x1b[31m→ ${entry.damage} 데미지!\x1b[0m`)
    }
  }

  lines.push('')
  lines.push('\x1b[33m════════════════════════════════════════\x1b[0m')

  if (state.winner === 'draw') {
    lines.push('\x1b[33m무승부!\x1b[0m')
  } else {
    const winnerName = state.winner === 'player'
      ? state.player.base.nameKo
      : state.opponent.base.nameKo
    lines.push(`\x1b[32m승자: ${winnerName}!\x1b[0m`)
  }

  lines.push('')
  lines.push(`총 ${state.turn}턴 소요`)
  lines.push(`\x1b[36m${state.player.base.nameKo}\x1b[0m: ${state.player.currentHp}/${state.player.maxHp} HP`)
  lines.push(`\x1b[35m${state.opponent.base.nameKo}\x1b[0m: ${state.opponent.currentHp}/${state.opponent.maxHp} HP`)
  lines.push('\x1b[33m════════════════════════════════════════\x1b[0m')
  lines.push('')

  return lines
}

function formatStatistics(
  name1: string,
  name2: string,
  stats: { playerWins: number; opponentWins: number; draws: number; winRate: number; avgTurns: number },
  count: number
): string[] {
  const lines: string[] = []

  lines.push('')
  lines.push('\x1b[33m════════════════════════════════════════\x1b[0m')
  lines.push(`\x1b[33m${count}회 시뮬레이션 결과\x1b[0m`)
  lines.push('\x1b[33m════════════════════════════════════════\x1b[0m')
  lines.push('')
  lines.push(`\x1b[36m${name1}\x1b[0m 승리: ${stats.playerWins}회 (${stats.winRate.toFixed(1)}%)`)
  lines.push(`\x1b[35m${name2}\x1b[0m 승리: ${stats.opponentWins}회 (${(100 - stats.winRate - (stats.draws / count) * 100).toFixed(1)}%)`)
  lines.push(`무승부: ${stats.draws}회`)
  lines.push('')
  lines.push(`평균 턴: ${stats.avgTurns.toFixed(1)}턴`)
  lines.push('')

  return lines
}

export function useGame(): UseGameReturn {
  const phaseRef = useRef<GamePhase>('menu')
  const selected1Ref = useRef<Arthropod | null>(null)
  const selected2Ref = useRef<Arthropod | null>(null)

  const getInitialOutput = useCallback((): string[] => {
    const lines: string[] = []
    lines.push('')
    lines.push('\x1b[33m╔══════════════════════════════════════╗\x1b[0m')
    lines.push('\x1b[33m║      슈퍼곤충대전 시뮬레이터        ║\x1b[0m')
    lines.push('\x1b[33m╚══════════════════════════════════════╝\x1b[0m')
    lines.push('')
    lines.push('\x1b[36m[1]\x1b[0m 배틀 시작')
    lines.push('\x1b[36m[2]\x1b[0m 도감')
    lines.push('\x1b[36m[3]\x1b[0m 통계 시뮬레이션')
    lines.push('')
    lines.push('> ')
    return lines
  }, [])

  const showMenu = (): string[] => {
    const lines: string[] = []
    lines.push('')
    lines.push('\x1b[36m[1]\x1b[0m 배틀 시작')
    lines.push('\x1b[36m[2]\x1b[0m 도감')
    lines.push('\x1b[36m[3]\x1b[0m 통계 시뮬레이션')
    lines.push('')
    lines.push('> ')
    return lines
  }

  const processInput = useCallback((input: string): string[] => {
    const output: string[] = []
    const trimmed = input.trim()

    switch (phaseRef.current) {
      case 'menu': {
        if (trimmed === '1') {
          phaseRef.current = 'select_1'
          output.push(...formatArthropodList())
          output.push('첫 번째 절지동물을 선택하세요: ')
        } else if (trimmed === '2') {
          phaseRef.current = 'encyclopedia'
          output.push(...formatArthropodList())
          output.push('\x1b[36m[0]\x1b[0m 돌아가기')
          output.push('')
          output.push('상세 정보를 볼 절지동물을 선택하세요: ')
        } else if (trimmed === '3') {
          phaseRef.current = 'stats_select_1'
          output.push(...formatArthropodList())
          output.push('첫 번째 절지동물을 선택하세요: ')
        } else {
          output.push('잘못된 선택입니다.')
          output.push(...showMenu())
        }
        break
      }

      case 'select_1': {
        const index = parseInt(trimmed, 10) - 1
        if (index >= 0 && index < arthropodList.length) {
          selected1Ref.current = arthropodList[index]
          phaseRef.current = 'select_2'
          output.push(...formatArthropodList())
          output.push('두 번째 절지동물을 선택하세요: ')
        } else {
          output.push('잘못된 선택입니다.')
          output.push(...formatArthropodList())
          output.push('첫 번째 절지동물을 선택하세요: ')
        }
        break
      }

      case 'select_2': {
        const index = parseInt(trimmed, 10) - 1
        if (index >= 0 && index < arthropodList.length) {
          selected2Ref.current = arthropodList[index]
          const result = simulateBattle(selected1Ref.current!, selected2Ref.current!)
          output.push(...formatBattleResult(result))
          phaseRef.current = 'menu'
          output.push(...showMenu())
        } else {
          output.push('잘못된 선택입니다.')
          output.push(...formatArthropodList())
          output.push('두 번째 절지동물을 선택하세요: ')
        }
        break
      }

      case 'encyclopedia': {
        if (trimmed === '0') {
          phaseRef.current = 'menu'
          output.push(...showMenu())
        } else {
          const index = parseInt(trimmed, 10) - 1
          if (index >= 0 && index < arthropodList.length) {
            output.push(...formatArthropodDetails(arthropodList[index]))
            output.push(...formatArthropodList())
            output.push('\x1b[36m[0]\x1b[0m 돌아가기')
            output.push('')
            output.push('상세 정보를 볼 절지동물을 선택하세요: ')
          } else {
            output.push('잘못된 선택입니다.')
            output.push(...formatArthropodList())
            output.push('\x1b[36m[0]\x1b[0m 돌아가기')
            output.push('')
            output.push('상세 정보를 볼 절지동물을 선택하세요: ')
          }
        }
        break
      }

      case 'stats_select_1': {
        const index = parseInt(trimmed, 10) - 1
        if (index >= 0 && index < arthropodList.length) {
          selected1Ref.current = arthropodList[index]
          phaseRef.current = 'stats_select_2'
          output.push(...formatArthropodList())
          output.push('두 번째 절지동물을 선택하세요: ')
        } else {
          output.push('잘못된 선택입니다.')
          output.push(...formatArthropodList())
          output.push('첫 번째 절지동물을 선택하세요: ')
        }
        break
      }

      case 'stats_select_2': {
        const index = parseInt(trimmed, 10) - 1
        if (index >= 0 && index < arthropodList.length) {
          selected2Ref.current = arthropodList[index]
          phaseRef.current = 'stats_count'
          output.push('')
          output.push('시뮬레이션 횟수를 입력하세요 (기본값 100): ')
        } else {
          output.push('잘못된 선택입니다.')
          output.push(...formatArthropodList())
          output.push('두 번째 절지동물을 선택하세요: ')
        }
        break
      }

      case 'stats_count': {
        const count = parseInt(trimmed, 10) || 100
        output.push(`${count}회 시뮬레이션 중...`)
        const stats = simulateMultipleBattles(selected1Ref.current!, selected2Ref.current!, count)
        output.push(...formatStatistics(
          selected1Ref.current!.nameKo,
          selected2Ref.current!.nameKo,
          stats,
          count
        ))
        phaseRef.current = 'menu'
        output.push(...showMenu())
        break
      }
    }

    return output
  }, [])

  return {
    processInput,
    getInitialOutput,
  }
}
