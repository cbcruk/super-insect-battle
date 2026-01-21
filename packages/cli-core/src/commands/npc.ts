import type { CommandResult, GameState } from '../game/types'
import { getRoom } from '../world/rooms'
import { getNpc, getNpcDialogue } from '../npc'
import { healTeam } from '../game/state'
import { line } from '../ui/display'

export function talkCommand(args: string[], state: GameState): CommandResult {
  const room = getRoom(state.player.location)

  if (!room || !room.npcs || room.npcs.length === 0) {
    return {
      output: '이 장소에는 대화할 수 있는 사람이 없습니다.',
      stateChanged: false,
    }
  }

  if (args.length === 0) {
    const npcNames = room.npcs
      .map((id) => getNpc(id))
      .filter(Boolean)
      .map((npc) => npc!.name)

    if (npcNames.length === 1) {
      return talkToNpc(room.npcs[0], state)
    }

    const lines: string[] = []
    lines.push('누구와 대화할까요?')
    npcNames.forEach((name, i) => {
      lines.push(`  ${i + 1}. ${name}`)
    })
    lines.push('')
    lines.push('(예: talk 1 또는 talk 간호사)')

    return {
      output: lines.join('\n'),
      stateChanged: false,
    }
  }

  const input = args.join(' ').toLowerCase()
  const npcIndex = parseInt(input, 10)

  let targetNpcId: string | undefined

  if (!isNaN(npcIndex) && npcIndex >= 1 && npcIndex <= room.npcs.length) {
    targetNpcId = room.npcs[npcIndex - 1]
  } else {
    targetNpcId = room.npcs.find((id) => {
      const npc = getNpc(id)
      return npc && npc.name.toLowerCase().includes(input)
    })
  }

  if (!targetNpcId) {
    return {
      output: '그런 사람을 찾을 수 없습니다.',
      stateChanged: false,
    }
  }

  return talkToNpc(targetNpcId, state)
}

function talkToNpc(npcId: string, _state: GameState): CommandResult {
  const npc = getNpc(npcId)

  if (!npc) {
    return {
      output: 'NPC를 찾을 수 없습니다.',
      stateChanged: false,
    }
  }

  const lines: string[] = []
  lines.push('')
  lines.push(`💬 ${npc.name}`)
  lines.push(line('─'))
  lines.push(`"${getNpcDialogue(npc)}"`)

  if (npc.actions && npc.actions.length > 0) {
    lines.push('')
    lines.push('행동:')
    npc.actions.forEach((action, i) => {
      lines.push(`  ${i + 1}. ${action.label}`)
    })
    lines.push('')
    lines.push('(예: do 1)')
  }

  lines.push('')

  return {
    output: lines.join('\n'),
    stateChanged: false,
  }
}

export function doCommand(args: string[], state: GameState): CommandResult {
  const room = getRoom(state.player.location)

  if (!room || !room.npcs || room.npcs.length === 0) {
    return {
      output: '이 장소에는 상호작용할 수 있는 사람이 없습니다.',
      stateChanged: false,
    }
  }

  if (args.length === 0) {
    return {
      output: '어떤 행동을 할까요? (예: do 1)',
      stateChanged: false,
    }
  }

  const npcWithActions = room.npcs
    .map((id) => getNpc(id))
    .find((npc) => npc && npc.actions && npc.actions.length > 0)

  if (!npcWithActions || !npcWithActions.actions) {
    return {
      output: '이 장소에서 할 수 있는 행동이 없습니다.',
      stateChanged: false,
    }
  }

  const actionIndex = parseInt(args[0], 10)

  if (isNaN(actionIndex) || actionIndex < 1 || actionIndex > npcWithActions.actions.length) {
    return {
      output: '올바른 행동 번호를 입력하세요.',
      stateChanged: false,
    }
  }

  const action = npcWithActions.actions[actionIndex - 1]

  switch (action.type) {
    case 'heal':
      return performHeal(state, npcWithActions.name)
    case 'info':
      return {
        output: `${npcWithActions.name}: "${getNpcDialogue(npcWithActions)}"`,
        stateChanged: false,
      }
    default:
      return {
        output: '아직 구현되지 않은 기능입니다.',
        stateChanged: false,
      }
  }
}

function performHeal(state: GameState, npcName: string): CommandResult {
  const needsHealing = state.player.team.some((insect) => insect.currentHp < insect.maxHp)

  if (!needsHealing) {
    return {
      output: `${npcName}: "팀이 이미 건강해요!"`,
      stateChanged: false,
    }
  }

  healTeam(state)

  const lines: string[] = []
  lines.push('')
  lines.push(`${npcName}: "곤충들을 치료했습니다!"`)
  lines.push('')
  lines.push('🎵 띠링~ 팀이 완전히 회복되었습니다!')
  lines.push('')

  return {
    output: lines.join('\n'),
    stateChanged: true,
  }
}
