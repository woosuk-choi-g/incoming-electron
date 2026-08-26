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
      ...timer,
      state: pause(state),
    });
  }, [timer]);

  const handleResume = useCallback(() => {
    const state = timer?.state;
    if (!state || state.type !== 'paused') {
      return;
    }
    electronAPI?.updateTimer(timerId, {
      ...timer,
      state: resume(state),
    });
  }, [timer]);

  return (
    <div className="timer-overlay">
      <TimerView
        timer={timer}
        onPause={handlePause}
        onResume={handleResume}
      />
    </div>
  );
}

export default TimerOverlay;
