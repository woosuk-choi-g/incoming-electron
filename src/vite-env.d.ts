/// <reference types="vite/client" />

declare global {
  interface Window {
    electronAPI: {
      createTimerWindow: () => Promise<void>;
    };
  }
}
