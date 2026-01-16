import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { getUserBookings, cancelBooking, BookingResponse } from '../api/bookingService';
import toast from 'react-hot-toast';


const PreviousBookings = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingResponse['data'][]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>(''); // For filtering bookings

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await getUserBookings({ page: currentPage, status: statusFilter || undefined });
        if (response.success) {
          setBookings(response.data.bookings);
          setTotalPages(response.data.pagination.total_pages);
        } else {
          toast.error(response.message || 'Failed to fetch bookings');
        }
      } catch (error: any) {
        console.error('Error fetching user bookings:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    const intervalId = setInterval(fetchBookings, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId); // Clean up the interval on component unmount
  }, [currentPage, statusFilter]); // Re-fetch when page or filter changes

  const getStatusColor = (status: BookingResponse['data']['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'ongoing':
      case 'preongoing':
      case 'approved':
        return 'bg-yellow-100 text-yellow-700';
      case 'waiting':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Function to fetch bookings (memoized to avoid re-creating on every render)
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUserBookings({ page: currentPage, status: statusFilter || undefined });
      if (response.success) {
        setBookings(response.data.bookings);
        setTotalPages(response.data.pagination.total_pages);
      } else {
        toast.error(response.message || 'Failed to fetch bookings');
      }
    } catch (error: any) {
      console.error('Error fetching user bookings:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchBookings();

    const intervalId = setInterval(fetchBookings, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId); // Clean up the interval on component unmount
  }, [fetchBookings]); // Depend on memoized fetchBookings

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
          fetchBookings(); // Re-fetch bookings to update the list
        } else {
          toast.error(response.message || 'Failed to cancel booking');
        }
      } catch (error: any) {
        console.error('Error cancelling booking:', error);
        toast.error(error.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-1/3">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-24" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-8 max-w-6xl mx-auto w-full flex-grow">
        <h1 className="text-2xl font-bold mb-8 text-gray-800">Previous Bookings</h1>
        <div className="mb-6">
          <label htmlFor="status-filter" className="sr-only">Filter by Status</label>
          <select
            id="status-filter"
            className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-700 px-4 py-2 rounded-lg w-full md:w-60 transition-all duration-200"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            {['waiting', 'approved', 'preongoing', 'ongoing', 'completed', 'cancelled'].map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-4">
          {bookings.length === 0 && !loading ? (
            <div className="text-center py-8 text-gray-600">No previous bookings found for this status.</div>
          ) : (
            bookings.map((booking) => {
              const { date, time } = formatDateTime(booking.pickup_date);
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 overflow-hidden"
                  onClick={() => navigate(`/booking-details/${booking.id}`)}
                >
                  {/* Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Booking ID</p>
                      <h3 className="text-gray-900 font-mono font-medium">#{booking.id.substring(0, 8)}</h3>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusColor(booking.status)}`}>
                        {booking.status === 'completed' && '✅ '}
                        {booking.status === 'cancelled' && '❌ '}
                        {booking.status === 'waiting' && '⏳ '}
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Route Details */}
                      <div className="md:col-span-2 space-y-6">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1 mr-4">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pickup</p>
                            <p className="text-gray-900 font-medium">{booking.pickup_location}</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1 mr-4">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Drop</p>
                            <p className="text-gray-900 font-medium">{booking.dropoff_location}</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1 mr-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Date & Time</p>
                            <p className="text-gray-900 font-medium">
                              {date} <span className="text-gray-300 mx-1">|</span> {time}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Price & Vehicle Info */}
                      <div className="space-y-6 md:border-l md:border-gray-100 md:pl-8">
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Amount</p>
                          <p className="text-2xl font-bold text-gray-900">₹{booking.price.toLocaleString()}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Category</p>
                          <span className="inline-block bg-gray-100 rounded px-2 py-1 text-sm font-medium text-gray-700">
                            {booking.cab_category_name}
                          </span>
                        </div>

                        {(booking.vehicle_model || booking.driver_name) && (
                          <div className="pt-4 border-t border-gray-100 space-y-2">
                            {booking.vehicle_model && (
                              <p className="text-sm text-gray-600 flex items-center">
                                <span className="w-4 mr-2 text-center text-gray-400">🚗</span>
                                {booking.vehicle_model}
                                <span className="text-xs text-gray-400 ml-1">({booking.vehicle_registration})</span>
                              </p>
                            )}
                            {booking.driver_name && (
                              <p className="text-sm text-gray-600 flex items-center">
                                <span className="w-4 mr-2 text-center text-gray-400">👤</span>
                                {booking.driver_name}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end space-x-4">
                      {booking.status === 'completed' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); /* Prevent navigation */ }}
                          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Download Invoice
                        </button>
                      )}
                      {(booking.status === 'waiting' || booking.status === 'approved') && (
                        <div className="flex justify-end">
                          {(() => {
                            // Inline 6-hour check for previous bookings list
                            const pickupTime = new Date(booking.pickup_date).getTime();
                            const currentTime = new Date().getTime();
                            const sixHoursInMillis = 6 * 60 * 60 * 1000;
                            const isCancellable = currentTime < (pickupTime - sixHoursInMillis);

                            if (isCancellable) {
                              return (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleCancelBooking(booking.id); }}
                                  className="inline-flex items-center px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors text-sm font-medium"
                                >
                                  Cancel Booking
                                </button>
                              );
                            } else {
                              return null;
                            }
                          })()}
                        </div>
                      )}
                      <button className="text-gray-400 hover:text-blue-600 transition-colors">
                        <span className="sr-only">View Details</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 border rounded-lg ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>

  );
};

export default PreviousBookings;
