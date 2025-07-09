// src/components/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  onMenuClick: (menuItem: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onMenuClick }) => {
  const location = useLocation();
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", path: "/dashboard" },
    { id: "booking", label: "Bookings", icon: "📅", path: "/booking" },
    { id: "trips", label: "Trips", icon: "🚗", path: "/trips" },
    { id: "wallet", label: "Wallet", icon: "💼", path: "/wallet" },
    { id: "driver", label: "Drivers", icon: "👤", path: "/driver" },
    { id: "car", label: "Vehicles", icon: "🚕", path: "/car" },
    { id: "inventory", label: "Inventory", icon: "📦", path: "/inventory" },
    { id: "driver-rewards", label: "Driver Rewards", icon: "🎁", path: "/driver-rewards" },
    { id: "penalty", label: "Penalty", icon: "⚠️", path: "/penalty" },
    { id: "profile", label: "Profile", icon: "👤", path: "/profile" }
  ];

  return (
    <div className="h-screen bg-white border-r border-gray-200 w-64 flex-shrink-0 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-gray-900">Travel.io</span>
          <span className="text-sm text-gray-600">Vendor Portal</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
        {menuItems.map((item) => (
            <Link
            key={item.id} 
              to={item.path}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
              onClick={() => onMenuClick(item.id)}
          >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
        ))}
      </div>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg w-full"
        >
          <span className="mr-3">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;