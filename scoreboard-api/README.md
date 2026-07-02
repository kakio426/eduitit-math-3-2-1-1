# Eduitit Mathmon Scoreboard API

매스몬 정적 HTML 게임에 붙이는 별도 배포용 스코어보드 백엔드 MVP입니다.

게임 파일과 이미지는 기존 GitHub Pages 또는 정적 호스팅에 두고, 이 API는 점수 세션, 서버 검산, 점수 저장, 참가코드별 랭킹, 차시별 주간 전국 랭킹만 맡습니다.

## GitHub 인계 구조

이 폴더 하나가 백엔드 패키지입니다.

```text
scoreboard-api/
  src/       API 서버 코드
  prisma/    PostgreSQL schema, seed, migration
  tests/     서버 검산과 API 테스트
  docs/      업체 배포/연동/운영 문서
```

정적 게임 HTML과 이미지 자산은 이 서버 안에 넣지 않습니다. 업체는 GitHub 저장소를 연결한 뒤 배포 서비스의 root directory를 `scoreboard-api`로 지정해서 백엔드만 별도 서비스로 띄우면 됩니다.

GitHub에 포함할 파일은 소스, 문서, `bun.lock`, `prisma/migrations`입니다. `node_modules/`, `dist/`, `.env`는 `.gitignore`로 제외합니다.

## 연동된 차시

- `3-2-1-1-mathmon-box-run`: 상자 점수 전국 순위
- `3-2-1-2-mathmon-rocket-charge`: 연료 점수 전국 순위
- `3-2-1-3-mathmon-jump-islands`: 점프 거리 전국 순위
- `3-2-1-4-mathmon-fusion`: 합체 점수 전국 순위

각 차시의 프론트엔드 마지막 순위 화면은 `_shared/scoreboard` 공통 SVG UI를 사용합니다. 업체가 붙일 부분은 게임 HTML의 `window.MATHMON_SCOREBOARD_API_URL` 주입과 이 폴더의 API 배포입니다. 차시별 점수/답안 로그 계약은 [게임 연동](docs/GAME_INTEGRATION.md)에 정리했습니다.

## 확정된 운영 원칙

- 학생 실명, 학교명, 지역, 전화번호, 이메일은 받지 않습니다.
- 자유 닉네임 입력은 금지합니다.
- 닉네임은 서버 allowlist 조합으로만 만듭니다.
- 참가코드는 랜덤 문자열만 허용하고 학교/반 이름으로 쓰지 않습니다.
- 전국 랭킹에는 닉네임, 점수, 정답 수, 차시, 주차만 보여 줍니다.
- 참가코드, 세션 ID, DB ID, IP 주소는 공개 랭킹 응답에 넣지 않습니다.

## 기술 스택

- Bun + TypeScript
- Hono
- Prisma
- PostgreSQL
- Zod
- Biome

승인 프롬프트에는 Express가 있었지만, 이 작업 환경의 TypeScript 규칙에 맞춰 Hono로 구현했습니다. API 경로와 응답 계약은 외주 인계안의 범위를 유지합니다.

## 로컬 실행

```bash
cd scoreboard-api
bun install
bun run prisma:generate
bun run dev
```

PostgreSQL까지 연결해 확인하려면 `.env.example`을 기준으로 `.env`를 만들고 다음을 실행합니다.

```bash
bun run prisma:migrate
bun run prisma:seed
```

운영 배포에서는 개발용 `prisma:migrate` 대신 아래 명령을 씁니다.

```bash
bun run prisma:generate
bun run prisma:deploy
bun run prisma:seed
```

## 업체 배포 요약

1. GitHub 저장소에서 `scoreboard-api` 폴더를 백엔드 서비스 root directory로 지정합니다.
2. PostgreSQL 데이터베이스를 붙이고 `DATABASE_URL`을 설정합니다.
3. `FRONTEND_ORIGINS`에 실제 게임 도메인을 넣습니다. 여러 개면 쉼표로 구분합니다.
4. 첫 배포 전에 `bun run prisma:deploy`와 `bun run prisma:seed`를 실행합니다.
5. 서비스 시작 명령은 `bun run start`입니다.
6. 배포 뒤 `/health`가 `{ "status": "ok" }`를 반환하는지 확인합니다.
7. 게임 HTML에는 `window.MATHMON_SCOREBOARD_API_URL`로 배포된 API 주소를 주입합니다.

## 검증

```bash
bun run lint
bun run typecheck
bun test
bun run check
```

## 문서

- [업체 인계서](docs/VENDOR_HANDOFF.md)
- [API 명세](docs/API.md)
- [Railway 배포](docs/RAILWAY_DEPLOY.md)
- [게임 연동](docs/GAME_INTEGRATION.md)
- [개인정보와 운영](docs/PRIVACY_AND_OPERATIONS.md)
