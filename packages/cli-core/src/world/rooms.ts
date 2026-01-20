import type { Room } from '../game/types'
import { generatedRooms } from './rooms.generated'

export const rooms: Record<string, Room> = generatedRooms

export const directionAliases: Record<string, string> = {
  북: '북',
  남: '남',
  동: '동',
  서: '서',
  북쪽: '북',
  남쪽: '남',
  동쪽: '동',
  서쪽: '서',
  n: '북',
  s: '남',
  e: '동',
  w: '서',
  north: '북',
  south: '남',
  east: '동',
  west: '서',
}

export function getRoom(roomId: string): Room | undefined {
  return rooms[roomId]
}

export function normalizeDirection(input: string): string | undefined {
  return directionAliases[input.toLowerCase()]
}
