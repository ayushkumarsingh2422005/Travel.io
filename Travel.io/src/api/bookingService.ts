import axios from 'axios';

// Create a separate axios instance for booking API calls
const bookingAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  // Add headers or auth tokens if needed
});

export interface BookingCreateRequest {
  vehicle_id: string;
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
    vehicle_id: string;
    vendor_id: string;
    partner_id?: string;
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
    vehicle_model: string;
    vehicle_registration: string;
    no_of_seats: number;
    vendor_name: string;
    vendor_phone: string;
    partner_name?: string;
    driver_name?: string;
    driver_phone?: string;
    driver_id?: string;
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
  data: BookingResponse['data'] & {
    customer_email: string;
    vehicle_image?: string;
    per_km_charge: number;
    vendor_email: string;
  };
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
