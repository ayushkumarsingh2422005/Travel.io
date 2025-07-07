import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Users from './screens/Users';
import Bookings from './screens/Bookings';
import Vendors from './screens/Vendors';
import Login from './screens/login';

const App: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('marcocabs_admin_token');

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-sm h-screen fixed">
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-red-600">Travel.io</h1>
                <p className="text-sm text-gray-600">Admin Portal</p>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1">
                <a
                  href="/users"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  Users
                </a>
                <a
                  href="/bookings"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Bookings
                </a>
                <a
                  href="/vendors"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Vendors
                </a>
              </nav>

              {/* User Profile */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    localStorage.removeItem('marcocabs_admin_token');
                    window.location.reload();
                  }}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200 w-full"
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 ml-64">
            {/* Header */}
            <header className="bg-white shadow-sm">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <svg
                        className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
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
                  <div className="flex items-center space-x-4">
                    <button className="text-gray-600 hover:text-gray-900">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    </button>
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold">
                      A
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="p-6">
              <Routes>
                <Route path="/users" element={<Users />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/" element={<Navigate to="/users" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
