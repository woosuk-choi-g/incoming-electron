import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Timer from './components/TimerView';
import TimerManager from './components/TimerManager';
import TimerOverlay from './components/TimerOverlay';
import { TimerProvider } from './features/timer/TimerContext';
import './App.css';

function App() {
  return (
    <TimerProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/timers" element={<TimerManager />} />
          <Route path="/timer-overlay/:timerId" element={<TimerOverlay />} />
        </Routes>
      </Router>
    </TimerProvider>
  );
}

export default App;
