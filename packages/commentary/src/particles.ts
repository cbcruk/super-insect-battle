const RIEUL = 8

function finalConsonant(word: string): number {
  const lastChar = word.charCodeAt(word.length - 1)
  if (Number.isNaN(lastChar)) return 0
  if (lastChar < 0xac00 || lastChar > 0xd7a3) return 0
  return (lastChar - 0xac00) % 28
}

function hasFinalConsonant(word: string): boolean {
  return finalConsonant(word) !== 0
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
  const final = finalConsonant(word)
  return final === 0 || final === RIEUL ? '로' : '으로'
}
