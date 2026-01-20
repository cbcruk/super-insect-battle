# 슈퍼곤충대전

턴제 곤충 배틀 시뮬레이터.

## 명령어

```bash
pnpm install    # 의존성 설치
pnpm build      # 모든 패키지 빌드
pnpm test:run   # 모든 패키지 테스트
pnpm demo       # 엔진 CLI 데모 실행
pnpm play       # MUD 스타일 CLI 게임 실행
```

## 작업방식 (Spec-driven development)

1. Specify: You provide a high-level description of what you’re building and why, and the coding agent generates a detailed specification.
2. Plan: Now you get technical. In this phase, you provide the coding agent with your desired stack, architecture, and constraints, and the coding agent generates a comprehensive technical plan.
3. Tasks: The coding agent takes the spec and the plan and breaks them down into actual work.
4. Implement: Your coding agent tackles the tasks one by one (or in parallel, where applicable).
5. Commit: task 완료 시 사용자 확인 요청 후 커밋

## 개발 원칙

1. **플레이 가능한 상태 유지**: 항상 실행 가능한 게임 상태 유지. 큰 변경보다 작은 반복 선호.
2. **데이터와 로직 분리**: 게임 콘텐츠(YAML)와 게임 로직(엔진)을 분리하여 유지보수성 확보.
3. **핵심 루프 우선**: 탐색 → 조우 → 배틀 → 성장 사이클이 재미있어야 함. 밸런싱은 그 다음.
4. **직접 플레이**: 자주 플레이하며 재미 검증.

### 우선순위

1. 핵심 배틀 루프 완성
2. 곤충 성장/레벨업
3. 콘텐츠 확장 (맵, 곤충)
4. UI/UX 개선

## Coding Conventions

### Naming

- **파일명**: `kebab-case` (예: `battle-engine.ts`, `type-chart.ts`)
- **함수/변수**: `camelCase` (예: `getInsectById`, `playerInsect`)
- **타입/인터페이스**: `PascalCase` (예: `BattleState`, `Insect`)
- **상수 객체 키**: `snake_case` (예: `rhinoceros_beetle`, `lift_throw`)
