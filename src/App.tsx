import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Timer from './components/Timer';
import TimerManager from './components/TimerManager';
import TimerOverlay from './components/TimerOverlay';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/timer" element={<Timer />} />
        <Route path="/timers" element={<TimerManager />} />
        <Route path="/timer-overlay/:timerId" element={<TimerOverlay />} />
      </Routes>
    </Router>
  );
}

export default App;
