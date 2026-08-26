import { defineIpcFunction } from './ipcUtil';
import { CreateTimerOption, Timer } from './timer';

export const getTimer = defineIpcFunction<[timerId: string], Timer | undefined>(
  'get-timer'
);
export const getAllTimers = defineIpcFunction<[], Timer[]>('get-all-timers');
export const addTimer = defineIpcFunction<[option: CreateTimerOption], Timer>(
  'add-timer'
);
export const updateTimer = defineIpcFunction<
  [timerId: string, option: CreateTimerOption],
  void
>('update-timer');
export const removeTimer = defineIpcFunction<[timerId: string], void>(
  'remove-timer'
);
