import { useState } from 'react';
import type { ChangeEvent, CSSProperties } from 'react';
import { useTimers } from '../features/timer/TimerContext';
import { getTimerDuration } from '../../shared/timerState';

function minutesToMs(minutes: number): number {
  return minutes * 60000;
}

function daysToMs(days: number): number {
  return days * 86400000;
}

function hoursToMs(hours: number): number {
  return hours * 3600000;
}

function secondsToMs(seconds: number): number {
  return seconds * 1000;
}

function centisecondsToMs(centiseconds: number): number {
  return centiseconds * 10;
}

interface TimerConfigDisplay {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  centiseconds: number;
}

function TimerManager() {
  const { timers, runtime, createTimer, removeTimer } = useTimers();
  const [timerConfigDisplay, setTimerConfigDisplay] =
    useState<TimerConfigDisplay>({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      centiseconds: 0,
    });
  const addTimer = async () => {
    const duration =
      daysToMs(timerConfigDisplay.days) +
      hoursToMs(timerConfigDisplay.hours) +
      minutesToMs(timerConfigDisplay.minutes) +
      secondsToMs(timerConfigDisplay.seconds) +
      centisecondsToMs(timerConfigDisplay.centiseconds);

    try {
      await createTimer({
        title: '새 타이머',
        duration,
        repeat: false,
      });
    } catch (error) {
      console.error('타이머 창 생성 실패:', error);
    }
  };

  const inputStyle: CSSProperties = {
    width: '40px',
    textAlign: 'right',
    fontSize: '20px',
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTimerConfigDisplay({
      ...timerConfigDisplay,
      [name]: parseInt(value) || 0,
    });
  };

  return (
    <div className="timer-manager">
      <h1>오버레이 타이머 관리</h1>
      <p>
        {runtime === 'electron'
          ? '각 타이머는 별도의 오버레이 창으로 생성됩니다'
          : '각 타이머는 별도의 브라우저 창으로 생성됩니다'}
      </p>

      <div>
        <input
          type="number"
          name="hours"
          value={timerConfigDisplay.hours}
          onChange={handleChange}
          style={inputStyle}
        />
        :
        <input
          type="number"
          name="minutes"
          value={timerConfigDisplay.minutes}
          onChange={handleChange}
          style={inputStyle}
        />
        :
        <input
          type="number"
          name="seconds"
          value={timerConfigDisplay.seconds}
          onChange={handleChange}
          style={inputStyle}
        />
        .
        <input
          type="number"
          name="centiseconds"
          value={timerConfigDisplay.centiseconds}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <button onClick={addTimer} className="add-timer-button">
        새 오버레이 타이머 추가
      </button>

      <div className="timers-list">
        <h2>생성된 타이머들</h2>
        {timers.map((timer) => (
          <div key={timer.id} className="timer-item">
            <div className="timer-info">
              <h3>{timer.title}</h3>
              <p>ID: {timer.id}</p>
              <p>시간: {Math.floor(getTimerDuration(timer.state) / 60000)}분</p>
            </div>
            <button
              onClick={() => removeTimer(timer.id)}
              className="remove-timer-button"
            >
              타이머 제거
            </button>
          </div>
        ))}
      </div>

      <div className="instructions">
        <h3>사용법:</h3>
        <ul>
          <li>
            &quot;새 오버레이 타이머 추가&quot; 버튼을 클릭하면 별도의 투명한
            오버레이 창이 생성됩니다
          </li>
          <li>
            각 오버레이 창은 게임이나 다른 애플리케이션 위에 항상 표시됩니다
          </li>
          <li>타이머가 완료되면 자동으로 창이 닫힙니다</li>
          <li>여기서 타이머를 제거하면 해당 오버레이 창도 함께 닫힙니다</li>
        </ul>
      </div>
    </div>
  );
}

export default TimerManager;
