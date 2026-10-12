---
# Google DESIGN.md 규격(YAML 토큰 + 근거 문장). 확정 전 lint 경고·오류 0:
#   npx -y @google/design.md@0.4.0 lint --format json DESIGN.md
name: <프로젝트 이름>
colors:        # OKLCH. 주색 하나, 날카로운 강조 하나, 중립. 이름 붙인 색 4~6개
  primary: "oklch(0 0 0)"
typography:    # 디스플레이 서체와 한글 본문 서체의 짝, 역할
  body: { fontFamily: "Pretendard", fontSize: "17px", lineHeight: 1.6 }
spacing: {}
rounded: {}    # 반경 위계 — 모든 요소에 같은 반경 금지
motion: {}     # 시간·이징·순서 토큰
---
# <프로젝트 이름> DESIGN

## 분야와 대표 서비스
- 분야: <playbook/domains 의 id>
- 대표 서비스(국내·해외)와 확인한 날짜:

## 기능 갭 표
| 대표 서비스가 하는 것 | 근거(서비스·출처) | 이 프로젝트에 있는지 | 넣을지 | 이유 |
|---|---|---|---|---|

## 아트 디렉션
- 한 줄 콘셉트(주제의 세계에서 가장 특징적인 것 하나):
- 이 페이지만의 원칙:
- 가져올 원리(대표 서비스·수상작마다 1개, 베끼지 않는다):
- ASCII 레이아웃:

## 모션 언어
- 시그니처 모먼트(하나):
- 반응 모션(누르기·포커스·hover):
- 전환(View Transitions·공유 요소):
- reduced-motion 버전:
- 영상 필요 여부:

## 고른 시안
- 시안 링크·고른 안·이유:

## 디자인 노트 (피한 기본값)
| 날짜 | 처음 나온 기본값 | 바꾼 것 | 이유 |
|---|---|---|---|
- 잘 된 점:
