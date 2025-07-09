import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import { useSearch } from '../context/SearchContext';

interface Driver {
  id: string;
  vendor_id: string;
  name: string;
  phone: string;
  address: string;
  license: string;
  is_active: number;
  vehicle_id: string;
  vendor_name: string;
  vehicle_info: string;
  created_at: string;
}

// Dummy driver data
const dummyDrivers: Driver[] = [
  {
    id: '1',
    vendor_id: 'vendor001',
    name: 'Mike Johnson',
    phone: '9876543210',
    address: '123 Street, Delhi',
    license: 'DL123456789',
    is_active: 1,
    vehicle_id: 'vehicle001',
    vendor_name: 'Satyam Transport',
    vehicle_info: 'Toyota Innova (DL01AB1234)',
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    vendor_id: 'vendor002',
    name: 'Aman Verma',
    phone: '9876500000',
    address: 'MG Road, Mumbai',
    license: 'MH456789123',
    is_active: 0,
    vehicle_id: 'vehicle002',
    vendor_name: 'SpeedX Services',
    vehicle_info: 'Maruti Swift (MH12XY5678)',
    created_at: '2024-03-10T00:00:00Z',
  },
  {
    id: '3',
    vendor_id: 'vendor003',
    name: 'Priya Sen',
    phone: '9876000000',
    address: 'Salt Lake, Kolkata',
    license: 'WB789654321',
    is_active: 1,
    vehicle_id: 'vehicle003',
    vendor_name: 'GoFast Riders',
    vehicle_info: 'Hyundai Aura (WB34YZ4321)',
    created_at: '2024-04-05T00:00:00Z',
  },
];

const columns = [
  { id: 'name', label: 'Name', minWidth: 170 },
  { id: 'phone', label: 'Phone', minWidth: 120 },
  { id: 'vendor_name', label: 'Vendor', minWidth: 170 },
  { id: 'vehicle_info', label: 'Assigned Vehicle', minWidth: 200 },
  { id: 'license', label: 'License No', minWidth: 120 },
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
];

const Drivers: React.FC = () => {
  const { query } = useSearch();

  const [data, setData] = useState<Driver[]>(dummyDrivers);
  const [filtered, setFiltered] = useState<Driver[]>([]);
  const [isLoading] = useState(false);

  useEffect(() => {
    if (!data) return;
    const lower = query.toLowerCase();
    setFiltered(
      data.filter(
        (d) =>
          d.name.toLowerCase().includes(lower) ||
          d.phone.toLowerCase().includes(lower) ||
          d.vendor_name.toLowerCase().includes(lower) ||
          d.vehicle_info.toLowerCase().includes(lower)
      )
    );
  }, [query, data]);

  const handleExport = () => {
    // optional export logic
  };

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
              <p className="text-2xl font-bold mt-1">{filtered?.length || 0}</p>
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
                {filtered?.filter((d) => d.is_active === 1).length || 0}
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
                {filtered?.filter((d) => d.is_active === 0).length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm">
        <Table
          columns={columns}
          data={filtered || []}
          isLoading={isLoading}
          title="Driver List"
          onExport={handleExport}
        />
      </div>
    </div>
  );
};

export default Drivers;
