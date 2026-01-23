import type { Action } from '../types/action'

export const actions: Record<string, Action> = {
  horn_lift: {
    id: 'horn_lift',
    name: 'Horn Lift',
    nameKo: '뿔로 들어올리기',
    category: 'attack',
    power: 85,
    accuracy: 90,
    priority: 0,
    description: 'Lifts the opponent with powerful horn and throws them.',
  },

  horn_thrust: {
    id: 'horn_thrust',
    name: 'Horn Thrust',
    nameKo: '뿔 찌르기',
    category: 'attack',
    power: 70,
    accuracy: 95,
    priority: 1,
    description: 'Quick thrust with the horn. Strikes first.',
  },

  shell_guard: {
    id: 'shell_guard',
    name: 'Shell Guard',
    nameKo: '갑각 방어',
    category: 'defense',
    power: 0,
    accuracy: 100,
    priority: 0,
    effect: {
      type: 'buff',
      target: 'self',
      statChange: { stat: 'defense', stages: 2 },
    },
    description: 'Hardens shell to greatly increase defense.',
  },

  grapple: {
    id: 'grapple',
    name: 'Grapple',
    nameKo: '붙잡기',
    category: 'attack',
    power: 60,
    accuracy: 85,
    priority: 0,
    effect: {
      type: 'status',
      target: 'opponent',
      condition: 'bind',
    },
    description: 'Grabs opponent tightly. May bind them.',
  },

  pincer_crush: {
    id: 'pincer_crush',
    name: 'Pincer Crush',
    nameKo: '집게로 조이기',
    category: 'attack',
    power: 80,
    accuracy: 90,
    priority: 0,
    description: 'Crushes opponent with powerful mandibles.',
  },

  pincer_grip: {
    id: 'pincer_grip',
    name: 'Pincer Grip',
    nameKo: '집게 물기',
    category: 'attack',
    power: 65,
    accuracy: 95,
    priority: 0,
    effect: {
      type: 'debuff',
      target: 'opponent',
      statChange: { stat: 'evasion', stages: -1 },
    },
    description: 'Grips opponent, reducing their evasion.',
  },

  quick_snip: {
    id: 'quick_snip',
    name: 'Quick Snip',
    nameKo: '재빠른 집기',
    category: 'attack',
    power: 50,
    accuracy: 100,
    priority: 1,
    description: 'Fast snipping attack. Always strikes first.',
  },

  venom_strike: {
    id: 'venom_strike',
    name: 'Venom Strike',
    nameKo: '독침 공격',
    category: 'attack',
    power: 75,
    accuracy: 90,
    priority: 0,
    effect: {
      type: 'status',
      target: 'opponent',
      condition: 'poison',
    },
    description: 'Strikes with venomous stinger. May poison.',
  },

  pincer_grab: {
    id: 'pincer_grab',
    name: 'Pincer Grab',
    nameKo: '집게 잡기',
    category: 'attack',
    power: 55,
    accuracy: 95,
    priority: 0,
    description: 'Grabs with pincers to set up for stinger.',
  },

  tail_whip: {
    id: 'tail_whip',
    name: 'Tail Whip',
    nameKo: '꼬리 휘두르기',
    category: 'attack',
    power: 60,
    accuracy: 100,
    priority: 0,
    effect: {
      type: 'debuff',
      target: 'opponent',
      statChange: { stat: 'defense', stages: -1 },
    },
    description: 'Whips with tail, lowering defense.',
  },

  toxic_sting: {
    id: 'toxic_sting',
    name: 'Toxic Sting',
    nameKo: '맹독 찌르기',
    category: 'special',
    power: 90,
    accuracy: 80,
    priority: 0,
    effect: {
      type: 'status',
      target: 'opponent',
      condition: 'poison',
    },
    description: 'Powerful venomous sting. High poison chance.',
  },

  fang_bite: {
    id: 'fang_bite',
    name: 'Fang Bite',
    nameKo: '독니 물기',
    category: 'attack',
    power: 70,
    accuracy: 90,
    priority: 0,
    effect: {
      type: 'status',
      target: 'opponent',
      condition: 'poison',
    },
    description: 'Bites with venomous fangs. May poison.',
  },

  web_trap: {
    id: 'web_trap',
    name: 'Web Trap',
    nameKo: '거미줄 덫',
    category: 'special',
    power: 0,
    accuracy: 85,
    priority: 0,
    effect: {
      type: 'status',
      target: 'opponent',
      condition: 'bind',
    },
    description: 'Traps opponent in sticky web.',
  },

  hair_flick: {
    id: 'hair_flick',
    name: 'Hair Flick',
    nameKo: '털 날리기',
    category: 'defense',
    power: 30,
    accuracy: 100,
    priority: 1,
    effect: {
      type: 'debuff',
      target: 'opponent',
      statChange: { stat: 'evasion', stages: -1 },
    },
    description: 'Flicks urticating hairs. Irritates opponent.',
  },

  venom_inject: {
    id: 'venom_inject',
    name: 'Venom Inject',
    nameKo: '독 주입',
    category: 'special',
    power: 85,
    accuracy: 85,
    priority: 0,
    effect: {
      type: 'status',
      target: 'opponent',
      condition: 'poison',
    },
    description: 'Injects concentrated venom directly.',
  },

  scythe_strike: {
    id: 'scythe_strike',
    name: 'Scythe Strike',
    nameKo: '낫다리 베기',
    category: 'attack',
    power: 85,
    accuracy: 95,
    priority: 0,
    description: 'Slashes with razor-sharp forelegs.',
  },

  rapid_slash: {
    id: 'rapid_slash',
    name: 'Rapid Slash',
    nameKo: '연속 베기',
    category: 'attack',
    power: 55,
    accuracy: 100,
    priority: 1,
    description: 'Quick consecutive slashes. Strikes first.',
  },

  ambush: {
    id: 'ambush',
    name: 'Ambush',
    nameKo: '기습',
    category: 'attack',
    power: 95,
    accuracy: 85,
    priority: 0,
    description: 'Surprise attack from concealment. High power.',
  },

  death_grip: {
    id: 'death_grip',
    name: 'Death Grip',
    nameKo: '죽음의 움켜쥠',
    category: 'attack',
    power: 75,
    accuracy: 90,
    priority: 0,
    effect: {
      type: 'status',
      target: 'opponent',
      condition: 'bind',
    },
    description: 'Seizes prey in unbreakable grip. May bind.',
  },

  forcipule_bite: {
    id: 'forcipule_bite',
    name: 'Forcipule Bite',
    nameKo: '악턱 물기',
    category: 'attack',
    power: 80,
    accuracy: 90,
    priority: 0,
    effect: {
      type: 'status',
      target: 'opponent',
      condition: 'poison',
    },
    description: 'Bites with venomous forcipules. May poison.',
  },

  coil_crush: {
    id: 'coil_crush',
    name: 'Coil Crush',
    nameKo: '휘감아 조이기',
    category: 'attack',
    power: 70,
    accuracy: 85,
    priority: 0,
    effect: {
      type: 'status',
      target: 'opponent',
      condition: 'bind',
    },
    description: 'Wraps around opponent and squeezes. May bind.',
  },

  leg_swarm: {
    id: 'leg_swarm',
    name: 'Leg Swarm',
    nameKo: '다리 폭풍',
    category: 'attack',
    power: 60,
    accuracy: 100,
    priority: 0,
    description: 'Attacks with a flurry of many legs.',
  },
}

export const actionList = Object.values(actions)

export function getActionById(id: string): Action | undefined {
  return actions[id]
}

export function getActionsByIds(ids: string[]): Action[] {
  return ids
    .map((id) => actions[id])
    .filter((a): a is Action => a !== undefined)
}
