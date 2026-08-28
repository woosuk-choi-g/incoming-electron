import { useEffect, useState, type CSSProperties } from 'react';
import type { Timer } from '../../shared/timer';
import { getTimerPresentation } from '../../shared/timerPresentation';

interface TimerViewProps {
  timer?: Timer;
  onPause?: () => void;
  onResume?: () => void;
}

function TimerView({ timer, onPause, onResume }: TimerViewProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!timer || timer.state.type !== 'running') return;
    const intervalId = window.setInterval(() => setNow(Date.now()), 10);
    return () => window.clearInterval(intervalId);
  }, [timer]);

  if (!timer) {
    return <div className="overlay-loading">타이머 불러오는 중…</div>;
  }

  const presentation = getTimerPresentation(timer.state, timer.duration, now);
  const canToggle = presentation.status !== 'expired';
  const isRunning = presentation.status === 'running';
  const progressStyle = {
    '--timer-progress': `${presentation.progress * 360}deg`,
  } as CSSProperties;

  return (
    <main
      className={`timer-hud urgency-${presentation.urgency}`}
      data-testid="timer-hud"
      data-urgency={presentation.urgency}
    >
      <header className="hud-header">
        <span className="hud-kicker">INCOMING</span>
        <span className={`status-chip status-${presentation.status}`}>
          <span className="status-dot" aria-hidden="true" />
          {presentation.statusLabel}
        </span>
      </header>

      <h1 className="hud-title">{timer.title}</h1>
      <div className="timer-ring" style={progressStyle} aria-hidden="true">
        <div className="timer-ring-inner">
          <output
            className="timer-time"
            data-testid="timer-display"
            aria-label={`${timer.title}, ${presentation.statusLabel}, 남은 시간 ${presentation.display}`}
          >
            {presentation.display}
          </output>
        </div>
      </div>

      <div className="hud-footer">
        <span className="precision-label">1/100 SEC PRECISION</span>
        <button
          type="button"
          className="primary-action"
          onClick={isRunning ? onPause : onResume}
          disabled={!canToggle}
          data-testid="timer-toggle"
        >
          {presentation.status === 'expired'
            ? '완료'
            : isRunning
              ? '일시정지'
              : '시작'}
        </button>
      </div>
    </main>
  );
}

export default TimerView;
