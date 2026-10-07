import {
  TERRAIN,
  ITEMS,
  posKey,
  type RunState,
  type TerrainType,
  type ThreatLevel,
} from '@super-insect-battle/roguelike'
import { THREAT_COLORS } from './threat-colors.ts'
import type { CellView } from './roguelike-cell.types.ts'

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

export const UNKNOWN_BG = '#070809'

export const CELL_SIZE = 20

/**
 * 맵 한 칸의 표시 내용을 FOV 안개(보임/발견/미발견)를 반영해 결정한다.
 *
 * `threats`에 위협 단계가 있는 적은 그 색으로 칠하고, 치명 단계는 `deadly`로 표시한다.
 *
 * @returns 아직 발견하지 못한 칸이면 `null`.
 */
export function describeCell(
  run: RunState,
  x: number,
  y: number,
  threats: ReadonlyMap<string, ThreatLevel> = new Map()
): CellView | null {
  const { map, actors, exit, visible, discovered } = run.level
  const key = posKey(x, y)
  const seen = !visible || visible.has(key)
  const known = seen || (discovered?.has(key) ?? false)
  if (!known) return null

  const tile = map.tiles[y * map.width + x]
  const style = TERRAIN_STYLE[tile.terrain]
  const view: CellView = {
    bg: style.bg,
    glyph: TERRAIN[tile.terrain].glyph,
    fg: style.fg,
    alpha: seen ? 1 : 0.4,
    deadly: false,
  }

  const item = tile.itemId ? ITEMS[tile.itemId] : undefined
  const actor = seen
    ? actors.find(
        (a) => a.combat.currentHp > 0 && a.pos.x === x && a.pos.y === y
      )
    : undefined

  if (actor) {
    const threat = threats.get(actor.id)
    view.glyph = actor.glyph
    view.fg =
      actor.faction === 'player'
        ? PLAYER_FG
        : threat
          ? THREAT_COLORS[threat].hex
          : HOSTILE_FG
    view.deadly = threat === 'deadly'
  } else if (exit.x === x && exit.y === y) {
    view.glyph = '>'
    view.fg = EXIT_FG
  } else if (item) {
    view.glyph = item.glyph
    view.fg = ITEM_FG
  }

  return view
}
