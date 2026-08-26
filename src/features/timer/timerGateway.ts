import { ElectronAPI } from '../../../electron/preload';
import type { CreateTimerOption, Timer } from '../../../shared/timer';
import { getTimerDuration } from '../../../shared/timerState';

export type TimerRuntime = 'electron' | 'web';

export interface TimerGateway {
  runtime: TimerRuntime;
  createTimer: (options: CreateTimerOption) => Promise<Timer>;
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
      if (options.title.trim().length === 0) {
        return Promise.reject(new Error('타이머 제목이 필요합니다.'));
      }

      const duration = getTimerDuration(options.state);
      if (!Number.isFinite(duration) || duration <= 0) {
        return Promise.reject(new Error('타이머 시간은 0보다 커야 합니다.'));
      }

      const timer: Timer = {
        id: createBrowserId(),
        title: options.title.trim(),
        state: options.state,
      };
      const searchParams = new URLSearchParams({
        title: timer.title,
        duration: duration.toString(),
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
