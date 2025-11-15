import React, { useEffect, useState, useCallback } from 'react';
import Table from '../components/Table';
import { useSearch } from '../context/SearchContext';
import { getAllUsers, deleteUser } from '../api/adminService'; // Import API services

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_phone_verified: number; // 0 or 1
  is_profile_completed: number; // 0 or 1
  gender: string | null;
  age: number | null;
  amount_spent: number; // This is total_spent from backend
  total_bookings: number;
  completed_bookings: number;
  total_spent: number;
  created_at: string;
}

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  format?: (value: any, row?: any) => React.ReactNode;
}

const Users: React.FC = () => {
  const { query } = useSearch();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 1,
  });

  const token = localStorage.getItem('marcocabs_admin_token');

  const fetchUsers = useCallback(async (page: number = 1, limit: number = 10, verified?: 'phone' | 'profile', search?: string) => {
    if (!token) {
      setError('No authentication token found');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllUsers(token, page, limit, verified, search);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers(pagination.current_page, pagination.per_page, undefined, query);
  }, [fetchUsers, pagination.current_page, pagination.per_page, query]);

  useEffect(() => {
    if (!users) return;
    const lower = query.toLowerCase();
    setFilteredUsers(
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower) ||
          u.phone.toLowerCase().includes(lower) ||
          (u.is_phone_verified ? 'phone verified' : '').includes(lower) ||
          (u.is_profile_completed ? 'profile completed' : '').includes(lower)
      )
    );
  }, [query, users]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, current_page: newPage }));
  };

  const handleViewUser = (id: string) => {
    // Navigate to user details page or open a modal
    console.log('View user:', id);
  };

  const handleDeleteUser = async (id: string) => {
    if (!token) {
      setError('No authentication token found');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        await deleteUser(token, id);
        alert('User deleted successfully!');
        fetchUsers(pagination.current_page, pagination.per_page, undefined, query); // Refresh data
      } catch (err: any) {
        setError(err.message || 'Failed to delete user');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleExport = () => {
    // Export logic here
    console.log('Exporting users...');
  };

  const columns: Column[] = [
    { id: 'name', label: 'Name', minWidth: 170 },
    { id: 'email', label: 'Email', minWidth: 170 },
    { id: 'phone', label: 'Phone', minWidth: 130 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (_: any, row: User) => {
        const statusText = row.is_profile_completed ? 'Profile Completed' : (row.is_phone_verified ? 'Phone Verified' : 'Pending');
        const statusStyles = {
          'Profile Completed': 'bg-green-100 text-green-800',
          'Phone Verified': 'bg-blue-100 text-blue-800',
          'Pending': 'bg-yellow-100 text-yellow-800',
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
      id: 'total_spent',
      label: 'Total Spent',
      minWidth: 120,
      format: (value: number) => `₹${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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
      minWidth: 100,
      format: (_: any, row: User) => (
        <div className="flex space-x-2">
          <button
            className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-colors duration-200"
            onClick={() => handleViewUser(row.id)}
            title="View Details"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            className="p-1.5 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-colors duration-200"
            onClick={() => handleDeleteUser(row.id)}
            title="Delete User"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const totalActiveUsers = filteredUsers.filter(user => user.is_profile_completed === 1).length; // Assuming profile completed means active
  const totalRevenue = filteredUsers.reduce((sum, user) => sum + user.total_spent, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and monitor user accounts
            </p>
          </div>
          <button
            onClick={() => {}} // TODO: Implement Add User functionality
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
            <span>Add User</span>
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-white/80">Total Users</p>
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
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalActiveUsers}
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
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
          data={filteredUsers}
          isLoading={isLoading}
          title="User List"
          onExport={handleExport}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Users;
