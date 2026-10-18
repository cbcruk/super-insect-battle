import {
  showdownPlacement,
  survivorCount,
  type RunState,
} from '@super-insect-battle/roguelike'

/** 게임 화면 상단에 보여줄 진행 상황. 탐험은 층, 쇼다운은 남은 라이벌 수. */
export function progressLabel(run: RunState): string {
  return run.mode === 'showdown'
    ? `쇼다운 · 생존 ${survivorCount(run)}마리`
    : `밀림 ${run.level.depth}층 / ${run.maxDepth}`
}

/** 런이 끝났을 때의 결과 제목. 쇼다운에서 쓰러지면 순위를 붙인다. */
export function outcomeTitle(run: RunState): string {
  if (run.mode === 'showdown') {
    return run.status === 'won'
      ? '최후의 1마리!'
      : `쓰러졌다... ${showdownPlacement(run)}위`
  }
  return run.status === 'won' ? '밀림 탈출 성공!' : '쓰러졌다...'
}
