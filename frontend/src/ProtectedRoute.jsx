import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Loading state for session check
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        //"https://session-report.onrender.com/api/user/names",'http://localhost:5000/api/admin/check-auth'
        const response = await fetch('https://session-report.onrender.com/api/admin/check-auth', {
          method: 'GET',
          credentials: 'include', // Include cookies for authentication
        });

        console.log('Response Status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Authentication Data:', data); // Log session data
          if (data && data.admin) {
            console.log('Authenticated: Admin session found');
            setIsAuthenticated(true); // User is authenticated
          } else {
            console.log('Not authenticated: Admin session not found');
            setIsAuthenticated(false); // User is not authenticated
          }
        } else {
          console.log('Unauthorized request, response not ok');
          setIsAuthenticated(false); // Unauthorized request
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    console.log('isAuthenticated state changed:', isAuthenticated);
    if (isAuthenticated === false) {
      // Redirect to home if not authenticated
      console.log('Redirecting to home');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // While waiting for authentication, show loading spinner
  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Optional: replace with spinner or loading message
  }

  // If authenticated, show the element (Admin Dashboard)
  if (isAuthenticated) {
    console.log('User authenticated, rendering protected route');
    return element;
  }

  // Render nothing if not authenticated
  console.log('User not authenticated, rendering nothing');
  return null;
};

export default ProtectedRoute;
