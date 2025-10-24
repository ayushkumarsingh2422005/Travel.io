import axios from '../api/axios';



export const checkAuth = async (type:string ,token:string | null): Promise<boolean> => {
  // const token = localStorage.getItem(`marcocabs_${type}_token`) ;

  if(type){
    console.log('type',type);
  }

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

interface DecodedUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

export const getUserDetailsFromToken = async (token: string | null): Promise<DecodedUser | null> => {
  if (!token) {
    console.log('No token found for user details');
    return null;
  }

  try {
    const response = await axios.get(`/auth/verifytoken`, { // Note: Using /user/auth/verifytoken as per backend routes
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (response.data.success) {
      return response.data.customer as DecodedUser;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Failed to get user details from token:', error);
    return null;
  }
};
