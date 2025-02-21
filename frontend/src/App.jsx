import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import SessionReport from './SessionReport';
import AudioTask from './AudioTask';
import AdminDashboard from './AdminDashboard';
import { ToastContainer } from "react-toastify";
import ProtectedRoute from './ProtectedRoute';

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
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/session-report" element={<SessionReport />} />
          <Route path="/audio-task" element={<AudioTask />} />
          {/* Protect the Admin Dashboard route */}
          <Route 
            path="/admin-dashboard" 
            element={<ProtectedRoute element={<AdminDashboard />} />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
