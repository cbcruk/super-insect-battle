import type { Player, OwnedInsect, Match, MatchLog } from '../domain/entities'

/**
 * 공통 Repository 인터페이스
 */
export interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>
  findAll(): Promise<T[]>
  save(entity: T): Promise<T>
  delete(id: ID): Promise<boolean>
}

/**
 * 플레이어 Repository
 */
export interface PlayerRepository extends Repository<Player> {
  /** visibleId로 조회 */
  findByVisibleId(visibleId: string): Promise<Player | null>
  /** 닉네임으로 조회 */
  findByNickname(nickname: string): Promise<Player | null>
  /** 레이팅 순 상위 N명 조회 */
  findTopByRating(limit: number): Promise<Player[]>
  /** 레이팅 업데이트 */
  updateRating(id: string, newRating: number): Promise<Player | null>
}

/**
 * 소유 곤충 Repository
 */
export interface OwnedInsectRepository extends Repository<OwnedInsect> {
  /** 특정 플레이어의 모든 곤충 조회 */
  findByPlayerId(playerId: string): Promise<OwnedInsect[]>
  /** 특정 플레이어의 특정 종 곤충 조회 */
  findByPlayerIdAndSpeciesId(
    playerId: string,
    speciesId: string
  ): Promise<OwnedInsect[]>
  /** 레벨 업데이트 */
  updateLevel(
    id: string,
    level: number,
    exp: number
  ): Promise<OwnedInsect | null>
}

/**
 * 매치 Repository
 */
export interface MatchRepository extends Repository<Match> {
  /** 특정 플레이어의 매치 기록 조회 */
  findByPlayerId(playerId: string, limit?: number): Promise<Match[]>
  /** 두 플레이어 간의 매치 기록 조회 */
  findByPlayerIds(player1Id: string, player2Id: string): Promise<Match[]>
  /** 진행 중인 매치 조회 */
  findActiveMatches(): Promise<Match[]>
  /** 특정 플레이어의 진행 중인 매치 조회 */
  findActiveMatchByPlayerId(playerId: string): Promise<Match | null>
  /** 매치 상태 업데이트 */
  updateStatus(
    id: string,
    status: Match['status'],
    winnerId?: string | null
  ): Promise<Match | null>
  /** 최근 매치 조회 */
  findRecent(limit: number): Promise<Match[]>
}

/**
 * 매치 로그 Repository (다시보기용)
 */
export interface MatchLogRepository extends Repository<MatchLog> {
  /** 매치 ID로 조회 */
  findByMatchId(matchId: string): Promise<MatchLog | null>
  /** 특정 플레이어의 매치 로그 조회 */
  findByPlayerId(playerId: string, limit?: number): Promise<MatchLog[]>
  /** 매치 로그에 액션 추가 */
  appendAction(
    matchId: string,
    action: MatchLog['actions'][number]
  ): Promise<boolean>
}

/**
 * 트랜잭션 지원을 위한 Unit of Work 패턴
 */
export interface UnitOfWork {
  /** 트랜잭션 시작 */
  begin(): Promise<void>
  /** 트랜잭션 커밋 */
  commit(): Promise<void>
  /** 트랜잭션 롤백 */
  rollback(): Promise<void>
  /** Repository 접근자들 */
  players: PlayerRepository
  ownedInsects: OwnedInsectRepository
  matches: MatchRepository
  matchLogs: MatchLogRepository
}
