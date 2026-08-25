import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from './electron-env';
import type { CreateTimerOption } from '../shared/timer';

contextBridge.exposeInMainWorld('electronAPI', {
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
  // pauseTimer
  // resumeTimer
} satisfies ElectronAPI);
