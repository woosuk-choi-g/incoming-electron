import z from 'zod';

const durationSchema = z.number().positive();
const timestampSchema = z.number();

export const pausedTimerStateSchema = z.object({
  type: z.literal('paused'),
  duration: durationSchema,
});

export const runningTimerStateSchema = z
  .object({
    type: z.literal('running'),
    startTime: timestampSchema,
    expiryTime: timestampSchema,
  })
  .refine((state) => state.expiryTime > state.startTime, {
    message: '종료 시각은 시작 시각보다 늦어야 합니다.',
    path: ['expiryTime'],
  });

export const timerStateSchema = z.discriminatedUnion('type', [
  pausedTimerStateSchema,
  runningTimerStateSchema,
]);

export type PausedTimerState = z.infer<typeof pausedTimerStateSchema>;
export type RunningTimerState = z.infer<typeof runningTimerStateSchema>;

/**
 * 완료 여부는 저장 상태가 아니라 현재 시각으로부터 계산한다.
 * @see ../docs/decisions/0001-derived-timer-completion.md
 */
export type TimerState = z.infer<typeof timerStateSchema>;
export type TimerStatus = TimerState['type'] | 'expired';

function assertDuration(duration: number): void {
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error('타이머 시간은 0보다 커야 합니다.');
  }
}

export function getTimerDuration(state: TimerState, now = Date.now()): number {
  if (state.type === 'paused') {
    return state.duration;
  }

  return Math.max(0, state.expiryTime - now);
}

export function getTimerStatus(
  state: TimerState,
  now = Date.now()
): TimerStatus {
  if (state.type === 'paused') {
    return 'paused';
  }

  return state.expiryTime <= now ? 'expired' : 'running';
}

export function start(duration: number, now = Date.now()): RunningTimerState {
  assertDuration(duration);

  return {
    type: 'running',
    startTime: now,
    expiryTime: now + duration,
  };
}

export function pause(
  timer: RunningTimerState,
  now = Date.now()
): PausedTimerState {
  const duration = getTimerDuration(timer, now);

  if (duration === 0) {
    throw new Error('완료된 타이머는 일시정지할 수 없습니다.');
  }

  return {
    type: 'paused',
    duration,
  };
}

export function resume(
  timer: PausedTimerState,
  now = Date.now()
): RunningTimerState {
  return start(timer.duration, now);
}

export function reset(duration: number): PausedTimerState {
  assertDuration(duration);

  return {
    type: 'paused',
    duration,
  };
}

export function complete(
  duration: number,
  repeat: boolean,
  now = Date.now()
): RunningTimerState {
  if (repeat) {
    return start(duration, now);
  }

  assertDuration(duration);
  return {
    type: 'running',
    startTime: now - duration,
    expiryTime: now,
  };
}

export function advance(
  state: TimerState,
  duration: number,
  repeat: boolean,
  now = Date.now()
): TimerState {
  if (state.type !== 'running' || now < state.expiryTime) {
    return state;
  }

  if (!repeat) {
    return state;
  }

  assertDuration(duration);
  const elapsedCycles = Math.floor((now - state.expiryTime) / duration) + 1;
  const startTime = state.expiryTime + (elapsedCycles - 1) * duration;

  return {
    type: 'running',
    startTime,
    expiryTime: startTime + duration,
  };
}
