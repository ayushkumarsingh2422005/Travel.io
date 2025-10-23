import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorBookings, getVendorDrivers } from '../utils/bookingService';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(error);

        // Fetch bookings
        const bookingsResponse = await getVendorBookings({ limit: 1000 }); // Fetch all to process locally
        if (bookingsResponse.success) {
          const allBookings = bookingsResponse.data.bookings;

          const total = allBookings.length;
          const completed = allBookings.filter(b => b.status === 'completed').length;
          const cancelled = allBookings.filter(b => b.status === 'cancelled').length;
          const ongoing = allBookings.filter(b => ['waiting', 'approved', 'preongoing', 'ongoing'].includes(b.status)).length;

          setBookingSummary({ total, completed, cancelled, ongoing });

          const mappedRecentBookings: RecentBooking[] = allBookings
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by most recent
            .slice(0, 3) // Take top 3
            .map(b => ({
              id: b.id,
              customerName: b.customer_name,
              pickup: b.pickup_location,
              dropoff: b.dropoff_location,
              date: new Date(b.pickup_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
              amount: b.price,
              status: b.status === 'completed' ? 'Completed' : b.status === 'cancelled' ? 'Cancelled' : 'In Progress',
            }));
          setRecentBookings(mappedRecentBookings);
        } else {
          setError(bookingsResponse.message || 'Failed to fetch bookings.');
        }

        // Fetch drivers
        const driversResponse = await getVendorDrivers();
        if (driversResponse.data && driversResponse.data.drivers) {
          const allDrivers = driversResponse.data.drivers;
          const totalDrivers = allDrivers.length;
          // Assuming 'active' and 'onTrip' status would come from a more detailed driver API or local state
          // For now, we'll just use total.
          setDriverSummary({
            total: totalDrivers,
            active: allDrivers.length, // Placeholder: assuming all fetched drivers are active
            onTrip: 0 // Placeholder: no direct 'onTrip' status from current API
          });
        } else {
          setError('Failed to fetch drivers.');
        }

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-8 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>

          {/* Recent Bookings Skeleton */}
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
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-gray-800">Vendor Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Bookings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Total Bookings</p>
          <p className="text-3xl font-bold text-gray-900">{bookingSummary.total}</p>
          <div className="mt-2 flex space-x-4 text-sm">
            <span className="text-green-600">{bookingSummary.completed} completed</span>
            <span className="text-red-600">{bookingSummary.cancelled} cancelled</span>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Active Bookings</p>
          <p className="text-3xl font-bold text-green-600">{bookingSummary.ongoing}</p>
          <p className="mt-2 text-sm text-gray-600">Currently in progress</p>
        </div>

        {/* Driver Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Drivers</p>
          <p className="text-3xl font-bold text-gray-900">{driverSummary.total}</p>
          <div className="mt-2 flex space-x-4 text-sm">
            <span className="text-green-600">{driverSummary.active} active</span>
            <span className="text-blue-600">{driverSummary.onTrip} on trip</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-600 mb-4">Quick Actions</p>
          <div className="space-y-2">
            <Link
              to="/driver"
              className="block text-sm text-green-600 hover:text-green-700 font-medium"
            >
              + Add New Driver
            </Link>
            <Link
              to="/car"
              className="block text-sm text-green-600 hover:text-green-700 font-medium"
            >
              + Add New Vehicle
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Recent Bookings</h2>
          <Link
            to="/booking"
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {recentBookings.map(booking => (
            <div
              key={booking.id}
              className="p-4 rounded-lg bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div className="mb-2 md:mb-0">
                <p className="font-medium text-gray-800">{booking.customerName}</p>
                <p className="text-sm text-gray-600">
                  {booking.pickup} → {booking.dropoff}
                </p>
                <p className="text-xs text-gray-500">{booking.date}</p>
              </div>
              <div className="flex items-center justify-between md:space-x-6">
                <p className="font-semibold text-gray-800">₹{booking.amount.toLocaleString()}</p>
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    booking.status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'Cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
