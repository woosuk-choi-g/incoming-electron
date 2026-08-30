import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import ReactErrorBoundary from './components/ReactErrorBoundary.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReactErrorBoundary>
      <App />
    </ReactErrorBoundary>
  </React.StrictMode>
);
