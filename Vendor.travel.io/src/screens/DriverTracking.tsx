import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

// Create a separate axios instance or use existing one if suitable
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

interface BookingDetails {
    id: string;
    pickup_location: string;
    dropoff_location: string;
    pickup_date: string;
    customer_name: string;
    customer_phone: string;
    status: string;
}

const DriverTracking: React.FC = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
    const [error, setError] = useState('');
    const [tripStarted, setTripStarted] = useState(false);

    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!bookingId) return;
            try {
                setLoading(true);
                // We'll interpret this as a public endpoint for drivers or use a specific driver auth flow if needed.
                // For simplicity/demo based on requirements, assuming we fetch public details or minimal auth.
                // However, usually this requires some token. The prompt implies a "tracking link" which might be public or tokenized.
                // Assuming a public detail fetch for now or that the link contains a token. 
                // Given the instructions, we'll try to fetch details. If backend is secured, this might fail without auth.
                // Let's assume there's a specific endpoint for drivers to view job details by ID.

                // Use a generic endpoint or the one defined in backend changes if specific.
                // The backend changes mentioned "Driver verifies OTP to start trip".
                // Let's assume GET /api/booking/driver/details/:id exists or we use the vendor one if we can.
                // For this task, I'll simulate fetching or use a hypothetical endpoint.
                const response = await api.get(`/api/booking/public/${bookingId}`); // Hypothetical public endpoint
                setBookingDetails(response.data.data);
                if (response.data.data.status === 'ongoing') {
                    setTripStarted(true);
                }
            } catch (err: any) {
                console.error('Error fetching booking:', err);
                setError('Failed to load booking details. Link might be invalid or expired.');
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetails();
    }, [bookingId]);

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingId || !otp) return;

        setLoading(true);
        try {
            // Endpoint to verify OTP
            const response = await api.post(`/api/booking/driver/verify-otp`, {
                booking_id: bookingId,
                otp: otp
            });

            if (response.data.success) {
                toast.success('OTP Verified! Trip Started.');
                setTripStarted(true);
                // Optionally update local state to reflect new status
                if (bookingDetails) {
                    setBookingDetails({ ...bookingDetails, status: 'ongoing' });
                }
            } else {
                toast.error('Invalid OTP. Please try again.');
            }
        } catch (err: any) {
            console.error('Error verifying OTP:', err);
            toast.error(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !bookingDetails) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full text-center">
                    <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
                <div className="md:flex">
                    <div className="p-8 w-full">
                        <div className="uppercase tracking-wide text-sm text-green-500 font-semibold mb-1">Driver Portal</div>
                        <h1 className="block mt-1 text-lg leading-tight font-medium text-black">Trip Details</h1>

                        {bookingDetails ? (
                            <div className="mt-6 space-y-4">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Customer</span>
                                    <span className="font-medium">{bookingDetails.customer_name}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Phone</span>
                                    <a href={`tel:${bookingDetails.customer_phone}`} className="font-medium text-blue-600">{bookingDetails.customer_phone}</a>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Pickup</span>
                                    <span className="font-medium text-right">{bookingDetails.pickup_location}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Dropoff</span>
                                    <span className="font-medium text-right">{bookingDetails.dropoff_location}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Date</span>
                                    <span className="font-medium">{new Date(bookingDetails.pickup_date).toLocaleString()}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 mt-4">Loading details...</p>
                        )}

                        <div className="mt-8">
                            {tripStarted || (bookingDetails?.status === 'ongoing') ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <svg className="mx-auto h-12 w-12 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="text-lg font-bold text-green-800">Trip Started</h3>
                                    <p className="text-green-600">Drive safely!</p>
                                </div>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div>
                                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                                            Enter Start OTP (from Customer)
                                        </label>
                                        <input
                                            type="text"
                                            id="otp"
                                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm tracking-widest text-center text-2xl"
                                            placeholder="XXXXXX"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || otp.length < 4}
                                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                                    >
                                        {loading ? 'Verifying...' : 'Start Trip'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverTracking;
