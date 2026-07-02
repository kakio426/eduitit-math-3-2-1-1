# 전국 순위 백엔드 업체 인계서

이 문서는 에듀잇티 매스몬 1단원 1~4차시의 전국 순위 기능을 업체가 배포하고 운영할 때 보는 시작 문서입니다.

게임 HTML과 이미지는 기존 정적 호스팅에 그대로 두고, `scoreboard-api` 폴더만 별도 백엔드 서비스로 배포합니다. 백엔드는 게임 시작 세션, 안전 닉네임 생성, 점수 제출, 서버 검산, 주간 전국 순위 조회를 맡습니다.

## GitHub 링크

- 저장소: <https://github.com/kakio426/eduitit-math-3-2>
- 현재 백엔드 폴더: <https://github.com/kakio426/eduitit-math-3-2/tree/main/scoreboard-api>
- 업체 인계서: <https://github.com/kakio426/eduitit-math-3-2/blob/main/scoreboard-api/docs/VENDOR_HANDOFF.md>
- 백엔드 README: <https://github.com/kakio426/eduitit-math-3-2/blob/main/scoreboard-api/README.md>
- API 명세: <https://github.com/kakio426/eduitit-math-3-2/blob/main/scoreboard-api/docs/API.md>
- 게임 연동 가이드: <https://github.com/kakio426/eduitit-math-3-2/blob/main/scoreboard-api/docs/GAME_INTEGRATION.md>
- Railway 배포 가이드: <https://github.com/kakio426/eduitit-math-3-2/blob/main/scoreboard-api/docs/RAILWAY_DEPLOY.md>
- 개인정보와 운영 메모: <https://github.com/kakio426/eduitit-math-3-2/blob/main/scoreboard-api/docs/PRIVACY_AND_OPERATIONS.md>
- 환경 변수 예시: <https://github.com/kakio426/eduitit-math-3-2/blob/main/scoreboard-api/.env.example>
- 공통 순위 화면 프론트 코드: <https://github.com/kakio426/eduitit-math-3-2/tree/main/_shared/scoreboard>

이 문서가 아직 GitHub에 보이지 않으면 로컬 변경분을 커밋하고 `main` 브랜치에 푸시해야 합니다.

## 업체 작업 범위

업체가 맡을 일은 아래입니다.

1. GitHub 저장소를 배포 서비스에 연결합니다.
2. 백엔드 서비스의 root directory를 `scoreboard-api`로 지정합니다.
3. PostgreSQL 데이터베이스를 만들고 `DATABASE_URL`을 설정합니다.
4. `FRONTEND_ORIGINS`에 실제 게임이 열리는 도메인을 넣습니다.
5. Prisma migration과 seed를 실행합니다.
6. API 서버를 HTTPS 주소로 배포합니다.
7. 게임 HTML이 열리기 전에 `window.MATHMON_SCOREBOARD_API_URL`에 배포된 API 주소를 주입합니다.
8. 공개 전 세션 생성, 점수 제출, 주간 순위 조회, API 실패 fallback을 확인합니다.

백엔드는 Railway가 아니어도 됩니다. Render, Fly.io, Cloud Run, VPS, 사내 인프라처럼 Bun 실행 환경을 만들 수 있고 PostgreSQL을 붙일 수 있는 곳이면 같은 구조로 운영할 수 있습니다.

## 배포 대상

배포 대상은 저장소 전체가 아니라 아래 폴더 하나입니다.

```text
scoreboard-api/
  src/       API 서버 코드
  prisma/    PostgreSQL schema, seed
  tests/     서버 검산과 API 테스트
  docs/      배포, 연동, 운영 문서
```

권장 배포 설정:

```text
Root Directory: scoreboard-api
Install Command: bun install --frozen-lockfile
Start Command: bun run start
Health Check: /health
```

첫 배포 또는 DB schema 변경 후 실행:

```bash
bun run prisma:generate
bun run prisma:deploy
bun run prisma:seed
```

정상 확인:

```bash
curl https://YOUR-SCOREBOARD-API.example.com/health
```

정상 응답:

```json
{ "status": "ok" }
```

## 환경 변수

`.env.example` 기준으로 운영 환경에 넣습니다.

```text
DATABASE_URL="postgresql://..."
FRONTEND_ORIGINS="https://your-game-domain.example"
ADMIN_TOKEN="long-random-token"
RETENTION_ANSWER_LOG_DAYS="90"
PORT="3000"
```

주의할 점:

- `DATABASE_URL`은 운영 PostgreSQL 접속 문자열입니다.
- `FRONTEND_ORIGINS`에는 게임 HTML이 실제로 열리는 도메인을 넣습니다. 여러 도메인은 쉼표로 구분합니다.
- `ADMIN_TOKEN`은 길고 예측하기 어려운 값으로 바꿉니다.
- `.env` 파일은 GitHub에 올리지 않습니다.

## 프론트 연결 방법

게임 코드를 크게 고칠 필요는 없습니다. 정적 HTML이 실행되기 전에 아래 값을 주입하면 됩니다.

```html
<script>
  window.MATHMON_SCOREBOARD_API_URL = "https://YOUR-SCOREBOARD-API.example.com";
</script>
```

현재 1~4차시는 `_shared/scoreboard/scoreboard-ui.js`의 `MathmonScoreboard.createApiBridge(...)`를 통해 백엔드와 연결됩니다.

업체가 확인할 프론트 연동 지점:

- 각 차시 `index.html`의 `SCOREBOARD_API_URL`
- 각 차시 `index.html`의 `scoreboardBridge`
- 각 차시 `index.html`의 `scoreboardAnswers`
- 각 차시 `index.html`의 `scoreboardScreen`
- 공통 렌더러 `_shared/scoreboard/scoreboard-ui.js`

