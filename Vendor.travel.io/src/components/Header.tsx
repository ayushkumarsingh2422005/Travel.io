// src/components/Header.tsx
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center bg-green-500 p-4">
      <div className="text-blue-600 font-bold text-xl">
        <img src="/api/placeholder/50/50" alt="Logo" className="h-10" />
      </div>
      <div className="text-blue-600 font-bold text-3xl">MARCO</div>
      <button className="text-blue-600 rounded-full p-2">
        <div className="w-8 h-1 bg-blue-600 mb-1 rounded"></div>
        <div className="w-8 h-1 bg-blue-600 mb-1 rounded"></div>
        <div className="w-8 h-1 bg-blue-600 rounded"></div>
      </button>
    </header>
  );
};

export default Header;