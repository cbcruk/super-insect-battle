import { Assets, type Texture } from 'pixi.js'
import { SPRITE_FILES } from './sprite-manifest'

const cache = new Map<string, Texture | null>()

export function hasSprite(id: string): boolean {
  return id in SPRITE_FILES
}

export async function loadSprite(id: string): Promise<Texture | null> {
  if (cache.has(id)) return cache.get(id) ?? null

  const file = SPRITE_FILES[id]
  if (!file) {
    cache.set(id, null)
    return null
  }

  try {
    const url = `${import.meta.env.BASE_URL}sprites/${file}`
    const texture = await Assets.load<Texture>(url)
    cache.set(id, texture)
    return texture
  } catch {
    cache.set(id, null)
    return null
  }
}
