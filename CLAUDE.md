# 슈퍼곤충대전

턴제 곤충 배틀 시뮬레이터. pnpm 워크스페이스 모노레포.

## 명령어

```bash
pnpm install    # 의존성 설치
pnpm build      # 모든 패키지 빌드
pnpm test:run   # 모든 패키지 테스트
pnpm demo       # 엔진 CLI 데모 실행
pnpm play       # MUD 스타일 CLI 게임 실행
```

## 디렉토리 구조

```
packages/
└── engine/                    # @insect-battle/engine - 배틀 엔진
    └── src/
        ├── index.ts
        ├── types/
        ├── data/
        └── engine/

apps/
└── cli/                       # @insect-battle/cli - MUD 스타일 CLI 게임
    └── src/
        ├── main.ts            # 게임 진입점
        ├── game/
        │   ├── types.ts       # 게임 상태 타입
        │   └── state.ts       # 상태 관리
        ├── world/
        │   └── rooms.ts       # 방/장소 정의
        ├── commands/
        │   ├── index.ts       # 명령어 라우터
        │   ├── explore.ts     # 탐색 명령어
        │   └── battle.ts      # 배틀 명령어
        ├── parser/
        │   └── index.ts       # 명령어 파서
        └── ui/
            └── display.ts     # 텍스트 UI
```

## 패키지

| 패키지 | 설명 |
|--------|------|
| `@insect-battle/engine` | 배틀 엔진 (순수 TypeScript) |
| `@insect-battle/cli` | MUD 스타일 CLI 게임 |

## 사용 예시

```typescript
import {
  insects,
  simulateBattle,
  simulateMultipleBattles,
} from '@insect-battle/engine'

// 단일 배틀
const result = simulateBattle(insects.rhinoceros_beetle, insects.stag_beetle)
console.log(result.winner) // 'player' | 'opponent' | 'draw'

// N판 시뮬레이션
const stats = simulateMultipleBattles(insects.rhinoceros_beetle, insects.stag_beetle, 1000)
console.log(`승률: ${stats.winRate.toFixed(1)}%`)
```

## Coding Conventions

### Naming

- **파일명**: `kebab-case` (예: `battle-engine.ts`, `type-chart.ts`)
- **함수/변수**: `camelCase` (예: `getInsectById`, `playerInsect`)
- **타입/인터페이스**: `PascalCase` (예: `BattleState`, `Insect`)
- **상수 객체 키**: `snake_case` (예: `rhinoceros_beetle`, `lift_throw`)
