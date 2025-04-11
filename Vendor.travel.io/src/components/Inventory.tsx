// src/components/Inventory.tsx
import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

// Define TypeScript interfaces
interface Vehicle {
  id: number;
  carBrand: string;
  carType: string;
  rcNumber: string;
  expiredDoc: string;
  expiryDate: string;
}

const Inventory: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  
  useEffect(() => {
    // Load dummy data - replace with API call when ready
    setVehicles(dummyVehicles);
  }, []);

  return (
    <>
      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search Restricted Inventory by RC number"
          className="w-full md:w-1/2 lg:w-1/3 border-2 border-black rounded-full p-3"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Vehicles Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr>
              <th className="border border-black p-2 w-12"></th>
              <th className="border border-black p-2">Car Brand</th>
              <th className="border border-black p-2">Car type</th>
              <th className="border border-black p-2">RC Number</th>
              <th className="border border-black p-2">Expired Doc</th>
              <th className="border border-black p-2">Expiry Date</th>
              <th className="border border-black p-2">Booking history</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="border border-black p-2">
                  <button className="text-red-500">
                    <Trash2 size={24} />
                  </button>
                </td>
                <td className="border border-black p-2">{vehicle.carBrand}</td>
                <td className="border border-black p-2">{vehicle.carType}</td>
                <td className="border border-black p-2">{vehicle.rcNumber}</td>
                <td className="border border-black p-2">{vehicle.expiredDoc}</td>
                <td className="border border-black p-2">{vehicle.expiryDate}</td>
                <td className="border border-black p-2">
                  <button className="bg-green-500 text-black px-6 py-1 rounded-full">
                    Show
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// Dummy data in JSON format
const dummyVehicles = [
  {
    id: 1,
    carBrand: "Swift Dzire CNG + Petrol",
    carType: "Sedan",
    rcNumber: "UPXXPRXXXX",
    expiredDoc: "Valid",
    expiryDate: "Approved"
  },
  {
    id: 2,
    carBrand: "Ertiga",
    carType: "SUV",
    rcNumber: "UPXXPRXXXX",
    expiredDoc: "Awaited",
    expiryDate: "Awaited"
  },
  {
    id: 3,
    carBrand: "",
    carType: "",
    rcNumber: "",
    expiredDoc: "",
    expiryDate: ""
  }
];

export default Inventory;