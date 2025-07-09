import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import { useSearch } from '../context/SearchContext';

interface Vehicle {
  id: string;
  vendor_id: string;
  model: string;
  registration_no: string;
  image: string;
  no_of_seats: number;
  is_active: number;
  vendor_name: string;
  created_at: string;
}

const dummyVehicles: Vehicle[] = [
  {
    id: '1',
    vendor_id: 'vendor001',
    model: 'Toyota Camry',
    registration_no: 'DL01AB1234',
    image: 'https://via.placeholder.com/80x80?text=Camry',
    no_of_seats: 4,
    is_active: 1,
    vendor_name: 'Satyam Transport',
    created_at: '2024-01-10T00:00:00Z',
  },
  {
    id: '2',
    vendor_id: 'vendor002',
    model: 'Maruti Swift',
    registration_no: 'MH12XY5678',
    image: 'https://via.placeholder.com/80x80?text=Swift',
    no_of_seats: 4,
    is_active: 0,
    vendor_name: 'SpeedX Services',
    created_at: '2024-02-15T00:00:00Z',
  },
  {
    id: '3',
    vendor_id: 'vendor003',
    model: 'Hyundai Aura',
    registration_no: 'WB34YZ4321',
    image: 'https://via.placeholder.com/80x80?text=Aura',
    no_of_seats: 4,
    is_active: 1,
    vendor_name: 'GoFast Riders',
    created_at: '2024-03-01T00:00:00Z',
  },
];

const columns = [
  { id: 'registration_no', label: 'Registration', minWidth: 120 },
  { id: 'model', label: 'Model', minWidth: 150 },
  { id: 'vendor_name', label: 'Vendor', minWidth: 170 },
  {
    id: 'no_of_seats',
    label: 'Seats',
    minWidth: 100,
    format: (value: number) => value.toString(),
  },
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
    id: 'image',
    label: 'Image',
    minWidth: 100,
    format: (value: string) =>
      value ? (
        <img
          src={value}
          alt="Vehicle"
          className="w-12 h-12 object-cover rounded"
        />
      ) : (
        'No Image'
      ),
  },
  {
    id: 'created_at',
    label: 'Added On',
    minWidth: 170,
    format: (value: string) => new Date(value).toLocaleDateString(),
  },
];

const Vehicles: React.FC = () => {
  const { query } = useSearch();

  const [data, setData] = useState<Vehicle[]>(dummyVehicles);
  const [filtered, setFiltered] = useState<Vehicle[]>([]);
  const [isLoading] = useState(false);

  useEffect(() => {
    const lower = query.toLowerCase();
    setFiltered(
      data.filter(
        (v) =>
          v.model.toLowerCase().includes(lower) ||
          v.registration_no.toLowerCase().includes(lower) ||
          v.vendor_name.toLowerCase().includes(lower)
      )
    );
  }, [query, data]);

  const handleExport = () => {
    // Optional export logic
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and monitor all vehicles
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
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-sm p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-white/20 rounded-xl p-3">
              🚗
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-white/80">Total Vehicles</p>
              <p className="text-2xl font-bold mt-1">{filtered.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-xl p-3">✅</div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Active Vehicles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {filtered.filter((v) => v.is_active === 1).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-xl p-3">⛔</div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Inactive Vehicles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {filtered.filter((v) => v.is_active === 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm">
        <Table
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          title="Vehicle List"
          onExport={handleExport}
        />
      </div>
    </div>
  );
};

export default Vehicles;
