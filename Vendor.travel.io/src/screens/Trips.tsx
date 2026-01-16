import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; // Import toast
import { getVendorTrips, BookingData } from '../utils/bookingService';

// Trip summary data for cards - will be dynamically calculated or fetched
const tripSummaryData = {
  upcoming: {
    totalTrips: "0",
    nextTrip: "N/A",
    expectedEarnings: "0"
  },
  completed: {
    totalTrips: "0",
    recentTrip: "N/A",
    totalEarnings: "0"
  }
};

// Trip type classification data (using vehicle model for now)
const tripTypeClasses = [
  { type: "Sedan", class: "bg-indigo-50 text-indigo-700" },
  { type: "SUV", class: "bg-purple-50 text-purple-700" },
  { type: "Hatchback", class: "bg-yellow-50 text-yellow-700" },
  { type: "default", class: "bg-gray-50 text-gray-700" }
];

// Payment status classification data (using booking status)
const paymentStatusClasses = [
  { status: "paid", class: "bg-green-100 text-green-800" },
  { status: "confirmed", class: "bg-green-100 text-green-800" },
  { status: "pending", class: "bg-yellow-100 text-yellow-800" },
  { status: "waiting", class: "bg-yellow-100 text-yellow-800" },
  { status: "approved", class: "bg-blue-100 text-blue-800" },
  { status: "preongoing", class: "bg-indigo-100 text-indigo-800" },
  { status: "ongoing", class: "bg-teal-100 text-teal-800" },
  { status: "completed", class: "bg-green-100 text-green-800" },
  { status: "cancelled", class: "bg-red-100 text-red-800" },
  { status: "default", class: "bg-gray-100 text-gray-700" }
];

export const TripsComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [trips, setTrips] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 10; // Number of items per page

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      setTrips([]); // Clear previous trips while loading

      try {
        const response = await getVendorTrips(activeTab, currentPage, limit);
        console.log(response)
        if (response.success) {
          setTrips(response.data.bookings);
          setTotalPages(response.data.pagination.total_pages);
          if (currentPage === 1) toast.success('Trips loaded successfully!'); // Success toast

          // Calculate trip summary data
          const totalTrips = response.data.bookings.length.toString();
          let nextTrip = "N/A";
          let recentTrip = "N/A";
          let expectedEarnings = "0";
          let totalEarnings = "0";

          if (response.data.bookings.length > 0) {
            if (activeTab === 'upcoming') {
              // Sort by pickup_date to find the next trip
              const sortedUpcoming = [...response.data.bookings].sort((a, b) => new Date(a.pickup_date).getTime() - new Date(b.pickup_date).getTime());
              const nextBooking = sortedUpcoming[0];
              const today = new Date();
              const nextTripDate = new Date(nextBooking.pickup_date);
              const diffTime = Math.abs(nextTripDate.getTime() - today.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays === 0) {
                nextTrip = "Today";
              } else if (diffDays === 1) {
                nextTrip = "Tomorrow";
              } else {
                nextTrip = `${diffDays} days`;
              }
              expectedEarnings = response.data.bookings.reduce((sum, trip) => sum + trip.price, 0).toLocaleString();
            } else { // completed
              // Sort by drop_date to find the most recent trip
              const sortedCompleted = [...response.data.bookings].sort((a, b) => new Date(b.drop_date).getTime() - new Date(a.drop_date).getTime());
              const recentBooking = sortedCompleted[0];
              const today = new Date();
              const recentTripDate = new Date(recentBooking.drop_date);
              const diffTime = Math.abs(today.getTime() - recentTripDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays === 0) {
                recentTrip = "Today";
              } else if (diffDays === 1) {
                recentTrip = "Yesterday";
              } else {
                recentTrip = `${diffDays} days ago`;
              }
              totalEarnings = response.data.bookings.reduce((sum, trip) => sum + trip.price, 0).toLocaleString();
            }
          }

          // Update the static tripSummaryData object (this is not ideal for React state, but for simplicity)
          // A better approach would be to use separate state variables for these summary values.
          if (activeTab === 'upcoming') {
            tripSummaryData.upcoming.totalTrips = totalTrips;
            tripSummaryData.upcoming.nextTrip = nextTrip;
            tripSummaryData.upcoming.expectedEarnings = expectedEarnings;
          } else {
            tripSummaryData.completed.totalTrips = totalTrips;
            tripSummaryData.completed.recentTrip = recentTrip;
            tripSummaryData.completed.totalEarnings = totalEarnings;
          }

        } else {
          toast.error(response.message || 'Failed to fetch trips'); // Error toast
        }
      } catch (err: any) {
        console.error('Error fetching trips:', err);
        // toast.error(err.response?.data?.message || 'An error occurred while fetching trips.'); // Error toast
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [activeTab, currentPage]);

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
            className={`py-3 px-6 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'upcoming'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            onClick={() => { setActiveTab('upcoming'); setCurrentPage(1); }}
            disabled={loading}
          >
            Upcoming Trips
          </button>
          <button
            className={`py-3 px-6 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'completed'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            onClick={() => { setActiveTab('completed'); setCurrentPage(1); }}
            disabled={loading}
          >
            Completed Trips
          </button>
        </div>
      </div>

      {/* Trip Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[0, 1, 2].map((idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
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
              <div className={`p-3 ${idx === 0 ? 'bg-indigo-50' : idx === 1 ? 'bg-green-50' : 'bg-purple-50'} rounded-lg`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${idx === 0 ? 'text-indigo-600' : idx === 1 ? 'text-green-600' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {idx === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />}
                  {idx === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  {idx === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-50/50">
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
                  <td colSpan={activeTab === 'upcoming' ? 6 : 7} className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                      <p className="font-medium">No {activeTab} trips found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100 font-mono text-xs">{trip.id}</td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTripTypeClass(trip.vehicle_model || '')}`}>
                        {trip.vehicle_model || 'N/A'}
                      </span>
                    </td>
                    {activeTab === 'upcoming' && (
                      <td className="p-4 text-sm text-gray-700 border-b border-gray-100">{trip.vehicle_model || 'N/A'}</td>
                    )}
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{trip.pickup_location}</span>
                        <span className="text-xs text-gray-400 my-0.5">↓</span>
                        <span className="font-medium text-gray-900">{trip.dropoff_location}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900 border-b border-gray-100">₹{trip.price}</td>
                    {activeTab === 'completed' && (
                      <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                        {/* Assuming customerReview is not directly available in BookingData, or needs to be fetched separately */}
                        <span className="text-gray-400 italic">No review</span>
                      </td>
                    )}
                    <td className="p-4 text-sm border-b border-gray-100">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusClass(trip.status)}`}>
                        {trip.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {!loading && trips.length > 0 && (
          <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripsComponent;
