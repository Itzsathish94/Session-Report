import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://session-report.onrender.com");


const ProtectedRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        //"https://session-report.onrender.com/api/user/names",'http://localhost:5000/api/admin/check-auth'
        const response = await fetch(`${API_BASE_URL}/api/admin/check-auth`, {
          method: "GET",
          credentials: "include",
          headers: {
              "Content-Type": "application/json",
          },
      });

        console.log('Response Status:', response.status);
        if (response.ok) {
          const data = await response.json();
          if (data && data.admin) {
            setIsAuthenticated(true); 
          } else {
            console.log('Not authenticated: Admin session not found');
            setIsAuthenticated(false); 
          }
        } else {
          console.log('Unauthorized request, response not ok');
          setIsAuthenticated(false); 
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
      console.log('Redirecting to home');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; 
  }

  if (isAuthenticated) {
    console.log('User authenticated, rendering protected route');
    return element;
  }

  console.log('User not authenticated, rendering nothing');
  return null;
};

export default ProtectedRoute;
