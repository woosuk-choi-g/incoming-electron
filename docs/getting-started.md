# 시작하기

Timer Overlay를 로컬에서 실행하고 검증하기 위한 기본 절차입니다.

## 사전 준비

- Node.js 22.12 이상
- npm

## 의존성 설치

```bash
npm install
```

루트에서 실행하면 renderer와 Electron 프로세스에 필요한 패키지가 함께
설치됩니다.

## 개발 서버 실행

```bash
npm run dev
```

`vite-plugin-electron`이 Vite 개발 서버와 Electron 앱을 함께 실행하며 코드
변경 시 자동으로 다시 로드합니다.

## 정적 검사와 포맷팅

```bash
npm run lint
npm run typecheck
npm run format
```

`format`은 파일을 직접 수정하므로 변경 사항을 확인한 뒤 커밋하세요.

## 빌드와 패키징

```bash
npm run build
```

타입 검사, Vite 빌드, 환경 파일 복사, `electron-builder` 순으로 실행됩니다.
결과는 `dist/`, `dist-electron/`, `release/`에 생성됩니다.

기존 빌드 결과를 제거하려면 다음 명령을 사용합니다.

```bash
npm run clean
```

## E2E 테스트

```bash
npm run test:e2e
```

`pretest:e2e`가 프로덕션 빌드를 먼저 수행한 뒤 Playwright가 실제 Electron
GUI를 실행합니다.

인터랙티브 UI에서 테스트를 디버깅하려면 다음 명령을 사용합니다.

```bash
npm run build
npm run test:e2e:ui
```

`test:e2e:ui`는 프로덕션 빌드를 자동 실행하지 않으므로 자산이 변경되었다면
먼저 `npm run build`를 실행해야 합니다.

환경 파일의 역할과 빌드 연동 방식은
[빌드 환경 변수 가이드](build-environment.md)를 참고하세요.
