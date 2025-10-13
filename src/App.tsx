import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Timer from './components/Timer';
import TimerManager from './components/TimerManager';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/timer" element={<Timer />} />
        <Route path="/timers" element={<TimerManager />} />
      </Routes>
    </Router>
  );
}

export default App;
