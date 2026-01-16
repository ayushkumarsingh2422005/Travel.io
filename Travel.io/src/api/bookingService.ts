import axios from 'axios';

// Create a separate axios instance for booking API calls
const bookingAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  // Add headers or auth tokens if needed
});

export interface BookingCreateRequest {
  cab_category_id: string;
  partner_id?: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  drop_date: string;
  path: string;
  distance: number;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    customer_id: string;
    vehicle_id: string | null;
    driver_id: string | null;
    vendor_id: string | null;
    partner_id?: string;
    cab_category_id: string;
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
    customer_email: string; // Added customer_email
    vehicle_model: string | null;
    vehicle_registration: string | null;
    vehicle_image: string | null; // Added vehicle_image
    no_of_seats: number | null;
    vendor_name: string | null;
    vendor_phone: string | null;
    vendor_email: string | null; // Added vendor_email
    partner_name?: string;
    driver_name?: string | null;
    driver_phone?: string | null;
    cab_category_name: string;
    cab_category_price_per_km: number;
    cab_category_image: string;
    min_seats: number; // Added min_seats
    max_seats: number; // Added max_seats
    per_km_charge: number | null; // Added per_km_charge
    booking_otp?: string;
    addons?: string[]; // Added addons array to track purchased addons
  };
}

export interface BookingListResponse {
  success: boolean;
  message: string;
  data: {
    bookings: BookingResponse['data'][];
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
  data: BookingResponse['data']; // Simplified as BookingResponse['data'] now contains all necessary fields
}

// Create a new booking
export const createBooking = async (bookingData: BookingCreateRequest): Promise<BookingResponse> => {
  const token = localStorage.getItem('marcocabs_customer_token');

  const response = await bookingAxios.post('/booking/user/create', bookingData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

// Get user's bookings
export const getUserBookings = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<BookingListResponse> => {
  const token = localStorage.getItem('marcocabs_customer_token');

  const response = await bookingAxios.get('/booking/user/my-bookings', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    params,
  });

  return response.data;
};

// Get booking details
export const getBookingDetails = async (bookingId: string): Promise<BookingDetailsResponse> => {
  const token = localStorage.getItem('marcocabs_customer_token');

  const response = await bookingAxios.get(`/booking/user/booking/${bookingId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.data;
};

// Cancel booking
export const cancelBooking = async (bookingId: string): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem('marcocabs_customer_token');

  const response = await bookingAxios.put(`/booking/user/booking/${bookingId}/cancel`, {}, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.data;
};
