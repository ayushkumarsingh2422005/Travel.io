import React, { useEffect, useState, useCallback } from 'react';
import Table from '../components/Table';
import { useSearch } from '../context/SearchContext';
import { getAdminStats } from '../api/adminService'; // Import getAdminStats

interface Booking {
  id: string;
  userId: string;
  userName: string;
  pickupLocation: string;
  dropLocation: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  date: string;
  driverName: string;
  vehicleType: string;
}

// Dummy data for the table, as backend changes are not allowed for a generic "all bookings" endpoint
const dummyBookings: Booking[] = [
  {
    id: 'b1',
    userId: 'u1',
    userName: 'Satyam Tiwari',
    pickupLocation: 'NIT Jamshedpur',
    dropLocation: 'Tatanagar Junction',
    status: 'confirmed',
    amount: 250,
    date: '2025-07-05T10:00:00Z',
    driverName: 'Raj Verma',
    vehicleType: 'Sedan',
  },
  {
    id: 'b2',
    userId: 'u2',
    userName: 'Aman Gupta',
    pickupLocation: 'Adityapur Colony',
    dropLocation: 'Sonari Airport',
    status: 'completed',
    amount: 450,
    date: '2025-07-01T08:30:00Z',
    driverName: 'Sunil Kumar',
    vehicleType: 'SUV',
  },
  {
    id: 'b3',
    userId: 'u3',
    userName: 'Priya Sharma',
    pickupLocation: 'Bistupur',
    dropLocation: 'Kadma',
    status: 'cancelled',
    amount: 0,
    date: '2025-06-28T15:45:00Z',
    driverName: 'Deepak Singh',
    vehicleType: 'Auto',
  },
  {
    id: 'b4',
    userId: 'u4',
    userName: 'Ravi Patel',
    pickupLocation: 'Telco',
    dropLocation: 'Sakchi',
    status: 'pending',
    amount: 180,
    date: '2025-07-10T19:20:00Z',
    driverName: 'Manoj Yadav',
    vehicleType: 'Mini',
  },
  {
    id: 'b5',
    userId: 'u5',
    userName: 'Kavita Joshi',
    pickupLocation: 'Jugsalai',
    dropLocation: 'Mango',
    status: 'completed',
    amount: 300,
    date: '2025-07-03T09:10:00Z',
    driverName: 'Anil Das',
    vehicleType: 'Sedan',
  },
];

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  format?: (value: any, row?: any) => React.ReactNode;
}

const Bookings: React.FC = () => {
  const { query } = useSearch();
  const [bookingsData, setBookingsData] = useState<Booking[]>(dummyBookings);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total_bookings: 0,
    completed_bookings: 0,
    cancelled_bookings: 0,
  });

  const token = localStorage.getItem('marcocabs_admin_token');

  const fetchBookingStats = useCallback(async () => {
    if (!token) {
      setError('No authentication token found');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const adminStats = await getAdminStats(token);
      setStats({
        total_bookings: adminStats.overall.total_bookings,
        completed_bookings: adminStats.overall.completed_bookings,
        cancelled_bookings: adminStats.overall.cancelled_bookings,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch booking statistics');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBookingStats();
  }, [fetchBookingStats]);

  useEffect(() => {
    if (!bookingsData) return;
    const lower = query.toLowerCase();
    setFilteredBookings(
      bookingsData.filter(
        (b) =>
          b.driverName.toLowerCase().includes(lower) ||
          b.dropLocation.toLowerCase().includes(lower) ||
          b.pickupLocation.toLowerCase().includes(lower) ||
          b.vehicleType.toLowerCase().includes(lower) ||
          b.status.toLowerCase().includes(lower) ||
          b.amount.toString().includes(lower) ||
          b.date.toLowerCase().includes(lower) ||
          b.userName.toLowerCase().includes(lower)
      )
    );
  }, [query, bookingsData]);

  const columns: Column[] = [
    { id: 'id', label: 'Booking ID', minWidth: 130 },
    { id: 'userName', label: 'User', minWidth: 170 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: string) => {
        const statusStyles = {
          pending: 'bg-yellow-100 text-yellow-800',
          confirmed: 'bg-blue-100 text-blue-800',
          completed: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800',
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              statusStyles[value as keyof typeof statusStyles]
            }`}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      },
    },
    {
      id: 'amount',
      label: 'Amount',
      minWidth: 100,
      format: (value: number) => `₹${value.toFixed(2)}`,
    },
    { id: 'pickupLocation', label: 'Pickup', minWidth: 200 },
    { id: 'dropLocation', label: 'Drop-off', minWidth: 200 },
    { id: 'driverName', label: 'Driver', minWidth: 170 },
    { id: 'vehicleType', label: 'Vehicle', minWidth: 120 },
    {
      id: 'date',
      label: 'Date',
      minWidth: 170,
      format: (value: string) => new Date(value).toLocaleString(),
    },
    // Removed actions column as there's no backend API for generic booking actions
  ];

  const handleExport = () => {
    // Export logic here
    console.log('Exporting bookings...');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and track all ride bookings
            </p>
          </div>
          <button
            onClick={handleExport}
            className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 active:bg-red-800 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>Export Bookings</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 overflow-hidden">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-sm p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-white/80">Total Bookings</p>
              <p className="text-2xl font-bold mt-1">
                {stats.total_bookings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-xl p-3">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total_bookings - stats.completed_bookings - stats.cancelled_bookings}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-xl p-3">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.completed_bookings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-xl p-3">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.cancelled_bookings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="text-red-600 p-4 bg-red-100 rounded-lg mb-4">Error: {error}</div>}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={filteredBookings || []}
          isLoading={isLoading}
          title="Booking List"
          onExport={handleExport}
        />
      </div>
    </div>
  );
};

export default Bookings;
