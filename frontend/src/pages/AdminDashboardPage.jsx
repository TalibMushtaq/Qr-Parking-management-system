import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

const AdminDashboardPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // ProtectedRoute already validates the user, so we can safely get from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Double-check it's an admin (should already be validated by ProtectedRoute)
        if (userData.role === 'admin') {
          setUser(userData);
        } else {
          // This shouldn't happen, but handle it just in case
          navigate('/admin/login');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/admin/login');
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Don't render until we have user data
  if (!user) {
    return null;
  }

  return <AdminLayout user={user} onLogout={handleLogout} />;
};

export default AdminDashboardPage;


