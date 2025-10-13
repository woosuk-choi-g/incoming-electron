import { useState, useEffect } from 'react';

function Timer() {
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval: number | null = null;

    if (isRunning && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isRunning, timeRemaining]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Start timer function
  const startTimer = () => {
    setTimeRemaining(600); // Reset to 10 minutes
    setIsRunning(true);
  };

  return (
    <div className="timer-container">
      <div className="timer-header">
        <h1>10분 타이머</h1>
      </div>

      <div className="timer-content">
        <div className="timer-display">
          <span className={`timer-time ${isRunning ? 'running' : ''}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>

        <div className="timer-controls">
          <button
            className="timer-button"
            onClick={startTimer}
            disabled={isRunning}
          >
            {isRunning ? '타이머 실행 중...' : '타이머 시작'}
          </button>
        </div>

        {timeRemaining === 0 && (
          <div className="timer-complete">
            <p>타이머 완료!</p>
            <button
              className="timer-button"
              onClick={() => {
                setTimeRemaining(600);
                setIsRunning(false);
              }}
            >
              다시 시작
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Timer;
