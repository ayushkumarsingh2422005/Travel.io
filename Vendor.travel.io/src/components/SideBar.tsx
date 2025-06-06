// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  onMenuClick: (menuItem: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onMenuClick }) => {
  const [activeItem, setActiveItem] = useState<string>("booking");
  
  const menuItems = [
    { id: "booking", label: "Bookings", icon: "📅" },
    { id: "Wallet", label: "Wallet", icon: "💼" },
    { id: "Trips", label: "Trips", icon: "🚗" },
    { id: "Add Drivers", label: "Add Drivers", icon: "👤" },
    { id: "Add Cabs", label: "Add Cabs", icon: "🚕" },
    { id: "Restricted Inventory", label: "Restricted Inventory", icon: "🔒" },
    { id: "Driver Rewards", label: "Driver Rewards", icon: "🎁" },
    { id: "Penalty", label: "Penalty", icon: "⚠️" },
   
  ];

  const handleMenuClick = (itemId: string) => {
    setActiveItem(itemId);
    onMenuClick(itemId);
  };

  return (
    <div className="w-64 overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 h-screen flex flex-col shadow-xl">
      {/* Company Logo */}
      <div className="px-6 py-5 border-b border-gray-700">
        <h1 className="text-white text-xl font-bold">Travel Vendor</h1>
        <p className="text-green-400 text-xs mt-1">Vendor Dashboard</p>
      </div>
      
      {/* User Profile */}
      <div className="p-4 border-b border-gray-700 flex items-center gap-3">
        <Link to="/" className="bg-gradient-to-r from-green-400 to-green-500 p-1 rounded-full">
          <img 
            src="/api/placeholder/40/40" 
            alt="User" 
            className="h-10 w-10 rounded-full border-2 border-white" 
          />
        </Link>
        <div className="flex-1">
          <Link to="/" className="text-white font-medium text-sm hover:text-green-300 transition-colors">Ashok Kumar</Link>
          <p className="text-gray-400 text-xs">Premium Vendor</p>
        </div>
        <Link 
          to="/" 
          className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
          title="Edit Profile"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
          </svg>
        </Link>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-hidden py-4">
      
        {menuItems.map((item) => (
          <button 
            key={item.id} 
            className={`flex items-center gap-3 w-full px-6 py-3 text-left transition-colors ${
              activeItem === item.id 
                ? 'bg-green-600 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            onClick={() => handleMenuClick(item.id)}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
            {activeItem === item.id && (
              <span className="ml-auto w-1.5 h-6 rounded-sm bg-white"></span>
            )}
          </button>
        ))}
      </div>
      
      {/* Footer */}
      <div className="border-t border-gray-700 p-4">
        <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;