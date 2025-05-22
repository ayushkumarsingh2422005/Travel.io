import React, { useState, useEffect } from 'react';

interface Trip {
  bookingId: string;
  tripType: string;
  carType?: string;
  tripItinerary: string;
  amount: number;
  penalty?: number;
  customerReview?: string;
  paymentStatus: string;
}

// Trip summary data for cards
const tripSummaryData = {
  upcoming: {
    totalTrips: "28",
    nextTrip: "Tomorrow",
    expectedEarnings: "4,800"
  },
  completed: {
    totalTrips: "142",
    recentTrip: "Yesterday",
    totalEarnings: "35,250"
  }
};

// Trip type classification data
const tripTypeClasses = [
  { type: "airport", class: "bg-blue-100 text-blue-700" },
  { type: "outstation", class: "bg-purple-100 text-purple-700" },
  { type: "local", class: "bg-yellow-100 text-yellow-700" },
  { type: "default", class: "bg-gray-100 text-gray-700" }
];

// Payment status classification data
const paymentStatusClasses = [
  { status: "paid", class: "bg-green-100 text-green-800" },
  { status: "confirmed", class: "bg-green-100 text-green-800" },
  { status: "pending", class: "bg-yellow-100 text-yellow-800" },
  { status: "default", class: "bg-blue-100 text-blue-800" }
];

const TripsComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Clear previous data and show loading spinner
    setLoading(true);
    setTrips([]); // Clear previous trips while loading
    
    // Simulate network delay with setTimeout
    const timer = setTimeout(() => {
      setTrips(activeTab === 'upcoming' ? mockUpcomingTrips : mockCompletedTrips);
      setLoading(false);
    }, 2000); // 2 second delay to show loading state
    
    // Clean up timer on component unmount or when activeTab changes
    return () => {
      clearTimeout(timer);
    };
  }, [activeTab]);

  const getTripTypeClass = (type: string) => {
    const found = tripTypeClasses.find(item => item.type.toLowerCase() === type.toLowerCase());
    return found ? found.class : tripTypeClasses.find(item => item.type === "default")?.class;
  };

  const getStatusClass = (status: string) => {
    const found = paymentStatusClasses.find(item => item.status.toLowerCase() === status.toLowerCase());
    return found ? found.class : paymentStatusClasses.find(item => item.status === "default")?.class;
  };

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <button
            className={`py-3 px-6 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'upcoming' 
                ? 'bg-green-600 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('upcoming')}
            disabled={loading}
          >
            Upcoming Trips
          </button>
          <button
            className={`py-3 px-6 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'completed' 
                ? 'bg-green-600 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('completed')}
            disabled={loading}
          >
            Completed Trips
          </button>
        </div>
      </div>

      {/* Trip Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Trips</p>
              {loading ? (
                <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {activeTab === 'upcoming' ? tripSummaryData.upcoming.totalTrips : tripSummaryData.completed.totalTrips}
                </p>
              )}
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">{activeTab === 'upcoming' ? 'Next Trip' : 'Recent Trip'}</p>
              {loading ? (
                <div className="h-7 w-20 bg-gray-200 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {activeTab === 'upcoming' ? tripSummaryData.upcoming.nextTrip : tripSummaryData.completed.recentTrip}
                </p>
              )}
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">{activeTab === 'upcoming' ? 'Expected Earnings' : 'Total Earnings'}</p>
              {loading ? (
                <div className="h-7 w-24 bg-gray-200 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  ₹{activeTab === 'upcoming' ? tripSummaryData.upcoming.expectedEarnings : tripSummaryData.completed.totalEarnings}
                </p>
              )}
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Booking ID</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Trip Type</th>
                {activeTab === 'upcoming' && (
                  <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Car Type</th>
                )}
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Trip Itinerary</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">
                  {activeTab === 'upcoming' ? 'Amount' : 'Amount Earned'}
                </th>
                {activeTab === 'completed' && (
                  <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Review</th>
                )}
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton rows
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx}>
                    {Array.from({ length: activeTab === 'upcoming' ? 6 : 7 }).map((_, colIdx) => (
                      <td key={colIdx} className="p-4 border-b border-gray-100">
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'upcoming' ? 6 : 7} className="p-4 text-center text-gray-500">
                    No {activeTab} trips found
                  </td>
                </tr>
              ) : (
                trips.map((trip) => (
                  <tr key={trip.bookingId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">{trip.bookingId}</td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTripTypeClass(trip.tripType)}`}>
                        {trip.tripType}
                      </span>
                    </td>
                    {activeTab === 'upcoming' && (
                      <td className="p-4 text-sm text-gray-700 border-b border-gray-100">{trip.carType}</td>
                    )}
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">{trip.tripItinerary}</td>
                    <td className="p-4 text-sm font-medium text-gray-900 border-b border-gray-100">₹{trip.amount}</td>
                    {activeTab === 'completed' && (
                      <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                        {trip.customerReview ? (
                          <div className="flex items-center">
                            <span className="text-amber-500 mr-1">★</span>
                            <span>{trip.customerReview}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    )}
                    <td className="p-4 text-sm border-b border-gray-100">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(trip.paymentStatus)}`}>
                        {trip.paymentStatus}
                      </span>
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

// Mock data for demonstration
const mockUpcomingTrips = [
  {
    bookingId: "BK-1001",
    tripType: "Airport",
    carType: "Sedan",
    tripItinerary: "City Center → Airport",
    amount: 350,
    paymentStatus: "Pending"
  },
  {
    bookingId: "BK-1002",
    tripType: "Outstation",
    carType: "SUV",
    tripItinerary: "City → Hill Station",
    amount: 1200,
    paymentStatus: "Confirmed"
  }
];

const mockCompletedTrips = [
  {
    bookingId: "BK-0998",
    tripType: "Local",
    carType: "Hatchback",
    tripItinerary: "Mall → Residence",
    amount: 250,
    customerReview: "4.8",
    paymentStatus: "Paid"
  },
  {
    bookingId: "BK-0999",
    tripType: "Airport",
    carType: "Sedan",
    tripItinerary: "Airport → Hotel",
    amount: 450,
    penalty: 50,
    customerReview: "4.5",
    paymentStatus: "Paid"
  }
];

export default TripsComponent; 