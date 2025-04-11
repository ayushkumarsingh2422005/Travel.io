// src/pages/Landing.tsx
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar'
import Header from '../components/Header';
import DriverRewards from '../components/DriverRewards';
import Inventory from '../components/Inventory';
import Penalty from '../components/Penalty';
import Trips from '../components/Trips';
import AddCarForm from '../components/AddCar';
import Booking from '../components/Booking'
import Wallet from '../components/Wallet'
import Driver from '../components/Driver'

type ComponentKey = 'inventory' | 'driverRewards' | 'penalty' | 'trips' | 'addcabs' | 'booking' | 'Wallet' | 'adddriver';

const componentMap: Record<ComponentKey, React.FC> = {
  inventory: Inventory,
  driverRewards: DriverRewards,
  penalty: Penalty,
  trips: Trips,
  booking: Booking,
  Wallet:Wallet,
  adddriver:Driver,
  addcabs:AddCarForm
};

const Landing: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<ComponentKey>('inventory');

  const handleMenuClick = (menuItem: string) => {
    const normalized = menuItem.toLowerCase();

    console.log(normalized);

    if (normalized.includes('inventory')) {
      setActiveComponent('inventory');
    } else if (normalized.includes('reward')) {
      setActiveComponent('driverRewards');
    } else if (normalized.includes('penalty')) {
      setActiveComponent('penalty');
    } else if (normalized.includes('trip')) {
      setActiveComponent('trips');
    }
    else if(normalized.includes('add driver')){
        setActiveComponent('adddriver')
    }
    else if(normalized.includes('wallet')){
        setActiveComponent('Wallet');
    }
    else if(normalized.includes('add cabs')){
        setActiveComponent('addcabs')
    }
    else if(normalized.includes('booking')){

        setActiveComponent('booking')

    }
  };

  const ActiveComponent = componentMap[activeComponent];

  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className="flex flex-1">
        <div className="flex-1 p-4 overflow-auto">
          <ActiveComponent />
        </div>

        <Sidebar onMenuClick={handleMenuClick} />
      </div>
    </div>
  );
};

export default Landing;