API 주소가 비어 있거나 API 호출에 실패해도 게임 완료 자체는 막지 않습니다. 이 경우 학생에게는 순위 기능이 꺼진 상태로 보이고, 결과 화면은 정상으로 남아야 합니다.

## API 계약 요약

기본 경로는 `/api/v1`입니다. 자세한 요청과 응답은 [API 명세](API.md)를 기준으로 합니다.

게임 시작 세션 생성:

```http
POST /api/v1/sessions
```

```json
{
  "lessonId": "3-2-1-2-mathmon-rocket-charge",
  "participationCode": "M7K2Q"
}
```

점수 제출:

```http
POST /api/v1/scores
```

```json
{
  "sessionId": "server-session-id",
  "lessonId": "3-2-1-2-mathmon-rocket-charge",
  "nickname": "튼튼 로켓 43",
  "participationCode": "M7K2Q",
  "clientScore": "55",
  "clientCorrectCount": 10,
  "playTimeMs": 62000,
  "answers": [],
  "rewardResult": {}
}
```

주간 전국 순위 조회:

```http
GET /api/v1/leaderboards/weekly?lessonId=3-2-1-2-mathmon-rocket-charge&limit=10
```

랭킹 응답에는 공개해도 되는 값만 포함합니다.

```json
{
  "entries": [
    {
      "rank": 1,
      "nickname": "튼튼 로켓 43",
      "score": "55",
      "correctCount": 10,
      "lessonId": "3-2-1-2-mathmon-rocket-charge",
      "weekStart": "2026-06-29"
    }
  ]
}
```

## 연동 차시

| 차시 | `lessonId` | 순위 제목 | 서버 점수 | 업체 확인 포인트 |
| --- | --- | --- | --- | --- |
| 1차시 상자런 | `3-2-1-1-mathmon-box-run` | 전국 상자 순위 | 상자 점수 | 깨진 상자는 고정 감점이 아니라 실제 변화량을 `broken.amount`로 보냅니다. |
| 2차시 로켓 | `3-2-1-2-mathmon-rocket-charge` | 전국 로켓 순위 | 연료 점수 | `instantLaunch`가 마지막 보상이면 10문제 전에도 제출할 수 있습니다. |
| 3차시 점프섬 | `3-2-1-3-mathmon-jump-islands` | 전국 점프 순위 | 점프 거리 | 한 번이라도 틀린 문제는 서버 검산에서 `shaky` 보상으로 봅니다. |
| 4차시 로봇 합체 | `3-2-1-4-mathmon-fusion` | 전국 합체 순위 | 합체 에너지 | `emptyTank`는 점수를 0으로 만들고, `rainbowFuel`은 `rainbowCore`를 함께 보냅니다. |

## 개인정보와 닉네임 원칙

공개 운영에서는 아래 원칙을 유지합니다.

- 학생 실명, 학교명, 지역, 전화번호, 이메일을 받지 않습니다.
- 학생이 자유 닉네임을 직접 입력하지 않습니다.
- 닉네임은 서버가 안전 단어 목록으로 생성합니다.
- 서버가 만든 닉네임과 다른 닉네임으로 점수를 제출하면 거절합니다.
- 참가코드는 선택값이며, 쓰는 경우에도 학교명이나 반 이름이 아니라 랜덤 문자열만 씁니다.
- 공개 랭킹 응답에는 참가코드, 세션 ID, DB ID, IP 주소를 넣지 않습니다.

운영 전 업체는 개인정보 처리방침, 삭제 요청 절차, 이상 점수 숨김 절차, 백업 보관 기간을 확정해야 합니다.

## 공개 전 QA 체크리스트

업체는 공개 전에 아래를 확인합니다.

- `GET /health`가 `{ "status": "ok" }`를 반환합니다.
- `POST /api/v1/sessions`가 `sessionId`, `seed`, `nickname`을 반환합니다.
- 게임을 끝낸 뒤 `POST /api/v1/scores`가 201로 성공합니다.
- 같은 `sessionId`로 중복 제출하면 409로 막힙니다.
- 서버가 만들지 않은 닉네임으로 제출하면 거절됩니다.
- 잘못된 차시 ID는 거절됩니다.
- `GET /api/v1/leaderboards/weekly`가 순위 목록을 반환합니다.
- 랭킹 응답에 참가코드, 세션 ID, DB ID, IP 주소가 없습니다.
- 실제 게임 도메인에서 CORS 문제가 없습니다.
- API 주소를 비운 상태에서도 게임 완료와 결과 화면이 정상입니다.
- API 오류 상태에서 순위 화면이 멈추지 않고 안내와 다시 시도 버튼을 보여 줍니다.

코드 검증 명령:

```bash
cd scoreboard-api
bun install
bun run typecheck
bun run lint
bun test
```

## 비용과 운영 주의

처음 공개할 때는 사용량 상한과 알림을 먼저 걸어 둡니다.

- 배포 서비스의 월 사용량 hard limit 또는 budget alert 설정
- PostgreSQL 백업 정책 확인
- 요청 제한 유지
- 과도한 랭킹 새로고침 방지를 위한 rate limit 확인
- 이상 점수 신고 또는 관리자 숨김 처리 절차 준비

학생이 전국 순위 화면을 여러 번 새로고침할 수 있으므로, 공개 트래픽이 커질 경우 랭킹 조회 캐시 또는 CDN 캐시를 검토합니다.

## 인계 결론

업체는 `scoreboard-api`를 독립 백엔드로 배포하고, 게임 쪽에는 API 주소만 주입하면 됩니다. 게임의 마지막 전국 순위 화면은 이미 1~4차시에 들어가 있으며, 백엔드가 켜지면 같은 화면에서 서버 닉네임, 점수, 등수가 표시됩니다.
