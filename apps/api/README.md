# @super-insect-battle/api

Hono 기반 배틀 API. **Cloudflare Workers + D1**로 배포한다.

## 엔드포인트

- `GET  /api/arthropods` — 절지동물 목록
- `GET  /api/arthropods/:id` — 절지동물 상세
- `POST /api/battle` — 배틀 실행 (SSE 스트림)
- `POST /api/battle/stats` — N회 배틀 실행 + 상성 통계 누적 저장
- `GET  /api/history` — 배틀 히스토리 목록
- `GET  /api/history/:id` — 배틀 상세 + 로그
- `GET  /api/history/stats/:playerId/:opponentId` — 누적 상성 통계

## 로컬 개발

```bash
pnpm --filter @super-insect-battle/api dev        # wrangler dev (http://localhost:8787)
pnpm --filter @super-insect-battle/api db:migrate:local
```

`wrangler dev`는 로컬 D1(miniflare)을 사용하므로 Cloudflare 계정 없이도 동작한다.

## 최초 배포 준비 (1회)

1. Cloudflare 로그인
   ```bash
   pnpm exec wrangler login
   ```
2. D1 데이터베이스 생성
   ```bash
   cd apps/api
   pnpm exec wrangler d1 create super-insect-battle
   ```
3. 출력된 `database_id`를 `wrangler.toml`의
   `REPLACE_WITH_YOUR_D1_DATABASE_ID` 자리에 채운다.
4. 원격 D1에 마이그레이션 적용
   ```bash
   pnpm db:migrate:remote
   ```
5. 배포
   ```bash
   pnpm deploy
   ```
   배포 후 출력되는 `*.workers.dev` 주소가 API URL이다.

## CI 자동 배포

`.github/workflows/deploy-api.yml`가 `main` 브랜치의 `apps/api/**` 변경 시
원격 D1 마이그레이션 적용 후 Worker를 배포한다. 저장소 Secrets에 다음이 필요하다.

- `CLOUDFLARE_API_TOKEN` — Workers + D1 편집 권한 토큰
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare 계정 ID

## 웹 연동

웹(`apps/web`)은 빌드 시 `VITE_API_URL` 환경변수로 API 주소를 주입받는다.
GitHub Pages 배포에서는 저장소 **Variables**에 `VITE_API_URL`을
배포된 Worker 주소로 설정한다. 미설정 시 통계 페이지의 브라우저 모드만 동작한다.
