import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  BookingData,
  Driver,
  Vehicle, // New import
  getVendorBookings,
  updateBookingStatus,
  getVendorDrivers,
  getVendorVehicles, // New import
  getPendingBookingRequests, // New import
  acceptBookingRequest, // New import
} from '../utils/bookingService'; // Import from the new service file

const Booking: React.FC = () => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]); // New state
  const [searchText, setSearchText] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<BookingData['status'] | ''>('waiting'); // Default to 'waiting'
  const [pickupLocationFilter, setPickupLocationFilter] = useState<string>('');
  const [dropoffLocationFilter, setDropoffLocationFilter] = useState<string>('');
  const [vehicleModelFilter, setVehicleModelFilter] = useState<string>('');
  const [cabCategoryFilter, setCabCategoryFilter] = useState<string>('');
  const [customerNameFilter, setCustomerNameFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalBookingsCount, setTotalBookingsCount] = useState<number>(0); // New state for total count

  const [showApproveModal, setShowApproveModal] = useState<boolean>(false);
  const [selectedBookingForApproval, setSelectedBookingForApproval] = useState<BookingData | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>(''); // New state
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [selectedBookingForCancellation, setSelectedBookingForCancellation] = useState<BookingData | null>(null);
  const [showDriverTrackingModal, setShowDriverTrackingModal] = useState<boolean>(false);
  const [generatedTrackingLink, setGeneratedTrackingLink] = useState<string>('');
  const [notifiedDriverDetails, setNotifiedDriverDetails] = useState<{ name: string, phone: string } | null>(null);

  const fetchBookings = async (
    statusFilter: BookingData['status'] | '' = '',
    page: number = currentPage,
    limit: number = itemsPerPage,
    bookingIdSearch?: string
  ) => {
    setLoading(true);
    try {
      let response;
      if (statusFilter === 'waiting') {
        response = await getPendingBookingRequests({ page, limit });
      } else {
        const params: { status?: BookingData['status']; bookingId?: string; page?: number; limit?: number } = { page, limit };
        if (statusFilter) {
          params.status = statusFilter as BookingData['status'];
        }
        if (bookingIdSearch) {
          params.bookingId = bookingIdSearch;
        }
        response = await getVendorBookings(params);
      }
      setBookings(response.data.bookings);
      setTotalPages(response.data.pagination.total_pages);
      setTotalBookingsCount(response.data.pagination.total);
      toast.success('Bookings loaded successfully!');
    } catch (err: any) {
      console.error('Error fetching vendor bookings:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await getVendorDrivers();
      setDrivers(response.data.drivers); // Corrected to access data.drivers
      // toast.success('Drivers loaded successfully!');
    } catch (err) {
      console.error('Error fetching drivers:', err);
      toast.error('Failed to fetch drivers.');
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await getVendorVehicles();
      console.log("vehicle available for booking", response.data.vehicles);
      setAvailableVehicles(response.data.vehicles); // Corrected to access data.vehicles
      // toast.success('Vehicles loaded successfully!');
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      toast.error('Failed to fetch vehicles.');
    }
  };

  useEffect(() => {
    fetchBookings(selectedStatus, currentPage, itemsPerPage, searchText);
    fetchDrivers();
    fetchVehicles();
  }, [selectedStatus, currentPage, itemsPerPage]); // Re-fetch when selectedStatus, currentPage, or itemsPerPage changes

  const handleSearch = async () => {
    setSearchLoading(true)
    setCurrentPage(1); // Reset to first page on new search
    fetchBookings(selectedStatus, 1, itemsPerPage, searchText);
    setSearchLoading(false);
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingData['status'], driverId: string | null = null) => {
    setUpdateLoading(true);
    try {
      await updateBookingStatus(bookingId, newStatus, driverId);
      setShowApproveModal(false);
      setSelectedBookingForApproval(null);
      setSelectedDriver('');
      setSelectedVehicle(''); // Reset vehicle selection
      fetchBookings(selectedStatus); // Re-fetch bookings to update the list
      toast.success(`Booking ${bookingId} status updated to ${newStatus} successfully!`); // Success toast
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      toast.error(err.response?.data?.message || 'Failed to update booking status. Please try again.'); // Error toast
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAcceptBooking = async () => {
    if (!selectedBookingForApproval || !selectedDriver || !selectedVehicle) {
      toast.error('Please select a driver and a vehicle to approve the booking.'); // Error toast
      return;
    }

    setUpdateLoading(true);
    try {
      await acceptBookingRequest(selectedBookingForApproval.id, selectedDriver, selectedVehicle);
      setShowApproveModal(false);
      setSelectedBookingForApproval(null);
      setSelectedDriver('');
      setSelectedVehicle('');
      fetchBookings(selectedStatus); // Re-fetch bookings to update the list
      toast.success(`Booking ${selectedBookingForApproval.id} accepted successfully!`); // Success toast

      // Generate tracking link and show modal
      const trackingLink = `${window.location.origin}/driver-tracking/${selectedBookingForApproval.id}`;
      setGeneratedTrackingLink(trackingLink);

      const driver = drivers.find(d => d.id === selectedDriver);
      if (driver) {
        setNotifiedDriverDetails({
          name: driver.name,
          phone: driver.phone
        });
      }

      setShowDriverTrackingModal(true);
    } catch (err: any) {
      console.error('Error accepting booking request:', err);
      toast.error(err.response?.data?.message || 'Failed to accept booking. Please try again.'); // Error toast
    } finally {
      setUpdateLoading(false);
    }
  };

  const openApproveModal = (booking: BookingData) => {
    setSelectedBookingForApproval(booking);
    setSelectedDriver(''); // Reset driver selection
    setSelectedVehicle(''); // Reset vehicle selection

    setShowApproveModal(true);
  };

  const closeApproveModal = () => {
    setShowApproveModal(false);
    setSelectedBookingForApproval(null);
    setSelectedDriver('');
    setSelectedVehicle(''); // Reset vehicle selection

  };

  const openCancelModal = (booking: BookingData) => {
    setSelectedBookingForCancellation(booking);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedBookingForCancellation(null);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancellation) {
      toast.error('No booking selected for cancellation.');
      return;
    }
    setUpdateLoading(true);
    try {
      await updateBookingStatus(selectedBookingForCancellation.id, 'cancelled');
      closeCancelModal();
      fetchBookings(selectedStatus);
      toast.success(`Booking ${selectedBookingForCancellation.id} cancelled successfully!`);
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel booking. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Client-side filtering function
  const getFilteredBookings = (allBookings: BookingData[]) => {
    return allBookings.filter(booking => {
      const matchesSearchText = searchText
        ? booking.id.toLowerCase().includes(searchText.toLowerCase())
        : true;
      const matchesPickupLocation = pickupLocationFilter
        ? booking.pickup_location.toLowerCase().includes(pickupLocationFilter.toLowerCase())
        : true;
      const matchesDropoffLocation = dropoffLocationFilter
        ? booking.dropoff_location.toLowerCase().includes(dropoffLocationFilter.toLowerCase())
        : true;
      const matchesVehicleModel = vehicleModelFilter
        ? (booking.vehicle_model?.toLowerCase().includes(vehicleModelFilter.toLowerCase()) || false)
        : true;
      const matchesCabCategory = cabCategoryFilter
        ? (booking.cab_category_name?.toLowerCase().includes(cabCategoryFilter.toLowerCase()) || false)
        : true;
      const matchesCustomerName = customerNameFilter
        ? booking.customer_name.toLowerCase().includes(customerNameFilter.toLowerCase())
        : true;

      return (
        matchesSearchText &&
        matchesPickupLocation &&
        matchesDropoffLocation &&
        matchesVehicleModel &&
        matchesCabCategory &&
        matchesCustomerName
      );
    });
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

          {/* New Filter Inputs */}
          <div className="w-full md:w-auto flex-grow">
            <input
              type="text"
              placeholder="Pickup Location"
              className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg p-3 w-full transition-all duration-200"
              value={pickupLocationFilter}
              onChange={(e) => setPickupLocationFilter(e.target.value)}
              disabled={searchLoading}
            />
          </div>
          <div className="w-full md:w-auto flex-grow">
            <input
              type="text"
              placeholder="Dropoff Location"
              className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg p-3 w-full transition-all duration-200"
              value={dropoffLocationFilter}
              onChange={(e) => setDropoffLocationFilter(e.target.value)}
              disabled={searchLoading}
            />
          </div>
          <div className="w-full md:w-auto flex-grow">
            <input
              type="text"
              placeholder="Vehicle Model"
              className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg p-3 w-full transition-all duration-200"
              value={vehicleModelFilter}
              onChange={(e) => setVehicleModelFilter(e.target.value)}
              disabled={searchLoading}
            />
          </div>
          <div className="w-full md:w-auto flex-grow">
            <input
              type="text"
              placeholder="Cab Category"
              className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg p-3 w-full transition-all duration-200"
              value={cabCategoryFilter}
              onChange={(e) => setCabCategoryFilter(e.target.value)}
              disabled={searchLoading}
            />
          </div>
          <div className="w-full md:w-auto flex-grow">
            <input
              type="text"
              placeholder="Customer Name"
              className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg p-3 w-full transition-all duration-200"
              value={customerNameFilter}
              onChange={(e) => setCustomerNameFilter(e.target.value)}
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

      {/* Bookings Table */}
      <div className="bg-white p-6 rounded-xl shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Available Bookings</h2>
        <div className="overflow-x-auto max-w-full">
          <table className="w-full min-w-max table-fixed">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-[100px]">Booking ID</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-[120px]">Customer Name</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-[100px]">Cab Category</th>
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
                getFilteredBookings(bookings).map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="p-3 text-sm text-gray-700 border-b border-gray-100 break-all">{booking.id}</td>
                    <td className="p-3 text-sm text-gray-700 border-b border-gray-100">{booking.customer_name}</td>
                    <td className="p-3 text-sm text-gray-700 border-b border-gray-100">
                      {booking.cab_category_name || booking.vehicle_model || 'N/A'}
                      {booking.vehicle_registration && ` (${booking.vehicle_registration})`}
                    </td>
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
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
                      <div className="flex flex-wrap gap-2">
                        {booking.status === 'waiting' && (
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-200"
                            onClick={() => openApproveModal(booking)}
                            disabled={updateLoading}
                          >
                            Approve
                          </button>
                        )}
                        {booking.status === 'approved' && (
                          <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-200"
                            onClick={() => handleUpdateStatus(booking.id, 'preongoing')}
                            disabled={updateLoading}
                          >
                            Mark Pre-Ongoing
                          </button>
                        )}
                        {booking.status === 'preongoing' && (
                          <button
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-200"
                            onClick={() => handleUpdateStatus(booking.id, 'ongoing')}
                            disabled={updateLoading}
                          >
                            Mark Ongoing
                          </button>
                        )}
                        {booking.status === 'ongoing' && (
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-200"
                            onClick={() => handleUpdateStatus(booking.id, 'completed')}
                            disabled={updateLoading}
                          >
                            Mark Completed
                          </button>
                        )}
                        {(booking.status === 'approved' || booking.status === 'preongoing' || booking.status === 'ongoing') && (
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-200"
                            onClick={() => openCancelModal(booking)}
                            disabled={updateLoading}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalBookingsCount > 0 && (
          <div className="flex flex-wrap justify-between items-center mt-6 p-4 bg-gray-50 rounded-lg shadow-inner">
            <div className="text-sm text-gray-600 mb-2 md:mb-0">
              Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalBookingsCount)} of {totalBookingsCount} bookings
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading || searchLoading}
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading || searchLoading}
              >
                Next
              </button>
            </div>
            <div className="w-full md:w-auto mt-2 md:mt-0">
              <select
                className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white text-gray-700 px-3 py-2 rounded-lg text-sm w-full md:w-auto transition-all duration-200"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page when items per page changes
                }}
                disabled={loading || searchLoading}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        )}
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
            <div className="mb-4">
              <label htmlFor="vehicle-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Vehicle:
              </label>
              <select
                id="vehicle-select"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                disabled={updateLoading}
              >
                <option value="">-- Select a Vehicle --</option>
                {availableVehicles
                  .filter(v =>
                    (!selectedBookingForApproval.min_seats || v.no_of_seats >= selectedBookingForApproval.min_seats)
                  )
                  .map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.model} ({vehicle.registration_no}) - {vehicle.no_of_seats} seats
                    </option>
                  ))}
              </select>
            </div>
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
                onClick={handleAcceptBooking}
                disabled={updateLoading}
              >
                {updateLoading ? 'Approving...' : 'Approve Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && selectedBookingForCancellation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <h3 className="text-lg font-bold mb-4">
              Cancel Booking <span className="break-all">{selectedBookingForCancellation.id}</span>
            </h3>
            <p className="mb-4 text-gray-700">
              Are you sure you want to cancel this booking? This action cannot be undone.
              Please review our <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terms and Conditions</a> for more details on cancellation policies.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors duration-150"
                onClick={closeCancelModal}
                disabled={updateLoading}
              >
                No, Keep Booking
              </button>
              <button
                className={`${updateLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-md transition-colors duration-150`}
                onClick={handleConfirmCancel}
                disabled={updateLoading}
              >
                {updateLoading ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Tracking Link Modal */}
      {showDriverTrackingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Driver Assigned Successfully!</h3>
              <p className="mt-2 text-sm text-gray-500">
                The driver {notifiedDriverDetails?.name} has been assigned. Share this tracking link with them to start the trip.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-md mb-6 break-all border border-gray-200">
              <p className="text-sm font-mono text-blue-600 text-center select-all cursor-pointer" onClick={() => {
                navigator.clipboard.writeText(generatedTrackingLink);
                toast.success('Link copied to clipboard!');
              }}>
                {generatedTrackingLink}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors duration-150 font-medium"
                onClick={() => {
                  navigator.clipboard.writeText(generatedTrackingLink);
                  toast.success('Link copied to clipboard!');
                }}
              >
                Copy Link
              </button>
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md transition-colors duration-150 font-medium"
                onClick={() => setShowDriverTrackingModal(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
                (In a real app, an SMS with this link would be sent to {notifiedDriverDetails?.phone})
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
