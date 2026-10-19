/** `pnpm roguelike` 인자를 해석한 실행 방식. */
export type PlayArgs =
  | { mode: 'descent'; seed: number }
  | { mode: 'showdown'; seed: number }
  | {
      mode: 'duel'
      playerId: string
      opponentId: string
      seed: number
      /** AI 대 AI로 끝까지 돌리고 결과만 출력한다. */
      auto: boolean
      /** 주어지면 `seed`부터 이 판 수만큼 시드를 바꿔 돌려 승률을 출력한다. */
      batch: number | null
    }

/** 사용법 안내 문구. */
export const PLAY_USAGE = [
  '사용법:',
  '  pnpm roguelike [seed]                               로그라이크',
  '  pnpm roguelike showdown [seed]                      쇼다운',
  '  pnpm roguelike duel <1P> <상대> [seed]              격자 매치업 (직접 조종)',
  '  pnpm roguelike duel <1P> <상대> [seed] --auto       AI 대 AI 한 판',
  '  pnpm roguelike duel <1P> <상대> [seed] --batch <N>  AI 대 AI N판 승률',
].join('\n')

/**
 * 명령줄 인자를 실행 방식으로 해석한다.
 *
 * @param randomSeed 시드를 주지 않았을 때 쓸 값.
 * @returns 해석할 수 없으면 사람이 읽을 오류 문구.
 */
export function parsePlayArgs(
  argv: string[],
  randomSeed: number
): PlayArgs | { error: string } {
  const flags = argv.filter((a) => a.startsWith('--'))
  const words = argv.filter(
    (a, i) => !a.startsWith('--') && argv[i - 1] !== '--batch'
  )
  const seedOf = (value: string | undefined): number | null => {
    if (value === undefined) return randomSeed
    const n = Number(value)
    return Number.isInteger(n) ? n : null
  }

  if (words[0] !== 'duel') {
    if (flags.length > 0) return { error: `${flags[0]}는 duel에서만 씁니다` }
    const showdown = words[0] === 'showdown'
    const seed = seedOf(showdown ? words[1] : words[0])
    if (seed === null) return { error: '시드는 정수여야 합니다' }
    return { mode: showdown ? 'showdown' : 'descent', seed }
  }

  const [, playerId, opponentId, seedArg] = words
  if (!playerId || !opponentId) return { error: '1P와 상대 종 id가 필요합니다' }
  const batchAt = argv.indexOf('--batch')
  // 배치는 시드를 안 주면 1부터 돌려 결과를 재현할 수 있게 한다
  const seed = batchAt >= 0 && seedArg === undefined ? 1 : seedOf(seedArg)
  if (seed === null) return { error: '시드는 정수여야 합니다' }

  let batch: number | null = null
  if (batchAt >= 0) {
    batch = Number(argv[batchAt + 1])
    if (!Number.isInteger(batch) || batch < 1) {
      return { error: '--batch 뒤에는 1 이상의 판 수가 필요합니다' }
    }
  }
  const unknown = flags.find((f) => f !== '--auto' && f !== '--batch')
  if (unknown) return { error: `알 수 없는 옵션: ${unknown}` }

  return {
    mode: 'duel',
    playerId,
    opponentId,
    seed,
    auto: flags.includes('--auto'),
    batch,
  }
}
