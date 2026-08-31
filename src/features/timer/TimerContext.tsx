// src/features/timer/TimerContext.tsx

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { BaseTimer, Timer } from '../../../shared/timer';
import {
  createTimerGateway,
  type TimerGateway,
  type TimerRuntime,
} from './timerGateway';
import useElectronAPI from '../../hooks/useElectronAPI';

interface TimerContextValue {
  timers: Timer[];
  runtime: TimerRuntime;
  createTimer: (options: BaseTimer) => Promise<void>;
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
  const electronAPI = useElectronAPI();

  const createTimer = useCallback(
    async (options: BaseTimer) => {
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

  useEffect(() => {
    if (!electronAPI) {
      return;
    }

    const api = electronAPI;
    let ignore = false;

    async function loadTimers() {
      try {
        const loadedTimers = await api.getAllTimers();
        if (!ignore) {
          setTimers(loadedTimers);
          void api.log(`타이머 목록 로드 완료: ${loadedTimers.length}개`);
        }
      } catch (error) {
        if (!ignore) {
          void api.log(`타이머 목록 로드 실패: ${String(error)}`);
        }
      }
    }

    void loadTimers();

    return () => {
      ignore = true;
    };
  }, [electronAPI]);

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
