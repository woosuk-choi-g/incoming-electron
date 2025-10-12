import React from 'react';

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🎉 Electron + React + TypeScript 성공! 🎉</h1>
        <p>
          축하합니다! Electron, React, 그리고 TypeScript가 성공적으로 통합되었습니다.
        </p>
        <div className="features">
          <h2>현재 설정된 기능들:</h2>
          <ul>
            <li>✅ Electron 데스크톱 애플리케이션</li>
            <li>✅ React 사용자 인터페이스</li>
            <li>✅ TypeScript 타입 안전성</li>
            <li>✅ Webpack 번들링</li>
            <li>✅ 핫 리로드 개발 모드</li>
          </ul>
        </div>
        <div className="info">
          <p>
            <strong>플랫폼:</strong> {process.platform} |
            <strong> Electron 버전:</strong> {process.versions.electron} |
            <strong> Node 버전:</strong> {process.versions.node} |
            <strong> Chrome 버전:</strong> {process.versions.chrome}
          </p>
        </div>
      </header>
    </div>
  );
};

export default App;
