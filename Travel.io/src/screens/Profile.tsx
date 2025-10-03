import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  profile_pic: string;
  is_phone_verified: boolean;
  created_at: string;
  gender: 'Male' | 'Female' | 'Other' | 'Select Gender';
  age: number;
  current_address: string;
  shop_name?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Select Gender',
    age: '',
    current_address: '',
    phone: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('marcocabs_customer_token')}`,
          },
        });
        setProfile(response.data.user);
        setFormData({
          name: response.data.user.name,
          gender: response.data.user.gender,
          age: response.data.user.age.toString(),
          current_address: response.data.user.current_address,
          phone: response.data.user.phone,
        });
      } catch (error) {
        toast.error('Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleVerifyPhone = async () => {
    try {
      await axiosInstance.post('/auth/send-phone-otp', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('marcocabs_customer_token')}`,
        },
      });
      toast.success('OTP sent to your phone!');
      setIsOtpModalOpen(true);
    } catch (error) {
      toast.error('Failed to send OTP');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('marcocabs_customer_token');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (formData.phone !== profile?.phone) {
        await axiosInstance.post('/auth/add-phone', { phone: formData.phone }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('marcocabs_customer_token')}`,
          },
        });
      }
      const response = await axiosInstance.put('/profile', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('marcocabs_customer_token')}`,
        },
      });
      setProfile(response.data.user);
      toast.success('Profile updated successfully!');
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/auth/verify-phone-otp', { otp }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('marcocabs_customer_token')}`,
        },
      });
      setProfile((prevProfile) => ({
        ...prevProfile!,
        is_phone_verified: true,
      }));
      toast.success('Phone verified successfully!');
      setIsOtpModalOpen(false);
    } catch (error) {
      toast.error('Invalid or expired OTP');
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full" />
              <div className="h-6 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-64" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-100 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-gray-800">Profile Settings</h1>
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="text-gray-600 mb-8">Manage your account</div>
        
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img 
              src={profile?.profile_pic} 
              alt={profile?.name} 
              className="w-24 h-24 rounded-full border-4 border-indigo-500"
            />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold mt-4">{profile?.name}</h2>
          <p className="text-gray-500">{profile?.shop_name}</p>
        </div>

        {/* Verification Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Email Card */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-600">Email</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Verified</span>
            </div>
            <p className="text-gray-800 break-all">{profile?.email}</p>
          </div>

          {/* Phone Card */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-600">Phone</span>
              {profile?.is_phone_verified ? (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Verified</span>
              ) : (
                <button 
                  onClick={handleVerifyPhone}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full hover:bg-indigo-200"
                >
                  Verify Now
                </button>
              )}
            </div>
            <p className="text-gray-800">+91 {profile?.phone}</p>
          </div>

          {/* Account Status Card */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-600">Account</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Approved</span>
            </div>
            <p className="text-gray-800">Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Edit Profile
          </button>
          <button 
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-700">Phone</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="gender" className="block text-gray-700">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option>Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="age" className="block text-gray-700">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="current_address" className="block text-gray-700">Current Address</label>
                <input
                  type="text"
                  id="current_address"
                  name="current_address"
                  value={formData.current_address}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isOtpModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Verify Phone</h2>
            <form onSubmit={handleOtpSubmit}>
              <div className="mb-4">
                <label htmlFor="otp" className="block text-gray-700">OTP</label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsOtpModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
