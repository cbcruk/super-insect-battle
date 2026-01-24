import { Hono } from 'hono'
import { db } from '../db/client.js'
import { battles, battleLogs, matchupStats } from '../db/schema.js'
import { eq, and, desc } from 'drizzle-orm'

const history = new Hono()

history.get('/', async (c) => {
  const page = Number(c.req.query('page')) || 1
  const limit = Math.min(Number(c.req.query('limit')) || 20, 100)
  const offset = (page - 1) * limit

  const [battleList, countResult] = await Promise.all([
    db
      .select()
      .from(battles)
      .orderBy(desc(battles.createdAt))
      .limit(limit)
      .offset(offset),
    db.select().from(battles),
  ])

  return c.json({
    battles: battleList.map((b) => ({
      id: b.id,
      player: b.playerId,
      opponent: b.opponentId,
      winner: b.winner,
      totalTurns: b.totalTurns,
      createdAt: b.createdAt,
    })),
    total: countResult.length,
    page,
    limit,
  })
})

history.get('/:id', async (c) => {
  const id = c.req.param('id')

  const battleResult = await db
    .select()
    .from(battles)
    .where(eq(battles.id, id))
    .limit(1)

  if (battleResult.length === 0) {
    return c.json({ error: 'Battle not found' }, 404)
  }

  const battle = battleResult[0]

  const logs = await db
    .select()
    .from(battleLogs)
    .where(eq(battleLogs.battleId, id))
    .orderBy(battleLogs.turn)

  return c.json({
    id: battle.id,
    player: battle.playerId,
    opponent: battle.opponentId,
    winner: battle.winner,
    totalTurns: battle.totalTurns,
    playerFinalHp: battle.playerFinalHp,
    opponentFinalHp: battle.opponentFinalHp,
    playerMaxHp: battle.playerMaxHp,
    opponentMaxHp: battle.opponentMaxHp,
    createdAt: battle.createdAt,
    logs: logs.map((l) => ({
      turn: l.turn,
      actor: l.actor,
      action: l.action,
      actionId: l.actionId,
      damage: l.damage,
      critical: l.critical === 1,
      playerHp: l.playerHp,
      opponentHp: l.opponentHp,
    })),
  })
})

history.get('/stats/:playerId/:opponentId', async (c) => {
  const playerId = c.req.param('playerId')
  const opponentId = c.req.param('opponentId')

  const result = await db
    .select()
    .from(matchupStats)
    .where(
      and(
        eq(matchupStats.playerId, playerId),
        eq(matchupStats.opponentId, opponentId)
      )
    )
    .limit(1)

  if (result.length === 0) {
    return c.json({
      player: playerId,
      opponent: opponentId,
      stats: {
        playerWins: 0,
        opponentWins: 0,
        draws: 0,
        totalBattles: 0,
        winRate: 0,
        avgTurns: 0,
      },
    })
  }

  const stat = result[0]
  const winRate =
    stat.totalBattles > 0 ? (stat.playerWins / stat.totalBattles) * 100 : 0

  return c.json({
    player: playerId,
    opponent: opponentId,
    stats: {
      playerWins: stat.playerWins,
      opponentWins: stat.opponentWins,
      draws: stat.draws,
      totalBattles: stat.totalBattles,
      winRate: Math.round(winRate * 10) / 10,
      avgTurns: Math.round(stat.avgTurns * 10) / 10,
    },
  })
})

export { history }
