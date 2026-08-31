import { defineIpcFunction } from './ipcUtil';
import type { BaseTimer, Timer } from './timer';

export const getTimer = defineIpcFunction<[timerId: string], Timer | undefined>(
  'get-timer'
);
export const getAllTimers = defineIpcFunction<[], Timer[]>('get-all-timers');
export const addTimer = defineIpcFunction<[option: BaseTimer], Timer>(
  'add-timer'
);
export const updateTimer = defineIpcFunction<[timerId: string, option: BaseTimer], void>(
  'update-timer'
);
export const removeTimer = defineIpcFunction<[timerId: string], void>(
  'remove-timer'
);
