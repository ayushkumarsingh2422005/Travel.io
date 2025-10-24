import axios from 'axios';


// Create a separate axios instance for vendor booking API calls
const vendorBookingAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in headers
vendorBookingAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('marcocabs_vendor_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
vendorBookingAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('marcocabs_vendor_token');
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export interface BookingData {
  id: string;
  customer_id: string;
  vehicle_id: string;
  driver_id: string | null;
  vendor_id: string;
  partner_id: string | null;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  drop_date: string;
  price: number;
  path: string;
  distance: number;
  status: 'waiting' | 'approved' | 'preongoing' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  vehicle_model: string;
  vehicle_registration: string;
  vehicle_image: string;
  driver_name: string | null;
  driver_phone: string | null;
  partner_name: string | null;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
}

export interface BookingListResponse {
  success: boolean;
  message: string;
  data: {
    bookings: BookingData[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}

export interface BookingDetailsResponse {
  success: boolean;
  message: string;
  data: BookingData & {
    customer_email: string;
    vehicle_image?: string;
    per_km_charge: number;
    vendor_email: string;
  };
}

export interface VendorProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  profile_pic: string | null;
  age: number;
  current_address: string;
  description: string | null;
  amount: number; // Wallet balance
  total_earnings: number;
  star_rating: number;
  is_phone_verified: number;
  is_email_verified: number;
  is_profile_completed: number;
  aadhar_number: string | null;
  is_aadhaar_verified: number;
  pan_number: string | null;
  is_pan_verified: number;
  created_at: string;
  updated_at: string;
}

export interface VendorProfileResponse {
  success: boolean;
  message: string;
  vendor: VendorProfileData;
}

// Get vendor's bookings
export const getVendorBookings = async (params?: {
  status?: BookingData['status'];
  bookingId?: string;
  page?: number;
  limit?: number;
}): Promise<BookingListResponse> => {
  const response = await vendorBookingAxios.get('/booking/vendor/my-bookings', { params });
  console.log('Vendor Bookings Response:', response.data);
  return response.data;
};

// Get single booking details for vendor
export const getVendorBookingDetails = async (bookingId: string): Promise<BookingDetailsResponse> => {
  const response = await vendorBookingAxios.get(`/booking/vendor/booking/${bookingId}`);
  return response.data;
};

// Update booking status (vendor only)
export const updateBookingStatus = async (
  bookingId: string,
  status: BookingData['status'],
  driver_id?: string | null // Updated type to allow null
): Promise<{ success: boolean; message: string; data: BookingData }> => {
  const payload: { status: BookingData['status']; driver_id?: string | null } = { status };
  if (driver_id !== undefined) {
    payload.driver_id = driver_id === '' ? null : driver_id;
  }
  const response = await vendorBookingAxios.put(`/booking/vendor/booking/${bookingId}/status`, payload);
  return response.data;
};

// Get vendor's drivers
export const getVendorDrivers = async (): Promise<{  data: { drivers: Driver[] } }> => {
  const response = await vendorBookingAxios.get('/vendor/driver'); // Corrected endpoint
  return response;
};

// Get vendor profile data
export const getVendorProfileData = async (): Promise<VendorProfileResponse> => {
  const response = await vendorBookingAxios.get('/vendor/profile');
  return response.data;
};

// Get vendor's trips (upcoming or completed)
export const getVendorTrips = async (type: 'upcoming' | 'completed', page: number = 1, limit: number = 10): Promise<BookingListResponse> => {
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

  let statusFilter: BookingData['status'][] = [];
  let dateFilter: 'before' | 'after' = 'after'; // Uncommented this line

  if (type === 'upcoming') {
    statusFilter = ['waiting', 'approved', 'preongoing', 'ongoing'];
    dateFilter = 'after'; // Pickup date after or on today
  } else { // completed
    statusFilter = ['completed', 'cancelled'];
    dateFilter = 'before'; // Pickup date before or on today
  }

  console.log(dateFilter);

  // The backend getVendorBookings API doesn't directly support date filtering or multiple statuses.
  // Since backend changes are not allowed, we will make multiple API calls for each status
  // and then combine and filter the results on the frontend.
  const allBookings: BookingData[] = [];
  let totalCount = 0;

  for (const status of statusFilter) {
    const response = await getVendorBookings({ page: 1, limit: 1000, status }); // Fetch all for this status to filter on frontend
    if (response.success) {
      allBookings.push(...response.data.bookings);
    }
  }

  // Frontend filtering by date
  const filteredBookings = allBookings.filter(booking => {
    const pickupDate = new Date(booking.pickup_date);
    const dropDate = new Date(booking.drop_date);
    const todayDate = new Date(today);

    // Normalize dates to start of day for accurate comparison
    pickupDate.setHours(0, 0, 0, 0);
    dropDate.setHours(0, 0, 0, 0);
    todayDate.setHours(0, 0, 0, 0);

    if (type === 'upcoming') {
      // For upcoming, pickup_date should be today or in the future
      return pickupDate >= todayDate;
    } else { // completed
      // For completed, drop_date should be today or in the past
      return dropDate <= todayDate;
    }
  });

  // Remove duplicates if any (e.g., if a booking status changes between calls)
  const uniqueBookings = Array.from(new Map(filteredBookings.map(booking => [booking.id, booking])).values());

  // Manually paginate the filtered results
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedBookings = uniqueBookings.slice(startIndex, endIndex);
  totalCount = uniqueBookings.length;

  return {
    success: true, // Assuming individual calls were successful, or handle errors more granularly
    message: 'Vendor trips retrieved successfully',
    data: {
      bookings: paginatedBookings,
      pagination: {
        current_page: page,
        per_page: limit,
        total: totalCount,
        total_pages: Math.ceil(totalCount / limit),
      },
    },
  };
};
