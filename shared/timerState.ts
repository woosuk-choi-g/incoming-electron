export interface PausedTimerState {
  type: 'paused';
  duration: number;
}

export interface RunningTimerState {
  type: 'running';
  startTime: number;
  expiryTime: number;
}

export type TimerState = PausedTimerState | RunningTimerState;

export function getTimerDuration(state: TimerState, now = Date.now()): number {
  return state.type === 'paused' ? state.duration : state.expiryTime - now;
}

export function pause(timer: RunningTimerState): PausedTimerState {
  return {
    type: 'paused',
    duration: getTimerDuration(timer),
  };
}

export function resume(timer: PausedTimerState): RunningTimerState {
  return {
    type: 'running',
    startTime: Date.now(),
    expiryTime: Date.now() + timer.duration,
  };
}
