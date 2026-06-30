function hasFinalConsonant(word: string): boolean {
  const lastChar = word.charCodeAt(word.length - 1)
  if (Number.isNaN(lastChar)) return false
  if (lastChar < 0xac00 || lastChar > 0xd7a3) return false
  return (lastChar - 0xac00) % 28 !== 0
}

export function eunNeun(word: string): string {
  return hasFinalConsonant(word) ? '은' : '는'
}

export function iGa(word: string): string {
  return hasFinalConsonant(word) ? '이' : '가'
}

export function eulReul(word: string): string {
  return hasFinalConsonant(word) ? '을' : '를'
}

export function euroRo(word: string): string {
  return hasFinalConsonant(word) ? '으로' : '로'
}
