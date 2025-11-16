import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import LoadingOverlay from './LoadingOverlay';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const response = await authAPI.verify();
        const userData = response.data.user;
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!user) {
    // Redirect to appropriate login page
    if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/user/login" replace />;
  }

  // Check if user has required role
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

