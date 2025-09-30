import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '../utils/verifytoken';

const UserAvatar: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('marcocabs_customer_token');
      if (token) {
        const result = await checkAuth('customer', token);
        setIsLoggedIn(result);
      }
      setLoading(false);
    };
    verifyUser();
  }, []);

  const handleAvatarClick = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse" />
    );
  }

  return (
    <div onClick={handleAvatarClick} className="cursor-pointer">
      {isLoggedIn ? (
        <img
          src="https://via.placeholder.com/40"
          alt="User Avatar"
          className="w-10 h-10 rounded-full"
        />
      ) : (
        <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white">
          G
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
