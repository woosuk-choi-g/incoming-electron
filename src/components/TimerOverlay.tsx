import { useParams } from 'react-router-dom';
import TimerView from './TimerView';
import { useCallback, useEffect, useState } from 'react';
import { Timer } from '../../shared/timer';
import { pause, resume } from '../../shared/timerState';
import useElectronAPI from '../hooks/useElectronAPI';

function TimerOverlay() {
  const { timerId } = useParams<{ timerId: string }>();
  const [timer, setTimer] = useState<Timer>();
  const electronAPI = useElectronAPI();

  useEffect(() => {
    if (timerId) {
      electronAPI?.getTimer(timerId).then((timer) => {
        setTimer(timer);
      });
    }

    const removeListener = electronAPI?.onTimersUpdated((timers) => {
      const newTimer = timers.find((timer) => timer.id === timerId);
      setTimer(newTimer);
    });
    return removeListener;
  }, [timerId]);

  if (!timerId) {
    return (
      <div className="timer-overlay-error">
        <h2>올바른 타이머 설정이 필요합니다</h2>
        <p>타이머 ID, 제목, 시간을 확인해주세요.</p>
      </div>
    );
  }

  const handlePause = useCallback(() => {
    const state = timer?.state;
    if (!state || state.type !== 'running') {
      return;
    }
    electronAPI?.updateTimer(timerId, {
      title: timer.title,
      duration: timer.duration,
      repeat: timer.repeat,
      state: pause(state, timer.duration, timer.repeat),
    });
  }, [timer]);

  const handleResume = useCallback(() => {
    const state = timer?.state;
    if (!state || state.type !== 'paused') {
      return;
    }
    electronAPI?.updateTimer(timerId, {
      title: timer.title,
      duration: timer.duration,
      repeat: timer.repeat,
      state: resume(state),
    });
  }, [timer]);

  const handleClose = useCallback(() => {
    void electronAPI?.closeTimerWindow(timerId);
  }, [electronAPI, timerId]);

  return (
    <div className="timer-overlay">
      <button
        type="button"
        className="overlay-close-button"
        aria-label="타이머 오버레이 닫기"
        title="닫기"
        data-testid="close-timer-overlay"
        onClick={handleClose}
      >
        <span aria-hidden="true">×</span>
      </button>
      <TimerView timer={timer} onPause={handlePause} onResume={handleResume} />
    </div>
  );
}

export default TimerOverlay;
