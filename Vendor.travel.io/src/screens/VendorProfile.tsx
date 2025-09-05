import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios'

interface VendorInfo {
  // Basic Information (from registration form)
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  city: string;
  numberOfCars: number;
  
  // Identity Details (from registration form)
  panNumber: string;

  aadhar_number:string;
  
  // Business Details (from registration form)
  businessName: string;
  businessType: string;
  gstNumber: string;
  businessAddress: string;
  
  // Bank Details (from registration form)
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  
  // Additional backend data
  profilePic?: string;
  totalEarnings: number;
  walletBalance: number;
  starRating: number;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  currentAddress: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  is_aadhar_verified: boolean;
  is_pan_verified:boolean;
  joinDate: string;
  
  // KYC Status
  kycStatus: 'Verified' | 'Pending' | 'Incomplete';
}



const VendorProfile: React.FC = () => {
  const [vendorInfo, setVendorInfo] = useState<VendorInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [editedInfo, setEditedInfo] = useState<Partial<VendorInfo>>({});
  const [AadharOtp, setAadharOtp] = useState<string>('');
  const [phoneOtp, setPhoneOtp] = useState<string>('');
  const [emailOtp, setEmailOtp] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showPhoneOtp, setShowPhoneOtp] = useState<boolean>(false);
  const [showEmailOtp, setShowEmailOtp] = useState<boolean>(false);
  const [showAadharOtp, setShowAadharOtp] = useState<boolean>(false);
  const [lastAadharOtpRequestTime, setLastAadharOtpRequestTime] = useState<number | null>(null);



  useEffect(() => {
    // Simulate fetching vendor data
    const fetchVendorData = async () => {
      setLoading(true);
      try {
        // Demo API request - in real app, this would be an actual API call
        // const response = await axios.get('/vendor/profile', {
        //   headers: {
        //     Authorization: `Bearer ${localStorage.getItem("marcocabs_vendor_token")}`,
        //   },
        // });
        // const data = await response.data;
        
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

  const handleVerifyPhone = async () => {
    try {
      if (!vendorInfo?.mobile) {
        setError('Phone number is required for verification.');
        return;
      }

      const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        setError('You must be logged in to verify your phone number.');
        return;
      }

     
      const response = await axios.post(
        '/auth/send-phone-otp',
        {
          phone: vendorInfo.mobile,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if(response){
        setSuccess('OTP sent successfully to your phone number. It will be valid for 10 minutes.');
        setShowPhoneOtp(true);
        setError('');
        }
        else{
        setError('Failed to send OTP. Please try again.');
        }


    } catch (error) {
      console.log('Error sending phone OTP:', error);
      setError('Failed to send OTP. Please try again.');
      setSuccess('');
    }
  };

  const handleVerifyPhoneOtp = async () => {
    try {
      if (!phoneOtp) {
        setError('Please enter the OTP sent to your phone.');
        return;
      }

      const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        setError('You must be logged in to verify your phone number.');
        return;
      }

     
      const response = await axios.post(
        '/auth/verify-phone-otp',
        {
          otp: phoneOtp,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if(response){
        setSuccess("phone number verified successfully.");
        setError('');
        setPhoneOtp(''); 
        setShowPhoneOtp(false);
        vendorInfo?.isPhoneVerified!= true; 
      }
      else{
        setError('Failed to verify OTP. Please check the OTP and try again.');
        setSuccess('');
      }

 

    } catch (error) {
      console.log('Error verifying phone OTP:', error);
      setError('Failed to verify OTP. Please try again.');
      setSuccess('');
    }
  }

  const handleVerifyEmail = async () => {
    try {
      if (!vendorInfo?.email) {
        setError('Email address is required for verification.');
        return;
      }

      const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        setError('You must be logged in to verify your email.');
        return;
      }

      // Demo API request
      const response = await axios.post(
        '/auth/resend-verification',
        {
          email: vendorInfo.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if(response){
        setSuccess('OTP sent successfully to your email. It will be valid for 10 minutes.');
        setError('');
        setShowEmailOtp(true);
      }
      else{
        setSuccess('');
        setError('Otp Was Not Send Try Again');
        setShowEmailOtp(false);
      }


    } catch (error) {
      console.log('Error sending email OTP:', error);
      setError('Failed to send OTP. Please try again.');
      setSuccess('');
    }
  };

  const handleVerifyEmailOtp = async () => {
    try {
      if (!emailOtp) {
        setError('Please enter the OTP sent to your email.');
        return;
      }

      const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        setError('You must be logged in to verify your email.');
        return;
      }

      const response = await axios.post(
        '/auth//verify-email',
        {
          otp: emailOtp,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

     if(response){ 
        setSuccess("Email verified successfully.");
        setError('');
        setEmailOtp('');
        setShowEmailOtp(false);
        vendorInfo?.isEmailVerified!= true;
      }
      else{
        setError('Failed to verify OTP. Please check the OTP and try again.');
        setSuccess('');
        setEmailOtp('');
        setShowEmailOtp(false);
      }

    } catch (error) {
      console.log('Error verifying email OTP:', error);
      setError('Failed to verify OTP. Please try again.');
      setSuccess('');
      setShowEmailOtp(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVerifyAadhar=async()=>{
   try {

     
     const token = localStorage.getItem("marcocabs_vendor_token");
     if (!token) {
       setError('You must be logged in to verify your email.');
       return;
      }
      
      if(!vendorInfo?.aadhar_number){
        setError("Enter Your Aadhar Number First ");
        return;
      }
      
      const response=await axios.post('/auth/generate-aadhaar-otp',{
        aadhaar_number:vendorInfo?.aadhar_number
      },
       {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
    )

    console.log('Aadhar verification OTP response:', response.data.message);

    if(response.data.status){
      setSuccess('Aadhar verification OTP generated successfully. Please check your email.');
      setError('');
      setShowAadharOtp(true);
      setLastAadharOtpRequestTime(Date.now()); // Set timestamp on successful OTP generation
    }
    else{
      setError('Failed to generate Aadhar verification link. Please try again.');
      setSuccess('');
      setShowAadharOtp(false);
    }
    
   } catch (error) {
     console.error('Error generating Aadhar verification link:', error);
     setError('Failed to generate Aadhar verification link. Please try again.');
     setSuccess('');
     setShowAadharOtp(false);
   }
  }

  const handleVerifyAadharOtp = async () => {
    try {

      if(!AadharOtp){
        setError("Enter The OTP for verification");
        return ;
      }

      const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        setError('You must be logged in to verify your Aadhar.');
        return;
      }

      const response = await axios.post('/auth/verify-aadhar-otp',{
        otp:AadharOtp
      },{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = response.data ;

      if (responseData.status===1) {
        setSuccess("Aadhar verified successfully.");
        setError('');
        setAadharOtp('');
        setShowAadharOtp(false);
        setVendorInfo(prev => prev ? { ...prev, is_aadhar_verified: true } : null);
        setLastAadharOtpRequestTime(null); // Clear cooldown on successful verification
      }
      else{
        setError('Failed to verify OTP. Please check the OTP and try again.');
        setSuccess('');
        setAadharOtp('');
        // Keep showAadharOtp true to allow retry
      }
      
    } catch (error) {
      
      console.error('Error confirming Aadhar verification:', error);
      setError('Failed to verify OTP. Please try again.');
      setSuccess('');
      setAadharOtp('');
      // Keep showAadharOtp true to allow retry
    }
  }

  // Get Aadhar Data

  // const getAadhaarData=async()=>{
  //   try {

  //     if(!(vendorInfo?.is_aadhar_verified)){
  //       setError("Please Complete Aadhar Verification First")
  //       return;
  //     }

      
  //     const token = localStorage.getItem("marcocabs_vendor_token");
  //     if (!token) {
  //       setError('You must be logged in to verify your Aadhar.');
  //       return;
  //     }

  //     const response = await axios.get('/auth/aadhar-data',{
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if(!response.data.status){
  //       setError(response.data.message);
  //     }
  //     else{
  //       console.log(response.data.aadhar_data);
  //     }

      
  //   } catch (error) {
  //     console.log("Something went Wring While Fetching Aadhar details");
  //     setError("Something Went Wrong");
  //   }
  // }



  const handleVerifyPan=async()=>{
    try {
    

        const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        setError('You must be logged in to verify your Aadhar.');
        return;
      }

      const response = await axios.post('/auth/fetch-pan',{
        pan_number:vendorInfo?.panNumber
      },{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if(response.data.status){
        setSuccess('Pan Verification SuccessFull');
        console.log(response.data);
        vendorInfo!.is_pan_verified=true;
      }
      else{
        setError('Pan Verification Unsuccessfull make sure the details are Up To Date');
      }


      
    } catch (error) {
      setError('Pan Verification Failed Please Try After Some Time');
      console.log(error);
    }
  }

  // Get PAN Data

  // const getPanData=async()=>{
  //   try {

  //     if(!vendorInfo?.is_pan_verified){
  //       setError(" Complete Pan Verification First ");
  //       return ;
  //     }

  //      const token = localStorage.getItem("marcocabs_vendor_token");
  //     if (!token) {
  //       setError('You must be logged in to verify your Aadhar.');
  //       return;
  //     }
      
  //     const response = await axios.get('/auth/verify-aadhar-otp',{
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if(!response.data.status){
  //       setError("Something Went Wrong");
  //     }
  //     else{
  //       console.log(response.data);
  //     }

      
  //   } catch (error) {
  //     console.log(error);
  //     setError("Something Went Wrong"); 
  //   }
  // }



  const handleSaveProfile = () => {
    // Demo API request to update profile
    // const updateProfile = async () => {
    //   const response = await axios.put('/vendor/profile', editedInfo, {
    //     headers: {
    //       Authorization: `Bearer ${localStorage.getItem("marcocabs_vendor_token")}`,
    //     },
    //   });
    //   if (response.data) {
    //     setVendorInfo(response.data);
    //   }
    // };
    
    setVendorInfo(prev => ({ ...prev, ...editedInfo } as VendorInfo));
    setIsEditing(false);
  };

  const getKycStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
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
    <div className="w-full min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Profile Header */}
      <div className="bg-white shadow-md rounded-xl p-6 sm:p-8 mb-6">
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gray-100 flex-shrink-0 transform hover:scale-105 transition-transform duration-300 shadow-sm overflow-hidden ring-4 ring-gray-100">
            {vendorInfo.profilePic ? (
              <img 
                src={vendorInfo.profilePic} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 sm:h-16 sm:w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{vendorInfo.fullName}</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">{vendorInfo.email}</p>
            <p className="text-gray-600 text-sm sm:text-base">{vendorInfo.mobile}</p>
            
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4 justify-center md:justify-start">
              <span className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${getKycStatusClass(vendorInfo.kycStatus)}`}>
                KYC: {vendorInfo.kycStatus}
              </span>
              <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium">
                Member since {new Date(vendorInfo.joinDate).toLocaleDateString()}
              </span>
              <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium">
                {vendorInfo.businessType}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 md:mt-0">
            <Link 
              to="/dashboard"
              className="px-5 py-2 sm:px-6 sm:py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" />
              </svg>
              Dashboard
            </Link>
            
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-5 py-2 sm:px-6 sm:py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-md p-5 sm:p-6">
          <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Total Cars</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{vendorInfo.numberOfCars}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Registered vehicles</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 sm:p-6">
          <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Total Earnings</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{vendorInfo.totalEarnings.toLocaleString()}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Lifetime earnings</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 sm:p-6">
          <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Wallet Balance</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{vendorInfo.walletBalance.toLocaleString()}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Available balance</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 sm:p-6">
          <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Rating</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{vendorInfo.starRating}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Customer rating</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-md rounded-t-xl">
        <div className="flex overflow-x-auto space-x-1 p-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-shrink-0 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'profile'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`flex-shrink-0 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'business'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Business Details
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex-shrink-0 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
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
      <div className="bg-white shadow-md rounded-b-xl p-6 sm:p-8 mb-8">
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={editedInfo.fullName || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200"
                  />
                ) : (
                  <p className="text-gray-900 text-base sm:text-lg">{vendorInfo.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900 text-base sm:text-lg">{vendorInfo.email || 'No email address added'}</p>
                
                {vendorInfo.email ? (
                  <>
                    <button
                      onClick={handleVerifyEmail}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm mt-2 hover:bg-green-700 transition-colors"
                    >
                      {vendorInfo.isEmailVerified ? 'Email Verified ✓' : 'Verify Email'}
                    </button>
                    {showEmailOtp && (
                      <>
                        <input
                          type="text"
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value)}
                          placeholder="Enter OTP"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 mt-3 transition-all duration-200"
                        />
                        <button onClick={handleVerifyEmailOtp} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm mt-2 hover:bg-green-700 transition-colors">
                          Verify OTP
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-gray-600 text-sm mt-1">Please add an email address to verify</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="mobile"
                    value={editedInfo.mobile || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200"
                  />
                ) : (
                  <p className="text-gray-900 text-base sm:text-lg">{vendorInfo.mobile || 'No phone number added'}</p>
                )}
                
                {vendorInfo.mobile ? (
                  <>
                    <button
                      onClick={handleVerifyPhone}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm mt-2 hover:bg-green-700 transition-colors"
                    >
                      {vendorInfo.isPhoneVerified ? 'Phone Verified ✓' : 'Verify Phone'}
                    </button>
                    {showPhoneOtp && (
                      <>
                        <input
                          type="text"
                          value={phoneOtp}
                          onChange={(e) => setPhoneOtp(e.target.value)}
                          placeholder="Enter OTP"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 mt-3 transition-all duration-200"
                        />
                        <button onClick={handleVerifyPhoneOtp} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm mt-2 hover:bg-green-700 transition-colors">
                          Verify OTP
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-gray-600 text-sm mt-1">Please add a phone number to verify</p>
                )}
                {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
                {success && <p className="text-green-500 mt-2 text-sm">{success}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={editedInfo.city || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200"
                  />
                ) : (
                  <p className="text-gray-900 text-base sm:text-lg">{vendorInfo.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <p className="text-gray-900 text-base sm:text-lg">{vendorInfo.age} years</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <p className="text-gray-900 text-base sm:text-lg">{vendorInfo.gender}</p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
                {isEditing ? (
                  <textarea
                    name="currentAddress"
                    value={editedInfo.currentAddress || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200"
                  />
                ) : (
                  <p className="text-gray-900 text-base sm:text-lg">{vendorInfo.currentAddress}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Cars</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="numberOfCars"
                    value={editedInfo.numberOfCars || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200"
                  />
                ) : (
                  <p className="text-gray-900 text-base sm:text-lg">{vendorInfo.numberOfCars}</p>
                )}
              </div>

                            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="aadhar_number"
                    value={editedInfo.aadhar_number || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200"
                  />
                ) : (
                  <p className="text-gray-900 text-base sm:text-lg">
                    {vendorInfo.aadhar_number ? `XXXX XXXX ${vendorInfo.aadhar_number.slice(-4)}` : 'Not added'}
                  </p>
                )}

                <p className="text-gray-900 mt-2 text-sm sm:text-base">
                  {vendorInfo.is_aadhar_verified ? 'Aadhar Verified ✓' : 'Aadhar Not Verified'}
                </p>

                {!vendorInfo.is_aadhar_verified && editedInfo.aadhar_number && (
                  <>
                    {!showAadharOtp && (
                      <button
                        onClick={handleVerifyAadhar}
                        disabled={lastAadharOtpRequestTime !== null && (Date.now() - lastAadharOtpRequestTime) < 60000}
                        className="mt-2 bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Generate Aadhar OTP
                      </button>
                    )}
                    {showAadharOtp && (
                      <>
                        <input
                          type="text"
                          value={AadharOtp}
                          onChange={(e) => setAadharOtp(e.target.value)}
                          placeholder="Enter Aadhar OTP"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 mt-3 transition-all duration-200"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={handleVerifyAadharOtp}
                            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                          >
                            Verify Aadhar OTP
                          </button>
                          <button
                            onClick={handleVerifyAadhar}
                            disabled={lastAadharOtpRequestTime !== null && (Date.now() - lastAadharOtpRequestTime) < 60000}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Resend OTP
                          </button>
                        </div>
                        {lastAadharOtpRequestTime !== null && (Date.now() - lastAadharOtpRequestTime) < 60000 && (
                          <p className="text-sm text-gray-500 mt-2">
                            Resend available in {Math.ceil((60000 - (Date.now() - lastAadharOtpRequestTime)) / 1000)}s
                          </p>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="panNumber"
                    value={editedInfo.panNumber || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200"
                  />
                ) : (
                  <p className="text-gray-900 text-base sm:text-lg">
                    {vendorInfo.panNumber ? `XXXXX${vendorInfo.panNumber.slice(-5)}` : 'Not added'}
                  </p>
                )}
                <p className="text-gray-900 mt-2 text-sm sm:text-base">
                  {vendorInfo.is_pan_verified ? 'PAN Verified ✓' : 'PAN Not Verified'}
                </p>
                {!vendorInfo.is_pan_verified && editedInfo.panNumber && (
                  <button
                    onClick={handleVerifyPan}
                    className="mt-2 bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 transition-colors"
                  >
                    Verify PAN
                  </button>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="md:col-span-2 flex justify-end gap-3 mt-6 sm:mt-8">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 sm:px-6 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-5 py-2.5 sm:px-6 sm:py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm sm:text-base"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'business' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="businessName"
                  value={editedInfo.businessName || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200"
                />
              ) : (
                <p className="text-gray-900 text-base sm:text-lg">{vendorInfo.businessName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
              {isEditing ? (
                <select
                  name="businessType"
                  value={editedInfo.businessType || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200"
                >
                  <option value="">Select business type</option>
                  <option value="Individual Proprietorship">Individual Proprietorship</option>
                  <option value="Partnership Firm">Partnership Firm</option>
                  <option value="Private Limited Company">Private Limited Company</option>
                  <option value="Public Limited Company">Public Limited Company</option>
                  <option value="Limited Liability Partnership">Limited Liability Partnership</option>
                </select>
              ) : (
                <p className="text-gray-900 text-base sm:text-lg">{vendorInfo.businessType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="gstNumber"
                  value={editedInfo.gstNumber || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200"
                />
              ) : (
                <p className="text-gray-900 text-base sm:text-lg">{vendorInfo.gstNumber || '—'}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
              {isEditing ? (
                <textarea
                  name="businessAddress"
                  value={editedInfo.businessAddress || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200"
                />
              ) : (
                <p className="text-gray-900 text-base sm:text-lg">{vendorInfo.businessAddress}</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bank' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="bankName"
                  value={editedInfo.bankName || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200"
                />
              ) : (
                <p className="text-gray-900 text-base sm:text-lg">{vendorInfo.bankName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="accountNumber"
                  value={editedInfo.accountNumber || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 font-mono transition-all duration-200"
                />
              ) : (
                <p className="text-gray-900 font-mono text-base sm:text-lg">
                  {'•'.repeat(vendorInfo.accountNumber.length - 4)}
                  {vendorInfo.accountNumber.slice(-4)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
              {isEditing ? (
                <input
                  type="text"
                  name="ifscCode"
                  value={editedInfo.ifscCode || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 font-mono uppercase transition-all duration-200"
                />
              ) : (
                <p className="text-gray-900 font-mono text-base sm:text-lg">{vendorInfo.ifscCode}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="accountHolderName"
                  value={editedInfo.accountHolderName || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200"
                />
              ) : (
                <p className="text-gray-900 text-base sm:text-lg">{vendorInfo.accountHolderName}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock data for the vendor profile - updated to match registration form and backend structure
const mockVendorData: VendorInfo = {
  "id": "VEN123456",
  "fullName": "Priya Transport Services",
  "email": "satyamtiwari87090@gmail.com",
  "mobile": "+91 9693240525",
  "city": "Mumbai",
  "numberOfCars": 5,
  "panNumber": "GSPPR6328H",
  "businessName": "Priya Transport Services",
  "businessType": "Individual Proprietorship",
  "gstNumber": "27ABCDE1234F1Z5",
  "businessAddress": "123, Main Street, Commercial Area, Mumbai - 400001",
  "bankName": "HDFC Bank",
  "accountNumber": "1234567890123456",
  "ifscCode": "HDFC0001234",
  "accountHolderName": "Priya Transport Services",
  "profilePic": "",
  "aadhar_number":"275365219277",
  "totalEarnings": 356000,
  "walletBalance": 45000,
  "starRating": 4.5,
  "age": 35,
  "gender": "Male",
  "currentAddress": "123, Main Street, Commercial Area, Mumbai - 400001",
  "isPhoneVerified": true,
  "isEmailVerified": true,
  "is_aadhar_verified": false,
  "is_pan_verified": false,
  "joinDate": "2022-08-15",
  "kycStatus": "Incomplete"
};

export default VendorProfile;
