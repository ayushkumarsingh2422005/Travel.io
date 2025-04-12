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
    <div className="w-full">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-md p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-white p-1 flex-shrink-0">
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{vendorInfo.name}</h1>
            <p className="text-green-100 mt-1">{vendorInfo.email}</p>
            <p className="text-green-100">{vendorInfo.phone}</p>
            
            <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getKycStatusClass(vendorInfo.kycStatus)}`}>
                KYC: {vendorInfo.kycStatus}
              </span>
              <span className="px-3 py-1 bg-green-50 text-green-800 rounded-full text-sm font-medium">
                Member since {new Date(vendorInfo.joinDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              to="/dashboard"
              className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" />
              </svg>
              Dashboard
            </Link>
            
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2"
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Cars</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{vendorInfo.totalCars}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Cars</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{vendorInfo.activeCars}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Drivers</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{vendorInfo.totalDrivers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">₹{vendorInfo.totalEarnings.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex overflow-x-auto space-x-4 pb-1">
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100 text-gray-600'}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Details
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'documents' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100 text-gray-600'}`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bankDetails' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100 text-gray-600'}`}
            onClick={() => setActiveTab('bankDetails')}
          >
            Bank Details
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
            
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editedInfo.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={editedInfo.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={editedInfo.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={editedInfo.city || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={editedInfo.address || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                  />
                </div>
                
                <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-gray-800 mt-1">{vendorInfo.name}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Email Address</p>
                  <p className="text-gray-800 mt-1">{vendorInfo.email}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-gray-800 mt-1">{vendorInfo.phone}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">City</p>
                  <p className="text-gray-800 mt-1">{vendorInfo.city}</p>
                </div>
                
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-gray-800 mt-1">{vendorInfo.address}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Documents</h2>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Upload Document
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Document Type</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Status</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Expiry Date</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorInfo.documents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-500">
                        No documents found. Upload your first document to get started.
                      </td>
                    </tr>
                  ) : (
                    vendorInfo.documents.map((doc, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                          <div className="font-medium">{doc.type}</div>
                        </td>
                        <td className="p-4 text-sm border-b border-gray-100">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDocStatusClass(doc.status)}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                          {doc.expiryDate || "—"}
                        </td>
                        <td className="p-4 text-sm border-b border-gray-100">
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
                              View
                            </button>
                            <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors">
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
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Bank Account Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Bank Name</p>
                <p className="text-gray-800 mt-1">{vendorInfo.accountDetails.bankName}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Account Number</p>
                <p className="text-gray-800 mt-1">
                  {vendorInfo.accountDetails.accountNumber.replace(/\d(?=\d{4})/g, "•")}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">IFSC Code</p>
                <p className="text-gray-800 mt-1">{vendorInfo.accountDetails.ifscCode}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Account Holder Name</p>
                <p className="text-gray-800 mt-1">{vendorInfo.accountDetails.accountHolderName}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-6">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mt-2">
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