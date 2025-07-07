// src/pages/Landing.tsx
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/SideBar';
import DriverRewards from './DriverRewards';
import Inventory from './Inventory';
import Penalty from './Penalty';
import Trips from './Trips';
import AddCarForm from './Car';
import Booking from './Booking'
import Wallet from './Wallet'
import Driver from './Driver'
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '../utils/verifytoken';

type ComponentKey = 'inventory' | 'driverRewards' | 'penalty' | 'trips' | 'addcabs' | 'booking' | 'Wallet' | 'adddriver';

const componentMap: Record<ComponentKey, React.FC> = {
  inventory: Inventory,
  driverRewards: DriverRewards,
  penalty: Penalty,
  trips: Trips,
  booking: Booking,
  Wallet: Wallet,
  adddriver: Driver,
  addcabs: AddCarForm
};

const Landing: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<ComponentKey>('booking');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate=useNavigate();

  const handleMenuClick = (menuItem: string) => {
    const normalized = menuItem.toLowerCase();

    if (normalized.includes('inventory')) {
      setActiveComponent('inventory');
    } else if (normalized.includes('reward')) {
      setActiveComponent('driverRewards');
    } else if (normalized.includes('penalty')) {
      setActiveComponent('penalty');
    } else if (normalized.includes('trip')) {
      setActiveComponent('trips');
    } else if(normalized.includes('add driver')) {
      setActiveComponent('adddriver');
    } else if(normalized.includes('wallet')) {
      setActiveComponent('Wallet');
    } else if(normalized.includes('add cabs')) {
      setActiveComponent('addcabs');
    } else if(normalized.includes('booking')) {
      setActiveComponent('booking');
    }
    
    // Close mobile menu after selection
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const ActiveComponent = componentMap[activeComponent];


 useEffect(() => {
  const check = async () => {
    const token = localStorage.getItem('marcocabs_customer_token');
    const type = 'customer';

    if (!token) {
     
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    const result = await checkAuth(type, token);
    if (!result) {
      navigate('/login', { state: { from: location.pathname } });
    }
  };

  check();
}, [navigate, location]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile by default */}
      <div className={`fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30`}>
        <Sidebar onMenuClick={handleMenuClick} />
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
              {activeComponent === 'booking' && 'Bookings Dashboard'}
              {activeComponent === 'Wallet' && 'Wallet Management'}
              {activeComponent === 'trips' && 'Trip Management'}
              {activeComponent === 'adddriver' && 'Add Drivers'}
              {activeComponent === 'addcabs' && 'Add Cabs'}
              {activeComponent === 'inventory' && 'Restricted Inventory'}
              {activeComponent === 'driverRewards' && 'Driver Rewards'}
              {activeComponent === 'penalty' && 'Penalty Management'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your {activeComponent === 'booking' ? 'bookings' : activeComponent} efficiently
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

export default Landing;
