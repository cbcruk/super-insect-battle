# 슈퍼곤충대전

실제 절지동물 특성 기반 1:1 배틀 시뮬레이터.

## 명령어

```bash
pnpm install    # 의존성 설치
pnpm build      # 모든 패키지 빌드
pnpm test:run   # 모든 패키지 테스트
pnpm simulator  # 터미널 시뮬레이터 실행
pnpm dev:web    # 웹 시뮬레이터 실행 (xterm)
```

## 프로젝트 구조

```
packages/engine/           # 배틀 엔진 코어
├── src/types/             # 타입 정의 (Arthropod, Action)
├── src/data/              # 데이터 (절지동물, 행동, 상성)
└── src/engine/            # 배틀 로직

apps/simulator/            # 터미널 UI 앱
├── src/ui/                # 메뉴, 렌더러
└── src/simulation/        # 배틀 실행

apps/web/                  # 웹 UI 앱 (xterm)
├── src/hooks/             # React hooks (useTerminal, useGame)
└── src/components/        # React 컴포넌트
```

## 데이터 모델

### Arthropod (절지동물)

- 물리적 특성: 체중, 체장, 힘 지수
- 무기: 타입(horn/mandible/stinger/fang/foreleg/leg), 위력, 독
- 행동: 공격성, 스타일(grappler/striker/venomous/defensive)
- 방어: 갑각 강도, 회피력

### 스타일 상성 (가위바위보)

- grappler > striker (1.2x)
- striker > venomous (1.2x)
- venomous > grappler (1.2x)
- defensive는 중립

## 개발 원칙

1. **플레이 가능한 상태 유지**: 항상 실행 가능한 게임 상태 유지
2. **데이터와 로직 분리**: 게임 데이터와 엔진 로직을 분리
3. **직접 플레이**: 자주 플레이하며 재미 검증

## Coding Conventions

### Naming

- **파일명**: `kebab-case` (예: `battle-engine.ts`, `matchup.ts`)
- **함수/변수**: `camelCase` (예: `getArthropodById`, `playerAction`)
- **타입/인터페이스**: `PascalCase` (예: `BattleState`, `Arthropod`)
- **상수 객체 키**: `snake_case` (예: `rhinoceros_beetle`, `horn_lift`)
