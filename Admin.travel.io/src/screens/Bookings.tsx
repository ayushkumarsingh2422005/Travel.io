import React from 'react';
import Table from '../components/Table';
import useData from '../hooks/useData';

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

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  format?: (value: any, row?: any) => React.ReactNode;
}

const Bookings: React.FC = () => {
  const { data, isLoading } = useData<Booking[]>('/api/bookings');

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
      format: (value: number) => `$${value.toFixed(2)}`,
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
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 100,
      format: (_: any, row: Booking) => (
        <div className="flex space-x-2">
          <button 
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
            onClick={() => handleViewBooking(row.id)}
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
          {row.status === 'pending' && (
            <>
              <button 
                className="p-1 text-green-600 hover:text-green-800 transition-colors duration-200"
                onClick={() => handleUpdateStatus(row.id, 'confirmed')}
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
              <button 
                className="p-1 text-red-600 hover:text-red-800 transition-colors duration-200"
                onClick={() => handleUpdateStatus(row.id, 'cancelled')}
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const handleViewBooking = (id: string) => {
    // View booking details
    console.log('View booking:', id);
  };

  const handleUpdateStatus = (id: string, status: string) => {
    // Update booking status
    console.log('Update booking status:', id, status);
  };

  const handleExport = () => {
    // Export logic here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and track all ride bookings
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-blue-600"
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
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
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
              <p className="text-2xl font-semibold text-gray-900">
                {data?.filter(booking => booking.status === 'pending').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
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
              <p className="text-2xl font-semibold text-gray-900">
                {data?.filter(booking => booking.status === 'completed').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
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
              <p className="text-2xl font-semibold text-gray-900">
                {data?.filter(booking => booking.status === 'cancelled').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        title="Booking List"
        onExport={handleExport}
      />
    </div>
  );
};

export default Bookings; 