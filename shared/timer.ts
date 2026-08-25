import type { TimerState } from './timerState';

export interface Timer {
  id: string;
  title: string;
  state: TimerState;
}

export interface CreateTimerOption {
  title: string;
  state: TimerState;
}
