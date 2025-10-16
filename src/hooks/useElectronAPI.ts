import { useMemo } from 'react';
import type { ElectronAPI } from '../../electron/electron-env';

function resolveElectronAPI(): ElectronAPI | undefined {
  return window.electronAPI;
}

function useElectronAPI(): ElectronAPI | undefined {
  return useMemo(resolveElectronAPI, []);
}

export default useElectronAPI;
