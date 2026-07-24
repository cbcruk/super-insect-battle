import {
  TERRAIN,
  ITEMS,
  posKey,
  type RunState,
  type TerrainType,
} from '@super-insect-battle/roguelike'

interface TileStyle {
  bg: string
  fg: string
}

const TERRAIN_STYLE: Record<TerrainType, TileStyle> = {
  floor: { bg: '#14181c', fg: '#39424c' },
  wall: { bg: '#0b0e11', fg: '#222a31' },
  tallgrass: { bg: '#111f13', fg: '#43b563' },
  water: { bg: '#0e1b2c', fg: '#4488c0' },
  mud: { bg: '#1c1610', fg: '#8a6a3a' },
}

const PLAYER_FG = '#22d3ee'
const HOSTILE_FG = '#f87171'
const EXIT_FG = '#fbbf24'
const ITEM_FG = '#e879f9'
const UNKNOWN_BG = '#070809'

export const CELL_SIZE = 20

/** RunState를 캔버스에 2D 타일로 렌더. FOV 안개(보임/발견/미발견) 반영. */
export function drawRoguelike(
  ctx: CanvasRenderingContext2D,
  run: RunState,
  cell: number = CELL_SIZE
): void {
  const { map, actors, exit, visible, discovered } = run.level

  ctx.fillStyle = UNKNOWN_BG
  ctx.fillRect(0, 0, map.width * cell, map.height * cell)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `bold ${Math.floor(cell * 0.78)}px ui-monospace, "SFMono-Regular", monospace`

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const key = posKey(x, y)
      const seen = !visible || visible.has(key)
      const known = seen || (discovered?.has(key) ?? false)
      if (!known) continue

      const px = x * cell
      const py = y * cell
      const tile = map.tiles[y * map.width + x]
      const style = TERRAIN_STYLE[tile.terrain]

      ctx.globalAlpha = seen ? 1 : 0.4
      ctx.fillStyle = style.bg
      ctx.fillRect(px, py, cell, cell)

      let glyph = TERRAIN[tile.terrain].glyph
      let fg = style.fg

      const item = tile.itemId ? ITEMS[tile.itemId] : undefined
      const actor = seen
        ? actors.find(
            (a) => a.combat.currentHp > 0 && a.pos.x === x && a.pos.y === y
          )
        : undefined

      if (actor) {
        glyph = actor.glyph
        fg = actor.faction === 'player' ? PLAYER_FG : HOSTILE_FG
      } else if (exit.x === x && exit.y === y) {
        glyph = '>'
        fg = EXIT_FG
      } else if (item) {
        glyph = item.glyph
        fg = ITEM_FG
      }

      if (glyph && glyph !== ' ' && glyph !== '.') {
        ctx.fillStyle = fg
        ctx.fillText(glyph, px + cell / 2, py + cell / 2 + 1)
      } else if (glyph === '.') {
        // 바닥은 옅은 점
        ctx.fillStyle = fg
        ctx.fillRect(px + cell / 2 - 1, py + cell / 2, 2, 2)
      }

      ctx.globalAlpha = 1
    }
  }
}
