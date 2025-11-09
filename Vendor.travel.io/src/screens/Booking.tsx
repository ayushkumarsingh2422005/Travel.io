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

  const [showApproveModal, setShowApproveModal] = useState<boolean>(false);
  const [selectedBookingForApproval, setSelectedBookingForApproval] = useState<BookingData | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>(''); // New state
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);

  const fetchBookings = async (statusFilter: BookingData['status'] | '' = '') => {
    setLoading(true);
    try {
      let response;
      if (statusFilter === 'waiting') { // Use 'waiting' for pending requests
        response = await getPendingBookingRequests();
      } else {
        const params: { status?: BookingData['status'] } = {}; // Removed bookingId from params
        if (statusFilter) {
          params.status = statusFilter as BookingData['status'];
        }
        response = await getVendorBookings(params); // Fetch all bookings for the selected status
      }
      setBookings(response.data.bookings); // Store all fetched bookings
      toast.success('Bookings loaded successfully!'); // Success toast
    } catch (err: any) {
      console.error('Error fetching vendor bookings:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch bookings. Please try again.'); // Error toast
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await getVendorDrivers();
      setDrivers(response.data.drivers);
      toast.success('Drivers loaded successfully!'); // Success toast
    } catch (err) {
      console.error('Error fetching drivers:', err);
      toast.error('Failed to fetch drivers.'); // Error toast
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await getVendorVehicles();
      setAvailableVehicles(response.data.vehicles);
      toast.success('Vehicles loaded successfully!'); // Success toast
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      toast.error('Failed to fetch vehicles.'); // Error toast
    }
  };

  useEffect(() => {
    const fetchAndSetBookings = async () => {
      setLoading(true);
      try {
        let response;
        if (selectedStatus === 'waiting') {
          response = await getPendingBookingRequests();
        } else {
          const params: { status?: BookingData['status'] } = {};
          if (selectedStatus) {
            params.status = selectedStatus as BookingData['status'];
          }
          response = await getVendorBookings(params);
        }
        setBookings(response.data.bookings); // Store all fetched bookings without immediate filtering
        toast.success('Bookings updated successfully!'); // Success toast
      } catch (err: any) {
        console.error('Error fetching vendor bookings:', err);
        toast.error(err.response?.data?.message || 'Failed to fetch bookings. Please try again.'); // Error toast
      } finally {
        setLoading(false);
      }
    };

    fetchAndSetBookings();
    fetchDrivers();
    fetchVehicles(); // Fetch vehicles on component mount
  }, [selectedStatus]); // Only re-fetch when selectedStatus changes

  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      let fetchedBookings: BookingData[] = [];
      if (selectedStatus === 'waiting') {
        const response = await getPendingBookingRequests();
        fetchedBookings = response.data.bookings;
      } else {
        const params: { status?: BookingData['status'], bookingId?: string } = {};
        if (selectedStatus) {
          params.status = selectedStatus as BookingData['status'];
        }
        // Only pass bookingId to backend if searchText is not empty, otherwise fetch all for status
        if (searchText) {
          params.bookingId = searchText;
        }
        const response = await getVendorBookings(params);
        fetchedBookings = response.data.bookings;
      }
      // Apply client-side filters to the fetched bookings
      setBookings(getFilteredBookings(fetchedBookings));
      toast.success('Search completed successfully!'); // Success toast
    } catch (err: any) {
      console.error('Error searching vendor bookings:', err);
      toast.error(err.response?.data?.message || 'Failed to search bookings. Please try again.'); // Error toast
    } finally {
      setSearchLoading(false);
    }
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
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b w-[100px]">Cab Category / Vehicle Model</th>
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
                    selectedBookingForApproval.min_seats && v.no_of_seats >= selectedBookingForApproval.min_seats &&
                    selectedBookingForApproval.max_seats && v.no_of_seats <= selectedBookingForApproval.max_seats
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
    </div>
  );
};

export default Booking;
