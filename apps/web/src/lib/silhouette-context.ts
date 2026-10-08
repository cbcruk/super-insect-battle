import { GraphicsContext, type ColorSource } from 'pixi.js'
import { SILHOUETTE_SPAN } from './insect-silhouette.ts'
import type { Silhouette } from './insect-silhouette.types.ts'

/**
 * 실루엣 도형을 `ctx`에 칸 크기(px)로 확대해 `(ox, oy)`를 중심으로 그린다.
 *
 * 무대는 곤충처럼 움직이는 것은 종별 컨텍스트로, 지형·아이템 무늬는 타일 그래픽에 직접 그린다.
 */
export function drawShapes(
  ctx: GraphicsContext,
  silhouette: Silhouette,
  ox: number,
  oy: number,
  cell: number,
  color: ColorSource,
  alpha = 1
): void {
  const k = cell / SILHOUETTE_SPAN
  const place = (points: number[]): number[] =>
    points.map((v, i) => v * k + (i % 2 === 0 ? ox : oy))
  for (const shape of silhouette) {
    if (shape.kind === 'ellipse') {
      ctx
        .ellipse(
          ox + shape.cx * k,
          oy + shape.cy * k,
          shape.rx * k,
          shape.ry * k
        )
        .fill({ color, alpha: alpha * (shape.opacity ?? 1) })
    } else if (shape.kind === 'polygon') {
      ctx
        .poly(place(shape.points))
        .fill({ color, alpha: alpha * (shape.opacity ?? 1) })
    } else {
      ctx.poly(place(shape.points), false).stroke({
        width: shape.width * k,
        color,
        alpha,
        cap: 'round',
        join: 'round',
      })
    }
  }
}

/**
 * 실루엣을 칸 크기(px)에 맞춘 흰색 Pixi 그래픽 컨텍스트로 만든다.
 *
 * 원점이 칸 중심이므로 그래픽을 칸 중심에 두면 된다. 색은 그래픽의 `tint`로 입힌다.
 */
export function silhouetteContext(
  silhouette: Silhouette,
  cell: number
): GraphicsContext {
  const ctx = new GraphicsContext()
  drawShapes(ctx, silhouette, 0, 0, cell, 0xffffff)
  return ctx
}
