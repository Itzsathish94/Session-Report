// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';  // Import your Home component
import SessionReport from './SessionReport';  // Import your SessionReport component
import AudioTask from './AudioTask';          // Import your AudioTask component

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center justify-center">
        {/* Define Routes for the Pages */}
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
