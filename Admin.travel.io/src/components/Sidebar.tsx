import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/users', label: 'Users', icon: '👥' },
  { path: '/bookings', label: 'Bookings', icon: '📅' },
  { path: '/vendors', label: 'Vendors', icon: '🏢' },
  { path: '/vehicles', label: 'Vehicles', icon: '🚗' },
  { path: '/drivers', label: 'Drivers', icon: '🚘' },
  { path: '/payments', label: 'Payments', icon: '💳' },
  { path: '/promocodes', label: 'Promo Codes', icon: '🎟️' },
  { path: '/ratings', label: 'Ratings', icon: '⭐' }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const sidebarContent = (
    <div className="h-screen flex flex-col bg-white">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <Link 
          to="/" 
          className="flex items-center space-x-2 transform hover:scale-105 transition-transform duration-200"
        >
          <span className="text-xl font-bold text-red-600">Travel.io</span>
          <span className="text-sm text-gray-600">Admin Portal</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 transform hover:translate-x-1 ${
                location.pathname === item.path
                  ? 'bg-red-50 text-red-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3 transform group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => {
            localStorage.removeItem('marcocabs_admin_token');
            window.location.href = '/login';
          }}
          className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg w-full transition-all duration-200 transform hover:translate-x-1"
        >
          <span className="mr-3 transform group-hover:scale-110 transition-transform duration-200">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-gray-600 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Mobile Sidebar Panel */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0 transition-transform duration-300">
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar; 