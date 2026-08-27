import z from "zod";

export const pausedTimerStateSchema = z.object({
  type: z.literal('paused'),
  duration: z.number(),
});

export type PausedTimerState = z.infer<typeof pausedTimerStateSchema>;

export const runningTimerStateSchema = z.object({
  type: z.literal('running'),
  startTime: z.number(),
  expiryTime: z.number(),
});

export const timerStateSchema = z.discriminatedUnion('type', [
  pausedTimerStateSchema,
  runningTimerStateSchema,
]);

export type RunningTimerState = z.infer<typeof runningTimerStateSchema>;

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
