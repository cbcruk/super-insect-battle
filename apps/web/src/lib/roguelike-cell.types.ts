import type { Arthropod } from '@super-insect-battle/engine'
import type { Silhouette } from './insect-silhouette.types.ts'

/** 맵 한 칸을 그리는 데 필요한 모든 것. 렌더러는 이 값만 보고 그린다. */
export interface CellView {
  bg: string
  /** 칸을 나타내는 글리프. 무늬·실루엣이 없을 때만 글자로 그린다. */
  glyph: string
  fg: string
  /** 칸 배경·지형의 밝기. 보이는 칸은 플레이어와의 거리에 따라 0.55~1, 발견만 한 칸은 0.4. */
  alpha: number
  /** 글리프의 밝기. 곤충·아이템·출구는 보이는 동안 거리와 무관하게 1. */
  glyphAlpha: number
  /** 지형·아이템·출구 무늬. 있으면 렌더러는 글리프 대신 이 무늬를 `fg` 색으로 그린다. */
  mark?: Silhouette
  /** 칸에 서 있는 액터의 id. */
  actorId?: string
  /** 칸에 서 있는 곤충의 종. 렌더러는 글리프 대신 이 종의 실루엣을 그린다. */
  species?: Arthropod
  /** 치명 위협 적이 서 있어 테두리로 강조할 칸인가. */
  deadly: boolean
}
