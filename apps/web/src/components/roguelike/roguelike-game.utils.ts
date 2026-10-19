import {
  CUBE_GLYPH,
  showdownPlacement,
  survivorCount,
  turnsUntilShrink,
  type RunState,
} from '@super-insect-battle/roguelike'

/**
 * 게임 화면 상단에 보여줄 진행 상황.
 *
 * 탐험은 층, 쇼다운은 남은 라이벌 수·보유 파워 큐브, 격자 매치업은 모드 이름과
 * 함께 다음 가스 축소까지 남은 턴을 붙인다.
 */
export function progressLabel(run: RunState): string {
  if (run.mode === 'descent') {
    return `밀림 ${run.level.depth}층 / ${run.maxDepth}`
  }
  const parts =
    run.mode === 'duel'
      ? ['격자 매치업']
      : [
          `쇼다운 · 생존 ${survivorCount(run)}마리`,
          `${CUBE_GLYPH} ${run.player.cubes}`,
        ]
  const { zone } = run.level
  const shrink = zone ? turnsUntilShrink(zone, run.turn) : null
  if (shrink !== null) parts.push(`가스 ${shrink}턴 후 축소`)
  return parts.join(' · ')
}

/** 런이 끝났을 때의 결과 제목. 쇼다운에서 쓰러지면 순위를 붙인다. */
export function outcomeTitle(run: RunState): string {
  if (run.mode === 'duel') {
    return run.status === 'won'
      ? `${run.player.species.nameKo} 승리!`
      : `${run.player.species.nameKo} 패배...`
  }
  if (run.mode === 'showdown') {
    return run.status === 'won'
      ? '최후의 1마리!'
      : `쓰러졌다... ${showdownPlacement(run)}위`
  }
  return run.status === 'won' ? '밀림 탈출 성공!' : '쓰러졌다...'
}
