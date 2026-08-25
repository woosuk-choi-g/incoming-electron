// src/features/timer/TimerContext.tsx

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CreateTimerOption, Timer } from '../../../shared/timer';
import {
  createTimerGateway,
  type TimerGateway,
  type TimerRuntime,
} from './timerGateway';

interface TimerContextValue {
  timers: Timer[];
  runtime: TimerRuntime;
  createTimer: (options: CreateTimerOption) => Promise<void>;
  removeTimer: (timerId: string) => Promise<void>;
}

const TimerContext = createContext<TimerContextValue | null>(null);

interface TimerProviderProps {
  children: ReactNode;
  gateway?: TimerGateway;
}

export function TimerProvider({ children, gateway }: TimerProviderProps) {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [activeGateway] = useState(() => gateway ?? createTimerGateway());

  const createTimer = useCallback(
    async (options: CreateTimerOption) => {
      const timer = await activeGateway.createTimer(options);
      setTimers((current) => [...current, timer]);
    },
    [activeGateway]
  );

  const removeTimer = useCallback(
    async (timerId: string) => {
      await activeGateway.removeTimer(timerId);

      setTimers((current) => current.filter((timer) => timer.id !== timerId));
    },
    [activeGateway]
  );

  const value = useMemo(
    () => ({
      timers,
      runtime: activeGateway.runtime,
      createTimer,
      removeTimer,
    }),
    [activeGateway.runtime, timers, createTimer, removeTimer]
  );

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
}

export function useTimers(): TimerContextValue {
  const context = useContext(TimerContext);

  if (!context) {
    throw new Error('useTimers는 TimerProvider 내부에서 사용해야 합니다.');
  }

  return context;
}
