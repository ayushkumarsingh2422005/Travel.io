import axios from '../api/axios';

interface AuthResponse {
    success: boolean;
    message: string;
}

export const checkAuth = async (type:string,token:string | null): Promise<boolean> => {
  // const token = localStorage.getItem(`marcocabs_${type}_token`) ;

  if (!token) {
    console.log('No token found');
    return false;
  }

  try {
   const response = await axios.get(`/auth/verifytoken`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});

// console.log('Auth response:', response);


     return response.data.success;
  } catch (error) {
    console.error('Auth failed:', error);
    localStorage.removeItem('marcocabs_vendor_token');
    localStorage.removeItem('marcocabs_customer_token');
    return false;
  }
};
