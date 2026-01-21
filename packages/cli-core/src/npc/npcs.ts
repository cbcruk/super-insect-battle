import type { Npc } from './types'

export const npcs: Record<string, Npc> = {
  nurse_joy: {
    id: 'nurse_joy',
    name: '간호사 조이',
    type: 'healer',
    description: '곤충 센터에서 일하는 친절한 간호사',
    dialogue: [
      { text: '안녕하세요! 곤충 센터에 오신 것을 환영합니다.' },
      { text: '곤충들을 치료해 드릴까요?' },
    ],
    actions: [
      { id: 'heal', label: '치료하기', type: 'heal' },
    ],
  },

  old_man: {
    id: 'old_man',
    name: '마을 어르신',
    type: 'villager',
    description: '마을 광장에서 쉬고 있는 어르신',
    dialogue: [
      { text: '요즘 젊은이들은 곤충 배틀에 열심이구만...' },
      { text: '남쪽 숲에는 강한 야생 곤충들이 많으니 조심하게.' },
      { text: '동굴에는 희귀한 곤충이 있다는 소문이 있어.' },
    ],
  },

  trainer_kim: {
    id: 'trainer_kim',
    name: '트레이너 김',
    type: 'trainer',
    description: '훈련장에서 수련 중인 트레이너',
    dialogue: [
      { text: '곤충 배틀의 핵심은 타입 상성이야!' },
      { text: '갑충 타입은 도약에 강하고, 맹독에 약해.' },
      { text: '상대의 타입을 잘 파악해서 싸워봐!' },
    ],
  },

  shopkeeper: {
    id: 'shopkeeper',
    name: '상점 주인',
    type: 'shopkeeper',
    description: '마을 상점을 운영하는 주인',
    dialogue: [
      { text: '어서오세요! 무엇을 도와드릴까요?' },
      { text: '좋은 물건 많이 있습니다!' },
      { text: '배틀에 필요한 건 다 있어요~' },
    ],
    actions: [
      { id: 'buy', label: '물건 사기', type: 'shop' },
    ],
  },
}

export function getNpc(id: string): Npc | undefined {
  return npcs[id]
}

export function getNpcDialogue(npc: Npc): string {
  const randomIndex = Math.floor(Math.random() * npc.dialogue.length)
  return npc.dialogue[randomIndex].text
}
