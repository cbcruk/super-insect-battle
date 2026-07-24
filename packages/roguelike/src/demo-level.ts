import { getArthropodById } from '@super-insect-battle/engine'
import type { Actor } from './actor'
import { createActor } from './actor'
import { createBasicBrain } from './ai/basic-brain'
import { tileMapFromStrings } from './map'
import type { Level } from './run'

/**
 * P1 수제 밀림 레벨. 절차 생성(rot.js)은 P2.
 * @ 시작 부근, > 출구(우하단), 사이에 적 곤충 · 수풀(") · 물(~).
 */
const LAYOUT = [
  '##############',
  '#............#',
  '#..""..~~....#',
  '#..""..~~....#',
  '#............#',
  '#....####....#',
  '#............#',
  '#............#',
  '##############',
]

export interface DemoSetup {
  level: Level
  player: Actor
}

export function makeDemoLevel(): DemoSetup {
  const map = tileMapFromStrings(LAYOUT)

  const mantis = getArthropodById('mantis')
  const scorpion = getArthropodById('scorpion')
  const centipede = getArthropodById('centipede')
  if (!mantis || !scorpion || !centipede) {
    throw new Error('데모에 필요한 절지동물 데이터가 없습니다.')
  }

  const player = createActor('player', mantis, { x: 1, y: 1 }, 'player', {
    glyph: '@',
  })

  const enemyA = createActor('scorpion', scorpion, { x: 9, y: 4 }, 'hostile', {
    glyph: 'S',
    brain: createBasicBrain(),
  })
  const enemyB = createActor(
    'centipede',
    centipede,
    { x: 6, y: 7 },
    'hostile',
    {
      glyph: 'C',
      brain: createBasicBrain(),
    }
  )

  const level: Level = {
    depth: 1,
    map,
    actors: [player, enemyA, enemyB],
    environment: { terrain: 'forest', timeOfDay: 'day', weather: 'clear' },
    exit: { x: 12, y: 7 },
  }

  return { level, player }
}
