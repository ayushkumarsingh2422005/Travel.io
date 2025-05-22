import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface PartnerInfo {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessAddress: string;
  city: string;
  joinDate: string;
  partnershipType: 'Premium' | 'Standard' | 'Basic';
  partnershipStatus: 'Active' | 'Pending' | 'Suspended';
  businessMetrics: {
    totalTrips: number;
    activeTrips: number;
    totalEarnings: number;
    averageRating: number;
    customerSatisfaction: number;
  };
  kycStatus: 'Verified' | 'Pending' | 'Incomplete';
  accountDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
  documents: {
    type: string;
    status: 'Valid' | 'Expired' | 'Awaited';
    expiryDate: string;
    documentUrl: string;
  }[];
  businessCategories: string[];
  serviceAreas: string[];
}

const PartnerProfile: React.FC = () => {
  const [partnerData, setPartnerData] = useState<PartnerInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [editedData, setEditedData] = useState<Partial<PartnerInfo>>({});

  useEffect(() => {
    const fetchPartnerData = async () => {
      setLoading(true);
      try {
        // Simulate API call with mock data
        setTimeout(() => {
          setPartnerData(mockPartnerData);
          setEditedData(mockPartnerData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching partner data:', error);
        setLoading(false);
      }
    };

    fetchPartnerData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = () => {
    if (partnerData) {
      setPartnerData({
        ...partnerData,
        ...editedData
      });
    }
    setIsEditing(false);
  };

  const getDocStatusClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'awaited': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKycStatusClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'incomplete': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        {/* Profile Header Skeleton */}
        <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 shadow-lg p-8 mb-8 text-white relative overflow-hidden">
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-32 h-32 rounded-full bg-white p-2 flex-shrink-0 animate-pulse" />
            <div className="flex-1 text-center md:text-left">
              <div className="h-8 w-48 bg-green-200 rounded mb-2 animate-pulse" />
              <div className="h-5 w-32 bg-green-100 rounded mb-1 animate-pulse" />
              <div className="h-5 w-32 bg-green-100 rounded mb-1 animate-pulse" />
              <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                <div className="h-6 w-24 bg-green-100 rounded-full animate-pulse" />
                <div className="h-6 w-32 bg-green-100 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="h-10 w-32 bg-white/20 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-white/20 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 px-4 md:px-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
              <div className="h-6 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-10 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-16 bg-green-100 rounded" />
            </div>
          ))}
        </div>
        {/* Tabs Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm mx-4 md:mx-6 mb-6">
          <div className="flex overflow-x-auto space-x-1 p-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-10 w-32 bg-green-50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
        {/* Tab Content Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm mx-4 md:mx-6 mb-8 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-xl animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-6 w-32 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!partnerData) {
    return (
      <div className="w-full p-6 bg-white rounded-xl shadow-md">
        <p className="text-center text-gray-500">No partner information found.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 shadow-lg p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGMwLTIuMjA5IDEuNzkxLTQgNC00czQgMS43OTEgNCA0LTEuNzkxIDQtNCA0LTQtMS43OTEtNC00eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvZz48L3N2Zz4=')] opacity-10"></div>
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 rounded-full bg-white p-2 flex-shrink-0 transform hover:scale-105 transition-transform duration-300 shadow-xl">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight">{partnerData.businessName}</h1>
            <p className="text-green-100 mt-2 text-lg">{partnerData.email}</p>
            <p className="text-green-100 text-lg">{partnerData.phone}</p>
            
            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getKycStatusClass(partnerData.kycStatus)}`}>
                KYC: {partnerData.kycStatus}
              </span>
              <span className="px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-semibold shadow-sm">
                Member since {new Date(partnerData.joinDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              to="/dashboard"
              className="px-6 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" />
              </svg>
              Dashboard
            </Link>
            
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 px-4 md:px-6">
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Trips</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{partnerData.businessMetrics.totalTrips}</p>
              <p className="text-green-600 text-sm mt-1">+12 this month</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Trips</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{partnerData.businessMetrics.activeTrips}</p>
              <p className="text-green-600 text-sm mt-1">85% utilization</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Average Rating</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{partnerData.businessMetrics.averageRating}/5</p>
              <p className="text-blue-600 text-sm mt-1">+0.2 this week</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Earnings</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">₹{partnerData.businessMetrics.totalEarnings.toLocaleString()}</p>
              <p className="text-green-600 text-sm mt-1">+18% vs last month</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl shadow-sm mx-4 md:mx-6 mb-6">
        <div className="flex overflow-x-auto space-x-1 p-2">
          <button 
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === 'profile' 
                ? 'bg-green-50 text-green-700 shadow-sm' 
                : 'hover:bg-gray-50 text-gray-600'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Details
          </button>
          <button 
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === 'documents' 
                ? 'bg-green-50 text-green-700 shadow-sm' 
                : 'hover:bg-gray-50 text-gray-600'
            }`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
          <button 
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === 'bankDetails' 
                ? 'bg-green-50 text-green-700 shadow-sm' 
                : 'hover:bg-gray-50 text-gray-600'
            }`}
            onClick={() => setActiveTab('bankDetails')}
          >
            Bank Details
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm mx-4 md:mx-6 mb-8">
        {activeTab === 'profile' && (
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Profile Information</h2>
            
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Business Name</label>
                  <input
                    type="text"
                    name="businessName"
                    value={editedData.businessName || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                  <input
                    type="text"
                    name="ownerName"
                    value={editedData.ownerName || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={editedData.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editedData.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    value={editedData.city || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all bg-gray-50"
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Business Address</label>
                  <input
                    type="text"
                    name="businessAddress"
                    value={editedData.businessAddress || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all bg-gray-50"
                  />
                </div>
                
                <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-gray-50 p-4 md:p-6 rounded-xl">
                  <p className="text-sm font-medium text-gray-500">Business Name</p>
                  <p className="text-base md:text-lg text-gray-800 mt-1 md:mt-2">{partnerData.businessName}</p>
                </div>
                
                <div className="bg-gray-50 p-4 md:p-6 rounded-xl">
                  <p className="text-sm font-medium text-gray-500">Owner Name</p>
                  <p className="text-base md:text-lg text-gray-800 mt-1 md:mt-2">{partnerData.ownerName}</p>
                </div>
                
                <div className="bg-gray-50 p-4 md:p-6 rounded-xl">
                  <p className="text-sm font-medium text-gray-500">Email Address</p>
                  <p className="text-base md:text-lg text-gray-800 mt-1 md:mt-2">{partnerData.email}</p>
                </div>
                
                <div className="bg-gray-50 p-4 md:p-6 rounded-xl">
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-base md:text-lg text-gray-800 mt-1 md:mt-2">{partnerData.phone}</p>
                </div>
                
                <div className="bg-gray-50 p-4 md:p-6 rounded-xl">
                  <p className="text-sm font-medium text-gray-500">City</p>
                  <p className="text-base md:text-lg text-gray-800 mt-1 md:mt-2">{partnerData.city}</p>
                </div>
                
                <div className="md:col-span-2 bg-gray-50 p-4 md:p-6 rounded-xl">
                  <p className="text-sm font-medium text-gray-500">Business Address</p>
                  <p className="text-base md:text-lg text-gray-800 mt-1 md:mt-2">{partnerData.businessAddress}</p>
                </div>

                <div className="md:col-span-2 bg-gray-50 p-4 md:p-6 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-3 md:mb-4">Business Categories</p>
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {partnerData.businessCategories.map((category, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 bg-gray-50 p-4 md:p-6 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-3 md:mb-4">Service Areas</p>
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {partnerData.serviceAreas.map((area, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Documents</h2>
              <button className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Upload Document
              </button>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 sm:p-4 text-left text-sm font-semibold text-gray-600">Document Type</th>
                    <th className="p-3 sm:p-4 text-left text-sm font-semibold text-gray-600">Status</th>
                    <th className="p-3 sm:p-4 text-left text-sm font-semibold text-gray-600">Expiry Date</th>
                    <th className="p-3 sm:p-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {partnerData.documents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 sm:p-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2 sm:gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p>No documents found. Upload your first document to get started.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    partnerData.documents.map((doc, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-1 sm:p-2 bg-gray-100 rounded-lg">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-sm sm:text-base">{doc.type}</div>
                              <div className="text-xs sm:text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${getDocStatusClass(doc.status)}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-gray-600 text-sm sm:text-base">
                          {doc.expiryDate || "—"}
                        </td>
                        <td className="p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md">
                              View
                            </button>
                            <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 text-gray-700 rounded-lg text-xs sm:text-sm hover:bg-gray-200 transition-colors shadow-sm hover:shadow-md">
                              Replace
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bankDetails' && (
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Bank Account Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-sm font-medium text-gray-500">Bank Name</p>
                <p className="text-lg text-gray-800 mt-2">{partnerData.accountDetails.bankName}</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-sm font-medium text-gray-500">Account Number</p>
                <p className="text-lg text-gray-800 mt-2 font-mono">
                  {partnerData.accountDetails.accountNumber.replace(/\d(?=\d{4})/g, "•")}
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-sm font-medium text-gray-500">IFSC Code</p>
                <p className="text-lg text-gray-800 mt-2 font-mono">{partnerData.accountDetails.ifscCode}</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-sm font-medium text-gray-500">Account Holder Name</p>
                <p className="text-lg text-gray-800 mt-2">{partnerData.accountDetails.accountHolderName}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-6 mt-8">
              <button className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Update Bank Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock data for demonstration
const mockPartnerData: PartnerInfo = {
  id: "P001",
  businessName: "Travel Solutions Pro",
  ownerName: "Rajesh Kumar",
  email: "rajesh@travelsolutionspro.com",
  phone: "+91 98765 43210",
  businessAddress: "123 Business Park, Sector 15",
  city: "Delhi",
  joinDate: "2023-01-15",
  partnershipType: "Premium",
  partnershipStatus: "Active",
  businessMetrics: {
    totalTrips: 156,
    activeTrips: 8,
    totalEarnings: 1250000,
    averageRating: 4.8,
    customerSatisfaction: 95
  },
  kycStatus: "Verified",
  accountDetails: {
    bankName: "HDFC Bank",
    accountNumber: "1234567890123456",
    ifscCode: "HDFC0001234",
    accountHolderName: "Travel Solutions Pro"
  },
  documents: [
    {
      type: "Business License",
      status: "Valid",
      expiryDate: "2025-12-31",
      documentUrl: "/documents/license.pdf"
    },
    {
      type: "GST Certificate",
      status: "Valid",
      expiryDate: "2024-03-31",
      documentUrl: "/documents/gst.pdf"
    },
    {
      type: "Insurance Policy",
      status: "Awaited",
      expiryDate: "N/A",
      documentUrl: "/documents/insurance.pdf"
    }
  ],
  businessCategories: [
    "Corporate Travel",
    "Airport Transfers",
    "Tour Packages",
    "Wedding Services"
  ],
  serviceAreas: [
    "Delhi NCR",
    "Gurgaon",
    "Noida",
    "Faridabad"
  ]
};

export default PartnerProfile; 