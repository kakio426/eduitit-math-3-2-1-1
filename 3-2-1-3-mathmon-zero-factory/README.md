# 매스몬 0 공장

에듀잇티 수학 게임 시리즈 3탄입니다.

- 대상: 3학년 2학기 1단원 3차시
- 학습: (몇십)×(몇십), (몇십몇)×(몇십)
- 문제: 0 처리가 필요한 곱셈 문제 10개 랜덤 출제
- 방식: `0 뗀 곱 계산 -> 0 붙이기` 2단계 선택형
- 보상: 한 문제를 끝낼 때마다 상자 칸이 채워지고, 컨베이어에서 닫힌 상자가 움직임
- 결과: 오늘 만든 상자를 크게 보여 주고, 상자가 간 길은 한 줄 이야기로만 보여 줌
- 실행: `index.html`을 브라우저에서 열기

## 설계 의도

`매스몬 0 공장`은 끝에 0이 붙은 곱셈을 통째로 외우게 하지 않고, 먼저 0을 잠깐 떼어 0 없는 곱셈을 한 뒤 떼어 낸 0을 다시 붙이는 원리를 연습하게 만듭니다.

예를 들어 `30 × 40`은 `3 × 4 = 12`를 먼저 고른 뒤, 두 수 끝의 0이 모두 2개였다는 것을 골라 `1,200`을 완성합니다. `27 × 40`은 `27 × 4 = 108`을 먼저 고르고, 끝의 0 1개를 붙여 `1,080`을 완성합니다.

보상은 `오늘 만든 상자` 하나로 유지합니다. 문제 안에서 한 번이라도 틀리면 그 문제는 고쳐서 보내는 상자로 처리해, 일부러 틀려 보상을 노리는 흐름을 막습니다. 문제 화면에는 10칸 상자 진행만 작게 두고, 보상 팝업에는 현재 등급의 상자 이미지와 한 줄 라벨만 보이게 했습니다. 보통·빠른 벨트·고쳐서 보냄·잠깐 멈춤·문이 열림·무지개 상자는 상자 이미지와 짧은 모션으로 구분합니다. 결과 화면에서는 상자 등급을 중심 보상으로 크게 보여 주고, 상자가 간 길은 제목 아래 한 줄 이야기와 배경 장면으로만 보입니다. 매스몬은 성과에 따라 바뀌지 않고, 결과 화면 옆에 냥냥몬 1마리만 작게 붙습니다.

3차시는 1차시 매스몬 기준에 맞춰 새로 만든 `0 공장 동물 매스몬팩`을 원본으로 둡니다. 실행 화면에서는 냥냥몬만 고정 동행으로 쓰고, 나머지 매스몬은 성과 등급이나 수집 보상으로 쓰지 않습니다. 원본 관리는 `_shared/mathmon/zero-factory-animal-pack/`에서 하고, 실행 패키지에는 필요한 WebP만 둡니다. 기존 0 공장팩과 V2 장난감/클레이풍 팩은 보존만 하고 실행에는 쓰지 않습니다.

상자 보상 자산은 `_shared/mathmon/zero-factory-animal-pack/toybox/`에서 관리합니다. 실행 화면에는 상자 등급 7종, 검사문, 조용한 컨베이어 무대, 닫힌 상자, 이벤트 오버레이만 복사합니다. 캐릭터가 보이는 초기 toybox 시안은 공유 폴더에 보존만 하며 런타임에서는 제외합니다.

## 화면

스크린샷은 `screenshots/` 폴더에 저장합니다.

## RasterStage 이미지

- `cover-generated.png`: 첫 화면 생성 이미지 원본
- `cover-generated.webp`: 첫 화면 배포용 WebP
- `title-logo-chromakey.png`: GPT Image로 만든 첫 화면 제목 로고 원본
- `title-logo-generated.png`: 초록 배경 제거 후 크롭한 제목 로고 PNG
- `title-logo-generated.webp`: 첫 화면 제목 로고 배포용 WebP
- `tutorial-zero-flow-generated.png`: 설명 화면 생성 이미지 원본
- `tutorial-zero-flow-generated.webp`: 설명 화면 배포용 WebP
- `factory-conveyor-generated.png`: 문제 화면 0 공장 배경 생성 이미지 원본
- `factory-conveyor-generated.webp`: 문제 화면 0 공장 배경 배포용 WebP
- `zero-token-generated.png`: 움직이는 0 이미지 원본
- `zero-token-generated.webp`: 움직이는 0 배포용 WebP
- `toybox/*.png/webp`: 상자 등급 7종, 검사문, 컨베이어 무대, 이벤트 오버레이
- `result-class-generated.png/webp`: 우리 반 결과 화면
- `result-school-generated.png/webp`: 학교 결과 화면
- `result-town-generated.png/webp`: 동네 결과 화면
- `result-city-generated.png/webp`: 도시 결과 화면
- `result-country-generated.png/webp`: 전국 결과 화면
- `result-world-generated.png/webp`: 세계 결과 화면
- `result-space-generated.png/webp`: 무지개 상자/우주 결과 화면
- `result-retry-generated.png/webp`: 컨베이어 점검/다시하기 결과 화면

첫 화면, 설명 화면, 결과 화면은 생성 이미지를 배경으로 씁니다. 첫 화면 제목은 CSS 텍스트가 아니라 GPT Image로 만든 독립 제목 로고(`title-logo-generated.webp`)를 얹고, 목표·시작 버튼·정답 수·상자 등급처럼 매 판 달라지거나 클릭이 필요한 요소는 HTML로 얹습니다. 설명 화면은 숫자와 글자가 없는 생성 이미지(`tutorial-zero-flow-generated.webp`)로 0을 떼고 다시 붙이는 흐름을 보여 주고, 정확한 예시 수식은 HTML 오버레이로 얹습니다. 문제 화면은 생성 이미지 0 공장 배경 위에 HTML/CSS 컨베이어 보드를 올리되, 기본 화면에서는 현재 단계와 선택지를 가장 크게 보이게 했습니다. 결과 화면은 오늘 만든 상자 등급을 가장 크게 보여 줍니다.

## 파일 구성

- `index.html`: 게임 본문
- `cover-generated.webp`: 첫 화면 RasterStage 배경
- `title-logo-generated.webp`: 첫 화면 제목 로고 오버레이
- `tutorial-zero-flow-generated.webp`: 설명 화면 RasterStage 배경
- `factory-conveyor-generated.webp`: 문제 화면 0 공장 배경
- `zero-token-generated.webp`: 움직이는 0 자산
- `result-*-generated.webp`: 상자가 간 길을 보여 주는 결과 RasterStage 배경
- `eduitit-logo-mark.png`: 에듀잇티 로고
- `assets/mathmon/zero-factory-animal-pack/mathmon-zfa-04-nyangnyangmon.webp`: 결과 화면 고정 동행 매스몬
- `assets/toybox/*.webp`: 상자 등급, 검사문, 보상 컨베이어 실행 자산
- `_shared/mathmon/zero-factory-animal-pack/`: 0 공장 동물 매스몬팩 원본 관리 위치
- `screenshots/`: 화면별 스크린샷
- `REPORT.md`: 게임 설명, 화면 흐름, 보상 구조
