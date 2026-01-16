import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserBookings, cancelBooking, BookingResponse } from '../api/bookingService';
import toast from 'react-hot-toast';

import { useLocation } from 'react-router-dom';


const Dashboard = () => {
  const location = useLocation();
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

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const response = await cancelBooking(bookingId);
        if (response.success) {
          toast.success(response.message || 'Booking cancelled successfully!');
          // Refresh dashboard data
          window.location.reload();
        } else {
          toast.error(response.message || 'Failed to cancel booking');
        }
      } catch (error: any) {
        console.error('Error cancelling booking:', error);
        toast.error(error.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  const isCancellable = (booking: BookingResponse['data']) => {
    if (booking.status !== 'waiting' && booking.status !== 'approved') return false;

    const pickupTime = new Date(booking.pickup_date).getTime();
    const currentTime = new Date().getTime();
    const sixHoursInMillis = 6 * 60 * 60 * 1000;

    // Check if current time is BEFORE (Pickup Time - 6 Hours)
    return currentTime < (pickupTime - sixHoursInMillis);
  };

  useEffect(() => {
    // Show OTP toast if focused from booking page
    if (location.state?.booking_otp) {
      toast.success(`Booking Confirmed! OTP: ${location.state.booking_otp}`, {
        duration: 8000,
        icon: '🎉',
      });
      // Clear state so it doesn't persist on refresh (though location.state persists on refresh in some routers, but okay for now)
      window.history.replaceState({}, document.title);
    }

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
    <div className="flex flex-col min-h-screen">
      <div className="p-8 max-w-6xl mx-auto w-full flex-grow">
        <h1 className="text-2xl font-bold mb-8 text-gray-800">Dashboard</h1>

        {/* Active Booking Section */}
        <div className="mb-8">
          {activeBooking ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Active Booking</h2>
                {isCancellable(activeBooking) && (
                  <button
                    onClick={() => handleCancelBooking(activeBooking.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeBooking.status === 'waiting' ? (
                  <div className="col-span-2 text-center">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">Booking Status: Waiting for Vendor</h3>
                    <p className="text-gray-600 mb-2">Your booking request has been sent to vendors.</p>
                    <p className="text-gray-800 font-medium mb-4">Cab Category: {activeBooking.cab_category_name}</p>

                    <div className="bg-gray-50 rounded-lg p-4 inline-block text-left w-full max-w-lg mx-auto">
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <span className="text-green-500 mr-3 mt-1">📍</span>
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Pickup</p>
                            <p className="text-gray-800 font-medium">{activeBooking.pickup_location}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="text-red-500 mr-3 mt-1">📍</span>
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Drop</p>
                            <p className="text-gray-800 font-medium">{activeBooking.dropoff_location}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-500 mr-3 mt-1">🕒</span>
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Date & Time</p>
                            <p className="text-gray-800 font-medium">
                              {formatDateTime(activeBooking.pickup_date).date} <span className="text-gray-400">|</span> {formatDateTime(activeBooking.pickup_date).time}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-1 text-sm text-gray-500">
                      <p>Vendor: Pending Assignment...</p>
                      <p>Vehicle: Pending Assignment...</p>
                      <p>Driver: Pending Assignment...</p>
                    </div>
                    {activeBooking.booking_otp && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center shadow-sm max-w-sm mx-auto">
                        <p className="text-sm text-blue-700 font-bold uppercase tracking-widest mb-1">Start Ride OTP</p>
                        <p className="text-4xl font-extrabold text-blue-900 tracking-[0.2em]">{activeBooking.booking_otp}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Left Column: Route Details */}
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1 mr-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Pickup</p>
                          <p className="text-gray-900 font-medium leading-relaxed">{activeBooking.pickup_location}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1 mr-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Drop</p>
                          <p className="text-gray-900 font-medium leading-relaxed">{activeBooking.dropoff_location}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1 mr-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Date & Time</p>
                          <p className="text-gray-900 font-medium">
                            {formatDateTime(activeBooking.pickup_date).date} <span className="text-gray-400 mx-1">|</span> {formatDateTime(activeBooking.pickup_date).time}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1 mr-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Cab Category</p>
                          <p className="text-gray-900 font-medium uppercase text-sm bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">{activeBooking.cab_category_name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Driver & Cab Details */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Ride Details</h4>

                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Vendor</p>
                          <p className="text-gray-900 font-semibold">{activeBooking.vendor_name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{activeBooking.vendor_phone || 'N/A'}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Vehicle</p>
                          <p className="text-gray-900 font-semibold">
                            {activeBooking.vehicle_model ? `${activeBooking.vehicle_model}` : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-600 font-mono bg-white border border-gray-200 px-1.5 rounded inline-block mt-0.5">
                            {activeBooking.vehicle_registration || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Driver</p>
                          <p className="text-gray-900 font-semibold">{activeBooking.driver_name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{activeBooking.driver_phone || 'N/A'}</p>
                        </div>

                        <div className="pt-3 border-t border-gray-200 mt-2">
                          <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                          <p className="text-2xl font-bold text-gray-800">₹{activeBooking.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Full Width OTP Banner (Outside Grid) */}
              {activeBooking.status !== 'waiting' && activeBooking.booking_otp && (
                <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 text-center max-w-2xl mx-auto shadow-sm">
                    <p className="text-sm text-blue-600 font-bold uppercase tracking-widest mb-2">Share this OTP with your driver</p>
                    <div className="inline-block bg-white px-8 py-3 rounded-xl border-2 border-blue-200 shadow-sm">
                      <p className="text-5xl font-black text-blue-600 tracking-[0.2em] font-mono">{activeBooking.booking_otp}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Do not share this OTP until you are in the cab.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">No Active Bookings</h2>
              <p className="text-gray-600 mb-4">Looking to book a ride?</p>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
              className="text-blue-600 hover:text-blue-700 font-medium"
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
                      <span className={`text-sm ${booking.status === 'completed'
                        ? 'text-blue-600'
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
    </div>
  );
};

export default Dashboard;
