import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import SessionReport from './SessionReport';
import AudioTask from './AudioTask';
import { ToastContainer } from "react-toastify";




const App = () => {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
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
