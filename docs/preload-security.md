# Electron preload 제한 사항과 보안 계약

이 문서는 이 저장소가 사용하는 Electron 44의 `electron/preload.ts`에
적용되는 제한 사항을 정리한다. preload는 renderer보다 권한이 큰 격리 영역에서
실행되므로, `window.electronAPI`는 편의 API가 아니라 신뢰 경계다.

## 실행 환경

- `contextIsolation`은 Electron 12부터 기본값이 `true`다. preload의
  `window`와 페이지의 `window`는 서로 다른 객체이므로 값을 직접 대입하지 말고
  `contextBridge.exposeInMainWorld`를 사용한다.
- renderer sandbox는 Electron 20부터 기본값이 `true`다. `nodeIntegration`을
  `true`로 설정하면 해당 renderer의 sandbox도 꺼진다. 기본값에만 기대지 말고
  창 설정을 검토할 때 `contextIsolation: true`, `sandbox: true`,
  `nodeIntegration: false`가 유지되는지 확인한다.
- sandboxed preload는 완전한 Node.js 환경이 아니다. polyfill된 `require`로
  불러올 수 있는 것은 Electron의 renderer 모듈 일부와 `events`, `timers`,
  `url`뿐이며, 전역도 `Buffer`, 제한된 `process`, `setImmediate`,
  `clearImmediate` 등으로 제한된다. 여러 파일을 import하는 이 프로젝트의
  preload는 Vite 빌드 결과 하나로 번들되어야 한다.

## contextBridge가 전달할 수 있는 값

`exposeInMainWorld`에 제공하는 API는 함수 또는 지원되는 값으로 구성된 객체여야
한다. 함수는 다른 컨텍스트로 proxy되고, 함수가 아닌 값은 복사된 뒤 동결된다.
따라서 양쪽에서 같은 객체를 공유하거나 노출 후 값을 변경해 상태를 동기화할 수
없다.

함수의 인자와 반환값도 컨텍스트 사이에서 복사된다. 문자열, 숫자, 불리언,
배열, 지원되는 값만 가진 일반 객체, `Error`, `Promise`, 함수와 Electron이
명시한 cloneable type을 사용할 수 있다. 다음 제약을 함께 고려한다.

- 사용자 정의 class 인스턴스는 prototype을 잃으므로 일반 데이터 객체로
  변환한다.
- `Symbol`은 전달할 수 없다.
- IPC로 main process에 보낼 때 함수, Promise, Symbol, WeakMap, WeakSet과
  DOM 객체(`File`, `ImageBitmap`, `DOMMatrix` 등)는 전달할 수 없다.
- Electron 29부터 `ipcRenderer` 전체를 context bridge로 전달하면 renderer에는
  빈 객체가 전달된다. 동작 여부와 별개로 raw IPC 노출은 보안상 금지한다.

## 최소 권한 IPC API

Renderer가 채널 이름을 선택할 수 없도록 각 기능을 고정된 채널의 작은 함수로
노출한다.

```ts
// 좋은 예시: renderer는 허용된 동작과 인자만 선택할 수 있다.
contextBridge.exposeInMainWorld('electronAPI', {
  getTimer: (timerId: string) => ipcRenderer.invoke('get-timer', timerId),
});
```

```ts
// 나쁜 예시: renderer가 임의의 main-process handler를 호출할 수 있다.
contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel: string, ...args: unknown[]) =>
    ipcRenderer.invoke(channel, ...args),
});
```

`ipcRenderer`나 `send`, `invoke`, `on` 자체를 직접 노출하는 것도 같은 이유로
금지한다. 새 기능에는 `electronAPI`의 기능별 wrapper와 대응하는 main-process
handler를 함께 추가한다.

## 이벤트 구독

`IpcRendererEvent`에는 `sender` 등 권한 있는 Electron 객체로 이어지는 속성이
있다. Renderer가 제공한 callback을 `ipcRenderer.on`에 직접 넘기지 말고,
preload 내부 listener가 필요한 payload만 복사해 전달해야 한다. 구독 해제 함수도
같이 반환해 listener 누수를 막는다.

```ts
// 좋은 예시: event는 preload 경계 안에 남고 구독을 해제할 수 있다.
onTimersUpdated: (callback: (timers: Timer[]) => void) => {
  const listener = (_event: IpcRendererEvent, timers: Timer[]) => {
    callback(timers);
  };

  ipcRenderer.on('timers-updated', listener);
  return () => ipcRenderer.removeListener('timers-updated', listener);
},
```

```ts
// 나쁜 예시: callback의 첫 번째 인자로 IpcRendererEvent가 유출된다.
onTimersUpdated: (callback: (...args: unknown[]) => void) => {
  ipcRenderer.on('timers-updated', callback);
},
```

## 검증 책임

Preload의 TypeScript 타입은 개발 도구일 뿐 런타임 입력을 막지 못한다. 페이지에
삽입된 스크립트는 `window.electronAPI`를 직접 호출할 수 있다고 가정한다.
따라서 다음 검증은 main process의 각 IPC handler에서 수행한다.

- 인자의 타입, 길이, 범위와 객체 shape 검증
- 요청을 보낸 frame 또는 `webContents`가 허용된 출처인지 검증
- 파일 경로, 외부 URL, shell 동작 등 시스템 자원에 대한 allowlist 적용
- 오류 응답에 비밀, 로컬 경로 또는 불필요한 내부 정보가 포함되지 않도록 제한

특히 `shell.openExternal`에 연결되는 URL은 renderer나 preload의 타입만 믿지
말고 main process에서 프로토콜과 목적지를 검증해야 한다.

## 리뷰 체크리스트

- Renderer가 임의 IPC 채널을 지정할 수 없는가?
- API가 필요한 최소 기능과 데이터만 노출하는가?
- 이벤트 callback에서 `IpcRendererEvent`를 제거했는가?
- 전달값이 bridge와 IPC 양쪽에서 복제 가능한 일반 데이터인가?
- Main-process handler가 런타임 입력과 sender를 검증하는가?
- 모든 창에서 context isolation과 sandbox가 유지되는가?
- Preload import가 최종 preload 파일로 번들되는가?

## 공식 자료

- [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- [Process Sandboxing](https://www.electronjs.org/docs/latest/tutorial/sandbox)
- [contextBridge API](https://www.electronjs.org/docs/latest/api/context-bridge)
- [ipcRenderer API](https://www.electronjs.org/docs/latest/api/ipc-renderer)
- [Security checklist](https://www.electronjs.org/docs/latest/tutorial/security)
