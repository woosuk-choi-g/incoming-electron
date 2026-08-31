import { ElectronAPI } from '../../../electron/preload';
import {
  BaseTimer,
  baseTimerSchema,
  createTimer as createTimerModel,
  type Timer,
} from '../../../shared/timer';

export type TimerRuntime = 'electron' | 'web';

export interface TimerGateway {
  runtime: TimerRuntime;
  createTimer: (options: BaseTimer) => Promise<Timer>;
  removeTimer: (timerId: string) => Promise<void>;
}

type ElectronTimerAPI = Pick<ElectronAPI, 'createTimer' | 'closeTimerWindow'>;

function createElectronTimerGateway(api: ElectronTimerAPI): TimerGateway {
  return {
    runtime: 'electron',
    createTimer: (options) => api.createTimer(options),
    removeTimer: (timerId) => api.closeTimerWindow(timerId),
  };
}

function createBrowserId(): string {
  return window.crypto.randomUUID();
}

function createWebTimerGateway(): TimerGateway {
  const overlayWindows = new Map<string, Window>();

  return {
    runtime: 'web',
    createTimer: (options) => {
      const validatedOptions = baseTimerSchema.safeParse(options);
      if (!validatedOptions.success) {
        return Promise.reject(new Error('올바른 타이머 설정이 필요합니다.'));
      }

      const timer = createTimerModel(createBrowserId(), validatedOptions.data);
      const searchParams = new URLSearchParams({
        title: timer.title,
        duration: timer.duration.toString(),
      });
      const overlayUrl = new URL(window.location.href);
      overlayUrl.hash = `/timer-overlay/${encodeURIComponent(timer.id)}?${searchParams.toString()}`;

      const overlayWindow = window.open(
        overlayUrl,
        `timer-overlay-${timer.id}`,
        'popup,width=800,height=600'
      );
      if (overlayWindow) {
        overlayWindows.set(timer.id, overlayWindow);
      }

      return Promise.resolve(timer);
    },
    removeTimer: (timerId) => {
      const overlayWindow = overlayWindows.get(timerId);
      if (overlayWindow && !overlayWindow.closed) {
        overlayWindow.close();
      }
      overlayWindows.delete(timerId);
      return Promise.resolve();
    },
  };
}

export function createTimerGateway(): TimerGateway {
  const electronAPI = Reflect.get(window, 'electronAPI') as
    | ElectronAPI
    | undefined;
  return electronAPI
    ? createElectronTimerGateway(electronAPI)
    : createWebTimerGateway();
}
