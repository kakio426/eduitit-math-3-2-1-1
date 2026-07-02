# API 명세

기본 경로는 `/api/v1`입니다. 모든 요청과 응답은 JSON입니다.

지원하는 `lessonId`는 아래 네 가지입니다.

- `3-2-1-1-mathmon-box-run`
- `3-2-1-2-mathmon-rocket-charge`
- `3-2-1-3-mathmon-jump-islands`
- `3-2-1-4-mathmon-fusion`

## `GET /health`

서버 상태 확인입니다.

```json
{ "status": "ok" }
```

## `POST /api/v1/sessions`

게임 시작 세션을 만듭니다.

요청:

```json
{
  "lessonId": "3-2-1-2-mathmon-rocket-charge",
  "participationCode": "M7K2Q"
}
```

`participationCode`는 선택값입니다. 학교명이나 반 이름이 아니라 랜덤 문자열만 넣습니다.

응답:

```json
{
  "sessionId": "8fffc8a7-7bd6-4f9f-95f8-1c4d51775efa",
  "lessonId": "3-2-1-2-mathmon-rocket-charge",
  "seed": 901234567,
  "nickname": "튼튼 로켓 43",
  "expiresAt": "2026-07-01T01:30:00.000Z"
}
```

## `POST /api/v1/sessions/:sessionId/nickname-reroll`

서버 승인 닉네임을 다시 뽑습니다. 세션당 기본 5회까지입니다.

응답:

```json
{
  "sessionId": "8fffc8a7-7bd6-4f9f-95f8-1c4d51775efa",
  "nickname": "반짝 매스몬 27"
}
```

## `POST /api/v1/scores`

점수를 제출합니다. 같은 세션은 한 번만 제출할 수 있습니다.

요청:

```json
{
  "sessionId": "8fffc8a7-7bd6-4f9f-95f8-1c4d51775efa",
  "lessonId": "3-2-1-2-mathmon-rocket-charge",
  "nickname": "튼튼 로켓 43",
  "participationCode": "M7K2Q",
  "clientScore": "50",
  "clientCorrectCount": 10,
  "playTimeMs": 62000,
  "answers": [
    {
      "questionIndex": 0,
      "elapsedMs": 4200,
      "steps": [
        { "stepId": "ones", "selected": 6, "expected": 6, "elapsedMs": 900 },
        { "stepId": "tens", "selected": 12, "expected": 12, "elapsedMs": 1100 },
        { "stepId": "hundreds", "selected": 15, "expected": 15, "elapsedMs": 1200 }
      ],
      "reward": { "id": "normal", "amount": 5 }
    }
  ],
  "rewardResult": { "destinationId": "neptune" }
}
```

응답:

```json
{
  "submissionId": "a91b66f6-b2cf-44c4-b07f-b256d8163751",
  "lessonId": "3-2-1-2-mathmon-rocket-charge",
  "nickname": "튼튼 로켓 43",
  "score": "50",
  "correctCount": 10,
  "maxScore": "100",
  "status": "accepted",
  "flagReasons": [],
  "weekStart": "2026-06-29",
  "rewardResult": { "destinationId": "neptune" }
}
```

`score`는 큰 점수 안전성을 위해 문자열입니다. 순위 정렬에는 이 값을 쓰지만, 학생 화면의 공통 순위표는 `rewardResult`를 이용해 도착한 곳·도착한 섬·얻은 로봇 같은 차시 결과명을 보여 줍니다.

`answers`는 기본 10개입니다. 다만 2차시 로켓의 `instantLaunch`처럼 차시 규칙상 마지막 보상으로 조기 종료되는 경우에만 10개보다 적은 답안 로그도 받을 수 있습니다. 3차시와 4차시는 반드시 10개를 보냅니다.

1차시 상자런의 깨진 상자는 `reward.id = "broken"`으로 보내고, `reward.amount`에는 실제 점수 변화량을 넣습니다. 예를 들어 깨진 상자에서 점수가 100100점에서 0점이 되면 `amount`는 `-100100`입니다.

## `GET /api/v1/leaderboards/weekly?lessonId=...`

차시별 주간 전국 랭킹입니다. 참가코드와 세션 ID는 응답에 포함하지 않습니다.

응답:

```json
{
  "entries": [
    {
      "rank": 1,
      "nickname": "튼튼 로켓 43",
      "score": "50",
      "correctCount": 10,
      "lessonId": "3-2-1-2-mathmon-rocket-charge",
      "weekStart": "2026-06-29",
      "rewardResult": { "destinationId": "neptune" }
    }
  ]
}
```

## `GET /api/v1/leaderboards/participation?lessonId=...&participationCode=...`

랜덤 참가코드 안 랭킹입니다. 응답 형식은 주간 전국 랭킹과 같습니다.

## 상태 코드

- `400`: 잘못된 요청, 닉네임 위반, 참가코드 불일치
- `404`: 없는 차시 또는 세션
- `409`: 이미 제출된 세션
- `422`: 서버 검산에서 거절된 점수
- `429`: 요청 제한 초과
