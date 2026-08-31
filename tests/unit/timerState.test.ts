import { describe, expect, it } from 'vitest';
import {
  advance,
  complete,
  getTimerDuration,
  getTimerStatus,
  pause,
  reset,
  resume,
  start,
  timerStateSchema,
} from '../../shared/timerState';

describe('timer state', () => {
  it('returns the stored duration for a paused timer', () => {
    expect(getTimerDuration({ type: 'paused', duration: 5_000 })).toBe(5_000);
  });

  it('calculates a running timer from its expiry time', () => {
    expect(
      getTimerDuration(
        { type: 'running', startTime: 1_000, expiryTime: 6_000 },
        2_500
      )
    ).toBe(3_500);
  });

  it('clamps an expired timer to zero', () => {
    expect(
      getTimerDuration(
        { type: 'running', startTime: 1_000, expiryTime: 6_000 },
        7_000
      )
    ).toBe(0);
  });

  it('derives paused, running, and expired status from state and time', () => {
    expect(getTimerStatus({ type: 'paused', duration: 5_000 }, 2_000)).toBe(
      'paused'
    );
    expect(
      getTimerStatus(
        { type: 'running', startTime: 1_000, expiryTime: 6_000 },
        5_999
      )
    ).toBe('running');
    expect(
      getTimerStatus(
        { type: 'running', startTime: 1_000, expiryTime: 6_000 },
        6_000
      )
    ).toBe('expired');
  });

  it('starts a timer from one captured system time', () => {
    expect(start(3_500, 2_500)).toEqual({
      type: 'running',
      startTime: 2_500,
      expiryTime: 6_000,
    });
  });

  it('rejects a non-positive or non-finite duration', () => {
    expect(() => start(0, 1_000)).toThrow('0보다 커야 합니다');
    expect(() =>
      reset(
        { type: 'running', startTime: 1_000, expiryTime: 6_000 },
        Number.POSITIVE_INFINITY,
        2_500
      )
    ).toThrow('0보다 커야 합니다');
  });

  it('pauses a one-time timer that has not yet expired', () => {
    expect(
      pause(
        { type: 'running', startTime: 1_000, expiryTime: 6_000 },
        5_000,
        false,
        2_500
      )
    ).toEqual({ type: 'paused', duration: 3_500 });
  });

  it('pauses a one-time timer that has already expired', () => {
    expect(
      pause(
        { type: 'running', startTime: 1_000, expiryTime: 6_000 },
        2_000,
        false,
        7_500
      )
    ).toEqual({ type: 'paused', duration: -1_500 });
  });

  it('pauses a repeatable timer that has not yet expired', () => {
    expect(
      pause(
        { type: 'running', startTime: 1_000, expiryTime: 6_000 },
        5_000,
        true,
        2_500
      )
    ).toEqual({ type: 'paused', duration: 3_500 });
  });

  it('pauses a repeatable timer that has already expired', () => {
    expect(
      pause(
        { type: 'running', startTime: 1_000, expiryTime: 6_000 },
        5_000,
        true,
        7_500
      )
    ).toEqual({ type: 'paused', duration: 3_500 });
  });

  it('resumes a paused timer', () => {
    expect(resume({ type: 'paused', duration: 3_500 }, 2_500)).toEqual({
      type: 'running',
      startTime: 2_500,
      expiryTime: 6_000,
    });
  });

  it('resets a paused timer', () => {
    expect(
      reset(
        { type: 'paused', duration: 3_500 },
        5_000,
        2_500
      )
    ).toEqual({ type: 'paused', duration: 5_000 });
  });

  it('resets a running timer', () => {
    expect(
      reset(
        {
          type: 'running',
          startTime: 1_000,
          expiryTime: 6_000,
        },
        5_000,
        2_500
      )
    ).toEqual(
      {
        type: 'running',
        startTime: 2_500,
        expiryTime: 7_500,
      }
    );
  });

  it('represents a completed one-shot timer as an expired running timer', () => {
    const state = complete(30_000, false, 5_000);

    expect(state).toEqual({
      type: 'running',
      startTime: -25_000,
      expiryTime: 5_000,
    });
    expect(timerStateSchema.safeParse(state).success).toBe(true);
  });

  it('starts the next cycle when a repeating timer completes', () => {
    expect(complete(30_000, true, 5_000)).toEqual({
      type: 'running',
      startTime: 5_000,
      expiryTime: 35_000,
    });
  });

  it('keeps an expired one-shot timer so completion remains derived', () => {
    const state = {
      type: 'running' as const,
      startTime: 1_000,
      expiryTime: 6_000,
    };

    expect(advance(state, 5_000, false, 8_000)).toBe(state);
    expect(getTimerStatus(state, 8_000)).toBe('expired');
  });

  it('advances repeated cycles without accumulating renderer delay', () => {
    expect(
      advance(
        { type: 'running', startTime: 1_000, expiryTime: 6_000 },
        5_000,
        true,
        17_000
      )
    ).toEqual({
      type: 'running',
      startTime: 16_000,
      expiryTime: 21_000,
    });
  });

  it('leaves a timer unchanged before it expires', () => {
    const state = {
      type: 'running' as const,
      startTime: 1_000,
      expiryTime: 6_000,
    };

    expect(advance(state, 5_000, true, 5_999)).toBe(state);
  });

  it('validates every supported state and rejects invalid durations', () => {
    expect(
      timerStateSchema.safeParse({ type: 'completed', completedAt: 6_000 })
        .success
    ).toBe(false);
    expect(
      timerStateSchema.safeParse({ type: 'paused', duration: 0 }).success
    ).toBe(false);
    expect(
      timerStateSchema.safeParse({
        type: 'running',
        startTime: 6_000,
        expiryTime: 6_000,
      }).success
    ).toBe(false);
    expect(
      timerStateSchema.safeParse({ type: 'finished', duration: 1 }).success
    ).toBe(false);
  });
});
