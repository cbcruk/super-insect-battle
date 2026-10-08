/**
 * 실루엣을 이루는 도형 하나. 좌표는 칸 중심을 원점으로 한 -10~10 단위 공간이며,
 * 머리가 위(-y)를 향한다.
 */
export type SilhouetteShape =
  | {
      kind: 'ellipse'
      cx: number
      cy: number
      rx: number
      ry: number
      /** 날개처럼 비쳐 보이는 부위의 불투명도. 없으면 1. */
      opacity?: number
    }
  | {
      kind: 'polygon'
      /** `[x0, y0, x1, y1, ...]` 꼭짓점 좌표. */
      points: number[]
      opacity?: number
    }
  | {
      kind: 'line'
      /** `[x0, y0, x1, y1, ...]` 꺾은선 좌표. 다리·더듬이·뿔처럼 선으로 그린다. */
      points: number[]
      width: number
    }

/** 곤충 한 종의 실루엣. 렌더러는 흰색으로 그린 뒤 tint로 색을 입힌다. */
export type Silhouette = readonly SilhouetteShape[]
