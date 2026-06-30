import type { Magnitude, MoveIntent, NoteCause } from './types'
import { euroRo, eulReul } from './particles'

export const INTRO_LINES = [
  (p: string, o: string, env: string): string =>
    `${p} 대 ${o} — ${env}에서의 일전이 시작된다!`,
  (p: string, o: string, env: string): string =>
    `${env}, 두 강자가 마주 선다. ${p} 그리고 ${o}!`,
  (p: string, o: string, env: string): string =>
    `결투의 막이 오른다 — ${p} vs ${o}, 무대는 ${env}.`,
]

export const ACTION_LINES = [
  (atk: string, move: string): string => `${atk} — ${move}!`,
  (atk: string, move: string): string => `${atk}, ${move}!`,
  (atk: string, move: string): string => `여기서 ${atk}, ${move}!`,
  (atk: string, move: string): string => `${atk}의 ${move}, 작렬한다!`,
  (atk: string, move: string): string => `${atk}, 기회를 놓치지 않고 ${move}!`,
  (atk: string, move: string): string => `${atk}, 망설임 없이 ${move}!`,
]

export const RESULT_LINES: Record<Magnitude, ((def: string) => string)[]> = {
  glance: [
    (def: string): string => `하지만 ${def}, 큰 피해 없이 받아넘긴다.`,
    (def: string): string => `${def}, 가볍게 흘려낸다. 스친 정도다.`,
    (def: string): string => `${def}, 한발 물러서며 충격을 덜어낸다.`,
  ],
  solid: [
    (): string => `제대로 들어갔다.`,
    (def: string): string => `${def}, 묵직한 한 방을 허용한다.`,
    (): string => `깔끔하게 적중! 만만치 않은 타격이다.`,
    (def: string): string => `${def}, 정통으로 얻어맞는다.`,
  ],
  heavy: [
    (def: string): string => `깊숙이 꽂힌다 — ${def}, 크게 휘청인다!`,
    (def: string): string => `강력하다! ${def}, 균형을 잃는다.`,
    (def: string): string => `${def}, 비명을 지르며 밀려난다!`,
  ],
  crushing: [
    (def: string): string => `엄청난 일격! ${def}, 그대로 나가떨어진다!`,
    (def: string): string => `회심의 강타! ${def}, 버텨내지 못한다!`,
    (def: string): string => `폭발적인 한 방! ${def}, 속절없이 무너진다!`,
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

export const STATUS_APPLIED_LINES = [
  (def: string, status: string): string => `그리고 ${def}, ${status} 상태에 빠진다!`,
  (def: string, status: string): string => `설상가상 — ${def}, ${status}에 걸렸다!`,
  (def: string, status: string): string => `${def}, ${status}의 늪에 빠진다.`,
]

export const MISS_LINES = [
  (atk: string, move: string): string => `${atk}의 ${move}, 그러나 빗나갔다!`,
  (atk: string): string => `헛스윙! ${atk}, 허공을 가른다.`,
  (atk: string, _move: string, def: string): string =>
    `${def}, 가볍게 피해낸다. ${atk}, 아쉬운 한 수.`,
  (atk: string): string => `${atk}, 빗맞았다. 기회를 날린다.`,
]

export const MOVE_LINES: Record<MoveIntent, ((atk: string, move: string) => string)[]> = {
  guard: [
    (atk: string, move: string): string =>
      `${atk}, ${move}${euroRo(move)} 자세를 가다듬는다.`,
    (atk: string, move: string): string => `${atk} — ${move}. 다음 수를 노린다.`,
  ],
  brace: [
    (atk: string): string => `${atk}, 잔뜩 웅크린다 — 다가올 공격에 대비한다!`,
    (atk: string): string => `${atk}, 단단히 몸을 사린다. 방어 태세!`,
  ],
  flee: [
    (atk: string): string => `${atk}, 거리를 벌리며 도망 태세를 취한다!`,
    (atk: string): string => `${atk}, 슬그머니 발을 뺀다 — 회피에 전념한다.`,
  ],
  defenseUp: [
    (atk: string, move: string): string => `${atk}, ${move}! 방어를 단단히 굳힌다.`,
    (atk: string, move: string): string =>
      `${atk}, ${move}${euroRo(move)} 수비를 끌어올린다.`,
  ],
  evasionUp: [
    (atk: string, move: string): string => `${atk}, ${move}! 몸놀림이 한층 날래진다.`,
    (atk: string): string => `${atk}, 자세를 낮춘다 — 회피 태세를 가다듬는다.`,
  ],
  strengthUp: [
    (atk: string, move: string): string => `${atk}, ${move}! 투지를 끌어올린다.`,
    (atk: string): string => `${atk}, 기세를 폭발시킨다 — 공격력이 치솟는다!`,
  ],
  weaken: [
    (atk: string, move: string): string => `${atk}, ${move}! 상대의 기세를 꺾는다.`,
    (atk: string): string => `${atk}, 상대를 윽박지른다 — 힘이 빠지게 만든다.`,
  ],
  blind: [
    (atk: string, move: string): string => `${atk}, ${move}! 상대의 시야를 흐린다.`,
    (atk: string): string => `${atk}, 상대의 감각을 교란한다 — 회피가 둔해진다.`,
  ],
  ensnare: [
    (atk: string, move: string): string => `${atk}, ${move}! 상대를 옭아맨다.`,
    (atk: string): string => `${atk}, 덫을 친다 — 상대의 발이 묶인다!`,
  ],
  confuse: [
    (atk: string, move: string): string => `${atk}, ${move}! 상대의 정신을 뒤흔든다.`,
    (atk: string): string => `${atk}, 상대를 교란한다 — 혼란에 빠뜨린다!`,
  ],
  envenom: [
    (atk: string, move: string): string => `${atk}, ${move}! 상대에게 독을 퍼뜨린다.`,
    (atk: string): string => `${atk}, 은밀히 독을 흘려넣는다.`,
  ],
}

export const NOTE_LINES: Record<
  Exclude<NoteCause, 'other'>,
  ((name: string) => string)[]
> = {
  poison: [
    (n: string): string => `독이 ${n}의 온몸으로 퍼진다 — 살이 타들어간다.`,
    (n: string): string => `${n}, 독에 신음한다. 체력이 갉아먹힌다.`,
  ],
  burn: [
    (n: string): string => `불길이 ${n}${eulReul(n)} 핥는다 — 고통스럽다.`,
    (n: string): string => `${n}, 화상의 열기에 몸부림친다.`,
  ],
  paralysis: [
    (n: string): string => `${n}, 마비되어 꼼짝도 못 한다!`,
    (n: string): string => `${n}, 몸이 말을 듣지 않는다 — 기회를 놓친다.`,
  ],
  bind: [
    (n: string): string => `${n}, 옭매인 채 발버둥치지만 빠져나오지 못한다.`,
    (n: string): string => `${n}, 속박을 풀지 못하고 묶여 있다.`,
  ],
  freed: [
    (n: string): string => `${n}, 마침내 속박을 끊어낸다!`,
    (n: string): string => `${n}, 몸을 비틀어 옭아맴에서 풀려난다!`,
  ],
  confusion: [
    (n: string): string => `${n}, 혼란에 빠져 제 몸을 친다!`,
    (n: string): string => `${n}, 갈피를 못 잡고 헛손질한다.`,
  ],
  sleep: [
    (n: string): string => `${n}, 깊은 잠에 빠져 미동도 없다...`,
    (n: string): string => `${n}, 곤히 잠들어 무방비 상태다.`,
  ],
  wake: [
    (n: string): string => `${n}, 번쩍 깨어난다!`,
    (n: string): string => `${n}, 정신을 차리고 몸을 일으킨다!`,
  ],
}

export const STREAK_LINES = [
  (name: string): string => `${name}, 완전히 흐름을 휘어잡았다! 파상공세가 멈추질 않는다.`,
  (name: string): string => `${name}, 연이은 적중 — 상대가 손쓸 틈이 없다!`,
  (name: string): string => `몰아치는 ${name}! 경기를 완전히 지배한다.`,
]

export const TURNAROUND_LINES = [
  (name: string): string => `흐름이 뒤집힌다 — ${name}, 단숨에 앞서 나간다!`,
  (name: string): string => `반전이다! 밀리던 ${name}, 전세를 역전시킨다.`,
  (name: string): string => `${name}, 기어이 흐름을 가져온다. 경기가 뒤집혔다!`,
]

export const FAINT_LINES = [
  (name: string): string => `${name}, 쓰러졌다! 더 이상 일어서지 못한다.`,
  (name: string): string => `${name}, 무너진다 — 승부가 갈렸다!`,
  (name: string): string => `${name}, 끝내 버티지 못하고 주저앉는다.`,
]
