import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingDetails, BookingDetailsResponse } from '../api/bookingService';
import toast from 'react-hot-toast';
import { checkAuth } from '../utils/verifytoken';

import Footer from '../components/Footer';

const BookingDetails = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<BookingDetailsResponse['data'] | null>(null);

  useEffect(() => {
    const verifyAndFetch = async () => {
      const token = localStorage.getItem('marcocabs_customer_token');
      const type = 'customer';

      if (!token) {
        toast.error('Authentication required to view booking details.');
        navigate('/login', { state: { from: `/booking-details/${bookingId}` } });
        return;
      }

      const authResult = await checkAuth(type, token);
      if (!authResult) {
        toast.error('Session expired or invalid. Please log in again.');
        navigate('/login', { state: { from: `/booking-details/${bookingId}` } });
        return;
      }

      if (!bookingId) {
        toast.error('Booking ID is missing.');
        navigate('/previous-bookings');
        return;
      }

      setLoading(true);
      try {
        const response = await getBookingDetails(bookingId);
        if (response.success) {
          setBookingDetails(response.data);
        } else {
          toast.error(response.message || 'Failed to fetch booking details');
          navigate('/previous-bookings');
        }
      } catch (error: any) {
        console.error('Error fetching booking details:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch booking details');
        navigate('/previous-bookings');
      } finally {
        setLoading(false);
      }
    };

    verifyAndFetch();
  }, [bookingId, navigate]);

  // Helper to format date and time
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  const getStatusColor = (status: BookingDetailsResponse['data']['status']) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Booking details not found.</p>
      </div>
    );
  }

  const { date: pickupDate, time: pickupTime } = formatDateTime(bookingDetails.pickup_date);
  const { date: dropDate, time: dropTime } = bookingDetails.drop_date ? formatDateTime(bookingDetails.drop_date) : { date: 'N/A', time: 'N/A' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12a9 9 0 01-9 9 9 9 0 01-9-9 9 9 0 019-9 9 9 0 019 9z" />
                <path d="M12 17l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z" fillRule="evenodd" clipRule="evenodd" fill="white" />
              </svg>
              <h1 className="text-2xl font-bold">Booking Details</h1>
            </div>
            <button
              onClick={() => navigate('/previous-bookings')}
              className="text-white hover:text-blue-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800">Booking #{bookingDetails.id.substring(0, 8)}</h1>
            <p className="text-gray-600 mt-2">Detailed information about your trip</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trip Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-blue-700 to-blue-600 text-white">
                  <h2 className="text-xl font-bold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Trip Summary
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <DetailItem label="Status" value={bookingDetails.status} colorClass={getStatusColor(bookingDetails.status)} />
                  <DetailItem label="Trip Type" value={bookingDetails.drop_date ? 'Round Trip' : 'One Way'} />
                  <DetailItem label="Pickup Date & Time" value={`${pickupDate} at ${pickupTime}`} />
                  {bookingDetails.drop_date && <DetailItem label="Drop Date & Time" value={`${dropDate} at ${dropTime}`} />}
                  <DetailItem label="Distance" value={`${bookingDetails.distance} km`} />
                  <DetailItem label="Price" value={`₹${bookingDetails.price.toLocaleString()}`} />
                  <DetailItem label="Cab Category" value={bookingDetails.cab_category_name} />
                  {bookingDetails.cab_category_image && (
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <span className="font-medium text-gray-700">Category Image</span>
                      <img src={bookingDetails.cab_category_image} alt={bookingDetails.cab_category_name} className="h-12 w-12 object-contain rounded-md" />
                    </div>
                  )}
                  <DetailItem label="Price per KM" value={`₹${parseFloat(bookingDetails.cab_category_price_per_km as any).toFixed(2)}`} />
                  {bookingDetails.min_seats !== undefined && <DetailItem label="Min Seats" value={bookingDetails.min_seats.toString()} />}
                  {bookingDetails.max_seats !== undefined && <DetailItem label="Max Seats" value={bookingDetails.max_seats.toString()} />}
                  {bookingDetails.per_km_charge !== null && (
                    <DetailItem label="Vehicle Per KM Charge" value={`₹${typeof bookingDetails.per_km_charge === 'number' ? bookingDetails.per_km_charge.toFixed(2) : parseFloat(bookingDetails.per_km_charge as any).toFixed(2)}`} />
                  )}
                </div>
                
                {/* OTP Display for Approved Bookings */}
                {bookingDetails.booking_otp && ['approved', 'preongoing'].includes(bookingDetails.status) && (
                  <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg mx-6 mb-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-yellow-800 mb-2">📱 Share this OTP with your driver to start the trip</p>
                      <div className="flex items-center justify-center space-x-2">
                        <p className="text-3xl font-bold text-yellow-900 tracking-widest">{bookingDetails.booking_otp}</p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(bookingDetails.booking_otp || '');
                            toast.success('OTP copied to clipboard!');
                          }}
                          className="p-2 hover:bg-yellow-100 rounded-md transition-colors"
                          title="Copy OTP"
                        >
                          <svg className="w-5 h-5 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Route & People Details */}
            <div className="space-y-6">
              {/* Route Details */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-blue-700 to-blue-600 text-white">
                  <h2 className="text-xl font-bold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Route Details
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <DetailItem label="Pickup Location" value={bookingDetails.pickup_location} />
                  <DetailItem label="Dropoff Location" value={bookingDetails.dropoff_location} />
                  {/* Assuming stops are part of the path or not explicitly stored as separate fields in bookingDetails */}
                  {/* <DetailItem label="Stops" value={bookingDetails.stops?.join(', ') || 'N/A'} /> */}
                </div>
              </div>

              {/* People Details */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-blue-700 to-blue-600 text-white">
                  <h2 className="text-xl font-bold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    People Details
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <DetailItem label="Customer Name" value={bookingDetails.customer_name || 'N/A'} />
                  <DetailItem label="Customer Phone" value={bookingDetails.customer_phone || 'N/A'} />
                  <DetailItem label="Customer Email" value={bookingDetails.customer_email || 'N/A'} />
                  {bookingDetails.vendor_name && <DetailItem label="Vendor Name" value={bookingDetails.vendor_name} />}
                  {bookingDetails.vendor_phone && <DetailItem label="Vendor Phone" value={bookingDetails.vendor_phone} />}
                  {bookingDetails.vendor_email && <DetailItem label="Vendor Email" value={bookingDetails.vendor_email} />}
                  {bookingDetails.driver_name && <DetailItem label="Driver Name" value={bookingDetails.driver_name} />}
                  {bookingDetails.driver_phone && <DetailItem label="Driver Phone" value={bookingDetails.driver_phone} />}
                  {bookingDetails.partner_name && <DetailItem label="Partner Name" value={bookingDetails.partner_name} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

// Helper component for displaying detail items
interface DetailItemProps {
  label: string;
  value: string;
  colorClass?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, colorClass }) => (
  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
    <span className="font-medium text-gray-700">{label}</span>
    <span className={`font-semibold text-gray-800 ${colorClass}`}>{value}</span>
  </div>
);

export default BookingDetails;
