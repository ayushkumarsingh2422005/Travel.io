import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface ActiveBooking {
  id: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  cabType: string;
  amount: number;
  status: 'In Progress';
  driverName: string;
  driverPhone: string;
  estimatedArrival: string;
}

interface RecentBooking {
  id: string;
  pickup: string;
  dropoff: string;
  date: string;
  status: 'Completed' | 'Cancelled';
  amount: number;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);

  useEffect(() => {
    setLoading(true);
    // Simulate API request
    setTimeout(() => {
      // Simulate active booking (could be null if no active booking)
      setActiveBooking({
        id: 'BOOK126',
        pickup: 'Sector 62, Noida',
        dropoff: 'IGI Airport, Delhi',
        date: '15 May 2024',
        time: '11:30 AM',
        cabType: 'SUV',
        amount: 2500,
        status: 'In Progress',
        driverName: 'Rajesh Kumar',
        driverPhone: '9876543210',
        estimatedArrival: '10 mins'
      });

      // Recent bookings
      setRecentBookings([
        {
          id: 'BOOK125',
          pickup: 'Greater Noida',
          dropoff: 'Gurgaon',
          date: '12 May 2024',
          status: 'Completed',
          amount: 3500
        },
        {
          id: 'BOOK124',
          pickup: 'Connaught Place',
          dropoff: 'Noida',
          date: '10 May 2024',
          status: 'Cancelled',
          amount: 1200
        }
      ]);
      setLoading(false);
    }, 1500);
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
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-gray-800">Dashboard</h1>

      {/* Active Booking Section */}
      <div className="mb-8">
        {activeBooking ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Active Booking</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Pickup</p>
                  <p className="text-gray-800">{activeBooking.pickup}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Drop</p>
                  <p className="text-gray-800">{activeBooking.dropoff}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                  <p className="text-gray-800">{activeBooking.date} at {activeBooking.time}</p>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Driver Details</p>
                  <p className="text-gray-800">{activeBooking.driverName}</p>
                  <p className="text-gray-600">{activeBooking.driverPhone}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Estimated Arrival</p>
                  <p className="text-green-600 font-semibold">{activeBooking.estimatedArrival}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Amount</p>
                  <p className="text-gray-800 font-semibold">₹{activeBooking.amount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">No Active Bookings</h2>
            <p className="text-gray-600 mb-4">Looking to book a ride?</p>
            <Link 
              to="/"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
            className="text-green-600 hover:text-green-700 font-medium"
          >
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {recentBookings.map(booking => (
            <div 
              key={booking.id}
              className="p-4 rounded-lg bg-gray-50 flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-gray-800">
                  {booking.pickup} → {booking.dropoff}
                </p>
                <p className="text-sm text-gray-600">{booking.date}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">₹{booking.amount.toLocaleString()}</p>
                <span className={`text-sm ${
                  booking.status === 'Completed' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
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