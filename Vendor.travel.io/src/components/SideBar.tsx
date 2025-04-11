// src/components/Sidebar.tsx
import React from 'react';

interface SidebarProps {
  onMenuClick: (menuItem: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onMenuClick }) => {
  const menuItems = [
      "booking",
    "Wallet",
    "Trips",
    "Add Drivers",
    "Add Cabs",
    "Restricted Inventory",
    "Driver Rewards",
    "Penalty"
  
  ];

  return (
    <div className="w-64 bg-blue-800 p-4 flex flex-col gap-4">
      {/* User Profile */}
      <div className="bg-green-500 rounded-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-white rounded-full p-2">
            <img src="/api/placeholder/40/40" alt="User" className="h-8 w-8 rounded-full" />
          </div>
          <span className="text-white font-bold">Ashok Kumar</span>
        </div>
        <button className="text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
          </svg>
        </button>
      </div>

      {/* Menu Items */}
      {menuItems.map((item, index) => (
        <button 
          key={index} 
          className="bg-green-500 text-white font-semibold py-3 px-4 rounded-full w-full text-center"
          onClick={() => onMenuClick(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;