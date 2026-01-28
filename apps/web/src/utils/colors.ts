export function getStyleColor(
  style: string
): string {
  switch (style) {
    case 'grappler':
      return 'var(--tui-red)'
    case 'striker':
      return 'var(--tui-green)'
    case 'venomous':
      return 'var(--tui-magenta)'
    case 'defensive':
      return 'var(--tui-blue)'
    default:
      return 'var(--tui-white)'
  }
}

export function getStatStageColor(stage: number): string {
  if (stage > 0) return 'var(--tui-green)'
  if (stage < 0) return 'var(--tui-red)'
  return 'var(--tui-gray)'
}

export function formatStatStage(stage: number): string {
  if (stage === 0) return ''
  return stage > 0 ? `+${stage}` : `${stage}`
}
