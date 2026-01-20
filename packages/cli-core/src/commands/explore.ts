import type { CommandResult, GameState } from '../game/types'
import { getRoom, normalizeDirection } from '../world/rooms'
import { movePlayer, healTeam, getActiveInsect } from '../game/state'
import { formatTeam, line } from '../ui/display'
import { rollEncounter } from '../random'

export function lookCommand(_args: string[], state: GameState): CommandResult {
  const room = getRoom(state.player.location)

  if (!room) {
    return {
      output: '알 수 없는 장소입니다.',
      stateChanged: false,
    }
  }

  const lines: string[] = []
  lines.push('')
  lines.push(`📍 ${room.name}`)
  lines.push(line('─'))
  lines.push(room.description)
  lines.push('')

  const exits = Object.keys(room.exits)

  if (exits.length > 0) {
    lines.push(`출구: ${exits.join(', ')}`)
  }

  if (room.hasWildEncounters) {
    lines.push('⚠️  이 지역에는 야생 곤충이 출현합니다!')
  }

  lines.push('')

  return {
    output: lines.join('\n'),
    stateChanged: false,
  }
}

export function goCommand(args: string[], state: GameState): CommandResult {
  if (args.length === 0) {
    return {
      output: '어느 방향으로 이동할까요? (예: go 북)',
      stateChanged: false,
    }
  }

  const direction = normalizeDirection(args[0])

  if (!direction) {
    return {
      output: `'${args[0]}'은(는) 알 수 없는 방향입니다.`,
      stateChanged: false,
    }
  }

  const currentRoom = getRoom(state.player.location)

  if (!currentRoom) {
    return {
      output: '현재 위치를 알 수 없습니다.',
      stateChanged: false,
    }
  }

  const nextRoomId = currentRoom.exits[direction]

  if (!nextRoomId) {
    return {
      output: `${direction}쪽으로는 갈 수 없습니다.`,
      stateChanged: false,
    }
  }

  const nextRoom = getRoom(nextRoomId)

  if (!nextRoom) {
    return {
      output: '그 방향의 장소를 찾을 수 없습니다.',
      stateChanged: false,
    }
  }

  movePlayer(state, nextRoomId)

  const lookResult = lookCommand([], state)
  const lines: string[] = [`${direction}쪽으로 이동했습니다.`, lookResult.output]

  if (nextRoom.hasWildEncounters && nextRoom.encounterRate) {
    const activeInsect = getActiveInsect(state)
    if (activeInsect && activeInsect.currentHp > 0 && rollEncounter(nextRoom.encounterRate)) {
      lines.push('')
      lines.push('🌿 풀숲에서 야생 곤충이 뛰쳐나왔다!')
      return {
        output: lines.join('\n'),
        stateChanged: true,
        shouldTriggerBattle: true,
      }
    }
  }

  return {
    output: lines.join('\n'),
    stateChanged: true,
  }
}

export function teamCommand(_args: string[], state: GameState): CommandResult {
  return {
    output: formatTeam(state),
    stateChanged: false,
  }
}

export function healCommand(_args: string[], state: GameState): CommandResult {
  if (state.player.location !== 'insect_center') {
    return {
      output: '곤충 센터에서만 회복할 수 있습니다.',
      stateChanged: false,
    }
  }

  healTeam(state)

  return {
    output: '🏥 팀이 완전히 회복되었습니다!',
    stateChanged: true,
  }
}

export function helpCommand(_args: string[], state: GameState): CommandResult {
  const isInBattle = state.battle !== null

  const lines: string[] = []

  lines.push('')
  lines.push('📖 명령어 도움말')
  lines.push(line('─'))

  if (isInBattle) {
    lines.push('배틀 중:')
    lines.push('  use <번호|이름>  - 스킬 사용')
    lines.push('  run              - 도망')
    lines.push('  team             - 팀 확인')
  } else {
    lines.push('탐색:')
    lines.push('  look (l)         - 주변 살펴보기')
    lines.push('  go <방향>        - 이동 (북/남/동/서)')
    lines.push('  team (t)         - 팀 확인')
    lines.push('  battle (b)       - 야생 곤충과 배틀')
    lines.push('  heal             - 팀 회복 (곤충 센터)')
  }

  lines.push('')
  lines.push('공통:')
  lines.push('  help (h, ?)      - 도움말')
  lines.push('  quit (q)         - 게임 종료')
  lines.push('')

  return {
    output: lines.join('\n'),
    stateChanged: false,
  }
}

export function quitCommand(_args: string[], _state: GameState): CommandResult {
  return {
    output: '게임을 종료합니다. 안녕히 가세요!',
    stateChanged: false,
    shouldQuit: true,
  }
}
