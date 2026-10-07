/** 맵 한 칸을 그리는 데 필요한 모든 것. 렌더러는 이 값만 보고 그린다. */
export interface CellView {
  bg: string
  /** 칸에 표시할 글리프. 바닥(`.`)은 글자 대신 옅은 점으로 그린다. */
  glyph: string
  fg: string
  /** 시야 밖이지만 발견한 칸은 0.4, 보이는 칸은 1. */
  alpha: number
  /** 치명 위협 적이 서 있어 테두리로 강조할 칸인가. */
  deadly: boolean
}
