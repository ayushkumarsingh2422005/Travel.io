import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { checkAuth, getUserDetailsFromToken } from '../utils/verifytoken';
import toast from 'react-hot-toast';
import { createPaymentOrder, verifyPayment, CreateOrderRequest, VerifyPaymentRequest } from '../api/paymentService';
import { getUserProfile, updateProfile, sendPhoneOtp, verifyPhoneOtp, addPhoneNumber, UserProfile } from '../api/userService';
import AddOnsSelector from '../components/AddOnsSelector';

// Declare Razorpay on the Window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface BookingData {
  pickup: string;
  destination: string;
  stops: string[];
  tripType: string;
  cab_category_id: string; // Add cab_category_id
  cab_category_name: string; // Add cab_category_name
  pickupDate: string;
  dropDate: string;
  distance: string;
  duration: string;
  price: number;
  path: string;
  distance_km: number;
  isRouteLoading: boolean;
  platformCharges: number;
  gstAmount: number;
  totalUpfrontPayment: number;
  remainingAmount: number;
  selectedAddOns?: any[];
  addOnsTotal?: number;
}

interface UserDetails {
  id: string;
  name?: string;
  email: string;
  phone?: string;
}

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [partnerId, setPartnerId] = useState('');
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState<any[]>([]);
  const [addOnsTotal, setAddOnsTotal] = useState(0);
  const [formData, setFormData] = useState({
    phone: '',
    gender: 'Select Gender' as 'Male' | 'Female' | 'Other' | 'Select Gender',
    age: '',
    current_address: '',
  });

  const bookingData = location.state as BookingData;

  // Pricing State
  const [pricing, setPricing] = useState({
    platformCharges: bookingData?.platformCharges || 0,
    gstAmount: bookingData?.gstAmount || 0,
    totalUpfrontPayment: bookingData?.totalUpfrontPayment || 0,
    remainingAmount: bookingData?.remainingAmount || 0
  });

  // dynamic recalculation of pricing when add-ons change
  useEffect(() => {
    if (bookingData?.price) {
      const totalBookingVal = bookingData.price + addOnsTotal;
      const platformCharges = Math.round(totalBookingVal * 0.10);
      const gstAmount = Math.round(platformCharges * 0.05);
      const totalUpfrontPayment = platformCharges + gstAmount;
      const remainingAmount = totalBookingVal - platformCharges;

      setPricing({
        platformCharges,
        gstAmount,
        totalUpfrontPayment,
        remainingAmount
      });
    }
  }, [addOnsTotal, bookingData]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Authentication check and user details fetch
  useEffect(() => {
    const checkAndFetchProfile = async () => {
      setProfileLoading(true);
      const token = localStorage.getItem('marcocabs_customer_token');
      const type = 'customer';

      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login', {
          state: {
            from: location.pathname,
            bookingData: bookingData,
          },
        });
        return;
      }

      const isAuthenticated = await checkAuth(type, token);

      if (!isAuthenticated) {
        navigate('/login', {
          state: {
            from: location.pathname,
            bookingData: bookingData,
          },
        });
        return;
      }

      setUserToken(token);
      const details = await getUserDetailsFromToken(token);
      if (details) {
        setUserDetails(details);
      } else {
        toast.error('Failed to retrieve user details. Please log in again.');
        navigate('/login', {
          state: {
            from: location.pathname,
            bookingData: bookingData,
          },
        });
        return;
      }

      try {
        const profileResponse = await getUserProfile();
        setUserProfile(profileResponse.user);
        setFormData({
          phone: profileResponse.user.phone || '',
          gender: profileResponse.user.gender || 'Select Gender',
          age: profileResponse.user.age > 0 ? profileResponse.user.age.toString() : '',
          current_address: profileResponse.user.current_address || '',
        });

        if (!profileResponse.user.is_profile_completed || !profileResponse.user.is_phone_verified) {
          setShowProfileForm(true);
          toast.error('Please complete your profile and verify your phone number to proceed with booking.');
        } else {
          setShowProfileForm(false);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to fetch profile data. Please try again.');
        // Optionally redirect to login or profile page if profile fetch fails critically
      } finally {
        setProfileLoading(false);
      }
    };

    checkAndFetchProfile();
  }, [navigate, location.pathname, bookingData]);

  // Redirect if no booking data
  useEffect(() => {
    if (!bookingData) {
      navigate('/');
    }
  }, [bookingData, navigate]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Check if phone number changed and needs to be added/verified
      if (formData.phone && formData.phone !== userProfile?.phone) {
        await addPhoneNumber(formData.phone);
        toast('Phone number updated. Please verify it.');
        // After adding phone, we might need to re-fetch profile to update is_phone_verified status
        // or trigger OTP flow directly. For now, let's assume updateProfile handles it.
      }

      const updatedProfileData = {
        phone: formData.phone,
        gender: formData.gender,
        age: parseInt(formData.age),
        current_address: formData.current_address,
        is_profile_completed: true, // Assume completing this form means profile is completed
      };

      const response = await updateProfile(updatedProfileData);
      setUserProfile(response.user);
      toast.success('Profile updated successfully!');

      if (!response.user.is_phone_verified) {
        toast.error('Please verify your phone number.');
        setIsOtpModalOpen(true); // Open OTP modal if phone is not verified
      } else {
        setShowProfileForm(false); // Hide form if profile and phone are verified
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      await sendPhoneOtp();
      toast.success('OTP sent to your phone!');
      setIsOtpModalOpen(true);
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyPhoneOtp(otp);
      toast.success('Phone verified successfully!');
      setIsOtpModalOpen(false);
      // Re-fetch profile to update the is_phone_verified status
      const profileResponse = await getUserProfile();
      setUserProfile(profileResponse.user);
      if (profileResponse.user.is_profile_completed && profileResponse.user.is_phone_verified) {
        setShowProfileForm(false); // Hide form if profile and phone are verified
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast.error(error.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    if (!bookingData || !userToken || !userProfile) {
      toast.error('Booking data, user token, or profile not available');
      return;
    }

    // Final check before creating booking
    if (!userProfile.is_profile_completed || !userProfile.is_phone_verified) {
      toast.error('Please complete your profile and verify your phone number before booking.');
      setShowProfileForm(true); // Show profile form again if somehow missed
      return;
    }

    setLoading(true);
    try {
      const orderRequest: CreateOrderRequest = {
        cab_category_id: bookingData.cab_category_id,
        partner_id: partnerId || undefined,
        pickup_location: bookingData.pickup,
        dropoff_location: bookingData.destination,
        pickup_date: bookingData.pickupDate,
        drop_date: bookingData.dropDate,
        path: bookingData.path,
        distance: bookingData.distance_km,
        amount: bookingData.price + addOnsTotal, // Send total booking price including add-ons to backend
        add_ons: selectedAddOns.map((addon: any) => ({
          id: addon.id,
          name: addon.name,
          price: addon.price,
          price_type: addon.price_type
        })),
      };

      const orderResponse = await createPaymentOrder(orderRequest, userToken);

      console.log('Order Response:', orderResponse);

      if (orderResponse.success) {
        initializeRazorpay(orderResponse.data);
      } else {
        toast.error(orderResponse.message || 'Failed to create payment order');
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const initializeRazorpay = (orderData: any) => {
    if (!userDetails || !userToken) {
      toast.error('User details or token not available for payment. Please log in again.');
      return;
    }

    console.log('order id ', orderData.order_id);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use VITE_ for Vite projects
      amount: Math.round(pricing.totalUpfrontPayment * 100), // Use the displayed Upfront Payment (in paise)
      currency: 'INR',
      name: 'Travel.io',
      description: `Booking for ${bookingData.cab_category_name}`,
      order_id: orderData.order_id,
      handler: async function (response: any) {
        const paymentVerificationRequest: VerifyPaymentRequest = {
          payment_id: orderData.payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        };
        const verificationResponse = await verifyPayment(paymentVerificationRequest, userToken);

        if (verificationResponse.success) {
          toast.success('Booking confirmed! Booking ID: ' + verificationResponse.data.booking.id);
          navigate('/dashboard', {
            state: {
              message: 'Your booking has been created successfully. You will receive driver details shortly.',
              booking_otp: verificationResponse.data.booking.booking_otp,
            },
          });
        } else {
          toast.error(verificationResponse.message || 'Payment verification failed. Please try again.');
        }
      },
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.phone,
      },
      theme: {
        color: '#3399cc',
      },
      modal: {
        ondismiss: function () {
          toast.error('Payment cancelled by user');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (!bookingData || profileLoading || !userToken || !userDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details and profile...</p>
        </div>
      </div>
    );
  }

  if (showProfileForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Complete Your Profile</h2>
          <p className="text-gray-600 text-center mb-6">
            Please provide your phone number, gender, age, and address to proceed with booking.
          </p>
          <form onSubmit={handleProfileFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                placeholder="e.g., 9876543210"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500"
                required
              />
              {!userProfile?.is_phone_verified && formData.phone && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="mt-2 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP for Verification'}
                </button>
              )}
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleFormChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500"
                required
              >
                <option value="Select Gender">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleFormChange}
                placeholder="Your age"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="current_address" className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
              <textarea
                id="current_address"
                name="current_address"
                value={formData.current_address}
                onChange={handleFormChange}
                placeholder="Your current address"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={loading || (formData.gender === 'Select Gender' || !formData.age || !formData.current_address || !formData.phone)}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Saving Profile...' : 'Save Profile and Continue'}
            </button>
          </form>

          {isOtpModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 w-full max-w-sm">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Verify Phone OTP</h3>
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="XXXXXX"
                      maxLength={6}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 text-center tracking-widest"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsOtpModalOpen(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold">Confirm Your Booking</h1>
            </div>
            <button
              onClick={() => navigate('/prices', { state: bookingData })}
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
          {/* Page title */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800">Confirm Your Booking</h1>
            <p className="text-gray-600 mt-2">Review your trip details and confirm your booking</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Summary - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trip Details Card */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-blue-700 to-blue-600 text-white">
                  <h2 className="text-xl font-bold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Trip Summary
                  </h2>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium text-gray-700">Trip Type</span>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {bookingData.tripType}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17.25V21.75A2.25 2.25 0 0011.25 24h1.5A2.25 2.25 0 0015 21.75V17.25m-3 0V14.25m0 3l-2.25-2.25m2.25 2.25l2.25-2.25m-2.25-10.5H12a2.25 2.25 0 00-2.25 2.25v1.5A2.25 2.25 0 0012 9h.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-gray-700">Cab Category</span>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {bookingData.cab_category_name}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span className="font-medium text-gray-700">Distance</span>
                      </div>
                      <span className="font-semibold text-gray-800">{bookingData.distance}</span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-gray-700">Duration</span>
                      </div>
                      <span className="font-semibold text-gray-800">{bookingData.duration}</span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium text-gray-700">Pickup Date & Time</span>
                      </div>
                      <span className="font-semibold text-gray-800">
                        {new Date(bookingData.pickupDate).toLocaleString()}
                      </span>
                    </div>


                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium text-gray-700">Return Date & Time</span>
                      </div>
                      <span className="font-semibold text-gray-800">
                        {new Date(bookingData.dropDate).toLocaleString()}
                      </span>
                    </div>

                  </div>
                </div>
              </div>

              {/* Route Details Card */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-blue-700 to-blue-600 text-white">
                  <h2 className="text-xl font-bold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Route Details
                  </h2>
                </div>

                <div className="p-6">
                  <div className="space-y-6">
                    <div className="relative pl-8 pb-6">
                      <div className="absolute top-0 left-3 -ml-px h-full w-0.5 bg-blue-200"></div>
                      <div className="flex items-center mb-2">
                        <div className="absolute -left-1 mt-0.5 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                        </div>
                        <span className="ml-10 font-medium text-gray-800">Starting Point</span>
                      </div>
                      <p className="ml-10 text-gray-600 break-words">{bookingData.pickup}</p>
                    </div>

                    {bookingData.stops?.map((stop, index) => (
                      <div key={index} className="relative pl-8 pb-6">
                        <div className="absolute top-0 left-3 -ml-px h-full w-0.5 bg-blue-200"></div>
                        <div className="flex items-center mb-2">
                          <div className="absolute -left-1 mt-0.5 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                          </div>
                          <span className="ml-10 font-medium text-gray-800">Stop {index + 1}</span>
                        </div>
                        <p className="ml-10 text-gray-600 break-words">{stop}</p>
                      </div>
                    ))}

                    <div className="relative pl-8">
                      <div className="absolute top-0 left-3 -ml-px h-1/2 w-0.5 bg-blue-200"></div>
                      <div className="flex items-center mb-2">
                        <div className="absolute -left-1 mt-0.5 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                        </div>
                        <span className="ml-10 font-medium text-gray-800">Destination</span>
                      </div>
                      <p className="ml-10 text-gray-600 break-words">{bookingData.destination}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add-Ons Selector Card */}
              <AddOnsSelector
                baseFare={bookingData.price}
                onAddOnsChange={(addons, total) => {
                  setSelectedAddOns(addons);
                  setAddOnsTotal(total);
                }}
              />
            </div>

            {/* Booking Actions - 1/3 width */}
            <div className="space-y-6">
              {/* Price Summary Card */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-blue-700 to-blue-600 text-white">
                  <h2 className="text-xl font-bold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Price Summary
                  </h2>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Base Trip Price</span>
                      <span className="font-semibold">₹{bookingData.price.toLocaleString()}</span>
                    </div>
                    {addOnsTotal > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Add-Ons Total</span>
                        <span className="font-semibold text-blue-600">+₹{addOnsTotal.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Platform Charges (10%)</span>
                      <span className="font-semibold">₹{pricing.platformCharges.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">GST (5% on Platform)</span>
                      <span className="font-semibold">₹{pricing.gstAmount.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-4 mt-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-lg font-bold text-gray-800">Total Upfront Payment</span>
                          <p className="text-xs text-gray-500">To pay now to confirm booking</p>
                        </div>
                        <span className="text-xl font-bold text-blue-600">₹{pricing.totalUpfrontPayment.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-gray-700">Remaining Amount</span>
                          <p className="text-xs text-gray-500">To pay to driver later</p>
                        </div>
                        <span className="font-semibold text-gray-800">₹{pricing.remainingAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Partner ID Input */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-blue-700 to-blue-600 text-white">
                  <h2 className="text-xl font-bold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Partner Referral (Optional)
                  </h2>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <label htmlFor="partnerId" className="block text-sm font-medium text-gray-700 mb-2">
                      Partner ID
                    </label>
                    <input
                      type="text"
                      id="partnerId"
                      value={partnerId}
                      onChange={(e) => setPartnerId(e.target.value)}
                      placeholder="Enter partner ID if referred"
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-blue-200 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave blank if you weren't referred by a partner
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/prices', { state: bookingData })}
                  className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg flex items-center justify-center transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  Modify Trip
                </button>

                <button
                  onClick={handleCreateBooking}
                  disabled={loading || bookingData.isRouteLoading} // Disable if loading or route is still loading
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg flex items-center justify-center transition-all shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <Footer />
    </div>
  );
}
