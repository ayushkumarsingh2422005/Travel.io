import axios from 'axios';

const API_URL = 'http://localhost:5000/admin'; // Assuming your backend runs on port 5000

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
