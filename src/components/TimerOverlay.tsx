import { useParams, useSearchParams } from 'react-router-dom';
import Timer from './Timer';

function TimerOverlay() {
  const { timerId } = useParams<{ timerId: string }>();
  const [searchParams] = useSearchParams();
  const title = searchParams.get('title');
  const duration = Number(searchParams.get('duration'));

  if (!timerId || !title || !Number.isFinite(duration) || duration <= 0) {
    return (
      <div className="timer-overlay-error">
        <h2>올바른 타이머 설정이 필요합니다</h2>
        <p>타이머 ID, 제목, 시간을 확인해주세요.</p>
      </div>
    );
  }

  return (
    <div className="timer-overlay">
      <Timer
        id={timerId}
        title={title}
        duration={duration}
        onComplete={() => {
          // 타이머 완료 시 창을 닫을 수 있는 로직
          console.log('타이머 완료:', timerId);
        }}
      />
    </div>
  );
}

export default TimerOverlay;
