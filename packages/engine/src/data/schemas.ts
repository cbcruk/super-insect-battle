import { z } from 'zod'

export const WeaponTypeSchema = z.enum([
  'horn',
  'mandible',
  'stinger',
  'fang',
  'foreleg',
  'leg',
])

export const BehaviorStyleSchema = z.enum([
  'grappler',
  'striker',
  'venomous',
  'defensive',
])

export const PhysicalStatsSchema = z.object({
  weightG: z.number().positive(),
  lengthMm: z.number().positive(),
  strengthIndex: z.number().min(0).max(100),
})

export const WeaponStatsSchema = z.object({
  type: WeaponTypeSchema,
  power: z.number().min(0).max(100),
  venomous: z.boolean(),
  venomPotency: z.number().min(0).max(100).optional(),
})

export const BehaviorStatsSchema = z.object({
  aggression: z.number().min(0).max(100),
  style: BehaviorStyleSchema,
})

export const DefenseStatsSchema = z.object({
  armorRating: z.number().min(0).max(100),
  evasion: z.number().min(0).max(100),
})

export const ArthropodSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameKo: z.string(),
  physical: PhysicalStatsSchema,
  weapon: WeaponStatsSchema,
  behavior: BehaviorStatsSchema,
  defense: DefenseStatsSchema,
  actions: z.array(z.string()),
  description: z.string(),
})

export const StatusConditionSchema = z.enum(['poison', 'bind'])

export const ActionCategorySchema = z.enum(['attack', 'defense', 'special'])

export const ActionEffectSchema = z.object({
  type: z.enum(['damage', 'status', 'buff', 'debuff']),
  target: z.enum(['self', 'opponent']),
  condition: StatusConditionSchema.optional(),
  statChange: z
    .object({
      stat: z.enum(['strength', 'defense', 'evasion']),
      stages: z.number(),
    })
    .optional(),
})

export const ActionSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameKo: z.string(),
  category: ActionCategorySchema,
  power: z.number().min(0),
  accuracy: z.number().min(0).max(100),
  priority: z.number(),
  effect: ActionEffectSchema.optional(),
  description: z.string(),
})

export const StyleMatchupSchema = z.record(
  BehaviorStyleSchema,
  z.record(BehaviorStyleSchema, z.number())
)

export const WeaponVsArmorSchema = z.record(
  WeaponTypeSchema,
  z.object({
    softBonus: z.number(),
    hardPenalty: z.number(),
  })
)

export const ArthropodsDataSchema = z.record(z.string(), ArthropodSchema)
export const ActionsDataSchema = z.record(z.string(), ActionSchema)
