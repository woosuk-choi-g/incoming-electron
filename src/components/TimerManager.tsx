import { useState } from 'react';
import Timer from './Timer';

function TimerManager() {
  const [timers, setTimers] = useState([
    { id: 'timer1', title: '10분 타이머', duration: 600000 },
    { id: 'timer2', title: '5분 타이머', duration: 300000 },
    { id: 'timer3', title: '3분 타이머', duration: 180000 },
  ]);

  const addTimer = () => {
    const newTimer = {
      id: `timer${Date.now()}`,
      title: '새 타이머',
      duration: 600000
    };
    setTimers(prev => [...prev, newTimer]);
  };

  const removeTimer = (id: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== id));
  };

  return (
    <div className="timer-manager">
      <h1>여러 타이머 관리</h1>
      <button onClick={addTimer} className="add-timer-button">
        새 타이머 추가
      </button>

      <div className="timers-grid">
        {timers.map(timer => (
          <div key={timer.id} className="timer-wrapper">
            <Timer
              id={timer.id}
              title={timer.title}
              duration={timer.duration}
              onComplete={() => {
                console.log(`${timer.title} 완료!`);
                // 완료 시 자동으로 제거하거나 다른 작업 수행 가능
              }}
            />
            <button
              onClick={() => removeTimer(timer.id)}
              className="remove-timer-button"
            >
              타이머 제거
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TimerManager;
