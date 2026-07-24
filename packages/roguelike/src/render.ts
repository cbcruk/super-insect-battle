import type { RunState } from './run'
import { TERRAIN } from './terrain'

/** 레벨을 ASCII 그리드 문자열로 렌더 (P1 터미널). */
export function renderLevel(run: RunState): string {
  const { map, actors, exit } = run.level
  const rows: string[] = []

  for (let y = 0; y < map.height; y++) {
    let row = ''
    for (let x = 0; x < map.width; x++) {
      const actor = actors.find(
        (a) => a.combat.currentHp > 0 && a.pos.x === x && a.pos.y === y
      )
      if (actor) {
        row += actor.glyph
      } else if (exit.x === x && exit.y === y) {
        row += '>'
      } else {
        const tile = map.tiles[y * map.width + x]
        row += TERRAIN[tile.terrain].glyph
      }
    }
    rows.push(row)
  }

  return rows.join('\n')
}

/** 그리드 + 상태(HP) + 최근 로그를 합친 한 프레임. */
export function renderFrame(run: RunState): string {
  const hp = run.level.actors
    .map(
      (a) =>
        `${a.glyph} ${a.species.nameKo} ${a.combat.currentHp}/${a.combat.maxHp}`
    )
    .join('   ')

  const recent = run.log.slice(-4).join('\n')

  return [
    renderLevel(run),
    '',
    `턴 ${run.turn} · ${statusLabel(run.status)}`,
    hp,
    recent ? `\n${recent}` : '',
  ].join('\n')
}

function statusLabel(status: RunState['status']): string {
  switch (status) {
    case 'playing':
      return '진행 중'
    case 'won':
      return '탈출 성공!'
    case 'dead':
      return '쓰러짐...'
  }
}
