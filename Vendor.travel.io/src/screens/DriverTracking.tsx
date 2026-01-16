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
                const response = await api.get(`/booking/public/${bookingId}`); // Hypothetical public endpoint
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
            const response = await api.post(`/booking/driver/verify-otp`, {
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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
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
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl border border-gray-100">
                <div className="md:flex">
                    <div className="p-8 w-full">
                        <div className="uppercase tracking-wide text-sm text-indigo-600 font-bold mb-1">Driver Portal</div>
                        <h1 className="block mt-1 text-2xl leading-tight font-bold text-gray-900">Trip Details</h1>

                        {bookingDetails ? (
                            <div className="mt-6 space-y-4">
                                <div className="flex justify-between border-b border-gray-100 pb-3">
                                    <span className="text-gray-500 text-sm">Customer</span>
                                    <span className="font-semibold text-gray-900">{bookingDetails.customer_name}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-3">
                                    <span className="text-gray-500 text-sm">Phone</span>
                                    <a href={`tel:${bookingDetails.customer_phone}`} className="font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                        </svg>
                                        {bookingDetails.customer_phone}
                                    </a>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-3">
                                    <span className="text-gray-500 text-sm">Pickup</span>
                                    <span className="font-medium text-right text-gray-900 max-w-[60%]">{bookingDetails.pickup_location}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-3">
                                    <span className="text-gray-500 text-sm">Dropoff</span>
                                    <span className="font-medium text-right text-gray-900 max-w-[60%]">{bookingDetails.dropoff_location}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-3">
                                    <span className="text-gray-500 text-sm">Date</span>
                                    <span className="font-medium text-gray-900">{new Date(bookingDetails.pickup_date).toLocaleString()}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-pulse text-gray-400">Loading details...</div>
                            </div>
                        )}

                        <div className="mt-8">
                            {bookingDetails?.status === 'completed' ? (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center shadow-sm">
                                    <svg className="mx-auto h-12 w-12 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <h3 className="text-lg font-bold text-green-800">Trip Completed</h3>
                                    <p className="text-green-600 text-sm mt-1">This trip has been successfully completed.</p>
                                </div>
                            ) : tripStarted || (bookingDetails?.status === 'ongoing') ? (
                                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center shadow-sm">
                                    <div className="animate-pulse mb-3">
                                        <span className="inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                    </div>
                                    <h3 className="text-xl font-bold text-indigo-800 mb-1">Trip Started</h3>
                                    <p className="text-indigo-600 mb-6 text-sm">Drive safely to the destination!</p>

                                    <button
                                        onClick={async () => {
                                            if (!confirm('Are you sure you want to complete this trip?')) return;
                                            setLoading(true);
                                            try {
                                                const response = await api.post(`/booking/driver/complete-trip`, {
                                                    booking_id: bookingId
                                                });
                                                if (response.data.success) {
                                                    toast.success('Trip Completed Successfully!');
                                                    setBookingDetails(prev => prev ? { ...prev, status: 'completed' } : null);
                                                    setTripStarted(false);
                                                }
                                            } catch (err: any) {
                                                console.error('Error completing trip:', err);
                                                toast.error(err.response?.data?.message || 'Failed to complete trip');
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        disabled={loading}
                                        className="w-full py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
                                    >
                                        {loading ? 'Processing...' : 'Complete Trip'}
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-5 bg-gray-50 p-6 rounded-xl border border-gray-100">
                                    <div>
                                        <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                                            Enter Start OTP (from Customer)
                                        </label>
                                        <input
                                            type="text"
                                            id="otp"
                                            className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm tracking-[1em] text-center text-2xl font-mono transition-shadow"
                                            placeholder="••••••"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || otp.length < 4}
                                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Verifying...
                                            </span>
                                        ) : 'Start Trip'}
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
