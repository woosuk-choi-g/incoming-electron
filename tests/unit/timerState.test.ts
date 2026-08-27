import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getTimerDuration,
  pause,
  resume,
  timerStateSchema,
} from '../../shared/timerState';

describe('timer state', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the stored duration for a paused timer', () => {
    expect(
      getTimerDuration({
        type: 'paused',
        duration: 5_000,
      })
    ).toBe(5_000);
  });

  it('calculates a running timer from its expiry time', () => {
    expect(
      getTimerDuration(
        {
          type: 'running',
          startTime: 1_000,
          expiryTime: 6_000,
        },
        2_500
      )
    ).toBe(3_500);
  });

  it('pauses a running timer with its remaining duration', () => {
    vi.useFakeTimers();
    vi.setSystemTime(2_500);

    expect(
      pause({
        type: 'running',
        startTime: 1_000,
        expiryTime: 6_000,
      })
    ).toEqual({
      type: 'paused',
      duration: 3_500,
    });
  });

  it('resumes a paused timer from the current system time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(2_500);

    expect(resume({ type: 'paused', duration: 3_500 })).toEqual({
      type: 'running',
      startTime: 2_500,
      expiryTime: 6_000,
    });
  });

  it('rejects an unknown timer state', () => {
    expect(
      timerStateSchema.safeParse({ type: 'finished', duration: 0 }).success
    ).toBe(false);
  });
});
