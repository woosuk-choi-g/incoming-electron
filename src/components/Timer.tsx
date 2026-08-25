import { useState, useEffect } from 'react';

interface TimerProps {
  id?: string;
  title?: string;
  duration?: number; // in milliseconds, default 10 minutes
  onComplete?: () => void;
}

type TimerDisplays = {
  hours: string;
  minutes: string;
  seconds: string;
  centiseconds: string;
}

type RunningState = {
  type: 'running';
  startTime: number;
  expiryTime: number;
}

type PausedState = {
  type: 'paused';
  duration: number;
}

type TimerState = RunningState | PausedState;

function Timer({ id = 'timer', title = '타이머', duration = 600000, onComplete }: TimerProps) {
  const [timerState, setTimerState] = useState<TimerState>({
    type: 'paused',
    duration,
  });

  const toTimerDisplaysAlter = (timeState: TimerState): TimerDisplays => {
    switch (timeState.type) {
      case 'running': {
        const duration = timeState.expiryTime - Date.now();
        const hours = Math.floor(duration / 3600000);
        const minutes = Math.floor((duration % 3600000) / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        const centiseconds = Math.floor((duration % 1000) / 10); // Get centiseconds (0-99)
        return {
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0'),
          centiseconds: centiseconds.toString().padStart(2, '0'),
        };
      }
      case 'paused': {
        const totalSeconds = Math.floor(timeState.duration / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const centiseconds = Math.floor((timeState.duration % 1000) / 10); // Get centiseconds (0-99)
        return {
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0'),
          centiseconds: centiseconds.toString().padStart(2, '0'),
        };
      }
    }
  }

  const [timerDisplays, setTimerDisplays] = useState(toTimerDisplaysAlter(timerState));

  // Update remaining time when expiry time changes
  useEffect(() => {

    const updateRemainingTime = () => {
      setTimerDisplays(toTimerDisplaysAlter(timerState));

      // Stop timer if time is up
      if (timerState.type === 'running' && timerState.expiryTime - Date.now() <= 0) {
        setTimerState({
          type: 'paused',
          duration,
        });
        onComplete?.();
      }
    };

    // Update immediately
    updateRemainingTime();

    if (timerState.type === 'paused') {
      return;
    }

    // Update every 10ms for smooth display (100fps)
    const interval = window.setInterval(updateRemainingTime, 10);

    return () => window.clearInterval(interval);
  }, [onComplete, timerState]);

  // Start timer function
  const startTimer = () => {
    setTimerState({
      type: 'running',
      startTime: Date.now(),
      expiryTime: Date.now() + duration,
    });
  };

  function pause(timer: RunningState): PausedState {
    return {
      type: 'paused',
      duration: timer.expiryTime - Date.now(),
    }
  }

  function pauseTimer() {
    if (timerState.type === 'paused') {
      return;
    }

    setTimerState(pause(timerState));
  }

  function resume(timer: PausedState): RunningState {
    return {
      type: 'running',
      startTime: Date.now(),
      expiryTime: Date.now() + timer.duration,
    }
  }

  function resumeTimer() {
    if (timerState.type === 'running') {
      return;
    }

    setTimerState(resume(timerState));
  }

  // Reset timer function
  const resetTimer = () => {
    setTimerState({
      type: 'paused',
      duration,
    });
  };

  return (
    <div className="timer-container">
      <div className="timer-header">
        <h1>{title}</h1>
        {id && <small>ID: {id}</small>}
      </div>

      <div className="timer-content">
        <div className="timer-display">
          <span className={`timer-time ${timerState.type === 'running' ? 'running' : ''}`}>
            {timerDisplays.minutes}:{timerDisplays.seconds}.{timerDisplays.centiseconds}
          </span>
        </div>

        <div className="timer-controls">
          <button
            className="timer-button"
            onClick={startTimer}
            disabled={timerState.type === 'running'}
          >
            {timerState.type === 'running' ? '타이머 실행 중...' : '타이머 시작'}
          </button>
          <button
            className="timer-button"
            onClick={resumeTimer}
            disabled={timerState.type === 'running'}
          >
            재개
          </button>
          <button
            className="timer-button"
            onClick={pauseTimer}
            disabled={timerState.type === 'paused'}
          >
            일시정지
          </button>
          <button
            className="timer-button"
            onClick={resetTimer}
          >
            재설정
          </button>
        </div>
      </div>
    </div>
  );
}

export default Timer;
