import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader } from '@googlemaps/js-api-loader';
import UserAvatar from '../components/UserAvatar';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { API_ENDPOINTS } from '../api/apiEndpoints';
import { checkAuth, getUserDetailsFromToken } from '../utils/verifytoken';
import { getUserProfile, updateProfile, sendPhoneOtp, verifyPhoneOtp, addPhoneNumber, UserProfile } from '../api/userService';
import Footer from '../components/Footer';

interface UserDetails {
  id: string;
  name?: string;
  email: string;
  phone?: string;
}

const faqs = [
  {
    q: 'Is local sightseeing included in outstation trip?',
    a: `For Round trip bookings, all the local sightseeing in mentioned cities is included.\nFor One way Multi-stop trip, all the local sightseeing in mentioned cities is included.\nFor One way trip, with only one pickup and one drop, sightseeing is not included.`
  },
  {
    q: 'How to change pickup date, time and return date?',
    a: 'Please click on Departure / Return date on top of this page.'
  },
  {
    q: 'Are Driver charges / Driver bata included in the price? Do i need to arrange for Driver food and accomodation during the trip?',
    a: 'Yes, all driver charges are included in the price. Driver will take care of his food and accomodation. You need not to arrange that.'
  },
  {
    q: 'What are extra charges if i need to travel in night hours?',
    a: 'There is no extra charges for traveling in night hours. Night charges are included in the price.'
  },
  {
    q: 'Please tell me any extra charge other than the price shown above.',
    a: `• 5% GST is extra.\n• Parking charges, if any, are extra and need to be paid by you as per actuals.\n• Toll tax and State tax may or may not be extra depending on the trip. Please check 'Other Terms' mentioned below price.`
  },
  {
    q: 'How much before departure, i have to book the cab?',
    a: 'Although you can book the cab up to 1 hour prior to departure time but we suggest to book 1 day in advance to avoid last minute rush.'
  },
  {
    q: 'Can I book cab by calling customer support?',
    a: `We are happy to provide you any clarifications required through customer support team but cab booking has to be done either through our website or through our android and iOS mobile app 'CabBazar - Outstation taxi'.`
  },
  {
    q: 'I want to book cab without paying any advance amount. I will pay on boarding the cab.',
    a: 'Sorry, it is not possible. You need to pay a small 15-20% amount in advance to book the cab on CabBazar.'
  },
  {
    q: 'I need a one way cab for travelling to more than one destination. I will drop at last destination and need not to return to Pickup location.',
    a: 'You can book a one way multi-stop cab. Please select One way trip and add all your destination cities in the itinerary.'
  },
  {
    q: 'Can we pickup additional passengers on the way in one way trip?',
    a: `You may book one way multi-stop cab by adding additional stops in itinerary.\nFor One way trip with only one pickup and one drop, Additional pickup or drop will incur additional charges.`
  },
  {
    q: 'Do I need to pay both side Toll tax for one way trip?',
    a: 'For One way trip, you need to pay one side Toll tax only.'
  },
  {
    q: 'Whether the cab will have FASTag?',
    a: 'Yes, all our cabs have FASTag installed by default.'
  },
  {
    q: 'Where to mention the complete pickup address?',
    a: 'You will have the option to mention complete pickup address on next screen.'
  },
  {
    q: 'When will I get car and driver details after booking?',
    a: 'In most cases, car and driver details are shared within minutes after booking. In few rare cases, it may take more time and may be shared up to two hours before departure.'
  },
  {
    q: 'Will advance amount be refunded if I cancel the booking?',
    a: 'It may or may not be refunded. Please refer to our Cancellation and Refund policy for details.'
  },
  {
    q: 'How can i make the advance payment? Which payment gateway should i choose?',
    a: `You can pay with all online payment modes like Netbanking, Debit / Credit card, UPI, Payment Wallet Apps like PhonePe, GooglePay, PayTM etc. To pay with Netbanking, Debit / Credit card, UPI, you can choose any payment gateway (PayTM or RazorPay). To pay with PayTM wallet, choose 'PayTM' payment gateway. To pay with other payment wallet apps like PhonePe, GooglePay etc, choose 'RazorPay' payment gateway.`
  },
  {
    q: 'Can I travel with pets?',
    a: 'Yes, you can. But you will be charged an additional amount of Rs. 840 for small cars (hatchbak, Sedan) and Rs. 1050 for bigger cars (SUV, Innova). Please select \'Pet Allowed\' add-on while booking.'
  },
];

