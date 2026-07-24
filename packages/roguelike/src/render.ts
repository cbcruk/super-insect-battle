import type { RunState } from './run'
import { TERRAIN } from './terrain'
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

      if (seen) {
        const actor = actors.find(
          (a) => a.combat.currentHp > 0 && a.pos.x === x && a.pos.y === y
        )
        if (actor) row += actor.glyph
        else if (isExit) row += '>'
        else row += TERRAIN[tile.terrain].glyph
      } else {
        row += isExit ? '>' : TERRAIN[tile.terrain].glyph
      }
    }
    rows.push(row)
  }

  return rows.join('\n')
}

/** 그리드 + 상태(깊이·HP) + 최근 로그. */
export function renderFrame(run: RunState): string {
  const player = run.player
  const hp = `${player.glyph} ${player.species.nameKo} HP ${player.combat.currentHp}/${player.combat.maxHp}`
  const recent = run.log.slice(-4).join('\n')

  return [
    renderLevel(run),
    '',
    `밀림 ${run.level.depth}층 / ${run.maxDepth}  ·  턴 ${run.turn}  ·  ${statusLabel(run.status)}`,
    hp,
    recent ? `\n${recent}` : '',
  ].join('\n')
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
