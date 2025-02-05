import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import bean from './assets/bean.png';

const Home = () => {

  const [hoveredButton, setHoveredButton] = useState('');

  const handleSessionReportHover = () => {
    setHoveredButton('session-report');
  };
  const handleAudioReportHover = () => {
    setHoveredButton('audio-task');
  };
  const handleHoverLeave = () => {
    setHoveredButton('');
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center">
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-center p-20 text-white">

        <h1 className='mb-[60px] text-[35px] pl-7 font-bold text-gray-100'>
          Boomer <span className='text-xs text-gray-400 ml-1 opacity-70'>v1.0.0</span>
        </h1>

        {/* Image with conditional class based on hover state */}
        <div className="relative mb-8">
          <img
            src={bean}
            alt="Mr. Bean"
            className={`max-h-[200px] transition-transform duration-500 ease-in-out transform ${hoveredButton === 'session-report' ? 'scale-x-[-1]' : ''} ${hoveredButton === 'audio-task' ? 'scale-x-[1]' : ''}`}
          />
        </div>

        <h1 className="text-4xl font-semibold mb-6 text-blue-400">What’s It Gonna Be?</h1>

        {/* Navigation Links */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Link
            to="/session-report"
            className="text-lg text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 px-4 py-2 rounded-lg transition transform duration-300 ease-out"
            onMouseEnter={handleSessionReportHover}
            onMouseLeave={handleHoverLeave}
          >
            Session Report
          </Link>

          <Link
            to="/audio-task"
            className="text-lg text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:ring-green-300 px-4 py-2 rounded-lg transition transform duration-300 ease-out"
            onMouseEnter={handleAudioReportHover}
            onMouseLeave={handleHoverLeave}
          >
            Audio Report
          </Link>
        </div>


        {/* Footer Section */}
        <footer className="absolute bottom-4 text-sm text-gray-400">
          <p>&copy; 2025 BCR 56/57. All rights reserved.</p>
        </footer>
      </div>
    </div>

  );
};

export default Home;
