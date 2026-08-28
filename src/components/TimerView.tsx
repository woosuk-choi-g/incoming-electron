import { useState, useEffect } from 'react';
import { TimerState } from '../../shared/timerState';
import type { Timer } from '../../shared/timer';

interface TimerViewProps {
  timer?: Timer;
  onPause?: () => void;
  onResume?: () => void;
}

type TimerDisplays = {
  hours: string;
  minutes: string;
  seconds: string;
  centiseconds: string;
};

function TimerView({ timer, onPause, onResume }: TimerViewProps) {
  const toTimerDisplaysAlter = (timeState: TimerState): TimerDisplays => {
    switch (timeState.type) {
      case 'running': {
        const duration = timeState.expiryTime - Date.now();
        if (duration <= 0) {
          return {
            hours: '00',
            minutes: '00',
            seconds: '00',
            centiseconds: '00',
          };
        }
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
  };

  const [timerDisplays, setTimerDisplays] = useState<TimerDisplays>({
    hours: '00',
    minutes: '00',
    seconds: '00',
    centiseconds: '00',
  });

  function updateDisplay(state: TimerState) {
    setTimerDisplays(toTimerDisplaysAlter(state));
  }

  useEffect(() => {
    if (!timer) return;
    const interval = setInterval(() => {
      updateDisplay(timer.state);
    }, 10);
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div className="timer-container">
      <div className="timer-header">
        <h1>{timer?.title}</h1>
      </div>

      <div className="timer-content">
        <div className="timer-display">
          <span
            className={`timer-time ${timer?.state.type === 'running' ? 'running' : ''}`}
          >
            {timerDisplays.minutes}:{timerDisplays.seconds}.
            {timerDisplays.centiseconds}
          </span>
        </div>

        <div className="timer-controls">
          <button
            className="timer-button"
            onClick={onResume}
            disabled={!timer || timer.state.type !== 'paused'}
          >
            재개
          </button>
          <button
            className="timer-button"
            onClick={onPause}
            disabled={!timer || timer.state.type !== 'running'}
          >
            일시정지
          </button>
        </div>
      </div>
    </div>
  );
}

export default TimerView;
