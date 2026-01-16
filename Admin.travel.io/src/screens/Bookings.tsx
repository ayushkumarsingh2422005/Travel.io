import React, { useEffect, useState, useCallback } from 'react';
import Table from '../components/Table';
import { useSearch } from '../context/SearchContext';
import { toast } from 'react-toastify';
import { getAdminStats, getAllBookings } from '../api/adminService'; // Import getAllBookings

interface Booking {
  id: string;
  userName: string;
  pickupLocation: string;
  dropLocation: string;
  status: string;
  amount: number;
  date: string;
  driverName: string;
  vehicleType: string;
}

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  format?: (value: any, row?: any) => React.ReactNode;
}

const Bookings: React.FC = () => {
  const { query } = useSearch();
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total_bookings: 0,
    completed_bookings: 0,
    cancelled_bookings: 0,
  });

  const token = localStorage.getItem('marcocabs_admin_token');

  const fetchBookingStats = useCallback(async () => {
    if (!token) return;
    try {
      const adminStats = await getAdminStats(token);
      setStats({
        total_bookings: adminStats.overall.total_bookings,
        completed_bookings: adminStats.overall.completed_bookings,
        cancelled_bookings: adminStats.overall.cancelled_bookings,
      });
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  }, [token]);

  const fetchBookings = useCallback(async () => {
    if (!token) {
      toast.error('No authentication token found');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await getAllBookings(token, 1, 100, undefined, query); // Pass query to backend

      const mappedBookings = response.bookings.map((b: any) => ({
        id: b.id,
        userName: b.customer_name || 'N/A',
        pickupLocation: b.pickup_location,
        dropLocation: b.dropoff_location,
        status: b.status,
        amount: typeof b.price === 'string' ? parseFloat(b.price) : b.price,
        date: b.pickup_date,
        driverName: b.driver_name || 'Unassigned',
        vehicleType: b.vehicle_model || b.cab_category || 'N/A',
      }));

      setFilteredBookings(mappedBookings); 
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch bookings');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token, query]);

  useEffect(() => {
    fetchBookingStats();
    fetchBookings();
  }, [fetchBookingStats, fetchBookings]);

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
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[value as keyof typeof statusStyles]
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
    </div >
  );
};

export default Bookings;