interface AutocompleteService {
  getPlacePredictions: (request: {
    input: string;
    types?: string[];
    componentRestrictions?: { country: string };
  }) => Promise<{
    predictions: Array<{ description: string }>;
  }>;
}

export default function Cabs() {
  const navigate = useNavigate();
  const location = useLocation();
  // const routeData = location.state || {};
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [cabCategories, setCabCategories] = useState<any[]>([]);
  const [selectedCabCategory, setSelectedCabCategory] = useState<string | null>(null);

  // Auth & Profile State
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [profileFormData, setProfileFormData] = useState({
    phone: '',
    gender: 'Select Gender' as 'Male' | 'Female' | 'Other' | 'Select Gender',
    age: '',
    current_address: '',
  });

  // Check Auth on Mount (Strict)
  useEffect(() => {
    const checkAndFetchProfile = async () => {
      setProfileLoading(true);
      const token = localStorage.getItem('marcocabs_customer_token');
      const type = 'customer';

      if (!token) {
        toast.error('Please login to continue.');
        navigate('/login', { state: { from: location.pathname } });
        return;
      }

      const isAuthenticated = await checkAuth(type, token);
      if (!isAuthenticated) {
        toast.error('Session expired. Please login again.');
        navigate('/login', { state: { from: location.pathname } });
        return;
      }

      setUserToken(token);
      const details = await getUserDetailsFromToken(token);
      if (details) {
        setUserDetails(details);
      } else {
        navigate('/login', { state: { from: location.pathname } });
        return;
      }

      try {
        const profileResponse = await getUserProfile();
        setUserProfile(profileResponse.user);
        setProfileFormData({
          phone: profileResponse.user.phone || '',
          gender: profileResponse.user.gender || 'Select Gender',
          age: profileResponse.user.age > 0 ? profileResponse.user.age.toString() : '',
          current_address: profileResponse.user.current_address || '',
        });

        if (!profileResponse.user.is_profile_completed || !profileResponse.user.is_phone_verified) {
          setShowProfileForm(true);
          toast.error('Please complete your profile to continue.');
        } else {
          setShowProfileForm(false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile.');
      } finally {
        setProfileLoading(false);
      }
    };

    checkAndFetchProfile();
  }, [navigate, location.pathname]);

  // Handle Profile Form Change
  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProfileFormData({
      ...profileFormData,
      [e.target.name]: e.target.value,
    });
  };

  // Profile Submit
  const handleProfileFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (profileFormData.phone && profileFormData.phone !== userProfile?.phone) {
        await addPhoneNumber(profileFormData.phone);
        toast('Phone number updated. Please verify it.');
      }

      const updatedProfileData = {
        phone: profileFormData.phone,
        gender: profileFormData.gender,
        age: parseInt(profileFormData.age),
        current_address: profileFormData.current_address,
        is_profile_completed: true,
      };

      const response = await updateProfile(updatedProfileData);
      setUserProfile(response.user);
      toast.success('Profile updated successfully!');

      if (!response.user.is_phone_verified) {
        toast.error('Please verify your phone number.');
        setIsOtpModalOpen(true);
      } else {
        setShowProfileForm(false);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    setLoading(true);
    try {
      await sendPhoneOtp();
      toast.success('OTP sent to your phone!');
      setIsOtpModalOpen(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyPhoneOtp(otp);
      toast.success('Phone verified successfully!');
      setIsOtpModalOpen(false);
      const profileResponse = await getUserProfile();
      setUserProfile(profileResponse.user);
      if (profileResponse.user.is_profile_completed && profileResponse.user.is_phone_verified) {
        setShowProfileForm(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };


  // Form states
  const [bookingForm, setBookingForm] = useState({
    tripType: "Round Trip",
    pickupLocation: "",
    destination: "",
    stops: [],
    pickupDate: "",
    dropDate: ""
  });

  // Implicitly using the new fields from backend
  const filterCategories = (categories: any[]) => {
    if (bookingForm?.tripType === 'Hourly Rental') {
      return categories.filter(cat => cat.service_type === 'hourly_rental' || cat.service_type === 'hourly'); // Support legacy 'hourly'
    } else if (bookingForm?.tripType === 'One Way') {
      return categories.filter(cat => cat.service_type === 'one_way');
    } else if (bookingForm?.tripType === 'Round Trip') {
      // Default to round_trip strings, but might fall back if service_type is missing or 'outstation' (legacy)
      // Strict request: "only be showing that cab categories whose service_type is round_trip"
      // We will also include 'outstation' as legacy support for existing data to prevent empty screens during migration
      return categories.filter(cat => cat.service_type === 'round_trip' || cat.service_type === 'outstation');
    }
    return categories;
  };

  const displayedCategories = filterCategories(cabCategories);





  useEffect(() => {
    if (location.state) {
      const state = location.state as any;
      setBookingForm(prev => ({
        ...prev,
        tripType: state.tripType || '',
        pickupLocation: state.pickup || '',
        destination: state.destination || '',
        stops: state.stops || [],
        pickupDate: state.pickupDate || '',
        dropDate: state.dropDate || ''
      }));
      let maxId = 0;
      const newAdditionalStops = (state.stops || []).map((stop: string, index: number) => {
        const id = index + 1;
        if (id > maxId) maxId = id;
        return {
          id: id,
          location: stop,
          suggestions: [],
          showSuggestions: false
        };
      });
      setAdditionalStops(newAdditionalStops);
      setNextStopId(maxId + 1);
    }
  }, [location]);




  // Add new states for location suggestions
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [autocompleteService, setAutocompleteService] = useState<AutocompleteService | null>(null);

  const pickupRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);
  const stopRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Add state for additional stops and their suggestions
  const [additionalStops, setAdditionalStops] = useState<Array<{
    id: number;
    location: string;
    suggestions: string[];
    showSuggestions: boolean;
  }>>([]);
  const [nextStopId, setNextStopId] = useState(1);

  console.log('dummy data ', loading);

  // Fetch cab categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API_ENDPOINTS.CAB_CATEGORIES);
        if (response.data.success) {
          setCabCategories(response.data.cab_categories);
          if (response.data.cab_categories.length > 0) {
            setSelectedCabCategory(response.data.cab_categories[0].id); // Select first category by default
          }
        } else {
          toast.error(response.data.message || 'Failed to fetch cab categories');
        }
      } catch (error) {
        console.error('Error fetching cab categories:', error);
        toast.error('An error occurred while fetching cab categories.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Initialize Google Maps services
  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
      version: "weekly",
      libraries: ["places", "geometry", "routes"]
    });

    loader.load().then((google) => {
      setAutocompleteService(new google.maps.places.AutocompleteService());
    });
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    formSetter: React.Dispatch<React.SetStateAction<{
      tripType: string;
      pickupLocation: string;
      destination: string;
      stops: never[];
      pickupDate: string;
      dropDate: string;
    }>>
  ) => {
    const { name, value } = e.target;
    formSetter(prev => ({ ...prev, [name]: value }));
  };

  // Booking form handler
  const handleBookingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    handleInputChange(e, setBookingForm);
  };



  // Trip type selector
  const handleTripTypeChange = (type: string) => {
    setBookingForm(prev => ({ ...prev, tripType: type }));
  };

  // Click handler: Book now
  // const handleBookNow = () => {
  //   console.log("Book Now clicked");
  //   // Implement book now functionality
  // };



  // Function to get location suggestions
  const getLocationSuggestions = async (input: string, setSuggestions: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (!autocompleteService || !input) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await autocompleteService.getPlacePredictions({
        input: input,
        types: ['(cities)'],
        componentRestrictions: { country: 'in' }
      });

      if (response && response.predictions) {
        setSuggestions(response.predictions.map((prediction: { description: string }) => prediction.description));
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      toast.error('Error fetching location suggestions');
    }
  };

  // Handle pickup location input change
  const handlePickupLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBookingForm(prev => ({ ...prev, pickupLocation: value }));
    if (value.trim() === "") {
      setShowPickupSuggestions(false);
      setPickupSuggestions([]);
    } else {
      setShowPickupSuggestions(true);
      await getLocationSuggestions(value, setPickupSuggestions);
    }
  };

  // Handle destination input change
  const handleDestinationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBookingForm(prev => ({ ...prev, destination: value }));
    if (value.trim() === "") {
      setShowDestinationSuggestions(false);
      setDestinationSuggestions([]);
    } else {
      setShowDestinationSuggestions(true);
      await getLocationSuggestions(value, setDestinationSuggestions);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (location: string, type: 'pickup' | 'destination') => {
    if (type === 'pickup') {
      setBookingForm(prev => ({ ...prev, pickupLocation: location }));
      setShowPickupSuggestions(false);
    } else {
      setBookingForm(prev => ({ ...prev, destination: location }));
      setShowDestinationSuggestions(false);
    }
  };

  // Handle adding a new stop
  const handleAddStop = () => {
    setAdditionalStops(prev => [...prev, {
      id: nextStopId,
      location: '',
      suggestions: [],
      showSuggestions: false
    }]);
    setNextStopId(prev => prev + 1);
  };

  // Handle removing a stop
  const handleRemoveStop = (id: number) => {
    setAdditionalStops(prev => prev.filter(stop => stop.id !== id));
  };

  // Handle stop location change
  const handleStopLocationChange = async (id: number, value: string) => {
    setAdditionalStops(prev =>
      prev.map(stop => {
        if (stop.id === id) {
          return {
            ...stop,
            location: value,
            showSuggestions: value.trim() !== "", // Hide suggestions if input is empty
            suggestions: value.trim() === "" ? [] : stop.suggestions // Clear suggestions if input is empty
          };
        }
        return stop;
      })
    );

    if (autocompleteService && value.trim() !== "") { // Only fetch suggestions if input is not empty
      try {
        const response = await autocompleteService.getPlacePredictions({
          input: value,
          types: ['(cities)'],
          componentRestrictions: { country: 'in' }
        });

        if (response && response.predictions) {
          setAdditionalStops(prev =>
            prev.map(stop => {
              if (stop.id === id) {
                return {
                  ...stop,
                  suggestions: response.predictions.map((prediction: { description: string }) => prediction.description)
                };
              }
              return stop;
            })
          );
        }
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
        toast.error('Error fetching location suggestions');
      }
    }
  };

  // Handle stop suggestion selection
  // const handleStopSuggestionSelect = (id: number, location: string) => {
  //   setAdditionalStops(prev => 
  //     prev.map(stop => {
  //       if (stop.id === id) {
  //         return {
  //           ...stop,
  //           location: location,
  //           showSuggestions: false
  //         };
  //       }
  //       return stop;
  //     })
  //   );
  // };

  // issue here : on selecting cab, state not updated in time for form submit

  const handleSelectCab = (categoryId: string | null) => {
    if (!categoryId) return;

    // Strict Auth Check before proceeding
    if (!userToken) {
      toast.error('Please login to continue.');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!userProfile?.is_profile_completed || !userProfile?.is_phone_verified) {
      toast.error('Please complete your profile first.');
      setShowProfileForm(true);
      return;
    }

    // Find the selected category object
    const selectedCategory = cabCategories.find(cat => cat.id === categoryId);

    if (!selectedCategory) {
      toast.error("Selected cab category not found.");
      return;
    }

    // Validate Check before navigating
    // (Re-using validation logic from handleBookingSubmit briefly or simplified)
    if (!bookingForm.pickupLocation || !bookingForm.pickupDate) {
      toast.error("Please fill in pickup details.");
      return;
    }

    // Construct stops
    const currentStops = additionalStops.map(stop => stop.location).filter(Boolean);

    // Direct Navigation
    navigate('/prices', {
      state: {
        pickup: bookingForm.pickupLocation,
        destination: bookingForm.destination,
        tripType: bookingForm.tripType,
        pickupDate: bookingForm.pickupDate,
        dropDate: bookingForm.dropDate,
        stops: currentStops,
        cabCategory: selectedCategory, // Pass the full object
      }
    });
  };




  // Form submission: Booking
  const handleBookingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields
    const errors = [];

    if (!bookingForm.pickupLocation.trim()) {
      errors.push('Pickup location is required');
    }

    if (bookingForm.tripType !== 'Hourly Rental' && !bookingForm.destination.trim()) {
      errors.push('Destination is required');
    }

    if (!bookingForm.pickupDate) {
      errors.push('Pickup date and time is required');
    }

    if (bookingForm.tripType === 'Round Trip' && !bookingForm.dropDate) {
      errors.push('Return date and time is required for round trips');
    }

    // Validate additional stops
    const emptyStops = additionalStops.filter(stop => !stop.location.trim());
    if (emptyStops.length > 0) {
      errors.push('Please fill in all stop locations or remove empty stops');
    }

    // Check if pickup date is in the past
    if (bookingForm.pickupDate) {
      const pickupDateTime = new Date(bookingForm.pickupDate);
      const now = new Date();
      if (pickupDateTime <= now) {
        errors.push('Pickup date and time must be in the future');
      }
    }

    // Check if return date is required
    const isDropDateRequired = bookingForm.tripType === 'Round Trip' || (bookingForm.tripType === 'One Way' && additionalStops.length > 0);

    if (isDropDateRequired && !bookingForm.dropDate) {
      errors.push(bookingForm.tripType === 'Round Trip' ? 'Return date and time is required' : 'Drop date and time is required');
    }

    // Check if return date is after pickup date
    if (isDropDateRequired && bookingForm.pickupDate && bookingForm.dropDate) {
      const pickupDateTime = new Date(bookingForm.pickupDate);
      const dropDateTime = new Date(bookingForm.dropDate);
      if (dropDateTime <= pickupDateTime) {
        errors.push(bookingForm.tripType === 'Round Trip' ? 'Return date must be after pickup date' : 'Drop date must be after pickup date');
      }
    }

    if (!selectedCabCategory) {
      errors.push('Please select a cab category');
    }

    if (errors.length > 0) {
      // Show validation errors
      errors.forEach(error => toast.error(error));
      return;
    }

    // If all validations pass, proceed to prices page
    handleBook();
  };

  const handleBook = () => {
    const currentStops = additionalStops.map(stop => stop.location).filter(Boolean);
    const selectedCategory = cabCategories.find(cat => cat.id === selectedCabCategory);

    navigate('/prices', {
      state: {
        pickup: bookingForm.pickupLocation,
        destination: bookingForm.destination,
        tripType: bookingForm.tripType,
        pickupDate: bookingForm.pickupDate,
        dropDate: bookingForm.dropDate,
        stops: currentStops,
        cabCategory: selectedCategory, // Pass the entire selected category object
      }
    });
  };

  const handleFaqClick = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Hide pickup suggestions
      if (pickupRef.current && !pickupRef.current.contains(event.target as Node)) {
        setShowPickupSuggestions(false);
      }
      // Hide destination suggestions
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationSuggestions(false);
      }
      // Hide additional stop suggestions
      additionalStops.forEach(stop => {
        const ref = stopRefs.current[stop.id];
        if (ref && !ref.contains(event.target as Node)) {
          setAdditionalStops(prev => prev.map(s => s.id === stop.id ? { ...s, showSuggestions: false } : s));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [additionalStops]); // Depend on additionalStops to re-attach listeners for new/removed stops


  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">Select Your Cab</div>
          <UserAvatar />
        </div>
      </header>
      {/* Booking Form Section */}
      {/* Booking Section */}
      <div className="container mx-auto px-4 pt-6">
        <div className="bg-white shadow-md rounded-xl p-6">
          <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="text-sm text-indigo-800">
              <span className="text-red-500">*</span> Fields marked with red asterisk are required for booking
            </p>
          </div>
          <form onSubmit={handleBookingSubmit}>
            <div className="mb-6">
              {/* Trip Type Buttons - matched with landing.tsx */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button
                  type="button"
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${bookingForm.tripType === "Round Trip"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  onClick={() => handleTripTypeChange("Round Trip")}
                >
                  Round Trip
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${bookingForm.tripType === "One Way"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  onClick={() => handleTripTypeChange("One Way")}
                >
                  One Way
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${bookingForm.tripType === "Hourly Rental"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  onClick={() => handleTripTypeChange("Hourly Rental")}
                >
                  Hourly Rental
                </button>
              </div>

              {/* Pickup Location */}
              <div className="mb-4 relative" ref={pickupRef}>
                <div className="absolute left-3 top-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="pickupLocation"
                  value={bookingForm.pickupLocation}
                  onChange={handlePickupLocationChange}
                  placeholder="Pickup location"
                  className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring focus:ring-indigo-200 focus:border-indigo-500"
                  required
                />
                {showPickupSuggestions && pickupSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {pickupSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSuggestionSelect(suggestion, 'pickup')}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Stops (Only if NOT Hourly Rental) */}
              {bookingForm.tripType !== "Hourly Rental" && additionalStops.map((stop) => (
                <div key={stop.id} className="mb-4 relative flex items-center" ref={el => { stopRefs.current[stop.id] = el; }}>
                  <div className="absolute left-3 top-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={stop.location}
                      onChange={(e) => handleStopLocationChange(stop.id, e.target.value)}
                      placeholder="Stop location"
                      className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring focus:ring-indigo-200 focus:border-indigo-500"
                    />
                    {stop.showSuggestions && stop.suggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg top-full">
                        {stop.suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => {
                              setAdditionalStops(prev =>
                                prev.map(s => s.id === stop.id ? { ...s, location: suggestion, showSuggestions: false } : s)
                              );
                            }}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(stop.id)}
                    className="ml-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Destination (Only if NOT Hourly Rental) */}
              {bookingForm.tripType !== "Hourly Rental" && (
                <div className="mb-4 relative" ref={destinationRef}>
                  <div className="absolute left-3 top-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    value={bookingForm.destination}
                    onChange={handleDestinationChange}
                    placeholder="Destination"
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring focus:ring-indigo-200 focus:border-indigo-500"
                    required
                  />
                  {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      {destinationSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleSuggestionSelect(suggestion, 'destination')}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Add Stop Button (Only if NOT Hourly Rental) */}
              {bookingForm.tripType !== "Hourly Rental" && (
                <button
                  type="button"
                  onClick={handleAddStop}
                  className="w-full p-3 rounded-lg border border-dashed border-indigo-500 text-indigo-600 mb-4 flex items-center justify-center hover:bg-indigo-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Stop
                </button>
              )}

              {/* Date Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="pickupDate"
                    name="pickupDate"
                    value={bookingForm.pickupDate}
                    onChange={handleBookingChange}
                    min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-indigo-200 focus:border-indigo-500"
                    required
                  />
                </div>

                {(bookingForm.tripType === 'Round Trip' || (bookingForm.tripType === 'One Way' && additionalStops.length > 0)) && (
                  <div>
                    <label htmlFor="dropDate" className="block text-sm font-medium text-gray-700 mb-1">
                      {bookingForm.tripType === 'Round Trip' ? 'Return Date & Time' : 'Drop Date & Time'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="dropDate"
                      name="dropDate"
                      value={bookingForm.dropDate}
                      onChange={handleBookingChange}
                      min={bookingForm.pickupDate || new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-indigo-200 focus:border-indigo-500"
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Cab Categories Display */}
      <div className="container mx-auto px-4 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Your Cab Category</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCategories.map((category) => (
            <div
              key={category.id}
              className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 ${selectedCabCategory === category.id ? 'border-indigo-500' : 'border-gray-200'
                } hover:shadow-xl transition-all duration-300 cursor-pointer`}
              onClick={() => handleSelectCab(category.id)}
            >
              <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                {category.category_image ? (
                  <img
                    src={`http://localhost:5000${category.category_image}`} // Assuming images are served from backend
                    alt={category.category}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">No Image</span>
                )}
                <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
                  {category.segment || 'Sedan'}
                </div>
              </div>
              <div className="p-4">
                <h4 className="text-xl font-bold text-gray-800 mb-1">{category.segment || category.category}</h4>
                <p className="text-gray-600 text-sm mb-3">
                  {category.min_seats || category.min_no_of_seats || 4}-{category.max_seats || category.max_no_of_seats || 4} Seater
                </p>

                {bookingForm.tripType === 'Hourly Rental' ? (
                  <>
                    <div className="flex items-baseline mb-3">
                      <span className="text-2xl font-bold text-indigo-600">₹{category.base_price}</span>
                      <span className="text-sm text-gray-500 ml-1">
                        ({category.package_hours}h / {category.package_km}km)
                      </span>
                    </div>
                    <ul className="text-sm text-gray-700 space-y-1 mb-4">
                      <li>Extra Hr: <span className="font-medium">₹{category.extra_hour_rate}/hr</span></li>
                      <li>Extra Km: <span className="font-medium">₹{category.extra_km_rate}/km</span></li>
                      <li>Driver Allowance: <span className="font-medium">{category.driver_allowance ? `₹${category.driver_allowance}` : 'Included'}</span></li>
                    </ul>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline mb-3">
                      <span className="text-2xl font-bold text-indigo-600">₹{category.price_per_km}/km</span>
                    </div>
                    <ul className="text-sm text-gray-700 space-y-1 mb-4">
                      <li>Fare/Km: <span className="font-medium">₹{category.price_per_km}/Km</span></li>
                      <li>Fuel Charges: <span className="font-medium">{category.fuel_charges > 0 ? `₹${category.fuel_charges}` : 'Included'}</span></li>
                      <li>Driver Charges: <span className="font-medium">{category.driver_charges > 0 ? `₹${category.driver_charges}` : 'Included'}</span></li>
                      <li>Night Charges: <span className="font-medium">{category.night_charges > 0 ? `₹${category.night_charges}` : 'Included'}</span></li>
                    </ul>
                  </>
                )}

                <button
                  type="button"
                  className="w-full py-2 px-4 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition-colors"
                  onClick={() => {
                    handleSelectCab(category.id)
                  }}
                >
                  Select Cab
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mt-12 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Frequently Asked Questions (FAQs)</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`transition-all duration-300 border rounded-xl shadow-md overflow-hidden ${isOpen ? 'border-l-8 border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'}`}
              >
                <button
                  className="w-full flex justify-between items-center px-6 py-5 font-semibold text-lg text-gray-800 focus:outline-none hover:bg-indigo-100 transition-colors"
                  onClick={() => handleFaqClick(idx)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <svg
                    className={`w-6 h-6 ml-4 transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : 'rotate-0 text-gray-400'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`transition-all duration-300 px-6 text-gray-700 text-base bg-indigo-50 ${isOpen ? 'max-h-96 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'} whitespace-pre-line`}
                  style={{ overflow: 'hidden' }}
                >
                  {faq.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Profile Completion Modal */}
      {showProfileForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Complete Your Profile</h2>
            <p className="text-gray-600 text-center mb-6">
              Please provide your phone number, gender, age, and address to proceed.
            </p>
            <form onSubmit={handleProfileFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={profileFormData.phone}
                  onChange={handleProfileFormChange}
                  placeholder="e.g., 9876543210"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500"
                  required
                />
                {!userProfile?.is_phone_verified && profileFormData.phone && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="mt-2 w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP for Verification'}
                  </button>
                )}
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={profileFormData.gender}
                  onChange={handleProfileFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500"
                  required
                >
                  <option value="Select Gender">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={profileFormData.age}
                  onChange={handleProfileFormChange}
                  placeholder="Your age"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="current_address" className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
                <textarea
                  name="current_address"
                  value={profileFormData.current_address}
                  onChange={handleProfileFormChange}
                  placeholder="Your current address"
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading || (profileFormData.gender === 'Select Gender' || !profileFormData.age || !profileFormData.current_address || !profileFormData.phone)}
                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Saving Profile...' : 'Save Profile and Continue'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Verify Phone OTP</h3>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="XXXXXX"
                  maxLength={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500 text-center tracking-widest"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOtpModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
