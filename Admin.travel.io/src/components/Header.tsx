import React from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-all duration-200 transform hover:scale-105"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all duration-200"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 transition-colors duration-200 group-hover:text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative transition-all duration-200 transform hover:scale-105">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white transform scale-100 transition-transform duration-200" />
          </button>

          {/* Profile */}
          <button className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 transform hover:scale-105">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center transform transition-transform duration-200 group-hover:scale-110">
              <span className="text-red-600 font-medium">A</span>
            </div>
            <span className="hidden md:inline-block font-medium">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 