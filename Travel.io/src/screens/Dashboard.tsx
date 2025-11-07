import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserBookings, BookingResponse } from '../api/bookingService';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState<BookingResponse['data'] | null>(null);
  const [recentBookings, setRecentBookings] = useState<BookingResponse['data'][]>([]);

  // Helper to format date and time
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch active bookings for each status individually
        const statusesToFetch = ['ongoing', 'preongoing', 'approved', 'waiting'];
        let allActiveBookings: BookingResponse['data'][] = [];

        for (const status of statusesToFetch) {
          const response = await getUserBookings({
            status: status,
            limit: 1, // Fetch one for each status, then combine and pick the latest
          });
          if (response.success && response.data.bookings.length > 0) {
            allActiveBookings.push(response.data.bookings[0]);
          }
        }

        // Sort all active bookings by creation date to get the latest one
        if (allActiveBookings.length > 0) {
          allActiveBookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          const latestActiveBooking = allActiveBookings[0];
          setActiveBooking(latestActiveBooking);
        } else {
          setActiveBooking(null);
        }

        // Fetch recent bookings for each status individually
        const recentStatusesToFetch = ['completed', 'cancelled'];
        let allRecentBookings: BookingResponse['data'][] = [];

        for (const status of recentStatusesToFetch) {
          const response = await getUserBookings({
            status: status,
            limit: 2, // Fetch up to 2 for each status, then combine and pick the latest
          });
          if (response.success && response.data.bookings.length > 0) {
            allRecentBookings.push(...response.data.bookings);
          }
        }

        // Sort all recent bookings by creation date and take the top 2
        if (allRecentBookings.length > 0) {
          allRecentBookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setRecentBookings(allRecentBookings.slice(0, 2)); // Limit to 2 recent bookings
        } else {
          setRecentBookings([]);
        }

      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    const intervalId = setInterval(fetchDashboardData, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId); // Clean up the interval on component unmount
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-8">
          {/* Active Booking Skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>

          {/* Recent Bookings Skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-gray-800">Dashboard</h1>

      {/* Active Booking Section */}
      <div className="mb-8">
        {activeBooking ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Active Booking</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeBooking.status === 'waiting' ? (
                <div className="col-span-2 text-center">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Booking Status: Waiting for Vendor</h3>
                  <p className="text-gray-600 mb-2">Your booking request has been sent to vendors.</p>
                  <p className="text-gray-800 font-medium mb-4">Cab Category: {activeBooking.cab_category_name}</p>
                  <div className="space-y-2 text-left inline-block mb-4">
                    <p className="text-gray-600">Pickup: <span className="font-medium text-gray-800">{activeBooking.pickup_location}</span></p>
                    <p className="text-gray-600">Drop: <span className="font-medium text-gray-800">{activeBooking.dropoff_location}</span></p>
                    <p className="text-gray-600">Date: <span className="font-medium text-gray-800">{formatDateTime(activeBooking.pickup_date).date}</span></p>
                    <p className="text-gray-600">Time: <span className="font-medium text-gray-800">{formatDateTime(activeBooking.pickup_date).time}</span></p>
                    {activeBooking.drop_date && activeBooking.drop_date !== activeBooking.pickup_date && (
                      <p className="text-gray-600">Drop Date: <span className="font-medium text-gray-800">{formatDateTime(activeBooking.drop_date).date}</span></p>
                    )}
                  </div>
                  <div className="space-y-2 text-left inline-block">
                    <p className="text-gray-600">Vendor: Not assigned yet</p>
                    <p className="text-gray-600">Vehicle: Not assigned yet</p>
                    <p className="text-gray-600">Driver: Not assigned yet</p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Pickup</p>
                      <p className="text-gray-800">{activeBooking.pickup_location}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Drop</p>
                      <p className="text-gray-800">{activeBooking.dropoff_location}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                      <p className="text-gray-800">
                        {formatDateTime(activeBooking.pickup_date).date} at {formatDateTime(activeBooking.pickup_date).time}
                      </p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Cab Category</p>
                      <p className="text-gray-800">{activeBooking.cab_category_name}</p>
                    </div>
                  </div>
                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Vendor</p>
                      <p className="text-gray-800">{activeBooking.vendor_name || 'N/A'}</p>
                      <p className="text-gray-600">{activeBooking.vendor_phone || 'N/A'}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Vehicle</p>
                      <p className="text-gray-800">
                        {activeBooking.vehicle_model ? `${activeBooking.vehicle_model} (${activeBooking.vehicle_registration})` : 'N/A'}
                      </p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Driver</p>
                      <p className="text-gray-800">{activeBooking.driver_name || 'N/A'}</p>
                      <p className="text-gray-600">{activeBooking.driver_phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Amount</p>
                      <p className="text-gray-800 font-semibold">₹{activeBooking.price.toLocaleString()}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">No Active Bookings</h2>
            <p className="text-gray-600 mb-4">Looking to book a ride?</p>
            <Link 
              to="/"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Book Now
            </Link>
          </div>
        )}
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Recent Bookings</h2>
          <Link 
            to="/previous-bookings"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {recentBookings.length === 0 && !loading ? (
            <div className="text-center py-4 text-gray-600">No recent bookings found.</div>
          ) : (
            recentBookings.map(booking => {
              const { date } = formatDateTime(booking.pickup_date);
              return (
                <div 
                  key={booking.id}
                  className="p-4 rounded-lg bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {booking.pickup_location} → {booking.dropoff_location}
                    </p>
                    <p className="text-sm text-gray-600">{booking.cab_category_name} - {date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">₹{booking.price.toLocaleString()}</p>
                    <span className={`text-sm ${
                      booking.status === 'completed' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
