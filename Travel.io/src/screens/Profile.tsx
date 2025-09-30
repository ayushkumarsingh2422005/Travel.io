import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  profile_pic: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  member_since: string;
  shop_name?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    setLoading(true);
    // Simulate API request
    setTimeout(() => {
      setProfile({
        name: 'Ayush Kumar Singh',
        email: 'ayush2422005@gmail.com',
        phone: '8299797516',
        profile_pic: 'https://ui-avatars.com/api/?name=Ayush+Kumar+Singh&background=6366f1&color=fff',
        is_email_verified: true,
        is_phone_verified: true,
        member_since: 'July 5, 2025',
        shop_name: 'Ayush Kumar'
      });
      setLoading(false);
    }, 1500);
  }, []);

  const handleVerifyEmail = () => {
    // Implement email verification logic
    console.log('Sending verification email...');
    toast('Verification email sent!');
  };

  const handleVerifyPhone = () => {
    // Implement phone verification logic
    console.log('Sending OTP to phone...');
    toast('OTP sent to your phone!');
  };

  const handleLogout = () => {
    // Implement logout logic
    toast.success('Logged out successfully!');
    navigate('/login');
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
              {profile?.is_email_verified ? (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Verified</span>
              ) : (
                <button 
                  onClick={handleVerifyEmail}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full hover:bg-indigo-200"
                >
                  Verify Now
                </button>
              )}
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
            <p className="text-gray-800">Member since {profile?.member_since}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
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
    </div>
  );
};

export default Profile;
