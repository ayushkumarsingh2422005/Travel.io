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
    <div className="flex flex-col min-h-screen">
      <div className="p-8 max-w-6xl mx-auto w-full flex-grow">
        <h1 className="text-2xl font-bold mb-8 text-gray-800">Profile Settings</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Overview */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500">
                  <img
                    src={profile?.profile_pic}
                    alt={profile?.name}
                    className="w-full h-full rounded-full border-4 border-white object-cover shadow-sm"
                  />
                </div>
                <div className="absolute bottom-1 right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-sm" title="Verified Account">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile?.name}</h2>
              <p className="text-indigo-600 font-medium mb-4">{profile?.shop_name || 'Travel Member'}</p>

              <div className="flex gap-2 w-full mt-2">
                <span className="flex-1 px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg border border-gray-100 font-medium py-2">
                  Member Since<br />
                  <span className="text-gray-900 text-sm">{profile?.created_at ? new Date(profile.created_at).getFullYear() : 'N/A'}</span>
                </span>
                <span className="flex-1 px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg border border-gray-100 font-medium py-2">
                  Status<br />
                  <span className="text-green-600 text-sm">Active</span>
                </span>
              </div>

              <div className="w-full mt-8 space-y-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:text-red-600 transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </span>
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Email Address</p>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 font-medium break-all">{profile?.email}</p>
                    <span className="ml-2 text-green-500 bg-green-50 p-1 rounded-full" title="Verified">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Phone Number</p>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 font-medium">+91 {profile?.phone}</p>
                    {profile?.is_phone_verified ? (
                      <span className="ml-2 text-green-500 bg-green-50 p-1 rounded-full" title="Verified">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </span>
                    ) : (
                      <button onClick={handleVerifyPhone} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 font-medium transition-colors">
                        Verify
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 md:col-span-2">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Current Address</p>
                  <p className="text-gray-900 font-medium">{profile?.current_address || 'No address added'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </span>
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Age</p>
                  <p className="text-gray-900 font-medium">{profile?.age} Years</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Gender</p>
                  <p className="text-gray-900 font-medium">{profile?.gender}</p>
                </div>
              </div>
            </div>
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
    </div>

  );
};

export default Profile;
