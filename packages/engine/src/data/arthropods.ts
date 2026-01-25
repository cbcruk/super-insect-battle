import type { Arthropod } from '../types/arthropod'
import { arthropodsData } from './generated/arthropods.gen'
import { ArthropodsDataSchema } from './schemas'

const validated = ArthropodsDataSchema.parse(arthropodsData)

export const arthropods: Record<string, Arthropod> = validated

export const arthropodList = Object.values(arthropods)

export function getArthropodById(id: string): Arthropod | undefined {
  return arthropods[id]
}
