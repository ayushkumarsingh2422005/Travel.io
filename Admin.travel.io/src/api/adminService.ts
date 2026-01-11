import axios from 'axios';

const API_URL = 'http://localhost:5000/admin'; // Assuming your backend runs on port 5000

// DASHBOARD MANAGEMENT 

export const getAdminDashboardData = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    throw error;
  }
};

export const getFinancialAnalytics = async (token: string, period: 'month' | 'week' | 'year' = 'month') => {
  try {
    const response = await axios.get(`${API_URL}/financial-analytics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { period },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching financial analytics:', error);
    throw error;
  }
};

export const getPendingVendorPayments = async (token: string, page: number = 1, limit: number = 10) => {
  try {
    const response = await axios.get(`${API_URL}/pending-vendor-payments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page, limit },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching pending vendor payments:', error);
    throw error;
  }
};

export const getPendingPartnerPayments = async (token: string, page: number = 1, limit: number = 10) => {
  try {
    const response = await axios.get(`${API_URL}/pending-partner-payments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page, limit },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching pending partner payments:', error);
    throw error;
  }
};

export const payVendor = async (token: string, booking_id: string, vendor_id: string, amount: number, payment_method: string = 'bank_transfer', notes?: string) => {
  try {
    const response = await axios.post(`${API_URL}/pay-vendor`, {
      booking_id,
      vendor_id,
      amount,
      payment_method,
      notes,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error paying vendor:', error);
    throw error;
  }
};

export const payPartner = async (token: string, transaction_id: string, partner_id: string, amount: number, payment_method: string = 'bank_transfer', notes?: string) => {
  try {
    const response = await axios.post(`${API_URL}/pay-partner`, {
      transaction_id,
      partner_id,
      amount,
      payment_method,
      notes,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error paying partner:', error);
    throw error;
  }
};

export const getAllPayments = async (token: string, page: number = 1, limit: number = 10, type?: string, status?: string, start_date?: string, end_date?: string) => {
  try {
    const response = await axios.get(`${API_URL}/all-payments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page, limit, type, status, start_date, end_date },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all payments:', error);
    throw error;
  }
};

// ==================== VENDOR MANAGEMENT ====================

export const getAllVendors = async (token: string, page: number = 1, limit: number = 10, status?: string, search?: string) => {
  try {
    const response = await axios.get(`${API_URL}/vendors`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page, limit, status, search },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all vendors:', error);
    throw error;
  }
};

export const getVendorDetails = async (token: string, vendorId: string) => {
  try {
    const response = await axios.get(`${API_URL}/vendors/${vendorId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    throw error;
  }
};

export const toggleVendorStatus = async (token: string, vendorId: string, is_active: boolean) => {
  try {
    const response = await axios.put(`${API_URL}/vendors/${vendorId}/status`, { is_active }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling vendor status:', error);
    throw error;
  }
};

export const applyVendorPenalty = async (token: string, vendorId: string, penalty_amount: number, penalty_reason: string) => {
  try {
    const response = await axios.post(`${API_URL}/vendors/${vendorId}/penalty`, { penalty_amount, penalty_reason }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error applying vendor penalty:', error);
    throw error;
  }
};

export const suspendVendor = async (token: string, vendorId: string, suspended: boolean, suspension_reason?: string, suspension_until?: string) => {
  try {
    const response = await axios.put(`${API_URL}/vendors/${vendorId}/suspend`, { suspended, suspension_reason, suspension_until }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error suspending vendor:', error);
    throw error;
  }
};

export const getVendorBookings = async (token: string, vendorId: string, page: number = 1, limit: number = 20, status?: string, start_date?: string, end_date?: string) => {
  try {
    const response = await axios.get(`${API_URL}/vendors/${vendorId}/bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page, limit, status, start_date, end_date },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching vendor bookings:', error);
    throw error;
  }
};

// ==================== DRIVER MANAGEMENT ====================

export const getAllDrivers = async (token: string, page: number = 1, limit: number = 10, status?: string, vendor_id?: string, search?: string) => {
  try {
    const response = await axios.get(`${API_URL}/drivers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page, limit, status, vendor_id, search },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all drivers:', error);
    throw error;
  }
};

export const toggleDriverStatus = async (token: string, driverId: string, is_active: boolean) => {
  try {
    const response = await axios.put(`${API_URL}/drivers/${driverId}/status`, { is_active }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling driver status:', error);
    throw error;
  }
};

// ==================== USER/CLIENT MANAGEMENT ====================

export const getAllUsers = async (token: string, page: number = 1, limit: number = 10, verified?: 'phone' | 'profile', search?: string) => {
  try {
    const response = await axios.get(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page, limit, verified, search },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

export const getUserDetails = async (token: string, userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

export const updateUserData = async (token: string, userId: string, userData: { name?: string; email?: string; phone?: string; is_phone_verified?: boolean; is_profile_completed?: boolean }) => {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};

export const deleteUser = async (token: string, userId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// ==================== STATISTICS & ANALYTICS ====================

export const getAnnualBookingsStats = async (token: string, year?: number) => {
  try {
    const response = await axios.get(`${API_URL}/stats/annual-bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { year },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching annual bookings statistics:', error);
    throw error;
  }
};

export const getWebsiteReachStats = async (token: string, period: 'week' | 'month' | 'year' = 'year') => {
  try {
    const response = await axios.get(`${API_URL}/stats/website-reach`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { period },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching website reach statistics:', error);
    throw error;
  }
};

export const getAdminStats = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching comprehensive admin statistics:', error);
    throw error;
  }
};

// ==================== CAB CATEGORY MANAGEMENT ====================

export const getCabCategories = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/cab-categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.cab_categories; // Note: Controller returns { success: true, count: n, cab_categories: [...] }
  } catch (error) {
    console.error('Error fetching cab categories:', error);
    throw error;
  }
};

export const getCabCategory = async (token: string, id: string) => {
  try {
    const response = await axios.get(`${API_URL}/cab-categories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.cab_category;
  } catch (error) {
    console.error('Error fetching cab category:', error);
    throw error;
  }
};

export const addCabCategory = async (token: string, data: any) => {
  try {
    const response = await axios.post(`${API_URL}/cab-categories`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding cab category:', error);
    throw error;
  }
};

export const updateCabCategory = async (token: string, id: string, data: any) => {
  try {
    const response = await axios.put(`${API_URL}/cab-categories/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating cab category:', error);
    throw error;
  }
};

export const deleteCabCategory = async (token: string, id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/cab-categories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting cab category:', error);
    throw error;
  }
};

// ==================== VEHICLE MANAGEMENT ====================

export const getAllVehicles = async (token: string, page: number = 1, limit: number = 10, status?: string, vendorId?: string, search?: string) => {
  try {
    const response = await axios.get(`${API_URL}/vehicles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page, limit, status, vendorId, search },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all vehicles:', error);
    throw error;
  }
};

export const toggleVehicleStatus = async (token: string, vehicleId: string, is_active: boolean) => {
  try {
    const response = await axios.put(`${API_URL}/vehicles/${vehicleId}/status`, { is_active }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling vehicle status:', error);
    throw error;
  }
};

