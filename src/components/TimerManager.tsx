import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useTimers } from '../features/timer/TimerContext';
import { getTimerPresentation } from '../../shared/timerPresentation';
import useElectronAPI from '../hooks/useElectronAPI';

interface TimerConfig {
  title: string;
  hours: number;
  minutes: number;
  seconds: number;
  centiseconds: number;
  repeat: boolean;
}

const initialConfig: TimerConfig = {
  title: '',
  hours: 0,
  minutes: 0,
  seconds: 0,
  centiseconds: 0,
  repeat: false,
};

const presets = [
  { label: '30초', duration: 30_000 },
  { label: '1분', duration: 60_000 },
  { label: '3분', duration: 180_000 },
  { label: '5분', duration: 300_000 },
];

function configToDuration(config: TimerConfig): number {
  return (
    config.hours * 3_600_000 +
    config.minutes * 60_000 +
    config.seconds * 1_000 +
    config.centiseconds * 10
  );
}

function TimerManager() {
  const { timers, runtime, createTimer, openTimer, removeTimer } = useTimers();
  const [config, setConfig] = useState(initialConfig);
  const [error, setError] = useState('');
  const electronAPI = useElectronAPI();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const dispose = electronAPI?.onTick((now) => {
      setNow(now);
    });

    return () => {
      dispose?.();
    };
  }, []);

  const setDuration = (duration: number) => {
    setConfig((current) => ({
      ...current,
      hours: Math.floor(duration / 3_600_000),
      minutes: Math.floor((duration % 3_600_000) / 60_000),
      seconds: Math.floor((duration % 60_000) / 1_000),
      centiseconds: Math.floor((duration % 1_000) / 10),
    }));
    setError('');
  };

  const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Number.parseInt(event.target.value, 10) || 0);
    setConfig((current) => ({ ...current, [event.target.name]: value }));
    setError('');
  };

  const addTimer = async (event: FormEvent) => {
    event.preventDefault();
    const duration = configToDuration(config);
    if (duration <= 0) {
      setError('시간을 1/100초 이상 설정해 주세요.');
      return;
    }

    try {
      await createTimer({
        title: config.title.trim() || `타이머 ${timers.length + 1}`,
        duration,
        repeat: config.repeat,
        state: { type: 'paused', duration },
      });
      setConfig(initialConfig);
      setError('');
    } catch {
      setError('타이머를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <main className="home-dashboard">
      <header className="product-header">
        <div>
          <span className="brand-mark" aria-hidden="true">
            I
          </span>
          <div>
            <p className="eyebrow">GAME TIMER HUD</p>
            <h1>INCOMING</h1>
          </div>
        </div>
        <div className="timer-count" aria-label={`타이머 ${timers.length}개`}>
          <strong>{timers.length}</strong>
          <span>ACTIVE TIMERS</span>
        </div>
      </header>

      <section className="dashboard-grid">
        <form
          className="create-card"
          onSubmit={addTimer}
          data-testid="timer-form"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">NEW OVERLAY</p>
              <h2>타이머 생성</h2>
            </div>
            <span className="runtime-badge">
              {runtime === 'electron' ? 'DESKTOP' : 'WEB'}
            </span>
          </div>

          <label className="field-label" htmlFor="timer-title">
            제목
          </label>
          <input
            id="timer-title"
            className="title-input"
            value={config.title}
            onChange={(event) =>
              setConfig((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            placeholder={`타이머 ${timers.length + 1}`}
            maxLength={40}
          />

          <fieldset className="duration-fields">
            <legend>시간 설정</legend>
            {[
              ['hours', '시', 99],
              ['minutes', '분', 59],
              ['seconds', '초', 59],
              ['centiseconds', '1/100초', 99],
            ].map(([name, label, max]) => (
              <label key={name as string}>
                <input
                  type="number"
                  name={name as string}
                  min="0"
                  max={max as number}
                  value={config[name as keyof TimerConfig] as number}
                  onChange={handleNumberChange}
                  data-testid={`duration-${name}`}
                />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>

          <div className="preset-row" aria-label="빠른 시간 설정">
            {presets.map((preset) => (
              <button
                type="button"
                key={preset.label}
                onClick={() => setDuration(preset.duration)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <label className="repeat-toggle">
            <input
              type="checkbox"
              checked={config.repeat}
              onChange={(event) =>
                setConfig((current) => ({
                  ...current,
                  repeat: event.target.checked,
                }))
              }
            />
            <span className="toggle-track" aria-hidden="true" />
            완료 후 자동 반복
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="create-button"
            data-testid="create-timer"
          >
            오버레이 생성 <span aria-hidden="true">→</span>
          </button>
        </form>

        <section className="timer-list-card" aria-labelledby="timer-list-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LIVE LOADOUT</p>
              <h2 id="timer-list-title">내 타이머</h2>
            </div>
            <span className="list-count">{timers.length}</span>
          </div>

          <div className="timers-list" data-testid="timer-list">
            {timers.length === 0 ? (
              <div className="empty-state" data-testid="empty-state">
                <div className="empty-icon" aria-hidden="true">
                  00
                </div>
                <h3>아직 타이머가 없습니다</h3>
                <p>프리셋을 골라 첫 오버레이를 준비하세요.</p>
              </div>
            ) : (
              timers.map((timer) => {
                const view = getTimerPresentation(
                  timer.state,
                  timer.duration,
                  timer.repeat,
                  now,
                );
                return (
                  <article
                    className="timer-item"
                    key={timer.id}
                    data-testid="timer-item"
                  >
                    <span
                      className={`item-accent urgency-${view.urgency}`}
                      aria-hidden="true"
                    />
                    <div className="timer-info">
                      <div className="item-title-row">
                        <h3>{timer.title}</h3>
                        <span className={`item-status status-${view.status}`}>
                          {view.statusLabel}
                        </span>
                      </div>
                      <div className="item-meta">
                        <strong>{view.display}</strong>
                        <span>{timer.repeat ? '반복 ON' : '1회'}</span>
                      </div>
                    </div>
                    <div className="timer-actions">
                      <button
                        type="button"
                        onClick={() => void openTimer(timer)}
                        className="open-timer-button"
                        aria-label={`${timer.title} 오버레이 열기`}
                        data-testid="open-timer"
                      >
                        열기
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeTimer(timer.id)}
                        className="remove-timer-button"
                        aria-label={`${timer.title} 제거`}
                        data-testid="remove-timer"
                      >
                        제거
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

export default TimerManager;
