import React from 'react';
import Table from '../components/Table';
import useData from '../hooks/useData';

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  totalEarnings: number;
  totalVehicles: number;
  totalDrivers: number;
  rating: number;
  joinedDate: string;
}

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  format?: (value: any, row?: any) => React.ReactNode;
}

const Vendors: React.FC = () => {
  const { data, isLoading } = useData<Vendor[]>('/api/vendors');

  const columns: Column[] = [
    { id: 'name', label: 'Name', minWidth: 170 },
    { id: 'email', label: 'Email', minWidth: 170 },
    { id: 'phone', label: 'Phone', minWidth: 130 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: string) => {
        const statusStyles = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800',
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
      id: 'totalEarnings',
      label: 'Total Earnings',
      minWidth: 130,
      format: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      id: 'totalVehicles',
      label: 'Vehicles',
      minWidth: 100,
      format: (value: number) => (
        <span className="inline-flex items-center">
          <svg
            className="w-4 h-4 mr-1 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {value}
        </span>
      ),
    },
    {
      id: 'totalDrivers',
      label: 'Drivers',
      minWidth: 100,
      format: (value: number) => (
        <span className="inline-flex items-center">
          <svg
            className="w-4 h-4 mr-1 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {value}
        </span>
      ),
    },
    {
      id: 'rating',
      label: 'Rating',
      minWidth: 100,
      format: (value: number) => (
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <svg
              key={index}
              className={`w-4 h-4 ${
                index < value
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          ))}
          <span className="ml-1 text-sm text-gray-600">{value.toFixed(1)}</span>
        </div>
      ),
    },
    {
      id: 'joinedDate',
      label: 'Joined Date',
      minWidth: 170,
      format: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 100,
      format: (_: any, row: Vendor) => (
        <div className="flex space-x-2">
          <button 
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
            onClick={() => handleViewVendor(row.id)}
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
          {row.status !== 'active' && (
            <button 
              className="p-1 text-green-600 hover:text-green-800 transition-colors duration-200"
              onClick={() => handleUpdateStatus(row.id, 'active')}
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
          )}
          {row.status === 'active' && (
            <button 
              className="p-1 text-red-600 hover:text-red-800 transition-colors duration-200"
              onClick={() => handleUpdateStatus(row.id, 'inactive')}
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
          )}
        </div>
      ),
    },
  ];

  const handleViewVendor = (id: string) => {
    // View vendor details
    console.log('View vendor:', id);
  };

  const handleUpdateStatus = (id: string, status: string) => {
    // Update vendor status
    console.log('Update vendor status:', id, status);
  };

  const handleExport = () => {
    // Export logic here
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and monitor vendor accounts
            </p>
          </div>
          <button
            onClick={() => {}}
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-white/80">Total Vendors</p>
              <p className="text-2xl font-bold mt-1">
                {data?.length || 0}
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
              <p className="text-sm font-medium text-gray-500">Active Vendors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data?.filter(vendor => vendor.status === 'active').length || 0}
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{data?.reduce((sum, vendor) => sum + vendor.totalEarnings, 0).toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-xl p-3">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data?.reduce((sum, vendor) => sum + vendor.totalVehicles, 0) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm">
        <Table
          columns={columns}
          data={data || []}
          isLoading={isLoading}
          title="Vendor List"
          onExport={handleExport}
        />
      </div>
    </div>
  );
};

export default Vendors; 