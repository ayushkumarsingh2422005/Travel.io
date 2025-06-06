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

export const TripsComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Use mock data instead of API for demo with simulated delay
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
        {[0, 1, 2].map((idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  {idx === 0 ? 'Total Trips' : idx === 1 ? (activeTab === 'upcoming' ? 'Next Trip' : 'Recent Trip') : (activeTab === 'upcoming' ? 'Expected Earnings' : 'Total Earnings')}
                </p>
                {loading ? (
                  <div className={`h-7 ${idx === 0 ? 'w-16' : idx === 1 ? 'w-20' : 'w-24'} bg-gray-200 rounded animate-pulse mt-1`} />
                ) : (
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {idx === 0
                      ? (activeTab === 'upcoming' ? tripSummaryData.upcoming.totalTrips : tripSummaryData.completed.totalTrips)
                      : idx === 1
                      ? (activeTab === 'upcoming' ? tripSummaryData.upcoming.nextTrip : tripSummaryData.completed.recentTrip)
                      : `₹${activeTab === 'upcoming' ? tripSummaryData.upcoming.expectedEarnings : tripSummaryData.completed.totalEarnings}`}
                  </p>
                )}
              </div>
              <div className={`p-3 ${idx === 0 ? 'bg-blue-100' : idx === 1 ? 'bg-green-100' : 'bg-purple-100'} rounded-lg`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${idx === 0 ? 'text-blue-700' : idx === 1 ? 'text-green-700' : 'text-purple-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {/* ...icon paths... */}
                </svg>
              </div>
            </div>
          </div>
        ))}
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

// JSON formatted data for upcoming trips - ready for API replacement
const mockUpcomingTrips = [
  {
    id: 1,
    bookingId: "BK-1001",
    tripType: "Airport",
    carType: "Sedan",
    tripItinerary: "City Center → Airport",
    amount: 350,
    paymentStatus: "Pending"
  },
  {
    id: 2,
    bookingId: "BK-1002",
    tripType: "Outstation",
    carType: "SUV",
    tripItinerary: "City → Hill Station",
    amount: 1200,
    paymentStatus: "Confirmed"
  }
];

// JSON formatted data for completed trips - ready for API replacement  
const mockCompletedTrips = [
  {
    id: 1,
    bookingId: "BK-0998",
    tripType: "Local",
    carType: "Hatchback",
    tripItinerary: "Mall → Residence",
    amount: 250,
    customerReview: "4.8",
    paymentStatus: "Paid"
  },
  {
    id: 2,
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