import { contextBridge, ipcRenderer } from 'electron';

// 타입 안전성을 위한 인터페이스 정의
interface ElectronAPI {
  createTimerWindow: (timerId: string, title: string, duration: number) => Promise<void>;
  closeTimerWindow: (timerId: string) => Promise<void>;
  getTimerWindows: () => Promise<string[]>;
  setWindowPosition: (x: number, y: number) => Promise<void>;
  getWindowPosition: () => Promise<{ x: number; y: number }>;
  getTimerSettings: (timerId: string) => Promise<any>;
  setTimerSettings: (timerId: string, settings: any) => Promise<void>;
}

contextBridge.exposeInMainWorld('electronAPI', {
  createTimerWindow: async (timerId: string, title: string, duration: number) => {
    return ipcRenderer.invoke('create-timer-window', { timerId, title, duration });
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
  }
} satisfies ElectronAPI);
