import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingDetails, BookingDetailsResponse } from '../api/bookingService';
import toast from 'react-hot-toast';
import { checkAuth } from '../utils/verifytoken';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
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
      <header className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg">
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
              className="text-white hover:text-green-100 transition-colors"
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
                <div className="p-5 bg-gradient-to-r from-green-700 to-green-600 text-white">
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
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <span className="font-medium text-gray-700">Category Image</span>
                      <img src={bookingDetails.cab_category_image} alt={bookingDetails.cab_category_name} className="h-12 w-12 object-contain rounded-md" />
                    </div>
                  )}
                  <DetailItem label="Price per KM" value={`₹${bookingDetails.cab_category_price_per_km.toFixed(2)}`} />
                  <DetailItem label="Min Seats" value={bookingDetails.min_seats.toString()} />
                  <DetailItem label="Max Seats" value={bookingDetails.max_seats.toString()} />
                  {bookingDetails.per_km_charge !== null && (
                    <DetailItem label="Vehicle Per KM Charge" value={`₹${typeof bookingDetails.per_km_charge === 'number' ? bookingDetails.per_km_charge.toFixed(2) : parseFloat(bookingDetails.per_km_charge as any).toFixed(2)}`} />
                  )}
                </div>
              </div>
            </div>

            {/* Route & People Details */}
            <div className="space-y-6">
              {/* Route Details */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-green-700 to-green-600 text-white">
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
                <div className="p-5 bg-gradient-to-r from-green-700 to-green-600 text-white">
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
      <footer className="bg-gray-900 text-white py-8 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-2xl font-bold">MARCO</div>
              <p className="text-gray-400 text-sm mt-1">Your reliable travel partner across India</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882-.3 1.857-.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Marco Cab Services. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Cancellation & Refund Policy</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a>
            </div>
          </div>
        </div>
      </footer>
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
  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
    <span className="font-medium text-gray-700">{label}</span>
    <span className={`font-semibold text-gray-800 ${colorClass}`}>{value}</span>
  </div>
);

export default BookingDetails;
