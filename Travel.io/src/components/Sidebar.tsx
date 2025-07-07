import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    // Add logout logic here (e.g., clearing tokens)
    navigate('/login');
  };

  // Sidebar content for reuse
  const sidebarContent = (
    <>
      <div className="font-bold text-2xl mb-10 tracking-wide text-green-600">Travel.io</div>
      <nav className="flex-1 space-y-2">
        
        <NavLink to="/cabs" className={({ isActive }) =>
          `flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-green-100 hover:text-green-700'}`
        } onClick={() => setOpen(false)}>
          <span className="mr-3">🚕</span> Cabs
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) =>
          `flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-green-100 hover:text-green-700'}`
        } onClick={() => setOpen(false)}>
          <span className="mr-3">🚕</span> Dashboard
        </NavLink>
        <NavLink to="/previous-bookings" className={({ isActive }) =>
          `flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-green-100 hover:text-green-700'}`
        } onClick={() => setOpen(false)}>
          <span className="mr-3">📖</span> Previous Bookings
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) =>
          `flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-green-100 hover:text-green-700'}`
        } onClick={() => setOpen(false)}>
          <span className="mr-3">👤</span> Profile
        </NavLink>
      </nav>
      <button onClick={() => { setOpen(false); handleLogout(); }} className="flex items-center mt-8 bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-3 rounded-lg transition-colors w-full">
        <span className="mr-3">🚪</span> Logout
      </button>
    </>
  );

  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-green-600 text-white p-2 rounded-lg shadow-lg focus:outline-none"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* Sidebar for desktop/tablet (fixed) */}
      <aside className="hidden md:flex flex-col py-8 px-4 shadow-lg min-h-screen w-60 bg-white border-r border-gray-100 fixed top-0 left-0 z-40">
        {sidebarContent}
      </aside>
      {/* Sidebar for mobile (slide-in) */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-60 bg-white border-r border-gray-100 flex flex-col py-8 px-4 shadow-lg min-h-screen animate-slide-in-left">
            {sidebarContent}
          </div>
          <div className="flex-1 bg-black bg-opacity-30" onClick={() => setOpen(false)} />
        </div>
      )}
      {/* Spacer for fixed sidebar on desktop/tablet */}
      <div className="hidden md:block w-60 flex-shrink-0" />
    </>
  );
};

export default Sidebar; 