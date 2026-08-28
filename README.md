# Timer Overlay

게임 중 반복 이벤트를 놓치지 않도록 별도 오버레이 창에 카운트다운을
표시하는 Electron 데스크톱 앱입니다.

현재는 타이머 핵심 흐름을 만드는 초기 단계입니다. 아래의 현재 기능과
MVP 범위를 구분해 프로젝트 상태를 설명합니다.

## 현재 기능

- 시간 입력을 통한 타이머 생성
- 타이머별 Electron 오버레이 창 생성과 종료
- 시스템 시간 기준 카운트다운 표시
- 시작·일시정지·재개·초기화·완료·반복을 표현하는 타이머 상태 모델
- 메인 창의 타이머 목록
- 시스템 트레이에서 메인 창 열기와 앱 종료
- 타이머 repository와 JSON 저장 기반
- Playwright를 이용한 Electron 실행·트레이·오버레이 E2E 테스트

저장 기반은 구현되어 있지만 앱 시작 시 복구되지 않으며, 생성·삭제·창 간
상태가 아직 완전히 동기화되지 않습니다. 자세한 작업 순서는
[로드맵](docs/ROADMAP.md)을 참고하세요.

## MVP 범위

- 타이머 생성, 수정, 삭제와 프리셋 저장
- 시작, 일시정지, 재개, 초기화, 완료, 반복
- 관리자와 여러 오버레이 사이의 상태 동기화
- 창 위치·스타일 저장과 재실행 복구
- IPC 입력 검증과 Electron 보안 강화
- 핵심 로직 테스트, Electron E2E, CI, Windows 설치 파일

웹, 모바일, 커뮤니티 공유와 네이티브 오버레이는 MVP에 포함하지 않습니다.

## 기술 스택

- React 18, TypeScript
- Electron 30
- Vite 5와 `vite-plugin-electron`
- React Router
- Zod
- ESLint와 Prettier
- Playwright Electron E2E
- electron-builder

## 프로젝트 구조

```text
incoming-electron/
├── electron/           # main process, preload, IPC, 로컬 저장
├── shared/             # renderer와 main이 공유하는 타입과 IPC 계약
├── src/
│   ├── components/     # 관리자와 오버레이 UI
│   ├── features/timer/ # 타이머 context와 runtime gateway
│   └── hooks/          # renderer hooks
├── tests/e2e/          # Playwright Electron 시나리오
├── scripts/            # 빌드 보조 스크립트
├── public/             # 정적 자산
└── docs/               # 로드맵과 개발 문서
```

## 시작하기

Node.js 22.12 이상과 npm이 필요합니다.

```bash
npm install
npm run dev
```

`npm run dev`는 Vite 개발 서버와 Electron 앱을 함께 실행합니다. 자세한
절차는 [시작하기 가이드](docs/getting-started.md)를 참고하세요.

## 품질 검사

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

- `build`는 typecheck, Vite 빌드, 환경 파일 복사, electron-builder 패키징을
  순서대로 실행합니다.
- `test:e2e`는 먼저 프로덕션 빌드를 수행한 뒤 실제 Electron GUI를
  실행합니다.
- E2E UI 디버깅은 `npm run test:e2e:ui`로 실행할 수 있습니다.

빌드 환경 설정은 [빌드 환경 변수 가이드](docs/build-environment.md)를
참고하세요.

## 문서

- [로드맵](docs/ROADMAP.md)
- [시작하기 가이드](docs/getting-started.md)
- [빌드 환경 변수 가이드](docs/build-environment.md)
- [오버레이 기술 리서치](docs/RESEARCH.md)
- [ADR 0001: 타이머 완료 여부를 파생 상태로 계산](docs/decisions/0001-derived-timer-completion.md)
