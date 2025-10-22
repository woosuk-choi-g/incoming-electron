# 시작하기

타이머 오버레이 프로젝트를 로컬에서 실행하고 검증하기 위한 기본 절차를 정리했습니다.

## 사전 준비

- Node.js 18 이상 (LTS 권장)
- npm (Node.js 설치 시 기본 포함)

## 의존성 설치

```bash
npm install
```

루트에서 실행하면 렌더러와 Electron 프로세스에 필요한 패키지가 한 번에 설치됩니다.

## 개발 서버 실행

```bash
npm run dev
```

`vite-plugin-electron`이 Vite 개발 서버와 Electron을 동시에 띄우며, 코드 변경 시 자동으로 리로드합니다.

## 정적 검사 및 포맷팅

- ESLint: `npm run lint`
- Prettier 포맷팅: `npm run format`

Pull Request 전에 두 스크립트를 실행해 스타일과 규칙 위반을 확인하세요.

## 빌드 & 패키징

```bash
npm run build
```

타입 검사(`tsc`), Vite 빌드, 환경 변수 복사 스크립트, `electron-builder` 순으로 실행되어 `dist/`, `dist-electron/`, `release/` 산출물이 생성됩니다. 빌드 전에 루트 `.env*` 파일을 확인하세요.

## E2E 테스트

Playwright 기반의 Electron E2E 시나리오를 실행합니다.

```bash
npm run test:e2e
```

인터랙티브 디버깅이 필요하다면 다음 명령을 사용하세요.

```bash
npm run test:e2e:ui
```

이 명령은 UI 모드만 실행하므로, 자산이 변경되었다면 먼저 `npm run build`를 수행하는 것이 좋습니다.

## 프로덕션 실행

```bash
npm run start:prod
```

`prestart:prod`가 자동으로 `npm run build`를 수행하고, 이후 Electron을 프로덕션 번들(`dist-electron/main.js`)로 기동합니다. 운영 환경 변수를 확인하거나 패키지 없이 실사용 시나리오를 재현할 때 활용하세요.

## 환경 변수 검증

`.env.development`, `.env.development.local`, `.env.production`, `.env.production.local` 값이 올바르게 반영되는지 빠르게 확인하려면 다음 명령을 사용하세요.

```bash
npm run test:env
```

Vite의 `loadEnv` 결과와 각 파일의 값이 일치하지 않으면 상세한 비교 결과와 함께 실패합니다.
