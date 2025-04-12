import React, { useState, useEffect } from 'react';

// Define TypeScript interfaces
interface Trip {
  id: number;
  bookingId: string;
  tripType: string;
  carType: string;
  tripItinerary: string;
  startDate: string;
  reportingTime: string;
  pickupAddress: string;
  dropAddress: string;
  mandatoryRequirement: string;
  additionalInfo: string;
  status: string;
}

// City data for dropdown
const cityData = [
  { id: 1, name: "Lucknow", value: "lucknow" },
  { id: 2, name: "Varanasi", value: "varanasi" },
  { id: 3, name: "Ayodhya", value: "ayodhya" },
  { id: 4, name: "Delhi", value: "delhi" }
];

// Car type data for dropdown
const carTypeData = [
  { id: 1, name: "Sedan", value: "sedan" },
  { id: 2, name: "SUV", value: "suv" },
  { id: 3, name: "Hatchback", value: "hatchback" },
  { id: 4, name: "Luxury", value: "luxury" }
];

const Booking: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCarType, setSelectedCarType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  
  useEffect(() => {
    // Simulate loading trips data with setTimeout
    setLoading(true);
    
    // Simulate API fetch with setTimeout
    const timer = setTimeout(() => {
      setTrips(dummyTrips);
      setLoading(false);
    }, 2000);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Placeholder filter function with loading simulation
  const handleSearch = () => {
    console.log("Searching with filters:", { searchText, selectedCity, selectedCarType });
    
    // Show loading state
    setSearchLoading(true);
    
    // Simulate search delay
    setTimeout(() => {
      // Filter based on search criteria
      let filteredTrips = [...dummyTrips];
      
      if (searchText) {
        filteredTrips = filteredTrips.filter(trip => 
          trip.bookingId.toLowerCase().includes(searchText.toLowerCase())
        );
      }
      
      if (selectedCity) {
        filteredTrips = filteredTrips.filter(trip => 
          trip.pickupAddress.toLowerCase().includes(selectedCity.toLowerCase()) ||
          trip.dropAddress.toLowerCase().includes(selectedCity.toLowerCase())
        );
      }
      
      if (selectedCarType) {
        filteredTrips = filteredTrips.filter(trip => 
          trip.carType.toLowerCase() === selectedCarType.toLowerCase()
        );
      }
      
      setTrips(filteredTrips);
      setSearchLoading(false);
    }, 1500);
  };

  // Function to render skeleton loading rows
  const renderSkeletonRows = () => {
    return Array(4).fill(0).map((_, index) => (
      <tr key={`skeleton-${index}`} className="animate-pulse">
        <td className="p-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </td>
        <td className="p-3 border-b border-gray-100">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </td>
        <td className="p-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-14"></div>
        </td>
        <td className="p-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-36 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </td>
        <td className="p-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </td>
        <td className="p-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </td>
        <td className="p-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </td>
        <td className="p-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </td>
        <td className="p-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-40"></div>
        </td>
        <td className="p-3 border-b border-gray-100">
          <div className="h-8 bg-gray-200 rounded w-24 mt-2"></div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen p-6 rounded-lg shadow-sm">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Bookings Dashboard</h1>
      
      {/* Search and Filter Section */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Search and Filter</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="w-full md:w-auto">
            <select 
              className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white text-gray-700 px-6 py-3 rounded-lg w-full md:w-60 transition-all duration-200"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={searchLoading}
            >
              <option value="">Select City</option>
              {cityData.map(city => (
                <option key={city.id} value={city.value}>{city.name}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-auto">
            <select 
              className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white text-gray-700 px-6 py-3 rounded-lg w-full md:w-60 transition-all duration-200"
              value={selectedCarType}
              onChange={(e) => setSelectedCarType(e.target.value)}
              disabled={searchLoading}
            >
              <option value="">Select Car type</option>
              {carTypeData.map(carType => (
                <option key={carType.id} value={carType.value}>{carType.name}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-auto flex-grow">
            <input
              type="text"
              placeholder="Search by booking ID"
              className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg p-3 w-full transition-all duration-200"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              disabled={searchLoading}
            />
          </div>
          
          <div className="w-full md:w-auto">
            <button 
              className={`${searchLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white px-8 py-3 rounded-lg font-medium shadow-sm transition-all duration-200 flex items-center justify-center`}
              onClick={handleSearch}
              disabled={searchLoading}
            >
              {searchLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white p-6 rounded-xl shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Available Trips</h2>
        <div className="overflow-x-auto max-w-full">
          <table className="w-full min-w-max table-fixed">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-24">Booking ID</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-28">Trip type</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-24">Car type</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-60">Trip Itinerary</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-28">Start Date</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-32">Reporting time</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-48">Pickup Address</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-48">Drop Address</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-56">Mandatory requirement</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-36">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading || searchLoading ? (
                // Show skeleton loading animation
                renderSkeletonRows()
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-4 text-center text-gray-500">
                    No trips found matching your search criteria.
                  </td>
                </tr>
              ) : (
                // Show actual trip data
                trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="p-3 text-sm text-gray-700 border-b border-gray-100">{trip.bookingId}</td>
                    <td className="p-3 text-sm text-gray-700 border-b border-gray-100">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        trip.tripType === 'One Way' ? 'bg-blue-100 text-blue-700' : 
                        trip.tripType === 'Round Trip' ? 'bg-purple-100 text-purple-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {trip.tripType}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-700 border-b border-gray-100">{trip.carType}</td>
                    <td className="p-3 text-sm text-gray-700 border-b border-gray-100 whitespace-pre-line break-words">{trip.tripItinerary}</td>
                    <td className="p-3 text-sm text-gray-700 border-b border-gray-100">{trip.startDate}</td>
                    <td className="p-3 text-sm text-gray-700 border-b border-gray-100">{trip.reportingTime}</td>
                    <td className="p-3 text-sm text-gray-700 border-b border-gray-100 break-words">{trip.pickupAddress}</td>
                    <td className="p-3 text-sm text-gray-700 border-b border-gray-100 break-words">{trip.dropAddress}</td>
                    <td className="p-3 text-sm text-gray-700 border-b border-gray-100 break-words">{trip.mandatoryRequirement}</td>
                    <td className="p-3 text-sm border-b border-gray-100">
                      {trip.additionalInfo && (
                        <div className="text-xs mb-2 bg-gray-50 p-2 rounded text-gray-600 break-words">
                          {trip.additionalInfo}
                        </div>
                      )}
                      {trip.status === 'pending' ? (
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md text-sm transition-colors duration-150">
                          Confirm
                        </button>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Confirmed
                        </span>
                      )}
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

// JSON dummyTrips data for API replacement
const dummyTrips = [
  {
    id: 1,
    bookingId: "12345",
    tripType: "One Way",
    carType: "Sedan",
    tripItinerary: "Lucknow - Ayodhya - Varanasi\n3 days 750 kms limit",
    startDate: "13/04/24",
    reportingTime: "05:30 AM",
    pickupAddress: "Lucknow Airport",
    dropAddress: "Varanasi Airport",
    mandatoryRequirement: "Luggage Carrier Model 2022 or above",
    additionalInfo: "6750\\- Toll + Parking + Night",
    status: "pending"
  },
  {
    id: 2,
    bookingId: "12346",
    tripType: "Round Trip",
    carType: "SUV",
    tripItinerary: "Delhi - Agra - Delhi\n2 days 500 kms limit",
    startDate: "15/04/24",
    reportingTime: "06:00 AM",
    pickupAddress: "Delhi Hotel Taj",
    dropAddress: "Delhi Hotel Taj",
    mandatoryRequirement: "Child Seat Required",
    additionalInfo: "",
    status: "confirmed"
  },
  {
    id: 3,
    bookingId: "12347",
    tripType: "Local",
    carType: "Hatchback",
    tripItinerary: "Lucknow City Tour\n1 day 100 kms limit",
    startDate: "18/04/24",
    reportingTime: "09:00 AM",
    pickupAddress: "Lucknow Railway Station",
    dropAddress: "Lucknow Railway Station",
    mandatoryRequirement: "None",
    additionalInfo: "2500\\- All inclusive",
    status: "pending"
  },
  {
    id: 4,
    bookingId: "12348",
    tripType: "One Way",
    carType: "Luxury",
    tripItinerary: "Varanasi - Prayagraj\n1 day 200 kms limit",
    startDate: "20/04/24",
    reportingTime: "10:00 AM",
    pickupAddress: "Varanasi BHU Gate",
    dropAddress: "Prayagraj Sangam",
    mandatoryRequirement: "English Speaking Driver",
    additionalInfo: "4500\\- Toll + Parking",
    status: "pending"
  }
];

export default Booking;