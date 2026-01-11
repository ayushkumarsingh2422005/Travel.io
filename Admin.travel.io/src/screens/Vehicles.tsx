import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSearch } from '../context/SearchContext';
import { getAllVehicles, toggleVehicleStatus } from '../api/adminService';

interface Vehicle {
  id: string;
  vendor_id: string;
  model: string;
  registration_no: string;
  image?: string;
  no_of_seats: number;
  per_km_charge?: number;
  is_active: number;
  approval_status?: string;
  category_id?: string;
  category_name?: string;
  vendor_name?: string;
  vendor_email?: string;
  vendor_phone?: string;
  rc_status?: string;
  rc_reg_date?: string;
  rc_expiry_date?: string;
  rc_vehicle_insurance_upto?: string;
}

const Vehicles: React.FC = () => {
  const { query } = useSearch();
  const [data, setData] = useState<Vehicle[]>([]);
  const [filtered, setFiltered] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('marcocabs_admin_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await getAllVehicles(token);
      setData(response.vehicles);
    } catch (error: any) {
      console.error('Error fetching vehicles:', error);
      toast.error(error.message || 'Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    const lower = query.toLowerCase();
    setFiltered(
      data.filter(
        (v) =>
          v.model.toLowerCase().includes(lower) ||
          v.registration_no.toLowerCase().includes(lower) ||
          (v.vendor_name && v.vendor_name.toLowerCase().includes(lower))
      )
    );
  }, [query, data]);

  const handleToggleStatus = async (vehicleId: string, currentStatus: number) => {
    try {
      const token = localStorage.getItem('marcocabs_admin_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      await toggleVehicleStatus(token, vehicleId, !currentStatus);
      toast.success('Vehicle status updated successfully');
      fetchVehicles(); // Refresh list
    } catch (error: any) {
      console.error('Error toggling vehicle status:', error);
      toast.error(error.message || 'Failed to update vehicle status');
    }
  };

  const getApprovalBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            onClick={fetchVehicles}
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
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
            <div className="flex-shrink-0 bg-yellow-100 rounded-xl p-3">⏳</div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {filtered.filter((v) => v.approval_status === 'pending').length}
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
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Loading vehicles...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No vehicles found
                  </td>
                </tr>
              ) : (
                filtered.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {vehicle.registration_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{vehicle.vendor_name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{vehicle.vendor_phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.category_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.no_of_seats}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getApprovalBadge(
                          vehicle.approval_status
                        )}`}
                      >
                        {vehicle.approval_status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          vehicle.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {vehicle.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleToggleStatus(vehicle.id, vehicle.is_active)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          vehicle.is_active
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {vehicle.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Vehicles;
