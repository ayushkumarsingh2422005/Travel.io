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
        return 'bg-green-100 text-green-700';
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
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-gray-800">Previous Bookings</h1>
      <div className="mb-6 flex flex-wrap gap-3">
        {['', 'waiting', 'approved', 'preongoing', 'ongoing', 'completed', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === '' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
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
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/booking-details/${booking.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Booking #{booking.id.substring(0, 8)}</h3>
                    <p className="text-gray-500">{date} at {time}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pickup Location</p>
                    <p className="text-gray-800">{booking.pickup_location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Drop Location</p>
                    <p className="text-gray-800">{booking.dropoff_location}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Cab Category</p>
                    <p className="text-gray-800">{booking.cab_category_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="text-gray-800 font-semibold">₹{booking.price.toLocaleString()}</p>
                  </div>
                  {booking.status !== 'waiting' && (
                    <>
                      {booking.vehicle_model && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Vehicle</p>
                          <p className="text-gray-800">{booking.vehicle_model} ({booking.vehicle_registration})</p>
                        </div>
                      )}
                      {booking.driver_name && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Driver</p>
                          <p className="text-gray-800">{booking.driver_name} - {booking.driver_phone}</p>
                        </div>
                      )}
                      {booking.vendor_name && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Vendor</p>
                          <p className="text-gray-800">{booking.vendor_name} - {booking.vendor_phone}</p>
                        </div>
                      )}
                    </>
                  )}
                  {booking.status === 'waiting' && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-blue-600 font-medium">Waiting for vendor to accept...</p>
                    </div>
                  )}
                </div>

                {booking.status === 'completed' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); /* Prevent navigation */ }}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mr-4"
                  >
                    Download Invoice
                  </button>
                )}
                {(booking.status === 'waiting' || booking.status === 'approved') && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCancelBooking(booking.id); }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Cancel Booking
                  </button>
                )}
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
              className={`px-4 py-2 border rounded-lg ${
                currentPage === index + 1 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
  );
};

export default PreviousBookings;
