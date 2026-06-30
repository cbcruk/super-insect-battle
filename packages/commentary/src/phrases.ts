import type { Magnitude } from './types'

export const ACTION_LINES = [
  (atk: string, move: string): string => `${atk} — ${move}!`,
  (atk: string, move: string): string => `${atk}, ${move}!`,
  (atk: string, move: string): string => `여기서 ${atk}, ${move}!`,
  (atk: string, move: string): string => `${atk}의 ${move}, 작렬한다!`,
]

export const RESULT_LINES: Record<Magnitude, ((def: string) => string)[]> = {
  glance: [
    (def: string): string => `하지만 ${def}, 큰 피해 없이 받아넘긴다.`,
    (def: string): string => `${def}, 가볍게 흘려낸다. 스친 정도다.`,
  ],
  solid: [
    (): string => `제대로 들어갔다.`,
    (def: string): string => `${def}, 묵직한 한 방을 허용한다.`,
    (): string => `깔끔하게 적중! 만만치 않은 타격이다.`,
  ],
  heavy: [
    (def: string): string => `깊숙이 꽂힌다 — ${def}, 크게 휘청인다!`,
    (def: string): string => `강력하다! ${def}, 균형을 잃는다.`,
  ],
  crushing: [
    (def: string): string => `엄청난 일격! ${def}, 그대로 나가떨어진다!`,
    (def: string): string => `회심의 강타! ${def}, 버텨내지 못한다!`,
  ],
}

export const CRIT_PREFIXES = ['급소다!', '정확히 급소를 노렸다!', '약점을 파고들었다!']

export const MATCHUP_UP = [
  ' 상성의 우위를 제대로 살렸다.',
  ' 흐름을 탄 공격이다.',
  '',
]

export const MATCHUP_DOWN = [
  ' 불리한 상성을 힘으로 밀어붙인다.',
  ' 상성을 거스르는 뚝심이다.',
  '',
]

export const LOW_HP_LINES = [
  (def: string): string => `${def}, 이제 한계가 가깝다...`,
  (def: string): string => `${def}, 더는 버티기 어려워 보인다.`,
  (def: string): string => `${def}, 비틀거린다. 위태롭다.`,
]

export const MISS_LINES = [
  (atk: string, move: string): string => `${atk}의 ${move}, 그러나 빗나갔다!`,
  (atk: string): string => `헛스윙! ${atk}, 허공을 가른다.`,
  (atk: string, _move: string, def: string): string =>
    `${def}, 가볍게 피해낸다. ${atk}, 아쉬운 한 수.`,
]

export const FAINT_LINES = [
  (name: string): string => `${name}, 쓰러졌다! 더 이상 일어서지 못한다.`,
  (name: string): string => `${name}, 무너진다 — 승부가 갈렸다!`,
]
