import { useState } from 'react';

interface TimerConfig {
  id: string;
  title: string;
  duration: number;
}

function TimerManager() {
  const [timers, setTimers] = useState<TimerConfig[]>([
    { id: 'timer1', title: '10분 타이머', duration: 600000 },
    { id: 'timer2', title: '5분 타이머', duration: 300000 },
    { id: 'timer3', title: '3분 타이머', duration: 180000 },
  ]);

  const addTimer = async () => {
    const newTimer: TimerConfig = {
      id: `timer${Date.now()}`,
      title: '새 타이머',
      duration: 600000
    };

    setTimers(prev => [...prev, newTimer]);

    // 실제 오버레이 창 생성
    try {
      await (window as any).electronAPI?.createTimerWindow(newTimer.id, newTimer.title, newTimer.duration);
    } catch (error) {
      console.error('타이머 창 생성 실패:', error);
    }
  };

  const removeTimer = async (id: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== id));

    // 창 닫기
    try {
      await (window as any).electronAPI?.closeTimerWindow(id);
    } catch (error) {
      console.error('타이머 창 닫기 실패:', error);
    }
  };

  return (
    <div className="timer-manager">
      <h1>오버레이 타이머 관리</h1>
      <p>각 타이머는 별도의 오버레이 창으로 생성됩니다</p>

      <button onClick={addTimer} className="add-timer-button">
        새 오버레이 타이머 추가
      </button>

      <div className="timers-list">
        <h2>생성된 타이머들</h2>
        {timers.map(timer => (
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
          <li>&quot;새 오버레이 타이머 추가&quot; 버튼을 클릭하면 별도의 투명한 오버레이 창이 생성됩니다</li>
          <li>각 오버레이 창은 게임이나 다른 애플리케이션 위에 항상 표시됩니다</li>
          <li>타이머가 완료되면 자동으로 창이 닫힙니다</li>
          <li>여기서 타이머를 제거하면 해당 오버레이 창도 함께 닫힙니다</li>
        </ul>
      </div>
    </div>
  );
}

export default TimerManager;
