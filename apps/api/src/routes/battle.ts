import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import {
  getArthropodById,
  simulateBattle,
  simulateMultipleBattles,
  createBattleArthropod,
} from '@super-insect-battle/engine'
import { getEventDelay, sleep } from '../utils/stream.js'
import { db } from '../db/client.js'
import { battles, battleLogs, matchupStats } from '../db/schema.js'
import { eq, and, sql } from 'drizzle-orm'

const battle = new Hono()

interface BattleRequest {
  player: string
  opponent: string
}

interface BattleStatsRequest {
  player: string
  opponent: string
  count: number
}

function generateId(): string {
  return crypto.randomUUID()
}

battle.post('/', async (c) => {
  const body = await c.req.json<BattleRequest>()
  const { player: playerId, opponent: opponentId } = body

  const playerArthropod = getArthropodById(playerId)
  const opponentArthropod = getArthropodById(opponentId)

  if (!playerArthropod) {
    return c.json({ error: `Player arthropod not found: ${playerId}` }, 400)
  }

  if (!opponentArthropod) {
    return c.json({ error: `Opponent arthropod not found: ${opponentId}` }, 400)
  }

  const battleState = simulateBattle(playerArthropod, opponentArthropod)
  const playerBattle = createBattleArthropod(playerArthropod)
  const opponentBattle = createBattleArthropod(opponentArthropod)
  const battleId = generateId()

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      event: 'start',
      data: JSON.stringify({
        battleId,
        player: playerArthropod.nameKo,
        opponent: opponentArthropod.nameKo,
        playerHp: playerBattle.maxHp,
        opponentHp: opponentBattle.maxHp,
      }),
    })

    await sleep(500)

    let prevEntry = undefined

    const logEntries: {
      turn: number
      actor: string
      action: string
      actionId?: string
      damage?: number
      critical: boolean
      playerHp: number
      opponentHp: number
    }[] = []

    for (const entry of battleState.log) {
      const delay = getEventDelay(entry, prevEntry)

      await sleep(delay)

      if (entry.remainingHp) {
        const logEntry = {
          turn: entry.turn,
          actor: entry.actor,
          action: entry.action,
          actionId: entry.actionId,
          damage: entry.damage,
          critical: entry.critical ?? false,
          playerHp: entry.remainingHp.player,
          opponentHp: entry.remainingHp.opponent,
        }
        logEntries.push(logEntry)
      }

      await stream.writeSSE({
        event: 'turn',
        data: JSON.stringify({
          turn: entry.turn,
          actor: entry.actor,
          action: entry.action,
          actionId: entry.actionId,
          damage: entry.damage,
          critical: entry.critical,
          remainingHp: entry.remainingHp,
        }),
      })

      prevEntry = entry
    }

    await sleep(300)

    try {
      await db.insert(battles).values({
        id: battleId,
        playerId,
        opponentId,
        winner: battleState.winner,
        totalTurns: battleState.turn,
        playerFinalHp: battleState.player.currentHp,
        opponentFinalHp: battleState.opponent.currentHp,
        playerMaxHp: playerBattle.maxHp,
        opponentMaxHp: opponentBattle.maxHp,
      })

      for (const log of logEntries) {
        await db.insert(battleLogs).values({
          battleId,
          turn: log.turn,
          actor: log.actor,
          action: log.action,
          actionId: log.actionId,
          damage: log.damage,
          critical: log.critical ? 1 : 0,
          playerHp: log.playerHp,
          opponentHp: log.opponentHp,
        })
      }
    } catch (error) {
      console.error('Failed to save battle:', error)
    }

    await stream.writeSSE({
      event: 'end',
      data: JSON.stringify({
        battleId,
        winner: battleState.winner,
        playerHp: battleState.player.currentHp,
        opponentHp: battleState.opponent.currentHp,
        totalTurns: battleState.turn,
      }),
    })
  })
})

battle.post('/stats', async (c) => {
  const body = await c.req.json<BattleStatsRequest>()
  const { player: playerId, opponent: opponentId, count = 100 } = body

  const playerArthropod = getArthropodById(playerId)
  const opponentArthropod = getArthropodById(opponentId)

  if (!playerArthropod) {
    return c.json({ error: `Player arthropod not found: ${playerId}` }, 400)
  }

  if (!opponentArthropod) {
    return c.json({ error: `Opponent arthropod not found: ${opponentId}` }, 400)
  }

  const limitedCount = Math.min(Math.max(1, count), 1000)
  const stats = simulateMultipleBattles(
    playerArthropod,
    opponentArthropod,
    limitedCount
  )

  try {
    const existing = await db
      .select()
      .from(matchupStats)
      .where(
        and(
          eq(matchupStats.playerId, playerId),
          eq(matchupStats.opponentId, opponentId)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      const prev = existing[0]
      const newTotal = prev.totalBattles + limitedCount
      const newPlayerWins = prev.playerWins + stats.playerWins
      const newOpponentWins = prev.opponentWins + stats.opponentWins
      const newDraws = prev.draws + stats.draws
      const newAvgTurns =
        (prev.avgTurns * prev.totalBattles + stats.avgTurns * limitedCount) /
        newTotal

      await db
        .update(matchupStats)
        .set({
          playerWins: newPlayerWins,
          opponentWins: newOpponentWins,
          draws: newDraws,
          totalBattles: newTotal,
          avgTurns: newAvgTurns,
          updatedAt: sql`datetime('now')`,
        })
        .where(eq(matchupStats.id, prev.id))
    } else {
      await db.insert(matchupStats).values({
        playerId,
        opponentId,
        playerWins: stats.playerWins,
        opponentWins: stats.opponentWins,
        draws: stats.draws,
        totalBattles: limitedCount,
        avgTurns: stats.avgTurns,
      })
    }
  } catch (error) {
    console.error('Failed to save matchup stats:', error)
  }

  return c.json({
    player: playerArthropod.nameKo,
    opponent: opponentArthropod.nameKo,
    count: limitedCount,
    stats: {
      playerWins: stats.playerWins,
      opponentWins: stats.opponentWins,
      draws: stats.draws,
      winRate: Math.round(stats.winRate * 100) / 100,
      avgTurns: Math.round(stats.avgTurns * 100) / 100,
    },
  })
})

export { battle }
