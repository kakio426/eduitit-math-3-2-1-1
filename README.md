# 에듀잇티 수학 게임 시리즈 작업실

이 폴더는 차시별 수학 게임을 만들고 관리하는 로컬 원본 작업실입니다. Codex와 Claude가 함께 작업할 때는 이 구조를 기준으로 새 차시를 추가합니다.

학생 화면에는 `AI Mart`라는 이름을 쓰지 않습니다. 학생에게 보이는 이름은 `에듀잇티 수학 게임`과 각 게임 제목만 사용합니다.

## 폴더 구조

```text
ai mart/
  README.md
  CLAUDE.md
  SERIES_CONTRACT.md
  manifest.json
  _shared/
    brand/
    mathmon/
  _templates/
    lesson-package/
  _archive/
  3-2-1-1-mathmon-box-run/
  3-2-1-2-mathmon-rocket-charge/
  3-2-1-3-mathmon-jump-islands/
  3-2-1-4-mathmon-fusion/
  3-2-2-1-mathmon-divide-farm/
  3-2-2-2-mathmon-elevator/
  3-2-2-3-mathmon-star-pickup/
  3-2-2-4-mathmon-check-lock/
  3-2-3-1-mathmon-target-hit/
  3-2-3-2-mathmon-compass-ring/
  3-2-3-3-mathmon-double-bridge/
  3-2-3-4-mathmon-circle-pattern/
  3-2-4-1-mathmon-pizza-fraction/
  3-2-4-2-mathmon-fraction-scoop/
  3-2-4-3-mathmon-fraction-sorter/
  3-2-4-4-mathmon-fraction-tug/
```

## 차시 폴더 이름 규칙

```text
학년-학기-단원-차시-영문짧은이름
```

예:

- `3-2-1-1-mathmon-box-run`: 3학년 2학기 1단원 1차시, 매스몬 상자런
- `3-2-1-2-example-game`: 3학년 2학기 1단원 2차시 예시

## 차시 폴더 필수 구성

각 차시 폴더에는 최소한 아래 파일을 둡니다.

- `index.html`: 학생이 실행하는 단일 게임 파일
- `README.md`: 대상, 학습 목표, 게임 방식, 파일 구성
- `REPORT.md`: 화면 흐름, 보상 구조, 매스몬/결과 설명
- `screenshots/`: 첫 화면, 설명 화면, 문제 화면, 보상 화면, 결과 화면
- 필요한 이미지 파일: 매스몬, 로고, 보상 이미지 등

## 현재 시리즈

| 차시 | 폴더 | 게임명 | 학습 |
| --- | --- | --- | --- |
| 3학년 2학기 1단원 1차시 | `3-2-1-1-mathmon-box-run` | 매스몬 상자런 | 받아올림 없는 세 자리 수 × 한 자리 수 |
| 3학년 2학기 1단원 2차시 | `3-2-1-2-mathmon-rocket-charge` | 매스몬 로켓발사 대작전 | 받아올림 있는 세 자리 수 × 한 자리 수 |
| 3학년 2학기 1단원 3차시 | `3-2-1-3-mathmon-jump-islands` | 매스몬 10배 점프섬 | 0을 가리고 먼저 곱한 뒤 0 붙이기 |
| 3학년 2학기 1단원 4차시 | `3-2-1-4-mathmon-fusion` | 매스몬 로봇 합체 | (몇)×(몇십몇), (몇십몇)×(몇십몇) |
| 3학년 2학기 2단원 1차시 | `3-2-2-1-mathmon-divide-farm` | 매스몬 나누기 농장 | 내림 없는 몇십몇 ÷ 몇 |
| 3학년 2학기 2단원 2차시 | `3-2-2-2-mathmon-elevator` | 매스몬 엘리베이터 | 내림 있는 두 자리 수 ÷ 한 자리 수 |
| 3학년 2학기 2단원 3차시 | `3-2-2-3-mathmon-star-pickup` | 매스몬 별 줍기 | 나머지가 있는 나눗셈 |
| 3학년 2학기 2단원 4차시 | `3-2-2-4-mathmon-check-lock` | 매스몬 검산 자물쇠 | 곱셈으로 나눗셈 검산하기 |
| 3학년 2학기 3단원 1차시 | `3-2-3-1-mathmon-target-hit` | 매스몬 표적 맞히기 | 원의 중심·반지름·지름 찾기 |
| 3학년 2학기 3단원 2차시 | `3-2-3-2-mathmon-compass-ring` | 매스몬 컴퍼스 마법진 | 컴퍼스로 원 그리기 |
| 3학년 2학기 3단원 3차시 | `3-2-3-3-mathmon-double-bridge` | 매스몬 두 배 다리 | 지름은 반지름의 두 배 |
| 3학년 2학기 3단원 4차시 | `3-2-3-4-mathmon-circle-pattern` | 매스몬 원 무늬 디자이너 | 원으로 규칙·무늬 만들기 |
| 3학년 2학기 4단원 1차시 | `3-2-4-1-mathmon-pizza-fraction` | 매스몬 피자 분수 가게 | 부분과 전체로 분수 나타내기 |
| 3학년 2학기 4단원 2차시 | `3-2-4-2-mathmon-fraction-scoop` | 매스몬 분수만큼 담기 | 전체의 분수만큼 구하기 |
| 3학년 2학기 4단원 3차시 | `3-2-4-3-mathmon-fraction-sorter` | 매스몬 분수 분류 컨베이어 | 진분수·가분수·대분수 구분 |
| 3학년 2학기 4단원 4차시 | `3-2-4-4-mathmon-fraction-tug` | 매스몬 분수 줄다리기 | 분모 같은 분수·단위분수 비교 |

## 레포지토리 운영

- 이 GitHub 레포지토리 하나를 원본이자 배포 기준으로 운영합니다.
- 차시 추가, 문서 수정, 이미지 자산, GitHub Pages 배포 설정은 모두 이 레포지토리 안에서 처리합니다.

## 새 차시를 만들 때

1. `_templates/lesson-package`를 새 차시 폴더로 복사합니다.
2. `manifest.json`에 새 차시 정보를 추가합니다.
3. `SERIES_CONTRACT.md`의 첫 화면, 문제 화면, 보상 화면, 결과 화면 구조를 맞춥니다.
4. `index.html`, `README.md`, `REPORT.md`를 차시 목표에 맞게 작성합니다.
5. 태블릿 가로와 컴퓨터 화면에서 스크린샷을 확인합니다.
6. GitHub Pages 공개 URL을 확인합니다.
