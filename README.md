# 슈퍼곤충대전 (Super Insect Battle)

실제 절지동물의 특성을 기반으로 한 1:1 턴제 배틀 시뮬레이터

## 실행 방법

```bash
pnpm install          # 의존성 설치
pnpm build            # 빌드
pnpm simulator        # 터미널 시뮬레이터 실행
pnpm simulator:web          # 웹 시뮬레이터 실행
```

## 게임 시스템

### 절지동물 (24종)

| 이름                 | 스타일    | 특징                   |
| -------------------- | --------- | ---------------------- |
| 장수풍뎅이           | grappler  | 강력한 뿔, 두꺼운 갑각 |
| 사슴벌레             | grappler  | 큰 턱으로 집기         |
| 헤라클레스장수풍뎅이 | grappler  | 최강의 힘              |
| 아틀라스장수풍뎅이   | grappler  | 삼중 뿔                |
| 타이탄하늘소         | grappler  | 거대한 큰턱            |
| 집게벌레             | grappler  | 꼬리 집게              |
| 사마귀               | striker   | 번개같은 낫다리        |
| 왕지네               | striker   | 독 악턱, 다리 공격     |
| 물장군               | striker   | 수중 매복 포식자       |
| 메뚜기               | striker   | 강력한 점프킥          |
| 늑대거미             | striker   | 추격형 사냥꾼          |
| 개미귀신             | striker   | 모래 함정 매복         |
| 귀뚜라미             | striker   | 점프 공격              |
| 전갈                 | venomous  | 치명적 독침            |
| 타란튤라             | venomous  | 거대 독니, 거미줄      |
| 침노린재             | venomous  | 극강의 독              |
| 장수말벌             | venomous  | 연속 독침 공격         |
| 검은과부거미         | venomous  | 신경독                 |
| 보석말벌             | venomous  | 마비 독침              |
| 쇠똥구리             | defensive | 극강의 방어력          |
| 노래기               | defensive | 독액 분비 방어         |
| 바퀴벌레             | defensive | 생존 특화              |
| 채찍전갈             | defensive | 산성 분사              |
| 폭탄먼지벌레         | defensive | 화학 폭탄              |

### 스타일 상성

```
grappler → striker (1.2x)
striker → venomous (1.2x)
venomous → grappler (1.2x)
defensive: 중립 (카운터 역할)
```

### 데미지 계산

최종 데미지에 영향을 주는 요소:

1. **기본 데미지**: `액션 위력 × (공격자 힘 / 50)`
2. **스타일 상성**: 0.8x ~ 1.2x
3. **체중 보너스**: 무거우면 유리 (0.8x ~ 1.2x)
4. **체장(리치) 보너스**: 길면 유리 (0.9x ~ 1.1x)
5. **무기 vs 갑각**: 무기 타입별 갑각 관통력
6. **환경 보너스**: 지형/시간대/날씨 적합도
7. **스탯 스테이지**: 버프/디버프 효과
8. **크리티컬**: 10% 확률로 1.5x

### 환경 시스템

**지형 (Terrain)**

- 숲 (forest), 사막 (desert), 습지 (wetland), 동굴 (cave)
- 선호 지형에서 +15% 보너스

**시간대 (Time of Day)**

- 낮 (day), 밤 (night)
- 선호 시간대에서 +10% 보너스, 불일치 시 -10%

**날씨 (Weather)**
| 날씨 | 효과 |
|------|------|
| 맑음 (clear) | 없음 |
| 비 (rain) | 습지 선호 +10%, 그 외 -5% |
| 쾌청 (sunny) | 주행성 +15%, 야행성 -10% |
| 모래폭풍 (sandstorm) | 사막 선호 +10%, 그 외 -10% |

### 상태이상

**독 (Poison)**

- 매 턴 종료 시 데미지: `(최대HP / 8) × (독강도 / 50)`
- 독강도 50 = 턴당 12.5%, 독강도 100 = 턴당 25%
- 영구 지속 (자연 해제 없음)

**속박 (Bind)**

- 2~4턴 지속
- 매 턴 50% 확률로 행동 불가

### 스탯 스테이지

버프/디버프로 스탯 변화 (-6 ~ +6 단계)

| 스테이지 | 배율  |
| -------- | ----- |
| -6       | 0.25x |
| -3       | 0.5x  |
| 0        | 1.0x  |
| +3       | 2.0x  |
| +6       | 4.0x  |

### 배틀 모드

**도망 (Flee)**

- 2턴간 회피율 +50%
- 공격력 -50%

**움츠림 (Brace)**

- 3턴간 받는 데미지 -50%
- 공격 불가

## 프로젝트 구조

```
packages/
├── engine/                 # 배틀 엔진 코어
│   ├── data/              # YAML 데이터 (절지동물, 액션, 상성)
│   ├── src/types/         # 타입 정의
│   ├── src/data/          # 데이터 로더
│   └── src/engine/        # 배틀 로직
│       ├── battle-engine.ts    # 메인 배틀 로직
│       ├── environment.ts      # 환경/날씨 시스템
│       ├── status-condition.ts # 상태이상
│       ├── stat-stages.ts      # 스탯 버프/디버프
│       ├── battle-mode.ts      # 도망/움츠림
│       └── ai-strategy.ts      # AI 전략
└── ui/                    # 터미널 UI (Ink)

apps/
├── simulator/             # 터미널 시뮬레이터
├── web/                   # 웹 시뮬레이터
└── api/                   # API 서버
```

## 개발

```bash
pnpm test:run             # 테스트 실행
pnpm build                # 전체 빌드
pnpm build:data           # YAML → TypeScript 변환
```

### 밸런스 검증

```bash
cd packages/engine
npx tsx scripts/balance-check.ts
```
