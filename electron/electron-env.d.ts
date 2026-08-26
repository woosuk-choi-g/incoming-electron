/// <reference types="vite-plugin-electron/electron-env" />

import { CreateTimerOption } from "../shared/timer";

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
export interface ElectronAPI {
  createTimerWindow: (
    timerId: string,
    title: string,
    duration: number
  ) => Promise<void>;
  closeTimerWindow: (timerId: string) => Promise<void>;
  getTimerWindows: () => Promise<string[]>;
  setWindowPosition: (x: number, y: number) => Promise<void>;
  getWindowPosition: () => Promise<{ x: number; y: number }>;
  getTimerSettings: (timerId: string) => Promise<any>;
  setTimerSettings: (timerId: string, settings: any) => Promise<void>;
  getTrayInfo: () => Promise<{
    hasTray: boolean;
    menuLabels: string[];
  }>;
  openExternal: (url: string) => Promise<void>;
  createTimer: (options: CreateTimerOption) => Promise<Timer>;
  getTimer: (timerId: string) => Promise<Timer | undefined>;
  getAllTimers: () => Promise<Timer[]>;
  updateTimer: (timerId: string, options: CreateTimerOption) => Promise<void>;
  removeTimer: (timerId: string) => Promise<void>;
  onTimersUpdated: (callback: (timers: Timer[]) => void) => void;
  log: (message: unknown) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
