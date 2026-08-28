# 타이머 오버레이 리서치 (2025-10-15)

## 1. Overwolf 통합을 위한 Electron 필수성

- Overwolf 개발 플랫폼은 Electron 포크(`ow-electron`)를 통해 오버레이를 배포하며, 공식 온보딩 자료와 API가 Electron 앱을 전제로 설계되어 있습니다.<sup>[1](https://dev.overwolf.com/ow-electron/getting-started/onboarding-resources/frameworks-overview/?utm_source=openai)</sup>
- 2025년 4월 개발자 업데이트에서도 Electron 34.x 업그레이드 유지가 명시되어, Electron이 여전히 통합의 기준선임을 확인할 수 있습니다.<sup>[2](https://blog.overwolf.com/developers-april-newsletter-documentation-overhaul/?utm_source=openai)</sup>
- 오버레이 포커스 모드, 게임 이벤트 라우팅, 안전 모드 등 핵심 기능은 Electron API로 노출되므로 Electron을 벗어나면 직접 접근이 불가능해집니다.<sup>[3](https://dev.overwolf.com/ow-electron/reference/Overwolf-electron-APIs/overlay/Overview/?utm_source=openai)</sup>

## 2. BrowserWindow 증가 시 성능 이슈

- Electron은 Chromium 프로세스 모델을 따르므로, `BrowserWindow`마다 렌더러 프로세스가 추가되어 창 개수가 늘수록 RAM·GPU 점유가 커집니다.<sup>[4](https://www.electronjs.org/docs/latest/tutorial/process-model?utm_source=openai)</sup>
- Overwolf의 자원 가이드에 따르면 기본 오버레이만으로도 380~420 MB 메모리를 사용하며, 다창 구성은 게임과의 자원 경쟁을 가중시킵니다.<sup>[1](https://dev.overwolf.com/ow-electron/getting-started/onboarding-resources/frameworks-overview/?utm_source=openai)</sup>
- 지원 문서에서도 창·캡처 탭이 많을수록 FPS 저하, 발열 증가가 보고되어 무분별한 창 증식이 운영 리스크가 됨을 지적합니다.<sup>[5](https://support.overwolf.com/support/solutions/articles/9000184425-performance-issues-fps-cpu-memory-?utm_source=openai)</sup>

### 성능 완화를 위한 체크리스트

- 불필요한 창은 생성 자체를 피하고, 숨김 상태에서는 즉시 제거합니다.
- `backgroundThrottling`을 활성화하고 비포커스 창에서는 타이머·애니메이션을 중지합니다.
- `webContents.performance.getMetrics()` 등으로 창별 메모리를 모니터링해 누수를 조기에 감지합니다.

## 3. 단일 창에서 ‘가상’ 다중 오버레이 구현

- Electron 30부터 `WebContentsView`(구 BrowserView)를 활용해 하나의 `BrowserWindow` 안에 여러 뷰를 삽입할 수 있어, 프로세스 수를 줄이면서 DOM 격리를 유지할 수 있습니다.<sup>[6](https://www.electronjs.org/blog?utm_source=openai)</sup>
- 항상 위(topmost) 단일 창 안에서 여러 `WebContentsView` 또는 React 라우트를 배치하고 CSS로 독립 오버레이처럼 표현할 수 있습니다.
- 고급 효과가 필요하면 오프스크린 렌더링(`BrowserWindow` + `webContents.capturePage`)으로 각 타이머 이미지를 얻어 `<canvas>` 하나에 합성하는 방식도 GPU 효율이 높습니다.<sup>[7](https://www.electronjs.org/docs/latest/tutorial/offscreen-rendering/?utm_source=openai)</sup>
- Overwolf 오버레이 모드(exclusive/standard)를 연동해 가상 오버레이가 하나의 실제 창을 공유하면서도 게임 입력 정책을 준수하도록 합니다.<sup>[3](https://dev.overwolf.com/ow-electron/reference/Overwolf-electron-APIs/overlay/Overview/?utm_source=openai)</sup>

### 권장 실험

1. 단일 `BrowserWindow` + 복수 `WebContentsView` 기반 프로토타입을 제작하고, 기존 다창 구조와 메모리·CPU를 비교합니다.
2. React 단일 DOM 기반 “가상 오버레이”와 타이머별 `WebContentsView`를 대조해 격리도와 성능을 측정합니다.
3. UI 다양성이 크다면 오프스크린 렌더링 + 캔버스 합성으로 중간 지점을 탐색합니다.

## 4. 네이티브 타이머 오버레이 PoC (Electron + Win32 DirectComposition)

### 아키텍처 개요

1. **Electron 메인 프로세스**
   - `contextBridge`를 통해 `nativeOverlay.createTimer`, `updateTimer`, `closeTimer` 등의 IPC 메서드를 노출합니다.
   - 타이머 상태를 Electron에서 관리하면서 생명주기를 네이티브 계층에 전달합니다.
2. **Node 네이티브 애드온(C++ 또는 Rust N-API)**
   - `CreateWindowEx`와 `WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_TOPMOST` 조합으로 투명 Topmost 레이어드 창을 생성합니다.
   - DirectComposition을 초기화해 반투명 표면과 애니메이션을 GPU로 합성합니다.<sup>[8](https://learn.microsoft.com/en-us/windows/win32/directcomp/why-use-directcomposition-?utm_source=openai)</sup>
   - `PerMonitorV2` DPI 인식을 적용해 다중 DPI 환경에서도 정확한 스케일을 유지합니다.<sup>[9](https://learn.microsoft.com/en-us/windows/win32/hidpi/declaring-managed-apps-dpi-aware?utm_source=openai)</sup>
3. **렌더링 전략**
   - 옵션 A: Electron 렌더러가 캔버스 `ImageData` 등 래스터 프레임을 IPC로 전달하면 네이티브 계층이 DirectComposition 비주얼로 업로드합니다.
   - 옵션 B: 타이머 UI를 DirectWrite + Direct2D 등 네이티브 코드로 직접 그려 데이터 이동을 최소화합니다.
   - Overwolf 포커스 이벤트를 후킹해 오버레이 표시/입력 정책을 동기화합니다.

### PoC 범위

- Electron UI와 동기화된 네이티브 타이머 오버레이 창 1개를 생성/종료합니다.
- 100 ms 간격으로 타이머 텍스트를 갱신하고, 테스트 하드웨어 기준 CPU 사용률을 2% 이하로 유지합니다.
- 창 클릭 스루 토글, 게임 창 상단 유지(Z-order) 동작을 창 모드/무테 창 환경에서 검증합니다.
- Overwolf 제출을 대비해 node-gyp 설정, 네이티브 DLL 서명 등 빌드 통합 절차를 정리합니다.

### 리스크 및 준수 사항

- 네이티브 오버레이 모듈은 Overwolf 안티치트 검수를 통과해야 하므로 DLL을 최소·투명하게 유지합니다.
- C++/Rust 빌드 단계 추가, 서명 요구 등 파이프라인 복잡도가 상승하므로 기대 성능 이득과 비교 평가가 필요합니다.

---

_최종 업데이트: 2025-10-15_
