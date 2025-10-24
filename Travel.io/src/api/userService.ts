import customerAxios from './customerAxios';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  profile_pic: string;
  is_phone_verified: boolean;
  is_profile_completed: boolean;
  gender: 'Male' | 'Female' | 'Other' | 'Select Gender';
  age: number;
  current_address: string;
  amount_spent: number;
  created_at: string;
  updated_at: string;
  google_id?: string;
  auth_provider: 'local' | 'google';
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  user: UserProfile;
}

export const getUserProfile = async (): Promise<UserProfileResponse> => {
  const response = await customerAxios.get('/user/profile');
  return response.data;
};

export const updateProfile = async (profileData: Partial<UserProfile>): Promise<UserProfileResponse> => {
  const response = await customerAxios.put('/user/profile', profileData);
  return response.data;
};

export const sendPhoneOtp = async (): Promise<{ success: boolean; message: string }> => {
  const response = await customerAxios.post('/user/auth/send-phone-otp');
  return response.data;
};

export const verifyPhoneOtp = async (otp: string): Promise<{ success: boolean; message: string }> => {
  const response = await customerAxios.post('/user/auth/verify-phone-otp', { otp });
  return response.data;
};

export const addPhoneNumber = async (phone: string): Promise<{ success: boolean; message: string }> => {
  const response = await customerAxios.post('/user/auth/add-phone', { phone });
  return response.data;
};
