import React, { useEffect, useState, useCallback } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal'; // Import Modal component
import { useSearch } from '../context/SearchContext';
import { getAllVendors, toggleVendorStatus, applyVendorPenalty, suspendVendor } from '../api/adminService'; // Import API services

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_active: number; // 0 or 1
  is_profile_completed: number;
  is_phone_verified: number;
  is_email_verified: number;
  star_rating: number;
  total_earnings: number;
  amount: number; // Current balance
  penalty_reason: string | null;
  penalty_amount: number;
  total_penalties: number;
  suspended_by_admin: number; // 0 or 1
  suspension_reason: string | null;
  suspension_date: string | null;
  suspension_until: string | null;
  created_at: string;
  total_vehicles: number;
  total_drivers: number;
  total_bookings: number;
  completed_bookings: number;
}

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  format?: (value: any, row?: any) => React.ReactNode;
}

const Vendors: React.FC = () => {
  const { query } = useSearch();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 1,
  });

  // State for modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);
  const [penaltyDetails, setPenaltyDetails] = useState({ amount: '', reason: '' });


  const token = localStorage.getItem('marcocabs_admin_token');

  const fetchVendors = useCallback(async (page: number = 1, limit: number = 10, status?: string, search?: string) => {
    if (!token) {
      setError('No authentication token found');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllVendors(token, page, limit, status, search);
      setVendors(response.vendors);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vendors');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchVendors(pagination.current_page, pagination.per_page, undefined, query);
  }, [fetchVendors, pagination.current_page, pagination.per_page, query]);

  useEffect(() => {
    if (!vendors) return;
    const lower = query.toLowerCase();
    setFilteredVendors(
      vendors.filter(
        (v) =>
          v.name.toLowerCase().includes(lower) ||
          v.email.toLowerCase().includes(lower) ||
          v.phone.toLowerCase().includes(lower) ||
          (v.is_active ? 'active' : 'inactive').includes(lower) ||
          (v.suspended_by_admin ? 'suspended' : '').includes(lower) ||
          v.total_earnings.toString().includes(lower) ||
          v.total_vehicles.toString().includes(lower) ||
          v.total_drivers.toString().includes(lower) ||
          v.star_rating.toString().includes(lower) ||
          v.created_at.toLowerCase().includes(lower)
      )
    );
  }, [query, vendors]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, current_page: newPage }));
  };

  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedVendor(null);
  };

  const handleOpenDeactivateModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsDeactivateModalOpen(true);
  };

  const handleCloseDeactivateModal = () => {
    setIsDeactivateModalOpen(false);
    setSelectedVendor(null);
  };

  const handleConfirmToggleStatus = async () => {
    if (!token || !selectedVendor) {
      setError('No authentication token found or vendor not selected');
      return;
    }
    setIsLoading(true);
    try {
      const newStatus = selectedVendor.is_active === 1 ? false : true;
      await toggleVendorStatus(token, selectedVendor.id, newStatus);
      alert(`Vendor ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchVendors(pagination.current_page, pagination.per_page, undefined, query); // Refresh data
      handleCloseDeactivateModal();
    } catch (err: any) {
      setError(err.message || 'Failed to update vendor status');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPenaltyModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsPenaltyModalOpen(true);
    setPenaltyDetails({ amount: '', reason: '' });
  };

  const handleClosePenaltyModal = () => {
    setIsPenaltyModalOpen(false);
    setSelectedVendor(null);
    setPenaltyDetails({ amount: '', reason: '' });
  };

  const handlePenaltyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPenaltyDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmApplyPenalty = async () => {
    if (!token || !selectedVendor) {
      setError('No authentication token found or vendor not selected');
      return;
    }
    const penaltyAmount = parseFloat(penaltyDetails.amount);
    const penaltyReason = penaltyDetails.reason.trim();

    if (penaltyAmount > 0 && penaltyReason) {
      setIsLoading(true);
      try {
        await applyVendorPenalty(token, selectedVendor.id, penaltyAmount, penaltyReason);
        alert('Penalty applied successfully!');
        fetchVendors(pagination.current_page, pagination.per_page, undefined, query); // Refresh data
        handleClosePenaltyModal();
      } catch (err: any) {
        setError(err.message || 'Failed to apply penalty');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    } else {
      alert('Penalty amount must be greater than 0 and reason is required.');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: number) => {
    if (!token) {
      setError('No authentication token found');
      return;
    }
    setIsLoading(true);
    try {
      const newStatus = currentStatus === 1 ? false : true;
      await toggleVendorStatus(token, id, newStatus);
      alert(`Vendor ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchVendors(pagination.current_page, pagination.per_page, undefined, query); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to update vendor status');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPenalty = async (id: string) => {
    if (!token) {
      setError('No authentication token found');
      return;
    }
    const penaltyAmount = parseFloat(prompt('Enter penalty amount:') || '0');
    const penaltyReason = prompt('Enter penalty reason:');

    if (penaltyAmount > 0 && penaltyReason) {
      setIsLoading(true);
      try {
        await applyVendorPenalty(token, id, penaltyAmount, penaltyReason);
        alert('Penalty applied successfully!');
        fetchVendors(pagination.current_page, pagination.per_page, undefined, query); // Refresh data
      } catch (err: any) {
        setError(err.message || 'Failed to apply penalty');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    } else {
      alert('Penalty amount must be greater than 0 and reason is required.');
    }
  };

  const handleSuspendVendor = async (id: string, currentSuspendedStatus: number) => {
    if (!token) {
      setError('No authentication token found');
      return;
    }
    const newSuspendedStatus = currentSuspendedStatus === 1 ? false : true;
    let suspensionReason: string | undefined;
    let suspensionUntil: string | undefined;

    if (newSuspendedStatus) {
      suspensionReason = prompt('Enter suspension reason:') || undefined;
      if (!suspensionReason) {
        alert('Suspension reason is required.');
        return;
      }
      const untilDateInput = prompt('Enter suspension end date (YYYY-MM-DD, optional:)');
      if (untilDateInput) {
        const date = new Date(untilDateInput);
        if (!isNaN(date.getTime())) { // Check if date is valid
          suspensionUntil = date.toISOString();
        } else {
          alert('Invalid date format. Suspension until date will not be set.');
        }
      }
    }

    setIsLoading(true);
    try {
      await suspendVendor(token, id, newSuspendedStatus, suspensionReason, suspensionUntil);
      alert(`Vendor ${newSuspendedStatus ? 'suspended' : 'unsuspended'} successfully!`);
      fetchVendors(pagination.current_page, pagination.per_page, undefined, query); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to update suspension status');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    // Export logic here
    console.log('Exporting vendors...');
  };

  const columns: Column[] = [
    { id: 'name', label: 'Name', minWidth: 170 },
    { id: 'email', label: 'Email', minWidth: 170 },
    { id: 'phone', label: 'Phone', minWidth: 130 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (_: any, row: Vendor) => {
        const statusText = row.suspended_by_admin ? 'Suspended' : (row.is_active ? 'Active' : 'Inactive');
        const statusStyles = {
          Active: 'bg-green-100 text-green-800',
          Inactive: 'bg-red-100 text-red-800',
          Suspended: 'bg-yellow-100 text-yellow-800',
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              statusStyles[statusText as keyof typeof statusStyles]
            }`}
          >
            {statusText}
          </span>
        );
      },
    },
    {
      id: 'total_earnings',
      label: 'Total Earnings',
      minWidth: 130,
      format: (value: number) => `₹${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      id: 'total_vehicles',
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
      id: 'total_drivers',
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
      id: 'star_rating',
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
          <span className="ml-1 text-sm text-gray-600">
            {typeof value === 'number' ? value.toFixed(1) : 'N/A'}
          </span>
        </div>
      ),
    },
    {
      id: 'created_at',
      label: 'Joined Date',
      minWidth: 170,
      format: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 180,
      format: (_: any, row: Vendor) => (
        <div className="flex space-x-2">
          <button
            className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-colors duration-200"
            onClick={() => handleViewVendor(row)}
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
            onClick={() => handleOpenDeactivateModal(row)}
            title={row.is_active === 1 ? 'Deactivate Vendor' : 'Activate Vendor'}
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
          <button
            className="p-1.5 text-yellow-600 hover:text-white hover:bg-yellow-600 rounded-lg transition-colors duration-200"
            onClick={() => handleOpenPenaltyModal(row)}
            title="Apply Penalty"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </button>
          <button
            className={`p-1.5 rounded-lg transition-colors duration-200 ${
              row.suspended_by_admin === 1
                ? 'text-green-600 hover:text-white hover:bg-green-600'
                : 'text-orange-600 hover:text-white hover:bg-orange-600'
            }`}
            onClick={() => handleSuspendVendor(row.id, row.suspended_by_admin)}
            title={row.suspended_by_admin === 1 ? 'Unsuspend Vendor' : 'Suspend Vendor'}
          >
            {row.suspended_by_admin === 1 ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.004 10.004 0 0112 20c-4.478 0-8.268-2.943-9.542-7 .985-3.13 3.423-5.653 6.359-7.187M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.542 0c-1.274 4.057-5.064 7-9.542 7-1.01 0-1.97-.163-2.9-.475m2.9-.475a10.004 10.004 0 00-2.9-.475M12 5c4.478 0 8.268 2.943 9.542 7M12 5a9.956 9.956 0 013-1.5" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            )}
          </button>
        </div>
      ),
    },
  ];

  const totalActiveVendors = vendors.filter(vendor => vendor.is_active === 1 && vendor.suspended_by_admin === 0).length;
  const totalInactiveVendors = vendors.filter(vendor => vendor.is_active === 0 && vendor.suspended_by_admin === 0).length;
  const totalSuspendedVendors = vendors.filter(vendor => vendor.suspended_by_admin === 1).length;
  const totalEarnings = vendors.reduce((sum, vendor) => sum + vendor.total_earnings, 0);
  const totalVehicles = vendors.reduce((sum, vendor) => sum + vendor.total_vehicles, 0);


  return (
    <div className="p-4 sm:p-6 lg:p-8">
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
            onClick={() => {}} // TODO: Implement Add Vendor functionality
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
                {pagination.total || 0}
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
                {totalActiveVendors}
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Suspended Vendors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalSuspendedVendors}
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
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
          data={filteredVendors}
          isLoading={isLoading}
          title="Vendor List"
          onExport={handleExport}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>

      {/* View Vendor Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={handleCloseViewModal} title="Vendor Details" size="lg">
        {selectedVendor && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedVendor.name}</p>
              <p><strong>Email:</strong> {selectedVendor.email}</p>
              <p><strong>Phone:</strong> {selectedVendor.phone}</p>
              <p><strong>Status:</strong> {selectedVendor.suspended_by_admin ? 'Suspended' : (selectedVendor.is_active ? 'Active' : 'Inactive')}</p>
              <p><strong>Profile Completed:</strong> {selectedVendor.is_profile_completed ? 'Yes' : 'No'}</p>
              <p><strong>Phone Verified:</strong> {selectedVendor.is_phone_verified ? 'Yes' : 'No'}</p>
              <p><strong>Email Verified:</strong> {selectedVendor.is_email_verified ? 'Yes' : 'No'}</p>
              <p><strong>Star Rating:</strong> {typeof selectedVendor.star_rating === 'number' ? selectedVendor.star_rating.toFixed(1) : 'N/A'}</p>
              <p><strong>Joined Date:</strong> {new Date(selectedVendor.created_at).toLocaleDateString()}</p>
            </div>
            <div className="space-y-2">
              <p><strong>Total Earnings:</strong> ₹{selectedVendor.total_earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p><strong>Current Balance:</strong> ₹{selectedVendor.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p><strong>Total Penalties:</strong> ₹{selectedVendor.total_penalties.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              {selectedVendor.penalty_reason && <p><strong>Last Penalty Reason:</strong> {selectedVendor.penalty_reason}</p>}
              <p><strong>Total Vehicles:</strong> {selectedVendor.total_vehicles}</p>
              <p><strong>Total Drivers:</strong> {selectedVendor.total_drivers}</p>
              <p><strong>Total Bookings:</strong> {selectedVendor.total_bookings}</p>
              <p><strong>Completed Bookings:</strong> {selectedVendor.completed_bookings}</p>
              {selectedVendor.suspended_by_admin === 1 && (
                <>
                  <p><strong>Suspension Reason:</strong> {selectedVendor.suspension_reason}</p>
                  <p><strong>Suspension Date:</strong> {selectedVendor.suspension_date ? new Date(selectedVendor.suspension_date).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Suspension Until:</strong> {selectedVendor.suspension_until ? new Date(selectedVendor.suspension_until).toLocaleDateString() : 'N/A'}</p>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Deactivate/Activate Vendor Modal */}
      <Modal isOpen={isDeactivateModalOpen} onClose={handleCloseDeactivateModal} title={selectedVendor?.is_active === 1 ? 'Deactivate Vendor' : 'Activate Vendor'} size="sm">
        {selectedVendor && (
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              Are you sure you want to {selectedVendor.is_active === 1 ? 'deactivate' : 'activate'} vendor <strong>{selectedVendor.name}</strong>?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                onClick={handleCloseDeactivateModal}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-white transition-colors duration-200 ${
                  selectedVendor.is_active === 1 ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
                onClick={handleConfirmToggleStatus}
              >
                {selectedVendor.is_active === 1 ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Apply Penalty Modal */}
      <Modal isOpen={isPenaltyModalOpen} onClose={handleClosePenaltyModal} title="Apply Penalty" size="md">
        {selectedVendor && (
          <div className="space-y-4">
            <div>
              <label htmlFor="penaltyAmount" className="block text-sm font-medium text-gray-700">
                Penalty Amount (₹)
              </label>
              <input
                type="number"
                id="penaltyAmount"
                name="amount"
                value={penaltyDetails.amount}
                onChange={handlePenaltyInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="e.g., 500"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="penaltyReason" className="block text-sm font-medium text-gray-700">
                Reason for Penalty
              </label>
              <textarea
                id="penaltyReason"
                name="reason"
                value={penaltyDetails.reason}
                onChange={handlePenaltyInputChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="e.g., Violation of terms, late delivery"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                onClick={handleClosePenaltyModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                onClick={handleConfirmApplyPenalty}
              >
                Apply Penalty
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Vendors;
