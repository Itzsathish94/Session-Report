import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';  
import SessionReport from './SessionReport';  
import AudioTask from './AudioTask';         

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/session-report" element={<SessionReport />} />
          <Route path="/audio-task" element={<AudioTask />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
