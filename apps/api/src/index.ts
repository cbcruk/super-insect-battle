import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { arthropods } from './routes/arthropods.js'
import { battle } from './routes/battle.js'
import { history } from './routes/history.js'

const app = new Hono()

app.use('*', cors())

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

const port = Number(process.env.PORT) || 3000

console.log(`🐛 Super Insect Battle API running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
