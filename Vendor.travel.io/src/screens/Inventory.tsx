// src/components/Inventory.tsx
import React, { useState, useEffect } from 'react';

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
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Load dummy data - replace with API call when ready
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        setTimeout(() => {
          setVehicles(dummyVehicles);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.rcNumber.toLowerCase().includes(searchText.toLowerCase()) ||
    vehicle.carBrand.toLowerCase().includes(searchText.toLowerCase())
  );

  const getDocStatusClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'awaited': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteVehicle = (id: number) => {
    setVehicles(prevVehicles => prevVehicles.filter(vehicle => vehicle.id !== id));
  };

  const handleShowBookingHistory = (id: number) => {
    // Implement show booking history functionality
    alert(`Show booking history for vehicle ${id}`);
  };

  return (
    <div className="w-full">
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[0, 1, 2].map((idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  {idx === 0 ? 'Total Vehicles' : idx === 1 ? 'Valid Documents' : 'Expiring Soon'}
                </p>
                {loading ? (
                  <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {idx === 0
                      ? vehicles.length
                      : idx === 1
                      ? vehicles.filter(vehicle => vehicle.expiredDoc.toLowerCase() === 'valid').length
                      : vehicles.filter(vehicle => vehicle.expiredDoc.toLowerCase() === 'awaited').length}
                  </p>
                )}
              </div>
              <div className={`p-3 ${idx === 0 ? 'bg-blue-100' : idx === 1 ? 'bg-green-100' : 'bg-yellow-100'} rounded-lg`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${idx === 0 ? 'text-blue-700' : idx === 1 ? 'text-green-700' : 'text-yellow-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {/* ...icon paths... */}
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by RC number or vehicle brand"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
            />
          </div>
          <button
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Vehicle
          </button>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b"></th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Car Brand</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Car Type</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">RC Number</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Document Status</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Expiry Date</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx}>
                    {Array.from({ length: 7 }).map((_, colIdx) => (
                      <td key={colIdx} className="p-4 border-b border-gray-100">
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    No vehicles found. Add your first vehicle to get started.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm border-b border-gray-100 text-center">
                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="text-red-500 p-1 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{vehicle.carBrand || "—"}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      {vehicle.carType ? (
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                          {vehicle.carType}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100 font-mono">
                      {vehicle.rcNumber || "—"}
                    </td>
                    <td className="p-4 text-sm border-b border-gray-100">
                      {vehicle.expiredDoc ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDocStatusClass(vehicle.expiredDoc)}`}>
                          {vehicle.expiredDoc}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      {vehicle.expiryDate || "—"}
                    </td>
                    <td className="p-4 text-sm border-b border-gray-100">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShowBookingHistory(vehicle.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                        >
                          History
                        </button>
                        <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
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
  }
];

export default Inventory;