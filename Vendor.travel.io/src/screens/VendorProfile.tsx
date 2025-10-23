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
  is_profile_completed: boolean; // Added based on user feedback
  joinDate: string;
  
  // KYC Status
  kycStatus: 'Verified' | 'Pending' | 'Incomplete';
  description?: string;
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
    const fetchVendorData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("marcocabs_vendor_token")}`,
          },
        });

        console.log(response.data);
        
        if (response.data && response.data.vendor) {
          const vendorData = response.data.vendor;
          const formattedData: VendorInfo = {
            id: vendorData.id,
            fullName: vendorData.name,
            email: vendorData.email,
            mobile: vendorData.phone,
            city: vendorData.city || '', // Assuming city might not be there
            numberOfCars: vendorData.number_of_cars || 0,
            is_profile_completed:vendorData.is_profile_completed|| false,
            panNumber: vendorData.pan_number || '',
            aadhar_number: vendorData.aadhar_number || '',
            businessName: vendorData.business_name || '',
            businessType: vendorData.business_type || '',
            gstNumber: vendorData.gst_number || '',
            businessAddress: vendorData.business_address || '',
            bankName: vendorData.bank_name || '', // Assuming backend provides this
            accountNumber: vendorData.account_number || '', // Assuming backend provides this
            ifscCode: vendorData.ifsc_code || '', // Assuming backend provides this
            accountHolderName: vendorData.account_holder_name || '', // Assuming backend provides this
            profilePic: vendorData.profile_pic,
            totalEarnings: vendorData.total_earnings,
            walletBalance: vendorData.amount, // Mapping amount to walletBalance
            starRating: vendorData.star_rating,
            age: vendorData.age,
            gender: vendorData.gender,
            currentAddress: vendorData.current_address === 'Address to be updated' ? '' : vendorData.current_address, // Handle placeholder
            isPhoneVerified: !!vendorData.is_phone_verified,
            isEmailVerified: !!vendorData.is_email_verified,
            is_aadhar_verified: !!vendorData.is_aadhaar_verified,
            is_pan_verified: !!vendorData.is_pan_verified,
            joinDate: vendorData.created_at,
            kycStatus: (vendorData.is_profile_completed) ? 'Verified' :  'Incomplete',
          };
          setVendorInfo(formattedData);
          setEditedInfo(formattedData);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching vendor data:', error);
        setError('Failed to fetch vendor data. Please try again.');
        setLoading(false);
      }
    };

    fetchVendorData();
  }, []);

  // Effect to clear success/error messages after a few seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

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
        setVendorInfo(prev => prev ? { ...prev, isPhoneVerified: true } : null); // Update state
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
        '/auth/verify-email',
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
        setVendorInfo(prev => prev ? { ...prev, isEmailVerified: true } : null); // Update state
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
       setError('You must be logged in to verify your Aadhar.');
       return;
      }
      
      if(!editedInfo?.aadhar_number){ // Use editedInfo for input field
        setError("Enter Your Aadhar Number First ");
        return;
      }
      
      const response=await axios.post('/auth/generate-aadhaar-otp',{
        aadhaar_number:editedInfo?.aadhar_number // Use editedInfo for input field
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

      const response = await axios.post('/auth/verify-aadhaar-otp',{
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
        setVendorInfo(prev => prev ? { ...prev, is_aadhar_verified: true, aadhar_number: editedInfo.aadhar_number || '' } : null); // Update state
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
        setError('You must be logged in to verify your PAN.');
        return;
      }

      if(!editedInfo?.panNumber){ // Use editedInfo for input field
        setError("Enter Your PAN Number First ");
        return;
      }

      const response = await axios.post('/auth/fetch-pan',{
        pan_number:editedInfo?.panNumber // Use editedInfo for input field
      },{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if(response.data.status){
        setSuccess('Pan Verification SuccessFull');
        console.log(response.data);
        setVendorInfo(prev => prev ? { ...prev, is_pan_verified: true, panNumber: editedInfo.panNumber || '' } : null); // Update state
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



  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        setError('You must be logged in to update your profile.');
        return;
      }

      // Only send fields that the backend can update as per vendorController.js
      const updateData: { [key: string]: any } = {}; // Use index signature for dynamic properties
      if (editedInfo.fullName !== undefined) updateData.name = editedInfo.fullName;
      if (editedInfo.mobile !== undefined) updateData.phone = editedInfo.mobile;
      if (editedInfo.gender !== undefined) updateData.gender = editedInfo.gender;
      if (editedInfo.age !== undefined) updateData.age = editedInfo.age;
      if (editedInfo.currentAddress !== undefined) updateData.current_address = editedInfo.currentAddress;
      if (editedInfo.description !== undefined) updateData.description = editedInfo.description;
      if (editedInfo.businessName !== undefined) updateData.business_name = editedInfo.businessName;
      if (editedInfo.businessType !== undefined) updateData.business_type = editedInfo.businessType;
      if (editedInfo.gstNumber !== undefined) updateData.gst_number = editedInfo.gstNumber;
      if (editedInfo.businessAddress !== undefined) updateData.business_address = editedInfo.businessAddress;
      if (editedInfo.bankName !== undefined) updateData.bank_name = editedInfo.bankName;
      if (editedInfo.accountNumber !== undefined) updateData.account_number = editedInfo.accountNumber;
      if (editedInfo.ifscCode !== undefined) updateData.ifsc_code = editedInfo.ifscCode;
      if (editedInfo.accountHolderName !== undefined) updateData.account_holder_name = editedInfo.accountHolderName;

      // If no fields are being updated, just exit
      if (Object.keys(updateData).length === 0) {
        setSuccess('No changes to save.');
        setIsEditing(false);
        return;
      }

      const response = await axios.put(
        '/profile', 
        updateData, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.success) {
        // Update vendorInfo with the data that was sent, and then merge any additional data from the backend response
        setVendorInfo(prev => ({ ...prev, ...updateData, ...response.data.vendor } as VendorInfo));
        setEditedInfo(prev => ({ ...prev, ...updateData, ...response.data.vendor } as VendorInfo)); // Also update editedInfo
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError(response.data.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating vendor profile:', error);
      setError('Failed to update profile. Please try again.');
    }
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
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Profile Header */}
      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 mb-6 border border-gray-200">
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex-shrink-0 transform hover:scale-105 transition-transform duration-300 shadow-md overflow-hidden ring-4 ring-green-200">
            {vendorInfo.profilePic ? (
              <img 
                src={vendorInfo.profilePic} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center bg-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1">{vendorInfo.fullName}</h1>
            <p className="text-gray-700 text-base sm:text-lg mb-1">{vendorInfo.email}</p>
            <p className="text-gray-700 text-base sm:text-lg">{vendorInfo.mobile}</p>
            
            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getKycStatusClass(vendorInfo.kycStatus)}`}>
                KYC: {vendorInfo.kycStatus}
              </span>
              <span className="px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                Member since {new Date(vendorInfo.joinDate).toLocaleDateString()}
              </span>
              <span className="px-4 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                {vendorInfo.businessType}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <Link 
              to="/dashboard"
              className="px-6 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 flex items-center justify-center gap-2 text-base font-medium shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" />
              </svg>
              Dashboard
            </Link>
            
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2 text-base font-medium shadow-md"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Cars</p>
          <p className="text-2xl font-bold text-gray-900">{vendorInfo.numberOfCars}</p>
          <p className="text-xs text-gray-600 mt-1">Registered vehicles</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Earnings</p>
          <p className="text-2xl font-bold text-gray-900">₹{vendorInfo.totalEarnings.toLocaleString()}</p>
          <p className="text-xs text-gray-600 mt-1">Lifetime earnings</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1">Wallet Balance</p>
          <p className="text-2xl font-bold text-gray-900">₹{vendorInfo.walletBalance.toLocaleString()}</p>
          <p className="text-xs text-gray-600 mt-1">Available balance</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1">Rating</p>
          <p className="text-2xl font-bold text-gray-900">{vendorInfo.starRating}</p>
          <p className="text-xs text-gray-600 mt-1">Customer rating</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-md rounded-t-xl border-x border-t border-gray-200">
        <div className="flex overflow-x-auto space-x-1 p-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-shrink-0 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'profile'
                ? 'bg-green-50 text-green-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`flex-shrink-0 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'business'
                ? 'bg-green-50 text-green-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Business Details
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex-shrink-0 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'bank'
                ? 'bg-green-50 text-green-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Bank Details
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow-lg rounded-b-xl p-6 sm:p-8 mb-8 border-x border-b border-gray-200">
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Full Name */}
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={editedInfo.fullName || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200 text-gray-800"
                />
              ) : (
                <p className="text-gray-900 text-base sm:text-lg font-semibold">{vendorInfo.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <p className="text-gray-900 text-base sm:text-lg font-semibold">{vendorInfo.email || 'No email address added'}</p>
              
              {vendorInfo.email && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${vendorInfo.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {vendorInfo.isEmailVerified ? 'Verified' : 'Not Verified'}
                  </span>
                  {!vendorInfo.isEmailVerified && (
                    <button
                      onClick={handleVerifyEmail}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 transition-colors"
                    >
                      Verify Email
                    </button>
                  )}
                  {showEmailOtp && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-3 w-full">
                      <input
                        type="text"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        placeholder="Enter OTP"
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200 text-gray-800"
                      />
                      <button onClick={handleVerifyEmailOtp} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
                        Verify OTP
                      </button>
                    </div>
                  )}
                </div>
              )}
              {!vendorInfo.email && (
                <p className="text-gray-600 text-sm mt-1">Please add an email address to verify</p>
              )}
            </div>

            {/* Phone */}
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="mobile"
                  value={editedInfo.mobile || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200 text-gray-800"
                />
              ) : (
                <p className="text-gray-900 text-base sm:text-lg font-semibold">{vendorInfo.mobile || 'No phone number added'}</p>
              )}
              
              {vendorInfo.mobile && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${vendorInfo.isPhoneVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {vendorInfo.isPhoneVerified ? 'Verified' : 'Not Verified'}
                  </span>
                  {!vendorInfo.isPhoneVerified && (
                    <button
                      onClick={handleVerifyPhone}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 transition-colors"
                    >
                      Verify Phone
                    </button>
                  )}
                  {showPhoneOtp && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-3 w-full">
                      <input
                        type="text"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value)}
                        placeholder="Enter OTP"
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 mt-3 transition-all duration-200 text-gray-800"
                      />
                      <button onClick={handleVerifyPhoneOtp} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm mt-2 hover:bg-green-700 transition-colors">
                        Verify OTP
                      </button>
                    </div>
                  )}
                </div>
              )}
              {!vendorInfo.mobile && (
                <p className="text-gray-600 text-sm mt-1">Please add a phone number to verify</p>
              )}
              {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
              {success && <p className="text-green-500 mt-2 text-sm">{success}</p>}
            </div>

            {/* City (Disabled for editing) */}
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
              <p className="text-gray-900 text-base sm:text-lg font-semibold">{vendorInfo.city || 'Not added'}</p>
              {isEditing && (
                <p className="text-gray-500 text-xs mt-1">City cannot be edited directly.</p>
              )}
            </div>

            {/* Age */}
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-1">Age</label>
              {isEditing ? (
                <input
                  type="number"
                  name="age"
                  value={editedInfo.age || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200 text-gray-800"
                />
              ) : (
                <p className="text-gray-900 text-base sm:text-lg font-semibold">{vendorInfo.age} years</p>
              )}
            </div>

            {/* Gender */}
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
              {isEditing ? (
                <select
                  name="gender"
                  value={editedInfo.gender || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200 text-gray-800"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-gray-900 text-base sm:text-lg font-semibold">{vendorInfo.gender}</p>
              )}
            </div>

            {/* Current Address */}
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-1">Current Address</label>
              {isEditing ? (
                <textarea
                  name="currentAddress"
                  value={editedInfo.currentAddress || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200 text-gray-800"
                />
              ) : (
                <p className="text-gray-900 text-base sm:text-lg font-semibold">{vendorInfo.currentAddress}</p>
              )}
            </div>

            {/* Number of Cars (Disabled for editing) */}
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-1">Number of Cars</label>
              <p className="text-gray-900 text-base sm:text-lg font-semibold">{vendorInfo.numberOfCars}</p>
              {isEditing && (
                <p className="text-gray-500 text-xs mt-1">Number of cars cannot be edited directly.</p>
              )}
            </div>

            {/* Aadhar Number */}
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-1">Aadhar Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="aadhar_number"
                  value={editedInfo.aadhar_number || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200 text-gray-800"
                  disabled={vendorInfo.is_aadhar_verified} // Disable input if already verified
                />
              ) : (
                <p className="text-gray-900 text-base sm:text-lg font-semibold">
                  {vendorInfo.aadhar_number ? `XXXX XXXX ${vendorInfo.aadhar_number.slice(-4)}` : 'Not added'}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${vendorInfo.is_aadhar_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {vendorInfo.is_aadhar_verified ? 'Verified' : 'Not Verified'}
                </span>
                {!vendorInfo.is_aadhar_verified && editedInfo.aadhar_number && (
                  <>
                    {!showAadharOtp && (
                      <button
                        onClick={handleVerifyAadhar}
                        disabled={lastAadharOtpRequestTime !== null && (Date.now() - lastAadharOtpRequestTime) < 60000}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Generate Aadhar OTP
                      </button>
                    )}
                    {showAadharOtp && (
                      <div className="flex flex-col sm:flex-row gap-2 mt-3 w-full">
                        <input
                          type="text"
                          value={AadharOtp}
                          onChange={(e) => setAadharOtp(e.target.value)}
                          placeholder="Enter Aadhar OTP"
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200 text-gray-800"
                        />
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
                    )}
                    {lastAadharOtpRequestTime !== null && (Date.now() - lastAadharOtpRequestTime) < 60000 && (
                      <p className="text-sm text-gray-500 mt-2 ">
                        Resend available in {Math.ceil((60000 - (Date.now() - lastAadharOtpRequestTime)) / 1000)}s
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* PAN Number */}
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-1">PAN Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="panNumber"
                  value={editedInfo.panNumber || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200 text-gray-800"
                  disabled={vendorInfo.is_pan_verified} // Disable input if already verified
                />
              ) : (
                <p className="text-gray-900 text-base sm:text-lg font-semibold">
                  {vendorInfo.panNumber ? `XXXXX${vendorInfo.panNumber.slice(-5)}` : 'Not added'}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${vendorInfo.is_pan_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {vendorInfo.is_pan_verified ? 'Verified' : 'Not Verified'}
                </span>
                {!vendorInfo.is_pan_verified && editedInfo.panNumber && (
                  <button
                    onClick={handleVerifyPan}
                    className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 transition-colors"
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
                  className="px-5 py-2.5 sm:px-6 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-5 py-2.5 sm:px-6 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm sm:text-base shadow-md"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'business' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Business Name */}
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-1">Business Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="businessName"
                  value={editedInfo.businessName || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200 text-gray-800"
                />
              ) : (
                <p className="text-gray-900 text-base sm:text-lg font-semibold">{vendorInfo.businessName || 'Not added'}</p>
              )}
            </div>

            {/* Business Type */}
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-1">Business Type</label>
              {isEditing ? (
                <input
                  type="text"
                  name="businessType"
                  value={editedInfo.businessType || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200 text-gray-800"
                />
              ) : (
                <p className="text-gray-900 text-base sm:text-lg font-semibold">{vendorInfo.businessType || 'Not added'}</p>
              )}
            </div>

            {/* GST Number */}
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-1">GST Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="gstNumber"
                  value={editedInfo.gstNumber || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200 text-gray-800"
                />
              ) : (
                <p className="text-gray-900 text-base sm:text-lg font-semibold">{vendorInfo.gstNumber || 'Not added'}</p>
              )}
            </div>

            {/* Business Address */}
            <div className="md:col-span-2 bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-1">Business Address</label>
              {isEditing ? (
                <textarea
                  name="businessAddress"
                  value={editedInfo.businessAddress || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200 text-gray-800"
                />
              ) : (
                <p className="text-gray-900 text-base sm:text-lg font-semibold">{vendorInfo.businessAddress || 'Not added'}</p>
              )}
            </div>
            {isEditing && (
              <div className="md:col-span-2 flex justify-end gap-3 mt-6 sm:mt-8">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 sm:px-6 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-5 py-2.5 sm:px-6 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm sm:text-base shadow-md"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bank' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Bank Name */}
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-1">Bank Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="bankName"
                  value={editedInfo.bankName || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200 text-gray-800"
                />
              ) : (
                <p className="text-gray-900 text-base sm:text-lg font-semibold">{vendorInfo.bankName || 'Not added'}</p>
              )}
            </div>

            {/* Account Number */}
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-1">Account Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="accountNumber"
                  value={editedInfo.accountNumber || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200 text-gray-800"
                />
              ) : (
                <p className="text-gray-900 font-mono text-base sm:text-lg font-semibold">
                  {vendorInfo.accountNumber ? `${'•'.repeat(vendorInfo.accountNumber.length - 4)}${vendorInfo.accountNumber.slice(-4)}` : 'Not added'}
                </p>
              )}
            </div>

            {/* IFSC Code */}
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-1">IFSC Code</label>
              {isEditing ? (
                <input
                  type="text"
                  name="ifscCode"
                  value={editedInfo.ifscCode || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200 text-gray-800"
                />
              ) : (
                <p className="text-gray-900 font-mono text-base sm:text-lg font-semibold">{vendorInfo.ifscCode || 'Not added'}</p>
              )}
            </div>

            {/* Account Holder Name */}
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-1">Account Holder Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="accountHolderName"
                  value={editedInfo.accountHolderName || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200 text-gray-800"
                />
              ) : (
                <p className="text-gray-900 text-base sm:text-lg font-semibold">{vendorInfo.accountHolderName || 'Not added'}</p>
              )}
            </div>
            {isEditing && (
              <div className="md:col-span-2 flex justify-end gap-3 mt-6 sm:mt-8">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 sm:px-6 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-5 py-2.5 sm:px-6 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm sm:text-base shadow-md"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProfile;
