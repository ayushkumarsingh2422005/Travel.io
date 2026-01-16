import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getVendorBookings, getVendorDrivers } from '../utils/bookingService';
import api from '../api/axios';

interface BookingSummary {
  total: number;
  completed: number;
  cancelled: number;
  ongoing: number;
}

interface RecentBooking {
  id: string;
  customerName: string;
  pickup: string;
  dropoff: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Cancelled' | 'In Progress';
}

interface DriverSummary {
  total: number;
  active: number;
  onTrip: number;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [bookingSummary, setBookingSummary] = useState<BookingSummary>({
    total: 0,
    completed: 0,
    cancelled: 0,
    ongoing: 0
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [driverSummary, setDriverSummary] = useState<DriverSummary>({
    total: 0,
    active: 0,
    onTrip: 0
  });
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [showLowBalanceModal, setShowLowBalanceModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch Vendor Profile for Balance
        try {
          const profileRes = await api.get('/profile');
          const balance = profileRes.data.vendor.amount || 0;
          setWalletBalance(balance);
          if (balance < 500) {
            setShowLowBalanceModal(true);
          }
        } catch (err) {
          console.error('Failed to fetch profile', err);
        }

        // Fetch bookings
        const bookingsResponse = await getVendorBookings({ limit: 1000 }); // Fetch all to process locally
        if (bookingsResponse.success) {
          const allBookings = bookingsResponse.data.bookings;

          const total = allBookings.length;
          const completed = allBookings.filter((b: any) => b.status === 'completed').length;
          const cancelled = allBookings.filter((b: any) => b.status === 'cancelled').length;
          const ongoing = allBookings.filter((b: any) => ['waiting', 'approved', 'preongoing', 'ongoing'].includes(b.status)).length;

          setBookingSummary({ total, completed, cancelled, ongoing });

          const mappedRecentBookings: RecentBooking[] = allBookings
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by most recent
            .slice(0, 3) // Take top 3
            .map((b: any) => ({
              id: b.id,
              customerName: b.customer_name || 'Guest Customer',
              pickup: b.pickup_location,
              dropoff: b.dropoff_location,
              date: new Date(b.pickup_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
              amount: b.price,
              status: b.status === 'completed' ? 'Completed' : b.status === 'cancelled' ? 'Cancelled' : 'In Progress',
            }));
          setRecentBookings(mappedRecentBookings);
        } else {
          toast.error(bookingsResponse.message || 'Failed to fetch bookings.');
        }

        // Fetch drivers
        const driversResponse = await getVendorDrivers();
        if (driversResponse.data && driversResponse.data.drivers) {
          const allDrivers = driversResponse.data.drivers;
          const totalDrivers = allDrivers.length;
          setDriverSummary({
            total: totalDrivers,
            active: allDrivers.length,
            onTrip: 0
          });
        } else {
          toast.error('Failed to fetch drivers.');
        }

      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        toast.error(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRecharge = async () => {
    try {
      const amount = 500; // Fixed recharge amount for simplicity
      const orderRes = await api.post('/wallet/recharge/create', { amount });

      if (orderRes.data.success) {
        const options = {
          key: orderRes.data.key_id,
          amount: orderRes.data.amount,
          currency: orderRes.data.currency,
          name: "Travel.io",
          description: "Vendor Wallet Recharge",
          order_id: orderRes.data.order_id,
          handler: async function (response: any) {
            try {
              const verifyRes = await api.post('/wallet/recharge/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: amount
              });

              if (verifyRes.data.success) {
                toast.success('Wallet Recharged Successfully!');
                const newBalance = walletBalance + amount;
                setWalletBalance(newBalance);
                if (newBalance >= 500) {
                  setShowLowBalanceModal(false);
                }
              } else {
                toast.error('Payment verification failed');
              }
            } catch (error) {
              toast.error('Payment verification error');
            }
          },
          prefill: {
            name: "Vendor",
            email: "vendor@example.com",
            contact: "9999999999"
          },
          theme: {
            color: "#4f46e5" // Indigo-600
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error("Recharge Error", error);
      toast.error("Failed to initiate recharge");
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-8 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vendor Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of your fleet and bookings</p>
        </div>
        <div className="bg-white px-5 py-2.5 rounded-xl shadow-sm border border-gray-200 flex items-center">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-3 text-indigo-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Wallet Balance</p>
            <span className={`font-bold text-lg ${walletBalance < 500 ? 'text-red-500' : 'text-gray-900'}`}>₹{walletBalance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Low Balance Modal */}
      {showLowBalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 transform transition-all scale-100 border border-red-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-6">
                <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Low Wallet Balance</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Your wallet balance is <strong>₹{walletBalance}</strong>, which is below the minimum <strong>₹500</strong>.
                To accept new bookings, please recharge your wallet.
              </p>
              <button
                onClick={handleRecharge}
                className="w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-lg shadow-red-200 px-6 py-3.5 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none transition-all duration-200"
              >
                Recharge ₹500 Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">Total</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{bookingSummary.total}</p>
            <p className="text-sm text-gray-500 font-medium">Total Bookings</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-xs text-gray-500">
            <span className="flex items-center mr-3"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>{bookingSummary.completed} Done</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>{bookingSummary.cancelled} Cncl</span>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="animate-pulse w-2 h-2 rounded-full bg-green-500"></span>
          </div>
          <div>
            <p className="text-3xl font-bold text-indigo-600 mb-1">{bookingSummary.ongoing}</p>
            <p className="text-sm text-gray-500 font-medium">Active Bookings</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-indigo-600 font-medium">
            Currently in progress
          </div>
        </div>

        {/* Driver Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{driverSummary.total}</p>
            <p className="text-sm text-gray-500 font-medium">Total Drivers</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-xs text-gray-500">
            <span className="flex items-center mr-3"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>{driverSummary.active} Active</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 p-6 text-white flex flex-col justify-between">
          <p className="text-sm font-medium opacity-90 mb-4">Quick Actions</p>
          <div className="space-y-3">
            <Link
              to="/driver"
              className="flex items-center text-sm font-semibold bg-white/10 hover:bg-white/20 p-2.5 rounded-lg transition-colors backdrop-blur-sm"
            >
              <span className="mr-2 text-lg leading-none">+</span> Add New Driver
            </Link>
            <Link
              to="/car"
              className="flex items-center text-sm font-semibold bg-white/10 hover:bg-white/20 p-2.5 rounded-lg transition-colors backdrop-blur-sm"
            >
              <span className="mr-2 text-lg leading-none">+</span> Add New Vehicle
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
          <Link
            to="/booking"
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center group"
          >
            View All
            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
        <div className="space-y-3">
          {recentBookings.map(booking => (
            <div
              key={booking.id}
              className="p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-200 flex flex-col md:flex-row md:items-center md:justify-between group"
            >
              <div className="mb-4 md:mb-0 flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center mr-4 text-gray-500 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                  <div className="flex items-center flex-wrap gap-2">
                    <p className="font-bold text-gray-800">{booking.customerName}</p>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 font-mono tracking-wide">#{booking.id.slice(0, 6)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="font-medium text-gray-700 truncate max-w-[150px] sm:max-w-xs">{booking.pickup}</span>
                    <svg className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    <span className="font-medium text-gray-700 truncate max-w-[150px] sm:max-w-xs">{booking.dropoff}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end md:gap-8 pl-14 md:pl-0">
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-0.5 font-medium uppercase tracking-wider">Price</p>
                  <p className="font-bold text-gray-900">₹{booking.amount.toLocaleString()}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-400 mb-0.5 font-medium uppercase tracking-wider">Date</p>
                  <p className="font-medium text-gray-700 text-sm whitespace-nowrap">{booking.date}</p>
                </div>
                <div className="min-w-[100px] flex justify-end">
                  <span
                    className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${booking.status === 'Completed'
                      ? 'bg-green-100 text-green-700'
                      : booking.status === 'Cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-indigo-100 text-indigo-700'
                      }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
