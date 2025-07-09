import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

  const navigate=useNavigate();

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
      <div className="w-full min-h-screen bg-gray-50">
        {/* Profile Header Skeleton */}
        <div className="bg-white shadow-sm p-8 mb-8">
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-32 h-32 rounded-full bg-gray-100 flex-shrink-0 animate-pulse" />
            <div className="flex-1 text-center md:text-left">
              <div className="h-8 w-48 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-5 w-32 bg-gray-100 rounded mb-1 animate-pulse" />
              <div className="h-5 w-32 bg-gray-100 rounded mb-1 animate-pulse" />
              <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                <div className="h-6 w-24 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-6 w-32 bg-gray-100 rounded-full animate-pulse" />
              </div>
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
      <div className="bg-white shadow-sm p-8 mb-8">
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex-shrink-0 transform hover:scale-105 transition-transform duration-300 shadow-sm overflow-hidden">
            <div className="w-full h-full rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{vendorInfo.name}</h1>
            <p className="text-gray-600 mt-2">{vendorInfo.email}</p>
            <p className="text-gray-600">{vendorInfo.phone}</p>
            
            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getKycStatusClass(vendorInfo.kycStatus)}`}>
                KYC: {vendorInfo.kycStatus}
              </span>
              <span className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                Member since {new Date(vendorInfo.joinDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              to="/dashboard"
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" />
              </svg>
              Dashboard
            </Link>
            
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 flex items-center gap-2"
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
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Cars</p>
          <p className="text-2xl font-bold text-gray-900">{vendorInfo.totalCars}</p>
          <p className="text-sm text-gray-600 mt-1">{vendorInfo.activeCars} active</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Drivers</p>
          <p className="text-2xl font-bold text-gray-900">{vendorInfo.totalDrivers}</p>
          <p className="text-sm text-gray-600 mt-1">Registered drivers</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Earnings</p>
          <p className="text-2xl font-bold text-gray-900">₹{vendorInfo.totalEarnings.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">Lifetime earnings</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">Account Status</p>
          <p className="text-2xl font-bold text-gray-900">{vendorInfo.kycStatus}</p>
          <p className="text-sm text-gray-600 mt-1">KYC verification</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm mx-4 md:mx-6 rounded-t-xl">
        <div className="flex overflow-x-auto space-x-1 p-2 border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'profile'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'documents'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'bank'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Bank Details
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow-sm mx-4 md:mx-6 rounded-b-xl p-6">
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editedInfo.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300"
                  />
                ) : (
                  <p className="text-gray-900">{vendorInfo.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{vendorInfo.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editedInfo.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300"
                  />
                ) : (
                  <p className="text-gray-900">{vendorInfo.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={editedInfo.address || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300"
                  />
                ) : (
                  <p className="text-gray-900">{vendorInfo.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={editedInfo.city || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300"
                  />
                ) : (
                  <p className="text-gray-900">{vendorInfo.city}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            {vendorInfo.documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{doc.type}</p>
                  <p className="text-sm text-gray-600">Expires: {doc.expiryDate}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDocStatusClass(doc.status)}`}>
                    {doc.status}
                  </span>
                  <a
                    href={doc.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5z" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'bank' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <p className="text-gray-900">{vendorInfo.accountDetails.bankName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <p className="text-gray-900">
                {'•'.repeat(vendorInfo.accountDetails.accountNumber.length - 4)}
                {vendorInfo.accountDetails.accountNumber.slice(-4)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
              <p className="text-gray-900">{vendorInfo.accountDetails.ifscCode}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
              <p className="text-gray-900">{vendorInfo.accountDetails.accountHolderName}</p>
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