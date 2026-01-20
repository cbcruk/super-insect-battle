# MUD Engine Research

텍스트 기반 게임 엔진들을 분석하고 우리 프로젝트에 적용 가능한 아이디어를 정리한 문서입니다.

## 분석 대상

| 엔진 | 기술 스택 | 특징 |
|------|-----------|------|
| [Ranvier](https://ranviermud.com/) | Node.js | 번들 시스템, 이벤트 기반 |
| [TalesMUD](https://github.com/TalesMUD/talesmud) | Go, Svelte | WebSocket, 절차적 생성 |
| [Furcadia](https://cms.furcadia.com/) | 자체 엔진 | 사용자 생성 콘텐츠, 맵 에디터 |

---

## 1. Ranvier MUD Engine

> https://ranviermud.com/

Node.js 기반 MUD 게임 엔진으로, 확장성에 중점을 둔 설계가 특징입니다.

### 핵심 특징

| 시스템 | 설명 |
|--------|------|
| **번들 시스템** | 모든 게임 요소를 모듈화 (areas, commands, effects, skills, behaviors) |
| **이벤트 기반** | 모든 엔티티에 이벤트 리스너 추가 가능 |
| **YAML 기반 데이터** | 코드와 콘텐츠 분리 (rooms.yml, npcs.yml, items.yml) |
| **좌표 기반 맵** | `[x, y, z]` 좌표로 자동 출구 연결 |
| **Entity Reference** | `area:entity` 형식으로 객체 참조 |

### 번들 구성 요소

| 폴더/파일 | 역할 |
|-----------|------|
| **areas/** | 지역, 아이템, 방, NPC, 퀘스트 정의 |
| **commands/** | 게임 명령어 |
| **effects/** | 캐릭터에 적용 가능한 효과 |
| **skills/** | 플레이어 스킬 및 주문 |
| **behaviors/** | 엔티티 간 공유 스크립트 |
| **input-events/** | 소켓 연결 처리 (로그인 등) |
| **server-events/** | 서버 시작 이벤트 |
| **quest-goals/rewards** | 퀘스트 목표 및 보상 정의 |

---

## 2. TalesMUD

> https://github.com/TalesMUD/talesmud

Golang 기반 MUD 개발 프레임워크로, 현대적인 웹 기술과 결합되어 있습니다.

### 기술 스택

| 항목 | 기술 |
|------|------|
| **백엔드** | Go, Gin |
| **프론트엔드** | Svelte, MaterializeCSS |
| **네트워크** | WebSocket + TCP 동시 지원 |
| **인증** | Auth0 |
| **배포** | GitHub Actions + Docker + Watchtower |

### 아키텍처

```
[TCP Client] ──┐
               ├──▶ [Game Instance] ──▶ [Broadcast to All Clients]
[WS Client]  ──┘
```

- TCP와 WebSocket 플레이어를 각각의 핸들러가 처리
- 게임 인스턴스에서 실제 로직 처리 후 결과를 모든 클라이언트에 브로드캐스트

### 주요 기능

- **절차적 던전 생성** (Procedural Dungeon Generation)
- **나노서비스**: 이름, 아이템, 방, 던전의 랜덤 생성 API
- **Hot Reload**: 서버 재시작 없이 명령어 리로드

---

## 3. Furcadia

> https://cms.furcadia.com/

1996년부터 운영 중인 사용자 생성 콘텐츠 중심의 가상 세계 플랫폼입니다.

### 창작 도구

| 도구 | 역할 |
|------|------|
| **Dream Editor** | 맵 편집기 (타일 기반, 벽/바닥/아이템/이펙트 배치) |
| **Fox Editor** | 커스텀 오브젝트/패치 아트 생성 |
| **DragonSpeak** | 스크립팅 언어 (이벤트 트리거 기반) |
| **Skin Editor** | UI 커스터마이징 |
| **PCX Editor** | 배경 이미지 생성 |

### Dream 시스템

- **Dream**: 사용자가 만든 가상 공간 (맵 + 스크립트 + 아트)
- 6,000+ 기본 아트 파일을 패치(덮어쓰기) 가능
- 오디오 지원: WMA, Ogg, MOD, S3M, WAV, MIDI

### DragonSpeak 예시

```
(0:0) When a furre enters this Dream,
(5:0) emit message {Welcome to my Dream!}.
```

이벤트 트리거 → 조건 → 액션 구조의 스크립팅 언어

---

## 우리 프로젝트에 적용 가능한 아이디어

### 단기 (즉시 적용 가능)

| 출처 | 아이디어 | 설명 |
|------|----------|------|
| Ranvier | **YAML 데이터 분리** | `world/rooms.ts` → `areas/*.yml`로 분리 |
| Ranvier | **이벤트 시스템** | 방 진입, 배틀 시작 등 이벤트 기반 처리 |
| TalesMUD | **랜덤 생성** | 야생 곤충, 아이템 등 절차적 생성 |

### 중기 (구조 개선)

| 출처 | 아이디어 | 설명 |
|------|----------|------|
| Ranvier | **번들 시스템** | 지역별 콘텐츠 패키징 |
| Ranvier | **Behaviors** | 곤충 AI 행동 패턴 모듈화 |
| Furcadia | **스크립팅** | 간단한 이벤트 스크립트 언어 |

### 장기 (확장 기능)

| 출처 | 아이디어 | 설명 |
|------|----------|------|
| Furcadia | **맵 에디터** | 웹 기반 월드 에디터 |
| Furcadia | **패치 시스템** | 커스텀 곤충/스킬 모드 지원 |
| TalesMUD | **멀티플레이어** | WebSocket 기반 온라인 대전 |

---

## 구현 예시

### YAML 기반 콘텐츠 분리

```yaml
# areas/forest/rooms.yml
- id: forest_entrance
  name: 숲 입구
  description: |
    울창한 숲의 입구다. 나뭇잎 사이로 다양한 곤충 소리가 들린다.
    이곳에서 야생 곤충과 마주칠 수 있다.
  exits:
    북: training_grounds
    남: deep_forest
  hasWildEncounters: true
  wildInsects:
    - grasshopper
    - stag_beetle
```

### 이벤트 시스템

```typescript
// 방 진입 이벤트
room.on('playerEnter', (player, state) => {
  if (room.hasWildEncounters && Math.random() < 0.3) {
    return triggerWildBattle(player, room.wildInsects)
  }
})

// 특정 방 이벤트
insectCenter.on('playerEnter', (player) => {
  return { output: '간호사: 곤충을 치료해 드릴까요?' }
})
```

### Behaviors (행동 패턴)

```typescript
// behaviors/aggressive.ts
export const aggressiveBehavior: InsectBehavior = {
  onBattleStart: (insect, opponent) => {
    // 선제공격 확률 증가
    return { firstStrike: true }
  },
  selectMove: (insect, opponent, availableMoves) => {
    // 공격력 높은 스킬 우선
    return availableMoves.sort((a, b) => b.power - a.power)[0]
  }
}
```

---

## 참고 자료

- [Ranvier MUD Engine](https://ranviermud.com/)
- [Ranvier GitHub](https://github.com/RanvierMUD/ranviermud)
- [TalesMUD GitHub](https://github.com/TalesMUD/talesmud)
- [Notes on building TalesMUD](https://medium.com/@atla/notes-on-building-talesmud-4a298fa69dde)
- [Furcadia](https://cms.furcadia.com/)
- [Furcadia Dream Editor](https://cms.furcadia.com/creations/dreammaking/dreamtutorials/dream-ed)
