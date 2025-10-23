import React, { useState, useEffect } from 'react';
import {
  BookingData,
  Driver,
  getVendorBookings,
  updateBookingStatus,
  getVendorDrivers,
} from '../utils/bookingService'; // Import from the new service file

const Booking: React.FC = () => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<BookingData['status'] | ''>('waiting'); // Default to 'waiting'
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [showApproveModal, setShowApproveModal] = useState<boolean>(false);
  const [selectedBookingForApproval, setSelectedBookingForApproval] = useState<BookingData | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);

  const fetchBookings = async (statusFilter: BookingData['status'] | '' = '') => {
    setLoading(true);
    setError(null);
    try {
      const params: { status?: BookingData['status'], bookingId?: string } = {};
      if (statusFilter) {
        params.status = statusFilter as BookingData['status'];
      }
      params.bookingId = (searchText as string) || undefined; // Convert empty string to undefined
      const response = await getVendorBookings(params);
      setBookings(response.data.bookings);
    } catch (err) {
      console.error('Error fetching vendor bookings:', err);
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await getVendorDrivers();
      console.log('Fetched drivers:', response);
      setDrivers(response.data.drivers);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      // Optionally set an error state for drivers
    }
  };

  useEffect(() => {
    fetchBookings(selectedStatus);
    fetchDrivers();
  }, [selectedStatus]); // Refetch bookings when selectedStatus changes, fetch drivers once

  const handleSearch = async () => {
    setSearchLoading(true);
    setError(null);
    try {
      const params: { status?: BookingData['status'], bookingId?: string } = {};
      if (selectedStatus) {
        params.status = selectedStatus as BookingData['status'];
      }
      params.bookingId = (searchText as string) || undefined; // Convert empty string to undefined
      const response = await getVendorBookings(params);
      setBookings(response.data.bookings);
    } catch (err) {
      console.error('Error searching vendor bookings:', err);
      setError('Failed to search bookings. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingData['status'], driverId: string | null = null) => {
    setUpdateLoading(true);
    setError(null);
    try {
      await updateBookingStatus(bookingId, newStatus, driverId);
      setShowApproveModal(false);
      setSelectedBookingForApproval(null);
      setSelectedDriver('');
      fetchBookings(selectedStatus); // Re-fetch bookings to update the list
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const openApproveModal = (booking: BookingData) => {
    setSelectedBookingForApproval(booking);
    setShowApproveModal(true);
  };

  const closeApproveModal = () => {
    setShowApproveModal(false);
    setSelectedBookingForApproval(null);
    setSelectedDriver('');
  };

  const confirmApproval = () => {
    if (selectedBookingForApproval && selectedDriver) {
      handleUpdateStatus(selectedBookingForApproval.id, 'approved', selectedDriver);
    } else {
      setError('Please select a driver to approve the booking.');
    }
  };

  // Function to render skeleton loading rows
  const renderSkeletonRows = () => {
    return Array(4).fill(0).map((_, index) => (
      <tr key={`skeleton-${index}`} className="animate-pulse">
        <td className="p-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </td>
        <td className="p-3 border-b border-gray-100">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </td>
        <td className="p-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-14"></div>
        </td>
        <td className="p-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-36 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </td>
        <td className="p-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </td>
        <td className="p-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </td>
        <td className="p-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </td>
        <td className="p-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </td>
        <td className="p-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-40"></div>
        </td>
        <td className="p-3 border-b border-gray-100">
          <div className="h-8 bg-gray-200 rounded w-24 mt-2"></div>
        </td>
      </tr>
    ));
  };

  const bookingStatuses: BookingData['status'][] = ['waiting', 'approved', 'preongoing', 'ongoing', 'completed', 'cancelled'];

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen p-6 rounded-lg shadow-sm">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Bookings Dashboard</h1>
      
      {/* Search and Filter Section */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Search and Filter</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="w-full md:w-auto">
            <select 
              className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white text-gray-700 px-6 py-3 rounded-lg w-full md:w-60 transition-all duration-200"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as BookingData['status'])}
              disabled={searchLoading}
            >
              <option value="">All Statuses</option>
              {bookingStatuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-auto flex-grow">
            <input
              type="text"
              placeholder="Search by booking ID"
              className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg p-3 w-full transition-all duration-200"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              disabled={searchLoading}
            />
          </div>
          
          <div className="w-full md:w-auto">
            <button 
              className={`${searchLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white px-8 py-3 rounded-lg font-medium shadow-sm transition-all duration-200 flex items-center justify-center`}
              onClick={handleSearch}
              disabled={searchLoading}
            >
              {searchLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white p-6 rounded-xl shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Available Bookings</h2>
        <div className="overflow-x-auto max-w-full">
          <table className="w-full min-w-max table-fixed">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-[100px]">Booking ID</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-[120px]">Customer Name</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-[100px]">Vehicle Model</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-[180px]">Pickup/Dropoff</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-[100px]">Dates</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-[80px]">Price</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-[120px]">Driver</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-[100px]">Status</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-[200px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading || searchLoading ? (
                // Show skeleton loading animation
                renderSkeletonRows()
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-gray-500">
                    No bookings found matching your search criteria.
                  </td>
                </tr>
              ) : (
                // Show actual booking data
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="p-3 text-sm text-gray-700 border-b border-gray-100 break-all">{booking.id}</td>
                    <td className="p-3 text-sm text-gray-700 border-b border-gray-100">{booking.customer_name}</td>
                    <td className="p-3 text-sm text-gray-700 border-b border-gray-100">{booking.vehicle_model}</td>
                    <td className="p-3 text-sm text-gray-700 border-b border-gray-100 whitespace-pre-line break-words">
                      {booking.pickup_location} to {booking.dropoff_location}
                    </td>
                    <td className="p-3 text-sm text-gray-700 border-b border-gray-100">
                      {new Date(booking.pickup_date).toLocaleDateString()} - {new Date(booking.drop_date).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm text-gray-700 border-b border-gray-100">₹{booking.price}</td>
                    <td className="p-3 text-sm text-gray-700 border-b border-gray-100">
                      {booking.driver_name || 'N/A'}
                      {booking.driver_phone && ` (${booking.driver_phone})`}
                    </td>
                    <td className="p-3 text-sm border-b border-gray-100">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' : 
                        booking.status === 'approved' ? 'bg-blue-100 text-blue-700' : 
                        booking.status === 'preongoing' ? 'bg-indigo-100 text-indigo-700' :
                        booking.status === 'ongoing' ? 'bg-purple-100 text-purple-700' :
                        booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm border-b border-gray-100">
                      {booking.status === 'waiting' && (
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md text-sm transition-colors duration-150"
                          onClick={() => openApproveModal(booking)}
                          disabled={updateLoading}
                        >
                          Approve
                        </button>
                      )}
                      {booking.status === 'approved' && (
                        <button
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded-md text-sm transition-colors duration-150 mr-2"
                          onClick={() => handleUpdateStatus(booking.id, 'preongoing')}
                          disabled={updateLoading}
                        >
                          Mark Pre-Ongoing
                        </button>
                      )}
                      {booking.status === 'preongoing' && (
                        <button
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded-md text-sm transition-colors duration-150 mr-2"
                          onClick={() => handleUpdateStatus(booking.id, 'ongoing')}
                          disabled={updateLoading}
                        >
                          Mark Ongoing
                        </button>
                      )}
                      {booking.status === 'ongoing' && (
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md text-sm transition-colors duration-150 mr-2"
                          onClick={() => handleUpdateStatus(booking.id, 'completed')}
                          disabled={updateLoading}
                        >
                          Mark Completed
                        </button>
                      )}
                      {(booking.status === 'waiting' || booking.status === 'approved') && (
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md text-sm transition-colors duration-150"
                          onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                          disabled={updateLoading}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showApproveModal && selectedBookingForApproval && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full"> {/* Increased max-w-md to max-w-lg */}
            <h3 className="text-lg font-bold mb-4">
              Approve Booking <span className="break-all">{selectedBookingForApproval.id}</span> {/* Added break-all */}
            </h3>
            <div className="mb-4">
              <label htmlFor="driver-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Driver:
              </label>
              <select
                id="driver-select"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                disabled={updateLoading}
              >
                <option value="">-- Select a Driver --</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} ({driver.phone})
                  </option>
                ))}
              </select>
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors duration-150"
                onClick={closeApproveModal}
                disabled={updateLoading}
              >
                Cancel
              </button>
              <button
                className={`${updateLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-md transition-colors duration-150`}
                onClick={confirmApproval}
                disabled={updateLoading}
              >
                {updateLoading ? 'Approving...' : 'Approve Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
