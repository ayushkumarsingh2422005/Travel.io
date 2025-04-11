import React, { useState, useEffect } from 'react';

interface Trip {
  bookingId: string;
  tripType: string;
  carType?: string;
  tripItinerary: string;
  amount: number;
  penalty?: number;
  customerReview?: string;
  paymentStatus: string;
}

export const TripsComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch trips data based on active tab
    const fetchTrips = async () => {
      setLoading(true);
      try {
        // Replace with your actual API call
        const response = await fetch(`/api/trips/${activeTab}`);
        const data = await response.json();
        setTrips(data);
      } catch (error) {
        console.error('Error fetching trips:', error);
        setTrips([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [activeTab]);

  // Mock data for demonstration
  const mockUpcomingTrips: Trip[] = [
    {
      bookingId: 'BK-1001',
      tripType: 'Airport',
      carType: 'Sedan',
      tripItinerary: 'City Center → Airport',
      amount: 350,
      paymentStatus: 'Pending'
    },
    {
      bookingId: 'BK-1002',
      tripType: 'Outstation',
      carType: 'SUV',
      tripItinerary: 'City → Hill Station',
      amount: 1200,
      paymentStatus: 'Confirmed'
    }
  ];

  const mockCompletedTrips: Trip[] = [
    {
      bookingId: 'BK-0998',
      tripType: 'Local',
      carType: 'Hatchback',
      tripItinerary: 'Mall → Residence',
      amount: 250,
      customerReview: '4.8',
      paymentStatus: 'Paid'
    },
    {
      bookingId: 'BK-0999',
      tripType: 'Airport',
      carType: 'Sedan',
      tripItinerary: 'Airport → Hotel',
      amount: 450,
      penalty: 50,
      customerReview: '4.5',
      paymentStatus: 'Paid'
    }
  ];

  // Use mock data instead of API for demo
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setTrips(activeTab === 'upcoming' ? mockUpcomingTrips : mockCompletedTrips);
      setLoading(false);
    }, 500);
  }, [activeTab]);

  return (
    <div className="flex flex-col w-full">
      {/* Tabs */}
      <div className="flex mb-4">
        <button
          className={`flex-1 py-4 rounded-full text-lg font-medium 
            ${activeTab === 'upcoming' ? 'bg-green-500 text-white' : 'bg-blue-700 text-white'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming trips
        </button>
        <div className="w-4"></div>
        <button
          className={`flex-1 py-4 rounded-full text-lg font-medium 
            ${activeTab === 'completed' ? 'bg-blue-700 text-white' : 'bg-green-500 text-white'}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed trips
        </button>
      </div>

      {/* Trips Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 p-3 text-center font-medium">
                Booking ID
              </th>
              <th className="border border-gray-300 p-3 text-center font-medium">
                Trip type
              </th>
              {activeTab === 'upcoming' && (
                <th className="border border-gray-300 p-3 text-center font-medium">
                  Car type
                </th>
              )}
              <th className="border border-gray-300 p-3 text-center font-medium">
                Trip Itinerary
              </th>
              <th className="border border-gray-300 p-3 text-center font-medium">
                {activeTab === 'upcoming' ? 'Amount' : 'Amount Earned'}
              </th>
              {activeTab === 'completed' && (
                <th className="border border-gray-300 p-3 text-center font-medium">
                  Customer review
                </th>
              )}
              <th className="border border-gray-300 p-3 text-center font-medium">
                Payment status
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center p-4">
                  Loading trips...
                </td>
              </tr>
            ) : trips.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-4">
                  No {activeTab} trips found
                </td>
              </tr>
            ) : (
              trips.map((trip) => (
                <tr key={trip.bookingId}>
                  <td className="border border-gray-300 p-3 text-center">
                    {trip.bookingId}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    {trip.tripType}
                  </td>
                  {activeTab === 'upcoming' && (
                    <td className="border border-gray-300 p-3 text-center">
                      {trip.carType}
                    </td>
                  )}
                  <td className="border border-gray-300 p-3 text-center">
                    {trip.tripItinerary}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    ₹{trip.amount}
                  </td>
                  {activeTab === 'completed' && (
                    <td className="border border-gray-300 p-3 text-center">
                      {trip.customerReview ? `${trip.customerReview}★` : 'N/A'}
                    </td>
                  )}
                  <td className="border border-gray-300 p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        trip.paymentStatus === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : trip.paymentStatus === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {trip.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TripsComponent;