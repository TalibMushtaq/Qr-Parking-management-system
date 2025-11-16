import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserDashboard from '../components/UserDashboard';
import Navbar from '../components/Navbar';
import LoadingOverlay from '../components/LoadingOverlay';

const UserDashboardPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) {
    return <LoadingOverlay />;
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      {isLoading && <LoadingOverlay />}
      <UserDashboard setIsLoading={setIsLoading} />
    </>
  );
};

export default UserDashboardPage;

