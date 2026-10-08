import { GraphicsContext } from 'pixi.js'
import { SILHOUETTE_SPAN } from './insect-silhouette.ts'
import type { Silhouette } from './insect-silhouette.types.ts'

/**
 * 실루엣을 칸 크기(px)에 맞춘 흰색 Pixi 그래픽 컨텍스트로 만든다.
 *
 * 원점이 칸 중심이므로 그래픽을 칸 중심에 두면 된다. 색은 그래픽의 `tint`로 입힌다.
 */
export function silhouetteContext(
  silhouette: Silhouette,
  cell: number
): GraphicsContext {
  const k = cell / SILHOUETTE_SPAN
  const ctx = new GraphicsContext()
  for (const shape of silhouette) {
    if (shape.kind === 'ellipse') {
      ctx
        .ellipse(shape.cx * k, shape.cy * k, shape.rx * k, shape.ry * k)
        .fill({ color: 0xffffff, alpha: shape.opacity ?? 1 })
    } else if (shape.kind === 'polygon') {
      ctx
        .poly(shape.points.map((v) => v * k))
        .fill({ color: 0xffffff, alpha: shape.opacity ?? 1 })
    } else {
      ctx.poly(
        shape.points.map((v) => v * k),
        false
      )
      ctx.stroke({
        width: shape.width * k,
        color: 0xffffff,
        cap: 'round',
        join: 'round',
      })
    }
  }
  return ctx
}
