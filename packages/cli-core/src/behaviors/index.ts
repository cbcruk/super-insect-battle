import type { BattleInsect, Move } from '@insect-battle/engine'
import { getTypeEffectiveness } from '@insect-battle/engine'

export interface InsectBehavior {
  id: string
  name: string
  selectMove: (attacker: BattleInsect, defender: BattleInsect, moves: Move[]) => Move
}

function getMoveDamageScore(move: Move, attacker: BattleInsect, defender: BattleInsect): number {
  if (move.category === 'status') return 0

  const effectiveness = getTypeEffectiveness(move.type, defender.base.type)
  const power = move.power * effectiveness

  if (move.category === 'physical') {
    return power * (attacker.stats.atk / defender.stats.def)
  } else {
    return power * (attacker.stats.spAtk / defender.stats.spDef)
  }
}

export const aggressiveBehavior: InsectBehavior = {
  id: 'aggressive',
  name: '공격적',
  selectMove: (attacker, defender, moves) => {
    const attackMoves = moves.filter((m) => m.power > 0)
    if (attackMoves.length === 0) return moves[0]

    let bestMove = attackMoves[0]
    let bestScore = getMoveDamageScore(bestMove, attacker, defender)

    for (const move of attackMoves) {
      const score = getMoveDamageScore(move, attacker, defender)
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove
  },
}

export const defensiveBehavior: InsectBehavior = {
  id: 'defensive',
  name: '방어적',
  selectMove: (attacker, _defender, moves) => {
    const hpRatio = attacker.currentHp / attacker.maxHp

    const healMoves = moves.filter((m) => m.effect?.type === 'heal')
    if (hpRatio < 0.4 && healMoves.length > 0) {
      return healMoves[0]
    }

    const statusMoves = moves.filter((m) => m.category === 'status')
    if (hpRatio > 0.6 && statusMoves.length > 0 && Math.random() < 0.5) {
      return statusMoves[Math.floor(Math.random() * statusMoves.length)]
    }

    const attackMoves = moves.filter((m) => m.power > 0)
    if (attackMoves.length === 0) return moves[0]

    return attackMoves[Math.floor(Math.random() * attackMoves.length)]
  },
}

export const balancedBehavior: InsectBehavior = {
  id: 'balanced',
  name: '균형',
  selectMove: (attacker, defender, moves) => {
    const hpRatio = attacker.currentHp / attacker.maxHp

    const healMoves = moves.filter((m) => m.effect?.type === 'heal')
    if (hpRatio < 0.3 && healMoves.length > 0) {
      return healMoves[0]
    }

    const attackMoves = moves.filter((m) => m.power > 0)
    if (attackMoves.length === 0) return moves[0]

    const effectiveMoves = attackMoves.filter(
      (m) => getTypeEffectiveness(m.type, defender.base.type) > 1
    )
    if (effectiveMoves.length > 0) {
      return effectiveMoves[Math.floor(Math.random() * effectiveMoves.length)]
    }

    return attackMoves[Math.floor(Math.random() * attackMoves.length)]
  },
}

export const behaviors: Record<string, InsectBehavior> = {
  aggressive: aggressiveBehavior,
  defensive: defensiveBehavior,
  balanced: balancedBehavior,
}

export function getBehavior(id: string): InsectBehavior {
  return behaviors[id] ?? balancedBehavior
}

export function selectMoveWithBehavior(
  behaviorId: string,
  attacker: BattleInsect,
  defender: BattleInsect
): Move {
  const behavior = getBehavior(behaviorId)
  return behavior.selectMove(attacker, defender, attacker.moves)
}
