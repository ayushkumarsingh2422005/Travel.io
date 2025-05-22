// src/components/AddCar.tsx
import React, { useState, useEffect } from 'react';

interface Car {
  id: number;
  brand: string;
  fuelType: string;
  carType: string;
  rcNumber: string;
  permit: string;
  status: string;
  chassis?: string;
  engine?: string;
  insuranceExpiry?: string;
  permitExpiry?: string | null;
  fitnessExpiry?: string;
  owner?: string;
  makeYear?: number;
  lastUpdated?: string;
}

// Car status classification data
const carStatusClasses = [
  { status: 'approved', class: 'bg-green-100 text-green-800' },
  { status: 'awaited', class: 'bg-yellow-100 text-yellow-800' },
  { status: 'rejected', class: 'bg-red-100 text-red-800' },
  { status: 'default', class: 'bg-gray-100 text-gray-800' }
];

// Permit status classification data
const permitStatusClasses = [
  { status: 'valid', class: 'bg-green-100 text-green-800' },
  { status: 'awaited', class: 'bg-yellow-100 text-yellow-800' },
  { status: 'expired', class: 'bg-red-100 text-red-800' },
  { status: 'default', class: 'bg-gray-100 text-gray-800' }
];

// Mock car data in comprehensive JSON format - ready for API replacement
const mockCarsData = [
  { 
    id: 1,
    brand: 'Swift Dzire', 
    fuelType: 'CNG + Petrol', 
    carType: 'Sedan',
    rcNumber: 'UP15AB3456',
    permit: 'Valid',
    status: 'Approved',
    chassis: 'MABZKA03ABD123456',
    engine: 'K12MN9876543',
    insuranceExpiry: '2025-08-15',
    permitExpiry: '2025-06-30',
    fitnessExpiry: '2025-12-31',
    owner: 'Vendor Name',
    makeYear: 2022,
    lastUpdated: '2023-11-05T14:30:00Z'
  },
  { 
    id: 2,
    brand: 'Ertiga', 
    fuelType: 'CNG + Petrol', 
    carType: 'SUV',
    rcNumber: 'UP15CD7890',
    permit: 'Awaited',
    status: 'Awaited',
    chassis: 'MABZRV05XCD987654',
    engine: 'K15BH1234567',
    insuranceExpiry: '2025-03-25',
    permitExpiry: null,
    fitnessExpiry: '2025-05-20',
    owner: 'Vendor Name',
    makeYear: 2023,
    lastUpdated: '2023-12-15T09:45:00Z'
  }
];

// Mock car data with enhanced structure for API replacement later
// Commented out to avoid unused variable warning - will be used in future implementation
/*
const API_ENDPOINTS = {
  CARS: '/api/cars',
  CAR_DETAILS: (id: number) => `/api/cars/${id}`,
  ADD_CAR: '/api/cars',
  UPDATE_CAR: (id: number) => `/api/cars/${id}`,
  DELETE_CAR: (id: number) => `/api/cars/${id}`,
  FETCH_BY_RC: '/api/cars/fetch-by-rc'
};
*/

