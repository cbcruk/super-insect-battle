import type { CommentaryLine } from '@super-insect-battle/commentary'

/** 화면에 쌓인 중계 한 줄. `id`는 줄마다 고유하다. */
export interface CommentaryItem {
  id: number
  line: CommentaryLine
}
