export interface ParsedCommand {
  command: string
  args: string[]
  raw: string
  isNumericShortcut: boolean
  numericValue?: number
}

const commandAliases: Record<string, string> = {
  l: 'look',
  보기: 'look',
  go: 'go',
  이동: 'go',
  가: 'go',
  team: 'team',
  팀: 'team',
  t: 'team',
  item: 'item',
  items: 'item',
  아이템: 'item',
  인벤토리: 'item',
  i: 'item',
  battle: 'battle',
  배틀: 'battle',
  싸움: 'battle',
  b: 'battle',
  use: 'use',
  사용: 'use',
  u: 'use',
  buy: 'buy',
  구매: 'buy',
  사다: 'buy',
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

export function isEmptyInput(input: string): boolean {
  return input.trim().length === 0
}
