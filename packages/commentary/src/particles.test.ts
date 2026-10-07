import { describe, expect, it } from 'vitest'
import { eulReul, euroRo, eunNeun, iGa } from './particles'

describe('Korean particles', () => {
  it('picks the particle by final consonant', () => {
    expect(eunNeun('사마귀')).toBe('는')
    expect(eunNeun('전갈')).toBe('은')
    expect(iGa('사마귀')).toBe('가')
    expect(iGa('장수풍뎅이')).toBe('가')
    expect(iGa('전갈')).toBe('이')
    expect(eulReul('독침')).toBe('을')
    expect(eulReul('큰턱 물기')).toBe('를')
  })

  it('uses 로 after ㄹ and vowels, 으로 after other consonants', () => {
    expect(euroRo('방어 자세')).toBe('로')
    expect(euroRo('껍질')).toBe('로')
    expect(euroRo('갑옷')).toBe('으로')
  })

  it('falls back to the vowel form for non-Hangul words', () => {
    expect(iGa('W')).toBe('가')
    expect(eunNeun('')).toBe('는')
  })
})
