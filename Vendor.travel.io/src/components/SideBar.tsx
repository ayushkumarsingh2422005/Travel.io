// src/components/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  onMenuClick: (menuItem: string) => void;
  kycCompleted: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onMenuClick, kycCompleted }) => {
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
      <div className="p-4 ">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-green-600">Travel.io</span>
          <span className="text-sm text-gray-600">Vendor Portal</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 relative">
        {!kycCompleted && (
          <div className="absolute inset-0 bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <p className="text-center text-gray-700 font-semibold p-4">
              Complete KYC to access all features.
              <Link to="/profile" className="text-green-600 hover:underline block mt-2">
                Go to Profile
              </Link>
            </p>
          </div>
        )}
        <div className={`space-y-1 ${!kycCompleted ? 'pointer-events-none opacity-50' : ''}`}>
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
            localStorage.removeItem('marcocabs_vendor_token');
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
