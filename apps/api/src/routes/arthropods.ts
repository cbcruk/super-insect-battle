import { Hono } from 'hono'
import {
  arthropodList,
  getArthropodById,
  type Arthropod,
} from '@super-insect-battle/engine'

const arthropods = new Hono()

arthropods.get('/', (c) => {
  return c.json({
    arthropods: arthropodList.map((a: Arthropod) => ({
      id: a.id,
      name: a.name,
      nameKo: a.nameKo,
      style: a.behavior.style,
      weaponType: a.weapon.type,
    })),
  })
})

arthropods.get('/:id', (c) => {
  const id = c.req.param('id')
  const arthropod = getArthropodById(id)

  if (!arthropod) {
    return c.json({ error: 'Arthropod not found' }, 404)
  }

  return c.json({ arthropod })
})

export { arthropods }
