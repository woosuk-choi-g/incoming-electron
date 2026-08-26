import { useMemo } from 'react';
import type { ElectronAPI } from '../../electron/preload';

function resolveElectronAPI(): ElectronAPI | undefined {
  return Reflect.get(window, 'electronAPI');
}

function useElectronAPI(): ElectronAPI | undefined {
  return useMemo(resolveElectronAPI, []);
}

export default useElectronAPI;
