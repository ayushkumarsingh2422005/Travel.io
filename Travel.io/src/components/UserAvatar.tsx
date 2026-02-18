import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '../utils/verifytoken';
import { getUserProfile, UserProfile } from '../api/userService';

const UserAvatar: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('marcocabs_customer_token');
      if (token) {
        const result = await checkAuth('customer', token);
        setIsLoggedIn(result);
        if (result) {
          try {
            const profileResponse = await getUserProfile();
            setUser(profileResponse.user);
          } catch (error) {
            console.error("Failed to fetch user profile", error);
          }
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, []);

  const handleAvatarClick = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse" />
    );
  }

  return (
    <div onClick={handleAvatarClick} className="cursor-pointer relative group">
      {isLoggedIn && user ? (
        user.profile_pic ? (
          <img
            src={`http://localhost:5000${user.profile_pic}`}
            alt={user.name || "User"}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:shadow-md transition-shadow"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + (user.name || "User") + "&background=random";
            }}
          />
        ) : (
          <img
            src={`https://ui-avatars.com/api/?name=${user.name || "User"}&background=random`}
            alt={user.name || "User"}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:shadow-md transition-shadow"
          />
        )
      ) : (
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
