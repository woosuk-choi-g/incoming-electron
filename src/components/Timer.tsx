import { useState, useEffect } from 'react';

interface TimerProps {
  id?: string;
  title?: string;
  duration?: number; // in milliseconds, default 10 minutes
  onComplete?: () => void;
}

function Timer({ id = 'timer', title = '타이머', duration = 600000, onComplete }: TimerProps) {
  const [expiryTime, setExpiryTime] = useState<number | null>(null); // Store expiry time in milliseconds
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0); // Track remaining time as state

  // Update remaining time when expiry time changes
  useEffect(() => {
    if (!expiryTime) {
      setTimeRemaining(0);
      return;
    }

    const updateRemainingTime = () => {
      const remaining = Math.max(0, expiryTime - Date.now());
      setTimeRemaining(remaining);

      // Stop timer if time is up
      if (remaining === 0 && isRunning) {
        setIsRunning(false);
        onComplete?.();
      }
    };

    // Update immediately
    updateRemainingTime();

    // Update every 10ms for smooth display (100fps)
    const interval = window.setInterval(updateRemainingTime, 10);

    return () => window.clearInterval(interval);
  }, [expiryTime, isRunning, onComplete]);

  // Format time as MM:SS.SS (SS = centiseconds)
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((milliseconds % 1000) / 10); // Get centiseconds (0-99)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  // Start timer function
  const startTimer = () => {
    setExpiryTime(Date.now() + duration);
    setIsRunning(true);
  };

  // Reset timer function
  const resetTimer = () => {
    setExpiryTime(Date.now() + duration);
    setIsRunning(false);
  };

  return (
    <div className="timer-container">
      <div className="timer-header">
        <h1>{title}</h1>
        {id && <small>ID: {id}</small>}
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
          <button
            className="timer-button"
            onClick={resetTimer}
          >
            재설정
          </button>
        </div>

        {timeRemaining === 0 && (
          <div className="timer-complete">
            <p>타이머 완료!</p>
            <button
              className="timer-button"
              onClick={resetTimer}
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
