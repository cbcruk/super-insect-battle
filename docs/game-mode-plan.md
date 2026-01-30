# 게임 모드 추가 계획

## 개요

시뮬레이션 모드(현실 기반) 외에 **게임 모드**(밸런스 조정)를 추가하여 공정한 대전 제공

## 밸런스 조정 방식

**HP 균등화**: 모든 캐릭터 HP를 100으로 고정

- 장점: 간단하고 효과적, 스탯 특성은 유지하면서 체력 격차만 해소
- 현재 문제: 장수풍뎅이 HP 277 vs 사마귀 HP 112 (2.5배 차이)

---

## 구현 전략

### 게임 모드 타입

```typescript
type GameMode = 'simulation' | 'balanced'
```

- `simulation`: 기존 방식 (현실 기반 HP 계산)
- `balanced`: HP 100 고정

---

## 파일 변경

### 1. 타입 추가

**`packages/engine/src/types/game-mode.ts`** (신규)

```typescript
export type GameMode = 'simulation' | 'balanced'
```

### 2. 배틀 엔진 수정

**`packages/engine/src/engine/battle-engine.ts`**

- `createBattleArthropod(arthropod, gameMode)` - gameMode 파라미터 추가
- `simulateBattle(a1, a2, gameMode)` - 모드 전달
- `simulateMultipleBattles(a1, a2, count, gameMode)` - 모드 전달

```typescript
export function createBattleArthropod(
  arthropod: Arthropod,
  gameMode: GameMode = 'simulation'
): BattleArthropod {
  let maxHp: number

  if (gameMode === 'balanced') {
    maxHp = 100
  } else {
    const baseHp = Math.floor(
      (arthropod.physical.strengthIndex + arthropod.defense.armorRating) * 1.5
    )
    maxHp = Math.max(100, baseHp)
  }

  return { ... }
}
```

### 3. 엔진 export 수정

**`packages/engine/src/index.ts`**

- GameMode 타입 export 추가

### 4. UI 수정 (packages/ui)

**`packages/ui/src/components/app.tsx`**

- `gameMode` 상태 추가
- 배틀 시작 전 모드 선택 UI 또는 메인 메뉴에서 모드 토글

**`packages/ui/src/simulation/battle-runner.ts`**

- `runBattle(a1, a2, gameMode)` 파라미터 추가
- `runStatisticsSimulation(a1, a2, count, gameMode)` 파라미터 추가

**`packages/ui/src/components/main-menu.tsx`**

- 현재 모드 표시 및 토글 옵션

---

## 수정 파일 목록

| 파일                                          | 변경 내용                                  |
| --------------------------------------------- | ------------------------------------------ |
| `packages/engine/src/types/game-mode.ts`      | 신규: GameMode 타입                        |
| `packages/engine/src/engine/battle-engine.ts` | createBattleArthropod, simulateBattle 수정 |
| `packages/engine/src/index.ts`                | GameMode export 추가                       |
| `packages/ui/src/components/app.tsx`          | gameMode 상태 관리                         |
| `packages/ui/src/simulation/battle-runner.ts` | gameMode 파라미터 전달                     |
| `packages/ui/src/components/main-menu.tsx`    | 모드 선택 UI                               |

---

## 검증 방법

1. **빌드 확인**

   ```bash
   pnpm build
   ```

2. **테스트 실행**

   ```bash
   pnpm test:run
   ```

3. **시뮬레이터에서 확인**

   ```bash
   pnpm simulator
   ```

   - 메뉴에서 모드 변경
   - balanced 모드로 장수풍뎅이 vs 사마귀 배틀
   - HP가 100으로 동일한지 확인

4. **통계 시뮬레이션**
   - 1000회 시뮬레이션으로 승률 확인
   - balanced 모드에서 승률이 더 균등해야 함

---

## 확장 아이디어 (GAME_IDEAS.md 기반)

### Phase 2: 컨디션 시스템

매 배틀마다 랜덤 컨디션을 적용하여 불확실성 추가

```typescript
interface BattleCondition {
  physical: number // 0.7 ~ 1.3, 물리 스탯에 영향
  mental: number // 0.7 ~ 1.3, 명중률/회피율에 영향
  stamina: number // 0.7 ~ 1.3, 후반 턴 성능에 영향
}
```

**효과**:

- 같은 곤충도 컨디션에 따라 결과가 달라짐
- 약한 곤충이 강한 곤충을 뒤집을 수 있음
- "운"과 "실력"의 균형

### Phase 3: 숨겨진 정보 시스템

**상대 스탯 비공개**:

- 배틀 시작 시 상대 곤충의 정확한 스탯이 보이지 않음
- 외형/이름으로만 추측
- 배틀 경험이 쌓이면 상대 평가 능력 향상

**IV(개체값) 시스템**:

```typescript
interface IndividualValues {
  strength: number // -10 ~ +10
  defense: number // -10 ~ +10
  speed: number // -10 ~ +10
  grade: 'S' | 'A' | 'B' | 'C' // 대략적 등급만 표시
}
```

### Phase 4: 배당률/베팅 시스템

**NPC 배틀 관전 + 베팅**:

```
[오늘의 대전]
🪲 장수풍뎅이 (1.2배) vs 🦗 사슴벌레 (3.5배)

베팅 금액: 1000골드
→ 장수풍뎅이 승리 시: 1200골드 획득
→ 사슴벌레 승리 시: 3500골드 획득 (언더독 베팅)
```

**배당률 계산**:

- 기본 스탯 기반 예상 승률 산출
- 컨디션 시스템으로 뒤집기 가능 → 도박의 재미

---

## 구현 우선순위

| Phase | 기능          | 복잡도 | 게임성 향상 |
| ----- | ------------- | ------ | ----------- |
| 1     | HP 균등화     | 낮음   | 중간        |
| 2     | 컨디션 시스템 | 중간   | 높음        |
| 3     | 숨겨진 정보   | 중간   | 높음        |
| 4     | 베팅 시스템   | 높음   | 매우 높음   |