const AddCarForm: React.FC = () => {
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [showAutoFetchForm, setShowAutoFetchForm] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Use mock data with delayed loading
  useEffect(() => {
    // Set loading state
    setLoading(true);
    setError(null);
    
    // Simulate API fetch with setTimeout
    const timer = setTimeout(() => {
      try {
        // Simulate successful API response
        setCars(mockCarsData as Car[]);
        setLoading(false);
      } catch {
        // Simulate error handling
        setError("Failed to fetch car data. Please try again.");
        setLoading(false);
      }
    }, 2000); // 2 second delay to simulate network latency
    
    // Cleanup function to prevent memory leaks
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // For future implementation - this will fetch car data from the backend
  // This is commented out to avoid unused function warnings
  /*
  const fetchCars = async () => {
    try {
      setLoading(true);
      // Example of how the API_ENDPOINTS would be used
      // const response = await fetch(API_ENDPOINTS.CARS);
      // if (!response.ok) throw new Error('Failed to fetch cars');
      // const data = await response.json();
      // setCars(data);
      setCars(mockCarsData as Car[]);
      setLoading(false);
    } catch (err) {
      setError("Error fetching car data");
      setLoading(false);
    }
  };
  */

  const handleDeleteCar = (id: number) => {
    // For future implementation - delete car via API
    // Example of how API_ENDPOINTS would be used:
    // try {
    //   await fetch(API_ENDPOINTS.DELETE_CAR(id), {
    //     method: 'DELETE'
    //   });
    //   // Refresh the car list
    // } catch (err) {
    //   setError("Failed to delete car");
    // }

    // Mock implementation
    const newCars = cars.filter(car => car.id !== id);
    setCars(newCars);
  };

  const getStatusBadgeClass = (status: string) => {
    const found = carStatusClasses.find(item => item.status.toLowerCase() === status.toLowerCase());
    return found ? found.class : carStatusClasses.find(item => item.status === 'default')?.class;
  };

  const getPermitBadgeClass = (permit: string) => {
    const found = permitStatusClasses.find(item => item.status.toLowerCase() === permit.toLowerCase());
    return found ? found.class : permitStatusClasses.find(item => item.status === 'default')?.class;
  };

  // Filter cars based on search term
  const filteredCars = cars.filter(car => 
    car.rcNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[0, 1, 2].map((idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  {idx === 0 ? 'Total Cars' : idx === 1 ? 'Approved Cars' : 'Pending Approval'}
                </p>
                {loading ? (
                  <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {idx === 0
                      ? cars.length
                      : idx === 1
                      ? cars.filter(car => car.status.toLowerCase() === 'approved').length
                      : cars.filter(car => car.status.toLowerCase() === 'awaited').length}
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

      {/* Search and Add New Car */}
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
              placeholder="Search car by RC number" 
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
              disabled={loading}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              className={`px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => setShowAutoFetchForm(true)}
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Auto Fetch
            </button>
            <button 
              className={`px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => setShowAddCarForm(true)}
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Car
            </button>
          </div>
        </div>
      </div>

      {/* Error message if any */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-8 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Car List Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b"></th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Car Details</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Car Type</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">RC Number</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Permit</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Status</th>
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
              ) : filteredCars.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    {cars.length > 0 ? 'No cars match your search criteria.' : 'No cars found. Add your first car to get started.'}
                  </td>
                </tr>
              ) : (
                filteredCars.map((car) => (
                  <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm border-b border-gray-100 text-center">
                      <button 
                        className="text-red-500 p-1 hover:bg-red-50 rounded-full transition-colors"
                        onClick={() => handleDeleteCar(car.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{car.brand}</div>
                      <div className="text-xs text-gray-500 mt-1">{car.fuelType}</div>
                      {car.makeYear && (
                        <div className="text-xs text-gray-500 mt-1">Make: {car.makeYear}</div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">{car.carType}</td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100 font-mono">{car.rcNumber}</td>
                    <td className="p-4 text-sm border-b border-gray-100">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPermitBadgeClass(car.permit)}`}>
                        {car.permit}
                      </span>
                      {car.permitExpiry && (
                        <div className="text-xs text-gray-500 mt-1">
                          Exp: {new Date(car.permitExpiry).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm border-b border-gray-100">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(car.status)}`}>
                        {car.status}
                      </span>
                      {car.lastUpdated && (
                        <div className="text-xs text-gray-500 mt-1">
                          Updated: {new Date(car.lastUpdated).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm border-b border-gray-100">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
                          View
                        </button>
                        <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors">
                          Bookings
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

      {/* Add Car Modal */}
      {showAddCarForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-white text-xl font-semibold">Add New Car</h2>
                <button 
                  onClick={() => setShowAddCarForm(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-green-50 mt-2">
                Make sure all the cars are in good condition and well maintained
              </p>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                  <div className="flex gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-medium text-blue-800 mb-1">Required Documents</h3>
                      <p className="text-sm text-blue-700">
                        Please have your RC, insurance, permit, and vehicle images ready to upload.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Car Details Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Car Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">RC Image</label>
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-500 mb-1">Drop file here or</span>
                        <button className="text-sm text-green-600 font-medium">Browse Files</button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Car Image</label>
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-500 mb-1">Drop file here or</span>
                        <button className="text-sm text-green-600 font-medium">Browse Files</button>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                      <select 
                        id="brand" 
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                      >
                        <option value="">Select brand name</option>
                        <option value="Maruti">Maruti</option>
                        <option value="Hyundai">Hyundai</option>
                        <option value="Tata">Tata</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                      <select 
                        id="fuelType" 
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                      >
                        <option value="">Select fuel type</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="CNG + Petrol">CNG + Petrol</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="makeYear" className="block text-sm font-medium text-gray-700 mb-1">Car Make Year</label>
                      <input
                        type="number"
                        id="makeYear"
                        placeholder="Enter car make year"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Insurance Details Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Insurance Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Document</label>
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-500 mb-1">Drop file here or</span>
                        <button className="text-sm text-green-600 font-medium">Browse Files</button>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="insurerName" className="block text-sm font-medium text-gray-700 mb-1">Insurer's Name</label>
                      <select 
                        id="insurerName" 
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                      >
                        <option value="">Select insurer</option>
                        <option value="HDFC ERGO">HDFC ERGO</option>
                        <option value="ICICI Lombard">ICICI Lombard</option>
                        <option value="Bajaj Allianz">Bajaj Allianz</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="policyNumber" className="block text-sm font-medium text-gray-700 mb-1">Insurance Policy Number</label>
                      <input
                        type="text"
                        id="policyNumber"
                        placeholder="Enter policy number"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="insuranceExpiry" className="block text-sm font-medium text-gray-700 mb-1">Insurance Expiry Date</label>
                      <input
                        type="date"
                        id="insuranceExpiry"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Fitness and Permit Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Fitness & Permit Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Document</label>
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-500 mb-1">Drop file here or</span>
                        <button className="text-sm text-green-600 font-medium">Browse Files</button>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="fitnessExpiry" className="block text-sm font-medium text-gray-700 mb-1">Fitness Expiry Date</label>
                      <input
                        type="date"
                        id="fitnessExpiry"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Permit Document</label>
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-500 mb-1">Drop file here or</span>
                        <button className="text-sm text-green-600 font-medium">Browse Files</button>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="permitExpiry" className="block text-sm font-medium text-gray-700 mb-1">Permit Expiry Date</label>
                      <input
                        type="date"
                        id="permitExpiry"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="permitType" className="block text-sm font-medium text-gray-700 mb-1">Permit Type</label>
                      <select 
                        id="permitType" 
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                      >
                        <option value="">Select permit type</option>
                        <option value="All India">All India</option>
                        <option value="State">State</option>
                        <option value="Local">Local</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="luggageCarrier" className="block text-sm font-medium text-gray-700 mb-1">Luggage Carrier</label>
                      <select 
                        id="luggageCarrier" 
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                      >
                        <option value="">Select availability</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="sourcing" className="block text-sm font-medium text-gray-700 mb-1">Sourcing</label>
                      <select 
                        id="sourcing" 
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                      >
                        <option value="">Select ownership type</option>
                        <option value="Own">Own</option>
                        <option value="Leased">Leased</option>
                        <option value="Partner">Partner</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-200 flex justify-end gap-3">
              <button 
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setShowAddCarForm(false)}
              >
                Cancel
              </button>
              <button 
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Car
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Fetch Modal */}
      {showAutoFetchForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-white text-xl font-semibold">Auto Fetch Car Details</h2>
                <button 
                  onClick={() => setShowAutoFetchForm(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-blue-50 mt-2">
                Enter RC details to automatically fetch your car information
              </p>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                  <div className="flex gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-medium text-blue-800 mb-1">Enter RC Details</h3>
                      <p className="text-sm text-blue-700">
                        Input your Registration Certificate details to fetch car information
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* RC Details Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">RC Number</label>
                  <div className="grid grid-cols-4 gap-3">
                    <input 
                      type="text" 
                      placeholder="State" 
                      className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                      maxLength={2}
                    />
                    <input 
                      type="text" 
                      placeholder="RTO Code" 
                      className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                      maxLength={2}
                    />
                    <input 
                      type="text" 
                      placeholder="Issue Year" 
                      className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                      maxLength={2}
                    />
                    <input 
                      type="text" 
                      placeholder="4 Digits" 
                      className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                      maxLength={4}
                    />
                  </div>
                  <div className="mt-3">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Fetch Car Details
                    </button>
                  </div>
                </div>
                
                {/* Auto Fetched Details */}
                <div className="space-y-4 mt-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Auto Fetched Details</h3>
              
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                      <input 
                        type="text" 
                        placeholder="Auto fetch name"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                      <input 
                        type="text" 
                        placeholder="Auto fetch name"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Maker Name</label>
                      <input 
                        type="text" 
                        placeholder="Auto fetch name"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Class</label>
                      <input 
                        type="text" 
                        placeholder="Auto fetch"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                      <input 
                        type="text" 
                        placeholder="Auto fetch"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chassis Number</label>
                      <input 
                        type="text" 
                        placeholder="Auto fetch"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Engine Number</label>
                      <input 
                        type="text" 
                        placeholder="Auto fetch"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                      <input 
                        type="text" 
                        placeholder="Auto fetch"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="Auto fetch"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="Auto fetch"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-200 flex justify-end gap-3">
              <button 
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setShowAutoFetchForm(false)}
              >
                Cancel
              </button>
              <button 
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add This Car
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCarForm;