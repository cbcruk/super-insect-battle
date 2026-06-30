export const STYLE_COLORS: Record<string, number> = {
  grappler: 0xe07a3f,
  striker: 0xe0c63f,
  venomous: 0x9b59d6,
  defensive: 0x4a9bd6,
}

export function colorForStyle(style: string): number {
  return STYLE_COLORS[style] ?? 0x888888
}
