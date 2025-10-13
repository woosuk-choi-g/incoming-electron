import TimerManager from './TimerManager';

function Home() {
  return (
    <div className="home-dashboard">
      <header className="dashboard-header">
        <h1>타이머 관리 대시보드</h1>
        <p>여러 타이머를 동시에 생성하고 관리하세요</p>
      </header>

      <TimerManager />
    </div>
  );
}

export default Home;
