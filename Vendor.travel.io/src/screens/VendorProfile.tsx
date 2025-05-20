import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface VendorInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  joinDate: string;
  totalCars: number;
  activeCars: number;
  totalDrivers: number;
  totalEarnings: number;
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
}

const VendorProfile: React.FC = () => {
  const [vendorInfo, setVendorInfo] = useState<VendorInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [editedInfo, setEditedInfo] = useState<Partial<VendorInfo>>({});

  useEffect(() => {
    // Simulate fetching vendor data
    const fetchVendorData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be replaced with an API call
        // const response = await fetch('/api/vendor/profile');
        // const data = await response.json();
        
        // Using mock data for demonstration
        setTimeout(() => {
          setVendorInfo(mockVendorData);
          setEditedInfo(mockVendorData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching vendor data:', error);
        setLoading(false);
      }
    };

    fetchVendorData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = () => {
    // In a real app, this would be replaced with an API call to update the profile
    // const updateProfile = async () => {
    //   const response = await fetch('/api/vendor/profile', {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(editedInfo)
    //   });
    //   if (response.ok) {
    //     const data = await response.json();
    //     setVendorInfo(data);
    //   }
    // };
    
    setVendorInfo(prev => ({ ...prev, ...editedInfo } as VendorInfo));
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
      <div className="w-full h-64 flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!vendorInfo) {
    return (
      <div className="w-full p-6 bg-white rounded-xl shadow-md">
        <p className="text-center text-gray-500">No vendor information found.</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight">{vendorInfo.name}</h1>
            <p className="text-green-100 mt-2 text-lg">{vendorInfo.email}</p>
            <p className="text-green-100 text-lg">{vendorInfo.phone}</p>
            
            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getKycStatusClass(vendorInfo.kycStatus)}`}>
                KYC: {vendorInfo.kycStatus}
              </span>
              <span className="px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-semibold shadow-sm">
                Member since {new Date(vendorInfo.joinDate).toLocaleDateString()}
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
              <p className="text-gray-500 text-sm font-medium">Total Cars</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{vendorInfo.totalCars}</p>
              <p className="text-green-600 text-sm mt-1">+2 this month</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Cars</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{vendorInfo.activeCars}</p>
              <p className="text-green-600 text-sm mt-1">80% utilization</p>
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
              <p className="text-gray-500 text-sm font-medium">Total Drivers</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{vendorInfo.totalDrivers}</p>
              <p className="text-blue-600 text-sm mt-1">+1 this week</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Earnings</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">₹{vendorInfo.totalEarnings.toLocaleString()}</p>
              <p className="text-green-600 text-sm mt-1">+15% vs last month</p>
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
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editedInfo.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={editedInfo.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={editedInfo.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    value={editedInfo.city || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all bg-gray-50"
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={editedInfo.address || ''}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-lg text-gray-800 mt-2">{vendorInfo.name}</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="text-sm font-medium text-gray-500">Email Address</p>
                  <p className="text-lg text-gray-800 mt-2">{vendorInfo.email}</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-lg text-gray-800 mt-2">{vendorInfo.phone}</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="text-sm font-medium text-gray-500">City</p>
                  <p className="text-lg text-gray-800 mt-2">{vendorInfo.city}</p>
                </div>
                
                <div className="md:col-span-2 bg-gray-50 p-6 rounded-xl">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-lg text-gray-800 mt-2">{vendorInfo.address}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
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
                    <th className="p-4 text-left text-sm font-semibold text-gray-600">Document Type</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-600">Status</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-600">Expiry Date</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vendorInfo.documents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p>No documents found. Upload your first document to get started.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    vendorInfo.documents.map((doc, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{doc.type}</div>
                              <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDocStatusClass(doc.status)}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">
                          {doc.expiryDate || "—"}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md">
                              View
                            </button>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors shadow-sm hover:shadow-md">
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
                <p className="text-lg text-gray-800 mt-2">{vendorInfo.accountDetails.bankName}</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-sm font-medium text-gray-500">Account Number</p>
                <p className="text-lg text-gray-800 mt-2 font-mono">
                  {vendorInfo.accountDetails.accountNumber.replace(/\d(?=\d{4})/g, "•")}
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-sm font-medium text-gray-500">IFSC Code</p>
                <p className="text-lg text-gray-800 mt-2 font-mono">{vendorInfo.accountDetails.ifscCode}</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-sm font-medium text-gray-500">Account Holder Name</p>
                <p className="text-lg text-gray-800 mt-2">{vendorInfo.accountDetails.accountHolderName}</p>
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

// Mock data for the vendor profile
const mockVendorData: VendorInfo = {
  "id": "VEN123456",
  "name": "Priya Transport Services",
  "email": "priya.transport@example.com",
  "phone": "+91 98765 43210",
  "address": "123, Main Street, Commercial Area",
  "city": "Mumbai",
  "joinDate": "2022-08-15",
  "totalCars": 5,
  "activeCars": 4,
  "totalDrivers": 6,
  "totalEarnings": 356000,
  "kycStatus": "Verified",
  "accountDetails": {
    "bankName": "HDFC Bank",
    "accountNumber": "1234567890123456",
    "ifscCode": "HDFC0001234",
    "accountHolderName": "Priya Transport Services"
  },
  "documents": [
    {
      "type": "Business Registration",
      "status": "Valid",
      "expiryDate": "2025-05-15",
      "documentUrl": "/documents/business-registration.pdf"
    },
    {
      "type": "GST Certificate",
      "status": "Valid",
      "expiryDate": "2024-12-31",
      "documentUrl": "/documents/gst-certificate.pdf"
    },
    {
      "type": "Insurance Policy",
      "status": "Expired",
      "expiryDate": "2023-11-30",
      "documentUrl": "/documents/insurance-policy.pdf"
    },
    {
      "type": "Trade License",
      "status": "Awaited",
      "expiryDate": "2024-03-15",
      "documentUrl": "/documents/trade-license.pdf"
    }
  ]
};

export default VendorProfile; 