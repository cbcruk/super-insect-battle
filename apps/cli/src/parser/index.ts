/**
 * 파싱된 명령어
 */
export interface ParsedCommand {
  /** 명령어 (소문자) */
  command: string
  /** 인자들 */
  args: string[]
  /** 원본 입력 */
  raw: string
  /** 숫자 단축키 입력 여부 */
  isNumericShortcut: boolean
  /** 숫자 값 (숫자 단축키인 경우) */
  numericValue?: number
}

/** 명령어 별칭 -> 표준 명령어 매핑 */
const commandAliases: Record<string, string> = {
  l: 'look',
  보기: 'look',
  go: 'go',
  이동: 'go',
  가: 'go',
  team: 'team',
  팀: 'team',
  t: 'team',
  battle: 'battle',
  배틀: 'battle',
  싸움: 'battle',
  b: 'battle',
  use: 'use',
  사용: 'use',
  u: 'use',
  run: 'run',
  도망: 'run',
  switch: 'switch',
  교체: 'switch',
  heal: 'heal',
  회복: 'heal',
  치료: 'heal',
  h: 'heal',
  help: 'help',
  도움말: 'help',
  '?': 'help',
  quit: 'quit',
  exit: 'quit',
  종료: 'quit',
  q: 'quit',
}

/**
 * 입력 문자열을 명령어로 파싱
 * 숫자만 입력된 경우 단축키로 처리, 그 외는 명령어+인자로 분리
 * @param input - 사용자 입력 문자열
 * @returns 파싱된 명령어 객체
 */
export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim()

  if (/^\d+$/.test(trimmed)) {
    return {
      command: '__numeric__',
      args: [],
      raw: trimmed,
      isNumericShortcut: true,
      numericValue: parseInt(trimmed, 10),
    }
  }

  const parts = trimmed.split(/\s+/)
  const rawCommand = parts[0]?.toLowerCase() ?? ''
  const args = parts.slice(1)
  const command = commandAliases[rawCommand] ?? rawCommand

  return {
    command,
    args,
    raw: trimmed,
    isNumericShortcut: false,
  }
}

/**
 * 빈 입력인지 확인
 * @param input - 사용자 입력
 * @returns 빈 문자열이면 true
 */
export function isEmptyInput(input: string): boolean {
  return input.trim().length === 0
}
