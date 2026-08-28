import type { TimerState, TimerStatus } from './timerState';
import { getTimerDuration, getTimerStatus } from './timerState';

export type TimerUrgency = 'normal' | 'warning' | 'critical' | 'complete';

export interface TimerPresentation {
  remainingMs: number;
  display: string;
  status: TimerStatus;
  statusLabel: string;
  urgency: TimerUrgency;
  progress: number;
}

export function formatTimerDuration(durationMs: number): string {
  const safeDuration = Math.max(0, Math.floor(durationMs));
  const hours = Math.floor(safeDuration / 3_600_000);
  const minutes = Math.floor((safeDuration % 3_600_000) / 60_000);
  const seconds = Math.floor((safeDuration % 60_000) / 1_000);

  if (safeDuration >= 600_000) {
    return [hours, minutes, seconds]
      .map((unit) => unit.toString().padStart(2, '0'))
      .join(':');
  }

  const totalMinutes = Math.floor(safeDuration / 60_000);
  const centiseconds = Math.floor((safeDuration % 1_000) / 10);
  return `${totalMinutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
}

export function getTimerUrgency(remainingMs: number): TimerUrgency {
  if (remainingMs <= 0) return 'complete';
  if (remainingMs <= 3_000) return 'critical';
  if (remainingMs <= 10_000) return 'warning';
  return 'normal';
}

export function getTimerPresentation(
  state: TimerState,
  configuredDuration: number,
  now = Date.now()
): TimerPresentation {
  const remainingMs = getTimerDuration(state, now);
  const status = getTimerStatus(state, now);
  const statusLabels: Record<TimerStatus, string> = {
    paused: '대기',
    running: '진행 중',
    expired: '완료',
  };

  return {
    remainingMs,
    display: formatTimerDuration(remainingMs),
    status,
    statusLabel: statusLabels[status],
    urgency: getTimerUrgency(remainingMs),
    progress:
      configuredDuration > 0
        ? Math.min(1, Math.max(0, remainingMs / configuredDuration))
        : 0,
  };
}
