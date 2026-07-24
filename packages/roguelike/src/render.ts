import {
  getActionsByIds,
  getActionTargeting,
  getActionRange,
  getCooldownRemaining,
} from '@super-insect-battle/engine'
import type { RunState } from './run'
import { TERRAIN } from './terrain'
import { ITEMS } from './items'
import { posKey } from './geometry'

/**
 * 레벨을 ASCII 그리드로 렌더. FOV가 설정된 경우:
 * - 보이는 칸: 지형·액터·출구 표시
 * - 발견했지만 안 보이는 칸: 지형·출구만(액터 숨김)
 * - 미발견: 공백
 */
export function renderLevel(run: RunState): string {
  const { map, actors, exit, visible, discovered } = run.level
  const rows: string[] = []

  for (let y = 0; y < map.height; y++) {
    let row = ''
    for (let x = 0; x < map.width; x++) {
      const key = posKey(x, y)
      const seen = !visible || visible.has(key)
      const known = seen || (discovered?.has(key) ?? false)

      if (!known) {
        row += ' '
        continue
      }

      const tile = map.tiles[y * map.width + x]
      const isExit = exit.x === x && exit.y === y

      const item = tile.itemId ? ITEMS[tile.itemId] : undefined

      if (seen) {
        const actor = actors.find(
          (a) => a.combat.currentHp > 0 && a.pos.x === x && a.pos.y === y
        )
        if (actor) row += actor.glyph
        else if (isExit) row += '>'
        else if (item) row += item.glyph
        else row += TERRAIN[tile.terrain].glyph
      } else {
        row += isExit ? '>' : item ? item.glyph : TERRAIN[tile.terrain].glyph
      }
    }
    rows.push(row)
  }

  return rows.join('\n')
}

/** 그리드 + 상태(깊이·HP) + 스킬 바 + 최근 로그. */
export function renderFrame(run: RunState): string {
  const player = run.player
  const hp = `${player.glyph} ${player.species.nameKo} HP ${player.combat.currentHp}/${player.combat.maxHp}`
  const recent = run.log.slice(-4).join('\n')

  return [
    renderLevel(run),
    '',
    `밀림 ${run.level.depth}층 / ${run.maxDepth}  ·  턴 ${run.turn}  ·  ${statusLabel(run.status)}`,
    hp,
    abilityBar(run),
    recent ? `\n${recent}` : '',
  ].join('\n')
}

/** 플레이어 스킬 목록 (숫자키로 사용). */
export function abilityBar(run: RunState): string {
  const actions = getActionsByIds(run.player.combat.actions)
  return actions
    .map((action, i) => {
      const targeting = getActionTargeting(action)
      const tag =
        targeting === 'self'
          ? '자'
          : targeting === 'ranged'
            ? `원${getActionRange(action)}`
            : '근'
      const cd = getCooldownRemaining(run.player.combat, action.id)
      return `${i + 1}.${action.nameKo}(${tag})${cd > 0 ? `[CD${cd}]` : ''}`
    })
    .join('  ')
}

function statusLabel(status: RunState['status']): string {
  switch (status) {
    case 'playing':
      return '진행 중'
    case 'won':
      return '밀림 탈출 성공!'
    case 'dead':
      return '쓰러짐...'
  }
}
