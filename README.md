# Timer Overlay - 게이머를 위한 타이머 오버레이 UI

**Timer Overlay**는 게이머를 위해 설계된 실시간 타이머 오버레이 애플리케이션입니다. 현재 Electron 데스크톱 앱으로 제공되며, 향후 웹 브라우저 지원도 계획하고 있습니다.

## 주요 기능

### ⏱️ 타이머 관리
- 실시간 타이머 생성 및 관리
- 직관적인 타이머 인터페이스
- 게임 플레이 중 실시간 타이머 표시

### 🎨 타이머 커스터마이징
- 다양한 타이머 스타일 및 테마
- 사용자 정의 색상 및 폰트 설정
- 크기 및 위치 조정 가능

### 🔄 타이머 모드
- **주기성 타이머**: 반복되는 작업을 위한 주기적 알림
- **1회성 타이머**: 단일 이벤트 기반 타이머

### 👥 프로필 공유
- 사용자 정의 타이머 설정 저장 및 공유
- 커뮤니티 프로필 공유 시스템
- 즐겨찾는 설정을 다른 사용자와 공유

### 📊 세션 공유
- 게임 세션 타이머 데이터 기록
- 세션 통계 및 분석 기능
- 다른 플레이어와 세션 데이터 공유

## 기술 스택

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Desktop Framework**: Electron
- **Styling**: CSS Modules / Styled Components
- **State Management**: React Context / Zustand
- **Testing**: Jest, React Testing Library

## 프로젝트 구조

```
electron-overlay-timer/
├── electron/                 # Electron 메인 프로세스
│   ├── main.ts              # Electron 메인 엔트리 포인트
│   ├── preload.ts           # 보안 통신을 위한 프리로드 스크립트
│   └── electron-env.d.ts    # Electron 타입 정의
├── src/                     # React 애플리케이션 소스
│   ├── components/          # 재사용 가능한 컴포넌트들
│   │   ├── Timer/          # 타이머 관련 컴포넌트
│   │   ├── Profile/        # 프로필 관리 컴포넌트
│   │   └── Settings/       # 설정 컴포넌트
│   ├── hooks/              # 커스텀 React 훅
│   ├── utils/              # 유틸리티 함수들
│   ├── styles/             # 스타일 파일들
│   └── App.tsx             # 메인 애플리케이션 컴포넌트
├── public/                 # 정적 자산 파일들
└── docs/                   # 문서 및 가이드
```

## 개발 설정

### 사전 요구사항
- Node.js 18+
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 모드로 실행 (Electron 앱)
npm run dev

# 프로덕션 빌드
npm run build

# 린팅 실행
npm run lint

# 코드 포맷팅
npm run format
```

## 기능 로드맵

### 현재 구현된 기능 ✅
- 기본 타이머 생성 및 표시
- Electron 데스크톱 앱 프레임워크

### 개발 중인 기능 🚧
- 타이머 커스터마이징 옵션
- 프로필 시스템 구현
- 주기성/1회성 타이머 모드

### 계획된 기능 📋
- 웹 브라우저 지원
- 세션 데이터 분석
- 커뮤니티 공유 플랫폼
- 모바일 앱 지원

## 기여

이 프로젝트에 기여하고 싶으시다면:

1. 프로젝트를 Fork하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some amazing feature'`)
4. 브랜치를 Push하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 라이선스

이 프로젝트는 MIT 라이선스 하에 제공됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 지원

문의사항이 있으시면 [Issues](https://github.com/your-username/timer-overlay/issues) 페이지를 통해 연락주세요.
