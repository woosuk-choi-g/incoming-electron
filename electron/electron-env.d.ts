/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import('electron').IpcRenderer;
  electronAPI: {
    createTimerWindow: (timerId: string, title: string, duration: number) => Promise<void>;
    closeTimerWindow: (timerId: string) => Promise<void>;
    getTimerWindows: () => Promise<string[]>;
    setWindowPosition: (x: number, y: number) => Promise<void>;
    getWindowPosition: () => Promise<{ x: number; y: number }>;
    getTimerSettings: (timerId: string) => Promise<any>;
    setTimerSettings: (timerId: string, settings: any) => Promise<void>;
  };
}
