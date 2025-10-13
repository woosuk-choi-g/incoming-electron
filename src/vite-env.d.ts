/// <reference types="vite/client" />

declare global {
  interface Window {
    electronAPI: {
      createTimerWindow: () => Promise<void>;
      on: (channel: string, listener: (...args: unknown[]) => void) => void;
      off: (channel: string, listener: (...args: unknown[]) => void) => void;
      send: (channel: string, ...args: unknown[]) => void;
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
    };
  }
}
