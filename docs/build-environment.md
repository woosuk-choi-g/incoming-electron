# 빌드 환경 변수 가이드

이 프로젝트는 다양한 실행 시나리오(로컬 개발, 테스트 빌드, 배포 패키지)를 지원하기 위해 4가지 `.env` 파일만 사용합니다. 아래 지침을 따라 환경 변수를 관리하면 민감한 정보는 안전하게 유지하면서도 Electron 패키지에 필요한 설정을 전달할 수 있습니다.

- `.env.development`
- `.env.development.local`
- `.env.production`
- `.env.production.local`

## 루트 `.env` 구분

- `.env.development`: 개발 모드에서 공통으로 사용하는 기본 설정입니다. `npm run dev` 실행 시 Vite와 Electron 메인/프리로드 프로세스 모두에서 참조됩니다.
- `.env.production`: 배포 빌드에 포함될 상수를 정의합니다. `npm run build` 이후 생성되는 렌더러/메인 번들에서 사용됩니다.

## `.local` 확장자 사용

Vite의 규칙에 따라 `.env.development.local`, `.env.production.local`과 같이 `.local` 접미사를 붙이면 **개인용 오버라이드**로 취급됩니다. 이 파일들은 Git에서 무시되며, 커밋되지 않도록 반드시 루트에만 두세요. 예를 들어:

- `.env.development.local`: 팀 공용 개발 설정을 덮어쓰는 개인 토큰
- `.env.production.local`: 스테이징 환경용 임시 자격 증명

`.local` 파일은 존재할 때만 읽히므로 필요할 때 추가하고 더 이상 쓰지 않으면 삭제해도 됩니다.

## 빌드 파이프라인과의 연동

`npm run build` 스크립트는 다음 순서로 실행됩니다.

1. `tsc`로 타입 검사
2. `vite build`로 렌더러/프리로드 번들 생성
3. `node scripts/copy-env.mjs` 실행
4. `electron-builder`로 최종 패키지 생성

`scripts/copy-env.mjs`는 루트에 있는 `.env.development`, `.env.production` 파일만 `dist-electron/`으로 복사합니다. Unix 계열 OS에서는 복사된 파일에 `0600` 권한을 적용해 패키지 산출물 내부에서도 최소한의 접근 권한만 허용합니다.

> 참고: `.local` 파일은 복사 대상에 포함되지 않습니다. 배포 패키지에 포함하려면 기본 파일에 필요한 값을 반영한 뒤 빌드하세요.

## 보안 권장 사항

- 민감한 값은 항상 `.local` 혹은 Git에 추적되지 않는 루트 `.env` 파일에만 저장하세요.
- 배포 패키지에 포함되는 값은 노출 가능성을 고려해 주기적으로 교체(rotate)하거나 서버 측에서만 사용하도록 설계를 조정하세요.
- 렌더러 코드에서 직접 비밀 정보를 참조하지 말고, 필요한 경우 프리로드 스크립트나 IPC를 통해 메인 프로세스에서 안전하게 읽어오도록 하세요.

## 업데이트 절차

1. 필요한 `.env*` 파일을 수정하거나 추가합니다.
2. `npm run dev` 또는 `npm run build`를 재실행해 변경 사항이 반영되었는지 확인합니다.
3. Playwright E2E (`npm run test:e2e`) 등을 통해 주요 플로우가 예상대로 동작하는지 검증합니다.
