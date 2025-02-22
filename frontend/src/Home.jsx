import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bean from './assets/bean.png';

const Home = () => {
  const [hoveredButton, setHoveredButton] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false); // State for checking admin login
  const navigate = useNavigate();
 

  useEffect(() => {
    // Check localStorage for admin login status on component mount
    const adminLoggedInStatus = localStorage.getItem('isAdminLoggedIn');
    if (adminLoggedInStatus === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const handleSessionReportHover = () => setHoveredButton('session-report');
  const handleAudioReportHover = () => setHoveredButton('audio-task');
  const handleHoverLeave = () => setHoveredButton('');

  const handleLoginClick = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPassword(''); // Clear password when closing
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://session-report.onrender.com");

  const handlePasswordSubmit = async () => {
    try { 
      //"https://session-report.onrender.com/api/admin/login",'http://localhost:5000/api/admin/login'
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password })
      });

      const data = await response.json();

      console.log('Response Status:', response.status);
      console.log('Response Data:', data);

      if (response.ok) {
        console.log('Login successful');
        localStorage.setItem('isAdminLoggedIn', 'true'); // Store login status
        setIsModalOpen(false);

        // Store success message in localStorage
        localStorage.setItem('loginSuccessMessage', 'Logged in successfully! 💻');

        // Navigate to admin dashboard
        navigate('/admin-dashboard');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong. Please try again.');
    }
  };


  const handleLogout = async () => {

    try { 
      //"https://session-report.onrender.com/api/admin/logout",'http://localhost:5000/api/admin/logout'
      await fetch(`${API_BASE_URL}/api/admin/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      localStorage.removeItem('isAdminLoggedIn'); // Remove login status from localStorage
      setIsAdminLoggedIn(false); // Update state to reflect the logout
      navigate('/'); // Redirect back to home after logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDashboard = () => {
    navigate('/admin-dashboard'); // Redirect to the admin dashboard if clicked
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center">
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-center p-20 text-white">
        <h1 className="mb-[60px] text-[35px] pl-1 font-bold text-gray-100">
          Boomer <span className="text-xs text-gray-400 ml-1 opacity-70">v2.0.0</span>
        </h1>

        {/* Image with conditional class based on hover state */}
        <div className="relative mb-8">
          <img
            src={bean}
            alt="Mr. Bean"
            className={`max-h-[200px] transition-transform duration-500 ease-in-out transform ${hoveredButton === 'session-report' ? 'scale-x-[-1]' : ''
              } ${hoveredButton === 'audio-task' ? 'scale-x-[1]' : ''}`}
          />
        </div>

        <h1 className="text-4xl font-semibold mb-6 text-blue-400">What’s It Gonna Be?</h1>

        {/* Navigation Links */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Link
            to="/session-report"
            className="text-lg text-white bg-blue-600 hover:bg-blue-800 px-4 py-2 rounded-lg transition duration-300"
            onMouseEnter={handleSessionReportHover}
            onMouseLeave={handleHoverLeave}
          >
            Session Report
          </Link>

          <Link
            to="/audio-task"
            className="text-lg text-white bg-green-600 hover:bg-green-800 px-4 py-2 rounded-lg transition duration-300"
            onMouseEnter={handleAudioReportHover}
            onMouseLeave={handleHoverLeave}
          >
            Audio Report
          </Link>
        </div>

        {/* Login as Admin Section */}
        <div key={localStorage.getItem('isAdminLoggedIn')} className="mt-4">
          {!isAdminLoggedIn ? (
            <button
              onClick={handleLoginClick}
              className="text-blue-400 flex items-center space-x-2"
            >
              <span>🔒</span> <span className='hover:underline'>Login as Admin</span>
            </button>
          ) : (
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDashboard}
                className="text-blue-400 hover:underline flex items-center space-x-2"
              >
                <span>🚪</span> <span>Dashboard</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:underline flex items-center space-x-2"
              >
                <span>🚪</span> <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center w-80">
              <h2 className="text-lg font-semibold text-white mb-4">Admin Login</h2>

              {/* Password Input */}
              <input
                type="password"
                className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordSubmit(); // Trigger submit when Enter is pressed
                  }
                }}
              />

              {/* Buttons */}
              <div className="mt-4 flex justify-between">
                <button
                  onClick={handleCloseModal}
                  className="bg-red-500 hover:bg-red-700 px-4 py-2 rounded text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit} // Same submit handler for both button and Enter key
                  className="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded text-white"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

      

        {/* Footer Section */}
        <footer className="fixed bottom-0 w-full text-sm text-gray-400 text-center py-2 bg-gray-900">
  <p>&copy; 2025 BCR 56/57. All rights reserved.</p>
</footer>
      </div>
    </div>
  );
};

export default Home;
