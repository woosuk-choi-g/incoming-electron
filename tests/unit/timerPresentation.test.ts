import { describe, expect, it } from 'vitest';
import {
  formatTimerDuration,
  getTimerPresentation,
  getTimerUrgency,
} from '../../shared/timerPresentation';

describe('timer presentation', () => {
  it('uses HH:MM:SS from ten minutes and MM:SS.cc below it', () => {
    expect(formatTimerDuration(3_661_999)).toBe('01:01:01');
    expect(formatTimerDuration(600_000)).toBe('00:10:00');
    expect(formatTimerDuration(599_999)).toBe('09:59.99');
    expect(formatTimerDuration(0)).toBe('00:00.00');
  });

  it('derives urgency at exact countdown boundaries', () => {
    expect(getTimerUrgency(10_001)).toBe('normal');
    expect(getTimerUrgency(10_000)).toBe('warning');
    expect(getTimerUrgency(3_001)).toBe('warning');
    expect(getTimerUrgency(3_000)).toBe('critical');
    expect(getTimerUrgency(0)).toBe('complete');
  });

  it('presents completed timers as a stable zero display', () => {
    expect(
      getTimerPresentation(
        { type: 'running', startTime: 1_000, expiryTime: 6_000 },
        5_000,
        7_000
      )
    ).toMatchObject({
      display: '00:00.00',
      status: 'expired',
      statusLabel: '완료',
      urgency: 'complete',
      progress: 0,
    });
  });
});
