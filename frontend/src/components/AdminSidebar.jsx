import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, QrCode, BarChart3, Settings, LogOut } from 'lucide-react';
import { Button } from './ui/button';

const AdminSidebar = ({ user, onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/admin/slots', icon: Car, label: 'Parking Slots' },
    { path: '/admin/scanner', icon: QrCode, label: 'QR Scanner' },
    { path: '/admin/stats', icon: BarChart3, label: 'Statistics' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Car className="h-6 w-6" />
          Admin Panel
        </h2>
        <p className="text-sm text-gray-400 mt-1">Parking Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-4">
        <div className="px-4 py-2 bg-gray-800 rounded-lg">
          <p className="text-sm font-medium text-white">{user?.name}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;

