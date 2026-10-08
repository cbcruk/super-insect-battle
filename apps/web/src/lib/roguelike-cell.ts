import {
  TERRAIN,
  ITEMS,
  posKey,
  tileAt,
  type RunState,
  type TerrainType,
  type ThreatLevel,
} from '@super-insect-battle/roguelike'
import { THREAT_COLORS } from './threat-colors.ts'
import { lightAt, REMEMBERED_LIGHT } from './sight-light.ts'
import { EXIT_MARK, NEIGHBOUR, itemMark, terrainMark } from './tile-marks.ts'
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

const NEIGHBOUR_STEPS = [
  [0, -1, NEIGHBOUR.n],
  [1, 0, NEIGHBOUR.e],
  [0, 1, NEIGHBOUR.s],
  [-1, 0, NEIGHBOUR.w],
] as const

/**
 * 같은 지형으로 이어지는 이웃 방향의 마스크를 구한다.
 *
 * 맵 밖이나 아직 발견하지 못한 칸도 이어진 것으로 쳐서, 무늬 모양으로 안 본 지형이
 * 드러나지 않게 한다.
 */
function sameTerrainMask(run: RunState, x: number, y: number): number {
  const { map, discovered } = run.level
  const terrain = map.tiles[y * map.width + x].terrain
  let mask = 0
  for (const [dx, dy, bit] of NEIGHBOUR_STEPS) {
    const nx = x + dx
    const ny = y + dy
    const tile = tileAt(map, nx, ny)
    const hidden = discovered !== undefined && !discovered.has(posKey(nx, ny))
    if (!tile || hidden || tile.terrain === terrain) mask |= bit
  }
  return mask
}

/**
 * 맵 한 칸의 표시 내용을 FOV 안개(보임/발견/미발견)를 반영해 결정한다.
 *
 * 보이는 칸은 플레이어에게서 멀수록 어두워지지만, 곤충·아이템·출구 글리프는 위협 색을
 * 알아볼 수 있도록 거리와 무관하게 밝게 둔다.
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
  const { player } = run
  const key = posKey(x, y)
  const seen = !visible || visible.has(key)
  const known = seen || (discovered?.has(key) ?? false)
  if (!known) return null

  const tile = map.tiles[y * map.width + x]
  const style = TERRAIN_STYLE[tile.terrain]
  const light = !seen
    ? REMEMBERED_LIGHT
    : visible
      ? lightAt(player.pos, x, y)
      : 1
  const view: CellView = {
    bg: style.bg,
    glyph: TERRAIN[tile.terrain].glyph,
    fg: style.fg,
    alpha: light,
    glyphAlpha: light,
    mark: terrainMark(tile.terrain, x, y, sameTerrainMask(run, x, y)),
    deadly: false,
  }
  const standOut = seen ? 1 : REMEMBERED_LIGHT

  const item = tile.itemId ? ITEMS[tile.itemId] : undefined
  const actor = seen
    ? actors.find(
        (a) => a.combat.currentHp > 0 && a.pos.x === x && a.pos.y === y
      )
    : undefined

  if (actor) {
    const threat = threats.get(actor.id)
    view.glyph = actor.glyph
    view.species = actor.species
    view.actorId = actor.id
    view.mark = undefined
    view.fg =
      actor.faction === 'player'
        ? PLAYER_FG
        : threat
          ? THREAT_COLORS[threat].hex
          : HOSTILE_FG
    view.deadly = threat === 'deadly'
    view.glyphAlpha = standOut
  } else if (exit.x === x && exit.y === y) {
    view.glyph = '>'
    view.fg = EXIT_FG
    view.mark = EXIT_MARK
    view.glyphAlpha = standOut
  } else if (item) {
    view.glyph = item.glyph
    view.fg = ITEM_FG
    view.mark = itemMark(item.id) ?? undefined
    view.glyphAlpha = standOut
  }

  return view
}
