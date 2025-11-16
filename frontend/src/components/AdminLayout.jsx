import React, { useState, createContext } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import LoadingOverlay from './LoadingOverlay';

export const AdminContext = createContext();

const AdminLayout = ({ user, onLogout }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <AdminContext.Provider value={{ setIsLoading }}>
      <div className="flex min-h-screen bg-gray-50">
        {isLoading && <LoadingOverlay />}
        <AdminSidebar user={user} onLogout={onLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet context={{ setIsLoading, user }} />
        </main>
      </div>
    </AdminContext.Provider>
  );
};

export default AdminLayout;
