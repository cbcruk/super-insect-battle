/** `[x0, y0, x1, y1, ...]` 좌표 배열을 SVG `points` 속성 문자열로 바꾼다. */
export function pointList(points: number[]): string {
  const pairs: string[] = []
  for (let i = 0; i < points.length; i += 2) {
    pairs.push(`${points[i]},${points[i + 1]}`)
  }
  return pairs.join(' ')
}
