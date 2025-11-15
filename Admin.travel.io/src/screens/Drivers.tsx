import React, { useEffect, useState, useCallback } from 'react';
import Table from '../components/Table';
import { useSearch } from '../context/SearchContext';
import { getAllDrivers, toggleDriverStatus } from '../api/adminService'; // Import API services

interface Driver {
  id: string;
  vendor_id: string;
  name: string;
  phone: string;
  address: string;
  dl_number: string; // Driver's License Number
  dl_data: string; // JSON string of DL data
  is_active: number; // 0 or 1
  vehicle_id: string | null;
  vendor_name: string;
  vendor_email: string;
  vendor_phone: string;
  vehicle_model: string | null;
  vehicle_registration: string | null;
  total_bookings: number;
  created_at: string;
}

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  format?: (value: any, row?: any) => React.ReactNode;
}

const Drivers: React.FC = () => {
  const { query } = useSearch();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 1,
  });

  const token = localStorage.getItem('marcocabs_admin_token');

  const fetchDrivers = useCallback(async (page: number = 1, limit: number = 10, status?: string, vendor_id?: string, search?: string) => {
    if (!token) {
      setError('No authentication token found');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllDrivers(token, page, limit, status, vendor_id, search);
      setDrivers(response.drivers);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch drivers');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDrivers(pagination.current_page, pagination.per_page, undefined, undefined, query);
  }, [fetchDrivers, pagination.current_page, pagination.per_page, query]);

  useEffect(() => {
    if (!drivers) return;
    const lower = query.toLowerCase();
    setFilteredDrivers(
      drivers.filter(
        (d) =>
          d.name.toLowerCase().includes(lower) ||
          d.phone.toLowerCase().includes(lower) ||
          d.vendor_name.toLowerCase().includes(lower) ||
          d.dl_number.toLowerCase().includes(lower) ||
          (d.vehicle_model?.toLowerCase().includes(lower)) ||
          (d.is_active ? 'active' : 'inactive').includes(lower)
      )
    );
  }, [query, drivers]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, current_page: newPage }));
  };

  const handleToggleStatus = async (id: string, currentStatus: number) => {
    if (!token) {
      setError('No authentication token found');
      return;
    }
    setIsLoading(true);
    try {
      const newStatus = currentStatus === 1 ? false : true;
      await toggleDriverStatus(token, id, newStatus);
      alert(`Driver ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchDrivers(pagination.current_page, pagination.per_page, undefined, undefined, query); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to update driver status');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDriver = (id: string) => {
    // Navigate to driver details page or open a modal
    console.log('View driver:', id);
  };

  const handleExport = () => {
    // optional export logic
    console.log('Exporting drivers...');
  };

  const columns: Column[] = [
    { id: 'name', label: 'Name', minWidth: 170 },
    { id: 'phone', label: 'Phone', minWidth: 120 },
    { id: 'vendor_name', label: 'Vendor', minWidth: 170 },
    {
      id: 'vehicle_model',
      label: 'Assigned Vehicle',
      minWidth: 200,
      format: (value: string | null, row: Driver) =>
        value ? `${value} (${row.vehicle_registration})` : 'N/A',
    },
    { id: 'dl_number', label: 'License No', minWidth: 120 },
    {
      id: 'is_active',
      label: 'Status',
      minWidth: 100,
      format: (value: number) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'created_at',
      label: 'Added On',
      minWidth: 170,
      format: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 100,
      format: (_: any, row: Driver) => (
        <div className="flex space-x-2">
          <button
            className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-colors duration-200"
            onClick={() => handleViewDriver(row.id)}
            title="View Details"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            className={`p-1.5 rounded-lg transition-colors duration-200 ${
              row.is_active === 1
                ? 'text-red-600 hover:text-white hover:bg-red-600'
                : 'text-green-600 hover:text-white hover:bg-green-600'
            }`}
            onClick={() => handleToggleStatus(row.id, row.is_active)}
            title={row.is_active === 1 ? 'Deactivate Driver' : 'Activate Driver'}
          >
            {row.is_active === 1 ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
      ),
    },
  ];

  const totalActiveDrivers = drivers.filter((d) => d.is_active === 1).length;
  const totalInactiveDrivers = drivers.filter((d) => d.is_active === 0).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and monitor driver accounts
            </p>
          </div>
          <button
            onClick={() => {}} // TODO: Implement Add Driver functionality
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
            <span>Add Driver</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-white/80">Total Drivers</p>
              <p className="text-2xl font-bold mt-1">{pagination.total || 0}</p>
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
              <p className="text-sm font-medium text-gray-500">Active Drivers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalActiveDrivers}
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Inactive Drivers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalInactiveDrivers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="text-red-600 p-4 bg-red-100 rounded-lg mb-4">Error: {error}</div>}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm">
        <Table
          columns={columns}
          data={filteredDrivers}
          isLoading={isLoading}
          title="Driver List"
          onExport={handleExport}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Drivers;
