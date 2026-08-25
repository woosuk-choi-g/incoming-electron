import { useState } from 'react';
import type { ChangeEvent, CSSProperties } from 'react';
import useElectronAPI from '../hooks/useElectronAPI';

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

function createTimerConfig(
  timerConfigDisplay: TimerConfigDisplay
): TimerConfig {
  return {
    id: `timer${Date.now()}`,
    title: '새 타이머',
    duration:
      daysToMs(timerConfigDisplay.days) +
      hoursToMs(timerConfigDisplay.hours) +
      minutesToMs(timerConfigDisplay.minutes) +
      secondsToMs(timerConfigDisplay.seconds) +
      centisecondsToMs(timerConfigDisplay.centiseconds),
  };
}

interface TimerConfig {
  id: string;
  title: string;
  duration: number;
}

interface TimerConfigDisplay {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  centiseconds: number;
}

function TimerManager() {
  const [timerConfigDisplay, setTimerConfigDisplay] =
    useState<TimerConfigDisplay>({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      centiseconds: 0,
    });
  const [timers, setTimers] = useState<TimerConfig[]>([
    { id: 'timer1', title: '10분 타이머', duration: minutesToMs(10) },
    { id: 'timer2', title: '5분 타이머', duration: minutesToMs(5) },
    { id: 'timer3', title: '3분 타이머', duration: minutesToMs(3) },
  ]);
  const electronAPI = useElectronAPI();

  const addTimer = async () => {
    const timerConfig: TimerConfig = createTimerConfig(timerConfigDisplay);

    if (!electronAPI?.createTimerWindow) {
      console.error(
        '타이머 창 생성 API를 찾을 수 없습니다. 데스크톱 앱에서 실행 중인지 확인해주세요.'
      );
      return;
    }

    try {
      await electronAPI.createTimerWindow(
        timerConfig.id,
        timerConfig.title,
        timerConfig.duration
      );
      setTimers((prev) => [...prev, timerConfig]);
    } catch (error) {
      console.error('타이머 창 생성 실패:', error);
    }
  };

  const removeTimer = async (id: string) => {
    // 창 닫기
    try {
      await electronAPI?.closeTimerWindow(id);
    } catch (error) {
      console.error('타이머 창 닫기 실패:', error);
    }

    setTimers((prev) => prev.filter((timer) => timer.id !== id));
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
      <p>각 타이머는 별도의 오버레이 창으로 생성됩니다</p>

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
              <p>시간: {Math.floor(timer.duration / 60000)}분</p>
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
