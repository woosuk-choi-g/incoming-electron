import { contextBridge, ipcRenderer } from 'electron';

// 타입 안전성을 위한 인터페이스 정의
interface ElectronAPI {
  createTimerWindow: () => Promise<void>;
}

contextBridge.exposeInMainWorld('electronAPI', {
  createTimerWindow: async () => {
    return ipcRenderer.invoke('create-timer-window');
  }
} satisfies ElectronAPI);
