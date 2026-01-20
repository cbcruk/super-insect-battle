export interface IndividualValues {
  hp: number
  atk: number
  def: number
  spAtk: number
  spDef: number
  spd: number
}

export interface WeightedInsect {
  id: string
  weight: number
}

export function rollEncounter(rate: number): boolean {
  return Math.random() * 100 < rate
}

export function generateIVs(): IndividualValues {
  return {
    hp: Math.floor(Math.random() * 32),
    atk: Math.floor(Math.random() * 32),
    def: Math.floor(Math.random() * 32),
    spAtk: Math.floor(Math.random() * 32),
    spDef: Math.floor(Math.random() * 32),
    spd: Math.floor(Math.random() * 32),
  }
}

export function selectWeightedInsect(insects: WeightedInsect[]): string {
  const totalWeight = insects.reduce((sum, i) => sum + i.weight, 0)
  let random = Math.random() * totalWeight

  for (const insect of insects) {
    random -= insect.weight
    if (random <= 0) {
      return insect.id
    }
  }

  return insects[insects.length - 1].id
}

export function selectRandomInsect(insectIds: string[]): string {
  return insectIds[Math.floor(Math.random() * insectIds.length)]
}

export function applyIVsToStats(
  baseStats: { hp: number; atk: number; def: number; spAtk: number; spDef: number; spd: number },
  ivs: IndividualValues,
  level: number = 50
): { hp: number; atk: number; def: number; spAtk: number; spDef: number; spd: number } {
  const calcStat = (base: number, iv: number): number => {
    return Math.floor(((2 * base + iv) * level) / 100 + 5)
  }

  const calcHp = (base: number, iv: number): number => {
    return Math.floor(((2 * base + iv) * level) / 100 + level + 10)
  }

  return {
    hp: calcHp(baseStats.hp, ivs.hp),
    atk: calcStat(baseStats.atk, ivs.atk),
    def: calcStat(baseStats.def, ivs.def),
    spAtk: calcStat(baseStats.spAtk, ivs.spAtk),
    spDef: calcStat(baseStats.spDef, ivs.spDef),
    spd: calcStat(baseStats.spd, ivs.spd),
  }
}
