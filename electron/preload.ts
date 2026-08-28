import { contextBridge, ipcRenderer } from 'electron';
import type {
  CreateTimerOption,
  Timer,
  UpdateTimerOption,
} from '../shared/timer';
import { getTimer, updateTimer } from '../shared/timerIpc';
import { invokeIpc } from './ipcRendererUtil';

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
  createTimer: async (options: CreateTimerOption) => {
    return ipcRenderer.invoke('create-timer', options);
  },
  getTimer: async (timerId: string) => {
    return invokeIpc(getTimer, timerId);
  },
  getAllTimers: async () => {
    return ipcRenderer.invoke('get-all-timers');
  },
  updateTimer: async (timerId: string, options: UpdateTimerOption) => {
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
};

export type ElectronAPI = typeof electronAPI;

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
