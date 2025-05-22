import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Wallet from './Wallet';
import Trips from './Trips';

type ComponentKey = 'Wallet' | 'Trips';

const componentMap: Record<ComponentKey, React.FC> = {
  Wallet: Wallet,
  Trips: Trips
};

const Dashboard: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<ComponentKey>('Trips');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuClick = (menuItem: string) => {
    if (menuItem === 'Wallet' || menuItem === 'Trips') {
      setActiveComponent(menuItem as ComponentKey);
    }
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const ActiveComponent = componentMap[activeComponent];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile by default */}
      <div className={`fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30`}>
        <Sidebar onMenuClick={handleMenuClick} activeItem={activeComponent} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Mobile menu toggle button */}
        <button 
          className="md:hidden fixed bottom-4 right-4 bg-green-600 text-white p-3 rounded-full shadow-lg z-40"
          onClick={toggleMobileMenu}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              {activeComponent === 'Wallet' && 'Wallet Management'}
              {activeComponent === 'Trips' && 'Trip Management'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your {activeComponent.toLowerCase()} efficiently
            </p>
          </div>
          
          {/* Component Content */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <ActiveComponent />
          </div>
        </main>
      </div>
      
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 md:hidden z-20"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Dashboard;
