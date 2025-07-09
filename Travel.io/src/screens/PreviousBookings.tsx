import React, { useEffect, useState } from 'react';

interface Booking {
  id: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  cabType: string;
  amount: number;
  status: 'Completed' | 'Cancelled' | 'In Progress';
  driverName?: string;
  driverPhone?: string;
}

const PreviousBookings = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setLoading(true);
    // Simulate API request
    setTimeout(() => {
      setBookings([
        {
          id: 'BOOK123',
          pickup: 'Sector 62, Noida',
          dropoff: 'IGI Airport, Delhi',
          date: '12 May 2024',
          time: '10:30 AM',
          cabType: 'SUV',
          amount: 2500,
          status: 'Completed',
          driverName: 'Rajesh Kumar',
          driverPhone: '9876543210'
        },
        {
          id: 'BOOK124',
          pickup: 'Connaught Place, Delhi',
          dropoff: 'Sector 18, Noida',
          date: '10 May 2024',
          time: '2:15 PM',
          cabType: 'Sedan',
          amount: 1200,
          status: 'Cancelled'
        },
        {
          id: 'BOOK125',
          pickup: 'Greater Noida',
          dropoff: 'Gurgaon',
          date: '8 May 2024',
          time: '9:00 AM',
          cabType: 'Premium SUV',
          amount: 3500,
          status: 'Completed',
          driverName: 'Amit Singh',
          driverPhone: '9876543211'
        }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Booking #{booking.id}</h3>
                <p className="text-gray-500">{booking.date} at {booking.time}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pickup Location</p>
                <p className="text-gray-800">{booking.pickup}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Drop Location</p>
                <p className="text-gray-800">{booking.dropoff}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cab Type</p>
                <p className="text-gray-800">{booking.cabType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Amount</p>
                <p className="text-gray-800 font-semibold">₹{booking.amount.toLocaleString()}</p>
              </div>
              {booking.driverName && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Driver Details</p>
                  <p className="text-gray-800">{booking.driverName} - {booking.driverPhone}</p>
                </div>
              )}
            </div>

            {booking.status === 'Completed' && (
              <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                Download Invoice
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviousBookings; 