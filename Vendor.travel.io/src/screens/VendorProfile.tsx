import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';

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

  aadhar_number: string;

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
  is_pan_verified: boolean;
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

  const [phoneOtp, setPhoneOtp] = useState<string>('');
  // emailOtp removed as we use magic link now
  // Digilocker flow used for Aadhaar now, no OTP state needed
  const [showPhoneOtp, setShowPhoneOtp] = useState<boolean>(false);
  // const [showEmailOtp, setShowEmailOtp] = useState<boolean>(false);

  const fetchVendorData = async (silent: boolean = false) => {
    if (!silent) setLoading(true);
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
          is_profile_completed: vendorData.is_profile_completed || false,
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
          kycStatus: (vendorData.is_profile_completed) ? 'Verified' : 'Incomplete',
        };
        setVendorInfo(formattedData);
        setEditedInfo(formattedData);
      }
      if (!silent) setLoading(false);
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      toast.error('Failed to fetch vendor data. Please try again.');
      if (!silent) setLoading(false);
    }
  };


  useEffect(() => {
    fetchVendorData(false);
  }, []);


  const handleVerifyPhone = async () => {
    try {
      if (!vendorInfo?.mobile) {
        toast.error('Phone number is required for verification.');
        return;
      }

      const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        toast.error('You must be logged in to verify your phone number.');
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

      if (response) {
        toast.success('OTP sent successfully to your phone number. It will be valid for 10 minutes.');
        setShowPhoneOtp(true);
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }

    } catch (error) {
      console.log('Error sending phone OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
    }
  };

  // Handle Digilocker Return
  useEffect(() => {
    const handleDigilockerReturn = async () => {
      const params = new URLSearchParams(window.location.search);
      const isDigilockerReturnParam = params.get('digilocker_verification');
      const isWaitingForDigilocker = localStorage.getItem('waiting_for_digilocker') === 'true';

      if (isDigilockerReturnParam === 'true' || isWaitingForDigilocker) {
        localStorage.removeItem('waiting_for_digilocker'); // Clear flag
        const verification_id = localStorage.getItem('ekyc_verification_id');
        const reference_id = localStorage.getItem('ekyc_reference_id');

        if (verification_id && reference_id) {
          // Clear param from URL so it doesn't re-trigger on reload (optional but clean)
          window.history.replaceState({}, '', window.location.pathname);

          const toastId = toast.loading('Completing verification...');

          try {
            const token = localStorage.getItem("marcocabs_vendor_token");
            const response = await axios.post('/auth/fetch-digilocker-document', {
              verification_id,
              reference_id
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === 1) {
              toast.success('Aadhaar verification successful!', { id: toastId });
              localStorage.removeItem('ekyc_verification_id');
              localStorage.removeItem('ekyc_reference_id');
              await fetchVendorData(true);
            } else {
              toast.error(response.data.message || 'Verification failed.', { id: toastId });
            }
          } catch (error: any) {
            console.error("Digilocker completion error:", error);
            toast.error(error.response?.data?.message || 'Verification failed. Please try again.', { id: toastId });
          }
        }
      }
    };

    handleDigilockerReturn();
  }, []);




  const handleVerifyPhoneOtp = async () => {
    try {
      if (!phoneOtp) {
        toast.error('Please enter the OTP sent to your phone.');
        return;
      }

      const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        toast.error('You must be logged in to verify your phone number.');
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

      if (response) {
        toast.success("phone number verified successfully.");
        setPhoneOtp('');
        setShowPhoneOtp(false);
        // Refetch to ensure state sync
        // Refetch to ensure state sync
        await fetchVendorData(true);
      }
      else {
        toast.error('Failed to verify OTP. Please check the OTP and try again.');
      }



    } catch (error) {
      console.log('Error verifying phone OTP:', error);
      toast.error('Failed to verify OTP. Please try again.');
    }
  }

  const handleVerifyEmail = async () => {
    try {
      if (!vendorInfo?.email) {
        toast.error('Email address is required for verification.');
        return;
      }

      const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        toast.error('You must be logged in to verify your email.');
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

      if (response) {
        toast.success('Verification link sent successfully to your email.');
        // No OTP logic for email - it's valid link based
      }
      else {
        toast.error('Failed to send verification link. Try Again');
      }


    } catch (error) {
      console.log('Error sending email verification:', error);
      toast.error('Failed to send verification link. Please try again.');
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /* 
   * Digilocker Verification Flow 
   */
  const handleVerifyAadhar = async () => {
    try {
      const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        toast.error('You must be logged in to verify your Aadhar.');
        return;
      }

      // We don't necessarily need input for Aadhar number if Digilocker handles it, 
      // but user instructions said: "verifies the validity of a Aadhaar number... using the provided details"
      // The API Step 1 doesn't seem to take aadhaar number in the request URL provided in the prompt?
      // Wait, the PROMPT said: Request URL: ...&aadhaar_number=... is NOT in the prompt's Query Params for Step 1?
      // Re-reading prompt: 
      // Request URL: GET : https://connect.ekychub.in/v3/digilocker/create_url_aadhaar?username=...&redirect_url=...
      // It DOES NOT show aadhaar_number as a param in the example URL.
      // BUT Step 1 description says: "Description: This API verifies the validity of a Aadhaar number... using the provided details."
      // The backend `initiateDigilockerVerification` I wrote DOES NOT send aadhaar_number to EKYC Hub 
      // (because I followed the URL structure in the prompt which didn't have it).
      // So presumably Digilocker asks for it or user logs in to Digilocker.

      const redirectUrl = `${window.location.protocol}//${window.location.host}/profile?digilocker_verification=true`;

      const response = await axios.post('/auth/initiate-digilocker', {
        redirect_url: redirectUrl
      },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === 1) {
        const { url, verification_id, reference_id } = response.data;

        // Save IDs to local storage to retrieve after redirect
        localStorage.setItem('ekyc_verification_id', verification_id);
        localStorage.setItem('ekyc_reference_id', reference_id);
        localStorage.setItem('waiting_for_digilocker', 'true'); // Set flag

        toast.loading('Redirecting to Digilocker...', { duration: 2000 });

        // Redirect to EKYC Hub URL
        window.location.href = url;
      } else {
        toast.error(response.data.message || 'Failed to initiate Digilocker verification.');
      }

    } catch (error) {
      console.error('Error initiating Digilocker verification:', error);
      toast.error('Failed to initiate verification. Please try again.');
    }
  }



  // Get Aadhar Data

  // const getAadhaarData=async()=>{
  //   try {

  //     if(!(vendorInfo?.is_aadhar_verified)){
  //       toast.error("Please Complete Aadhar Verification First")
  //       return;
  //     }


  //     const token = localStorage.getItem("marcocabs_vendor_token");
  //     if (!token) {
  //       toast.error('You must be logged in to verify your Aadhar.');
  //       return;
  //     }

  //     const response = await axios.get('/auth/aadhar-data',{
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if(!response.data.status){
  //       toast.error(response.data.message);
  //     }
  //     else{
  //       console.log(response.data.aadhar_data);
  //     }


  //   } catch (error) {
  //     console.log("Something went Wring While Fetching Aadhar details");
  //     toast.error("Something Went Wrong");
  //   }
  // }



  const handleVerifyPan = async () => {
    try {


      const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        toast.error('You must be logged in to verify your PAN.');
        return;
      }

      if (!editedInfo?.panNumber) { // Use editedInfo for input field
        toast.error("Enter Your PAN Number First ");
        return;
      }

      const response = await axios.post('/auth/fetch-pan', {
        pan_number: editedInfo?.panNumber // Use editedInfo for input field
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status) {
        toast.success('Pan Verification SuccessFull');
        console.log(response.data);
        // Refetch to ensure state sync
        // Refetch to ensure state sync
        await fetchVendorData(true);
      }
      else {
        toast.error('Pan Verification Unsuccessfull make sure the details are Up To Date');
      }



    } catch (error) {
      toast.error('Pan Verification Failed Please Try After Some Time');
      console.log(error);
    }
  }

  // Get PAN Data

  // const getPanData=async()=>{
  //   try {

  //     if(!vendorInfo?.is_pan_verified){
  //       toast.error(" Complete Pan Verification First ");
  //       return ;
  //     }

  //      const token = localStorage.getItem("marcocabs_vendor_token");
  //     if (!token) {
  //       toast.error('You must be logged in to verify your Aadhar.');
  //       return;
  //     }

  //     const response = await axios.get('/auth/verify-aadhar-otp',{
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if(!response.data.status){
  //       toast.error("Something Went Wrong");
  //     }
  //     else{
  //       console.log(response.data);
  //     }


  //   } catch (error) {
  //     console.log(error);
  //     toast.error("Something Went Wrong"); 
  //   }
  // }



  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        toast.error('You must be logged in to update your profile.');
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
        toast.success('No changes to save.');
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
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        // Refresh data silently to ensure correct formatting and map keys correctly (e.g., phone -> mobile)
        await fetchVendorData(true);
      } else {
        toast.error(response.data.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating vendor profile:', error);
      toast.error('Failed to update profile. Please try again.');
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
            className={`flex-shrink-0 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'profile'
              ? 'bg-green-50 text-green-800'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`flex-shrink-0 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'business'
              ? 'bg-green-50 text-green-800'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            Business Details
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex-shrink-0 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'bank'
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
                    <div className="flex gap-2">
                      <button
                        onClick={handleVerifyEmail}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 transition-colors"
                      >
                        Verify Email
                      </button>
                      <button
                        onClick={() => fetchVendorData(true)}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors"
                        title="Click this after verifying in your email"
                      >
                        Check Status
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
                  <button
                    onClick={handleVerifyAadhar}
                    className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 transition-colors"
                  >
                    Verify Aadhar (Digilocker)
                  </button>
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
