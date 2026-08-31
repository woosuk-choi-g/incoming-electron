import { contextBridge, ipcRenderer } from 'electron';
import type { BaseTimer, Timer } from '../shared/timer';
import { getTimer, onTick, updateTimer } from '../shared/timerIpc';
import { invokeIpc, onBroadcast } from './ipcRendererUtil';

/**
 * Security boundary for renderer-facing APIs.
 *
 * Keep this object a small, capability-based API:
 * - expose one wrapper per approved IPC channel; never expose `ipcRenderer` or
 *   its generic `send`, `invoke`, or `on` methods;
 * - copy only the required event payload into renderer callbacks; never pass
 *   `IpcRendererEvent`, because it exposes privileged Electron objects;
 * - accept and return contextBridge/structured-clone-compatible data only;
 * - validate every renderer argument again in the main-process handler. TypeScript
 *   types disappear at runtime and do not form a security boundary;
 * - keep `contextIsolation: true`, `sandbox: true`, and
 *   `nodeIntegration: false` on every BrowserWindow that uses this preload;
 * - bundle imports into the preload output. A sandboxed preload has only a
 *   restricted `require` implementation, not a full Node.js environment.
 *
 * Good: `readConfig: () => ipcRenderer.invoke('config:read')`
 * Bad:  `invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)`
 *
 * Good: `onTick: (cb) => ipcRenderer.on('tick', (_event, value) => cb(value))`
 * Bad:  `onTick: (cb) => ipcRenderer.on('tick', cb)`
 *
 * See ../docs/preload-security.md for the exact Electron 44 constraints,
 * rationale, review checklist, and expanded examples.
 */
const electronAPI = {
  createTimerWindow: async (
    timerId: string,
    title: string,
    duration: number
  ) => {
    return ipcRenderer.invoke('create-timer-window', {
      timerId,
      title,
      duration,
    });
  },
  closeTimerWindow: async (timerId: string) => {
    return ipcRenderer.invoke('close-timer-window', timerId);
  },
  getTimerWindows: async () => {
    return ipcRenderer.invoke('get-timer-windows');
  },
  setWindowPosition: async (x: number, y: number) => {
    return ipcRenderer.invoke('set-window-position', { x, y });
  },
  getWindowPosition: async () => {
    return ipcRenderer.invoke('get-window-position');
  },
  getTimerSettings: async (timerId: string) => {
    return ipcRenderer.invoke('get-timer-settings', timerId);
  },
  setTimerSettings: async (timerId: string, settings: any) => {
    return ipcRenderer.invoke('set-timer-settings', timerId, settings);
  },
  getTrayInfo: async () => {
    return ipcRenderer.invoke('get-tray-info');
  },
  openExternal: async (url: string) => {
    return ipcRenderer.invoke('open-external', url);
  },
  createTimer: async (options: BaseTimer) => {
    return ipcRenderer.invoke('create-timer', options);
  },
  getTimer: async (timerId: string) => {
    return invokeIpc(getTimer, timerId);
  },
  getAllTimers: async () => {
    return ipcRenderer.invoke('get-all-timers');
  },
  updateTimer: async (timerId: string, options: BaseTimer) => {
    return invokeIpc(updateTimer, timerId, options);
  },
  removeTimer: async (timerId: string) => {
    return ipcRenderer.invoke('remove-timer', timerId);
  },
  onTimersUpdated: (callback: (timers: Timer[]) => void) => {
    const listener = (_event: unknown, timers: Timer[]) => {
      callback(timers);
    };

    ipcRenderer.on('timers-updated', listener);

    return () => {
      ipcRenderer.removeListener('timers-updated', listener);
    };
  },
  log: async (message: unknown) => {
    ipcRenderer.invoke('log', message);
  },
  onTick: (callback: (now: number) => void) => {
    return onBroadcast(onTick, callback);
  },
};

export type ElectronAPI = typeof electronAPI;

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
