import { iGa } from './particles'

export const ARENA_INTRO_LINES = [
  (turns: number): string =>
    `밀림 아레나, 독가스는 ${turns}턴 뒤부터 조여 온다.`,
  (turns: number): string =>
    `${turns}턴이 지나면 독가스가 경기장을 좁혀 온다. 숨을 곳은 수풀뿐!`,
]

export const AMBUSH_LINES = [
  (atk: string): string => `수풀 속에서 ${atk}${iGa(atk)} 튀어나온다!`,
  (atk: string): string => `매복이다! 풀숲에 숨어 있던 ${atk}!`,
  (atk: string): string => `${atk}, 수풀을 박차고 기습한다!`,
]

export const RANGED_LINES = [
  (atk: string, cells: number): string => `${atk}, ${cells}칸 밖에서 노린다.`,
  (atk: string): string => `${atk}, 거리를 둔 채 견제에 나선다.`,
  (atk: string): string => `${atk}, 다가오기 전에 먼저 쏘아붙인다!`,
]

export const HIDE_LINES = [
  (name: string): string => `${name}, 수풀 속으로 몸을 숨긴다.`,
  (name: string): string => `${name}${iGa(name)} 풀숲으로 사라진다.`,
]

export const GAS_SHRINK_LINES = [
  (radius: number): string =>
    `독가스가 조여 온다! 안전지대가 반경 ${radius}칸으로 줄었다.`,
  (radius: number): string =>
    `경기장이 좁아진다 — 남은 안전지대 반경 ${radius}칸.`,
]

export const GAS_LAST_LINES = [
  (): string => `안전지대는 이제 한가운데 한 칸뿐!`,
]

export const GAS_DAMAGE_LINES = [
  (name: string): string => `${name}, 독가스에 휩싸여 괴로워한다!`,
  (name: string): string => `${name}${iGa(name)} 가스 속에서 버티고 있다!`,
  (name: string): string => `${name}, 독가스를 피하지 못했다!`,
]
