export function getSpriteSize(lengthMm: number): number {
  const minSize = 64
  const maxSize = 128
  const minLength = 30
  const maxLength = 200
  const ratio = (lengthMm - minLength) / (maxLength - minLength)
  return Math.round(minSize + Math.max(0, Math.min(1, ratio)) * (maxSize - minSize))
}
