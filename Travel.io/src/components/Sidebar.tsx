import { useState } from 'react';
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
      <div className="px-2 mb-10 flex items-center">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 mr-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <span className="font-bold text-2xl tracking-tight text-gray-800">Travel<span className="text-indigo-600">.io</span></span>
      </div>
      <nav className="flex-1 space-y-1">
        <NavLink to="/cabs" className={({ isActive }) =>
          `group flex items-center px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${isActive
            ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`
        } onClick={() => setOpen(false)}>
          <span className="mr-3 p-1 rounded-lg transition-colors group-hover:bg-white/50">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </span>
          Book a Cab
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) =>
          `group flex items-center px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${isActive
            ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`
        } onClick={() => setOpen(false)}>
          <span className="mr-3 p-1 rounded-lg transition-colors group-hover:bg-white/50">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </span>
          Dashboard
        </NavLink>
        <NavLink to="/previous-bookings" className={({ isActive }) =>
          `group flex items-center px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${isActive
            ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`
        } onClick={() => setOpen(false)}>
          <span className="mr-3 p-1 rounded-lg transition-colors group-hover:bg-white/50">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </span>
          Previous Bookings
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) =>
          `group flex items-center px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${isActive
            ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`
        } onClick={() => setOpen(false)}>
          <span className="mr-3 p-1 rounded-lg transition-colors group-hover:bg-white/50">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </span>
          Profile
        </NavLink>
      </nav>

      <div className="mt-8 border-t border-gray-100 pt-6 px-2">
        <button onClick={() => { setOpen(false); handleLogout(); }} className="flex items-center w-full px-4 py-3.5 rounded-xl font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group">
          <span className="mr-3 p-1 rounded-lg transition-colors group-hover:bg-red-100">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </span>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg shadow-lg focus:outline-none"
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