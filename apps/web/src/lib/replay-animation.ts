/** 같은 애니메이션 클래스를 다시 붙여 처음부터 재생한다. */
export function replayAnimation(
  el: HTMLElement | null,
  className: string
): void {
  if (!el) return
  el.classList.remove(className)
  void el.offsetWidth
  el.classList.add(className)
}
