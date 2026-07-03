import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createDb } from './db/client.js'
import type { AppEnv } from './types.js'
import { arthropods } from './routes/arthropods.js'
import { battle } from './routes/battle.js'
import { history } from './routes/history.js'

const app = new Hono<AppEnv>()

app.use('*', cors())

// 요청마다 D1 바인딩으로 drizzle 인스턴스를 만들어 컨텍스트에 주입
app.use('*', async (c, next) => {
  c.set('db', createDb(c.env.DB))
  await next()
})

app.get('/', (c) => {
  return c.json({
    name: 'Super Insect Battle API',
    version: '1.0.0',
    endpoints: {
      'GET /api/arthropods': 'List all arthropods',
      'GET /api/arthropods/:id': 'Get arthropod by ID',
      'POST /api/battle': 'Start battle (SSE stream)',
      'POST /api/battle/stats': 'Run multiple battles and get stats',
      'GET /api/history': 'List battle history',
      'GET /api/history/:id': 'Get battle details with logs',
      'GET /api/history/stats/:playerId/:opponentId':
        'Get cumulative matchup stats',
    },
  })
})

app.route('/api/arthropods', arthropods)
app.route('/api/battle', battle)
app.route('/api/history', history)

export default app
