import { useState } from 'react';
import reactLogo from '../assets/react.svg';
import viteLogo from '/electron-vite.animate.svg';

function Home() {
  const [count, setCount] = useState(0);

  const openTimerWindow = async () => {
    try {
      // @ts-expect-error - electronAPI가 전역으로 선언되어 있으므로 타입 에러 무시
      await window.electronAPI.createTimerWindow();
    } catch (error) {
      console.error('타이머 창을 여는 중 오류 발생:', error);
    }
  };

  return (
    <>
      <div>
        <a href="https://electron-vite.github.io" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Electron</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      {/* Timer Section */}
      <div className="card">
        <h2>10분 타이머</h2>
        <p>현재 창에서 타이머를 시작하거나 새 창에서 열 수 있습니다.</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            className="timer-button"
            onClick={() => window.location.hash = '#/timer'}
          >
            현재 창에서 시작
          </button>
          <button
            className="timer-button"
            onClick={openTimerWindow}
          >
            새 창에서 시작
          </button>
        </div>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default Home;
