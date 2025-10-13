import { useParams } from 'react-router-dom';
import Timer from './Timer';

function TimerOverlay() {
  const { timerId } = useParams<{ timerId: string }>();

  if (!timerId) {
    return (
      <div className="timer-overlay-error">
        <h2>타이머 ID가 필요합니다</h2>
        <p>올바른 타이머 오버레이 URL을 사용해주세요.</p>
      </div>
    );
  }

  return (
    <div className="timer-overlay">
      <Timer
        id={timerId}
        title={`${timerId} 오버레이 타이머`}
        duration={600000} // 기본 10분
        onComplete={() => {
          // 타이머 완료 시 창을 닫을 수 있는 로직
          console.log('타이머 완료:', timerId);
        }}
      />
    </div>
  );
}

export default TimerOverlay;
