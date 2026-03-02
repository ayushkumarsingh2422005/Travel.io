import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { API_ENDPOINTS } from '../api/apiEndpoints';
import Footer from '../components/Footer';

// Initial JSON data that would normally come from API
const initialData = {
  contactInfo: {
    email: "support@xyz.com",
    phone: "+91 xx-xxxx-xxxx"
  },
  partnerInfo: {
    email: "admin@xyz.com",
    phone: "+91 xx-xxxx-xxxx"
  },
  services: [
    {
      id: 1,
      title: "Clean Cab",
      icon: "🚕",
      features: [
        "Well sanitized cars",
        "Cleaned by professionals",
        "Zero bad smell"
      ]
    },
    {
      id: 2,
      title: "Transparent Billing",
      icon: "🧾",
      features: [
        "No blind charges",
        "No Driver Charges",
        "Detailed bill breakdown"
      ]
    },
    {
      id: 3,
      title: "Reliable Service",
      icon: "✓",
      features: [
        "On time pick-up",
        "Pan India Driver availability",
        "Instant ride confirmation"
      ]
    },
    {
      id: 4,
      title: "Trained Drivers",
      icon: "👨‍✈️",
      features: [
        "Trained Drivers",
        "100% Verified Drivers",
        "Client Focused drivers"
      ]
    },
    {
      id: 5,
      title: "Our Services",
      icon: "🤝",
      features: [
        "Outstation Cabs",
        "Intercity Cabs",
        "Local car rental for wedding & Others",
        "Airport Transfer"
      ]
    }
  ],
  reviews: [
    {
      id: 1,
      name: "Customer 1",
      rating: 5,
      comment: "It was a really great journey from Manali to Delhi and the driver was very polite and cooperative.",
      avatarUrl: "/dummy/customer-1.jpg"
    },
    {
      id: 2,
      name: "Customer 2",
      rating: 4,
      comment: "It was a really great journey from Manali to Delhi and the driver was very polite and cooperative.",
      avatarUrl: "/dummy/customer-2.jpg"
    },
    {
      id: 3,
      name: "Customer 3",
      rating: 5,
      comment: "It was a really great journey from Manali to Delhi and the driver was very polite and cooperative.",
      avatarUrl: "/dummy/customer-3.jpg"
    },
    {
      id: 4,
      name: "Customer 4",
      rating: 4,
      comment: "It was a really great journey from Manali to Delhi and the driver was very polite and cooperative.",
      avatarUrl: "/dummy/customer-1.jpg"
    }
  ],
  serviceTypes: [
    "One-way Cab",
    "Car Rental",
    "Airport Taxi",
    "Local Sightseeing",
    "Innova",
    "Tempo Traveller",
    "Pet Friendly Cab"
  ],
  cabOptions: ["Outstation", "Local", "Airport"]
};

interface AutocompleteService {
  getPlacePredictions: (request: {
    input: string;
    types?: string[];
    componentRestrictions?: { country: string };
  }) => Promise<{
    predictions: Array<{ description: string }>;
  }>;
}

interface Geocoder {
  geocode: (request: {
    location?: { lat: number; lng: number };
  }) => Promise<{ results: { formatted_address: string }[] }>;
}

const safeDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

export default function MarcoCabService() {
  const navigate = useNavigate();
  // State to hold data that would come from API
  const [data, setData] = useState(initialData);

  // Form states
  const [bookingForm, setBookingForm] = useState({
    tripType: "Round Trip",
    pickupLocation: "",
    destination: "",
    cabType: "Outstation",
    pickupDate: "",
    dropDate: "" // Used as "Return Date" or "End Date" logic
  });

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    mobile: "",
    message: ""
  });

  const [partnerForm, setPartnerForm] = useState({
    name: "",
    email: "",
    mobile: "",
    message: ""
  });

  // Add new states for location suggestions
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [autocompleteService, setAutocompleteService] = useState<AutocompleteService | null>(null);
  const [geocoder, setGeocoder] = useState<Geocoder | null>(null);

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

  // Effect to simulate API data fetch
  useEffect(() => {
    // This is where you would fetch data from your API
    // For example:
    // const fetchData = async () => {
    //   try {
    //     const response = await fetch('https://api.example.com/data');
    //     const jsonData = await response.json();
    //     setData(jsonData);
    //   } catch (error) {
    //     console.error("Error fetching data:", error);
    //   }
    // };
    // fetchData();

    // For now, we'll just use the initial data
    setData(initialData);
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
      setGeocoder(new google.maps.Geocoder());
    });
  }, []);

  // type FormState = Record<string, string>;

  // const handleInputChange = <T extends FormState>(
  //   e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  //   formSetter: React.Dispatch<React.SetStateAction<T>>
  // ) => {
  //   const { name, value } = e.target;
  //   formSetter(prev => ({ ...prev, [name]: value }));
  // };

  // Booking form handler
  // const handleBookingChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  // ) => {
  //   handleInputChange(e, setBookingForm);
  // };

  // Date picker handler
  const handleDateChange = (date: Date | null, field: string) => {
    if (date) {
      // Adjust for timezone offset to keep local time
      const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      setBookingForm(prev => ({ ...prev, [field]: offsetDate.toISOString().slice(0, 16) }));
    } else {
      setBookingForm(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Contact form handler
  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      // Only allow numeric input and max 10 digits
      if (!/^\d*$/.test(value) || value.length > 10) return;
    }
    if (name === "name" && value.length > 50) return;
    if (name === "message" && value.length > 500) return;

    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  // Partner form handler
  const handlePartnerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      // Only allow numeric input and max 10 digits
      if (!/^\d*$/.test(value) || value.length > 10) return;
    }
    if (name === "name" && value.length > 50) return;
    if (name === "message" && value.length > 500) return;

    setPartnerForm(prev => ({ ...prev, [name]: value }));
  };

  // Trip type selector
  const handleTripTypeChange = (type: string) => {
    setBookingForm(prev => ({ ...prev, tripType: type }));
  };

  // Click handler: Book now
  const handleBookNow = () => {
    navigate("/cabs");
  };

  // Form submission: Contact
  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      toast.error("Please enter a valid email address.", { id: 'contact-email-error' });
      return;
    }
    if (contactForm.mobile.length !== 10) {
      toast.error("Mobile number must be exactly 10 digits.", { id: 'contact-mobile-error' });
      return;
    }

    const token = localStorage.getItem('marcocabs_customer_token')

    if (token == null) {
      toast.error("Please login to contact us.", { id: 'contact-login-error' });
      return;
    }

    try {
      const response = await axios.post(API_ENDPOINTS.CONTACT, contactForm, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        toast.success(response.data.message || "Message sent successfully!", { id: 'contact-success' });
        setContactForm({ name: "", email: "", mobile: "", message: "" });
      } else {
        toast.error(response.data.message || "Failed to send message.", { id: 'contact-failure' });
      }
    } catch (error: any) {
      console.error("Contact form error:", error);
      toast.error(error.response?.data?.message || "An error occurred. Please try again.", { id: 'contact-error' });
    }
  };

  // Form submission: Partner
  const handlePartnerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(partnerForm.email)) {
      toast.error("Please enter a valid email address.", { id: 'partner-email-error' });
      return;
    }
    if (partnerForm.mobile.length !== 10) {
      toast.error("Mobile number must be exactly 10 digits.", { id: 'partner-mobile-error' });
      return;
    }
    const token = localStorage.getItem('marcocabs_customer_token')

    if (token == null) {
      toast.error("Please login to partner with us.", { id: 'partner-login-error' });
      return;
    }
    try {
      const response = await axios.post(API_ENDPOINTS.PARTNER, partnerForm, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        toast.success(response.data.message || "Application sent successfully!", { id: 'partner-success' });
        setPartnerForm({ name: "", email: "", mobile: "", message: "" });
      } else {
        toast.error(response.data.message || "Failed to send application.", { id: 'partner-failure' });
      }
    } catch (error: any) {
      console.error("Partner form error:", error);
      toast.error(error.response?.data?.message || "An error occurred. Please try again.", { id: 'partner-error' });
    }
  };

  // Form submission: Booking
  const handleBookingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Strict Validation
    if (!bookingForm.pickupLocation) {
      toast.error("Please enter a Pickup Location", { id: 'pickup-location-error' });
      return;
    }
    if (!bookingForm.destination && bookingForm.tripType !== "Hourly Rental") {
      toast.error("Please enter a Drop Location", { id: 'drop-location-error' });
      return;
    }
    if (!bookingForm.pickupDate) {
      toast.error("Please select a Pickup Date & Time", { id: 'pickup-date-error' });
      return;
    }
    if ((bookingForm.tripType === "Round Trip" || (bookingForm.tripType === "One Way" && additionalStops.length > 0)) && !bookingForm.dropDate) {
      toast.error("Please select a Drop Date & Time", { id: 'drop-date-error' });
      return;
    }


    console.log("Booking form submitted:", bookingForm);

    // Prepare basic route data for navigation
    const routeData = {
      pickup: bookingForm.pickupLocation,
      destination: bookingForm.destination,
      stops: additionalStops.map(stop => stop.location),
      tripType: bookingForm.tripType,
      pickupDate: bookingForm.pickupDate,
      dropDate: bookingForm.dropDate
    };

    console.log(routeData);


    // Navigate to cabs page with route data
    navigate('/cabs', { state: routeData });
  };

  // Handle keyboard navigation for suggestions
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    suggestions: string[],
    onSelect: (val: string) => void,
    closeSuggestions: () => void
  ) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        onSelect(suggestions[activeSuggestionIndex]);
        setActiveSuggestionIndex(-1);
      }
    } else if (e.key === "Escape") {
      closeSuggestions();
      setActiveSuggestionIndex(-1);
    }
  };

  // Function to get location suggestions
  const getLocationSuggestions = async (input: string, setSuggestions: React.Dispatch<React.SetStateAction<string[]>>) => {
    setActiveSuggestionIndex(-1); // Reset active index when typing
    if (!autocompleteService || !input) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await autocompleteService.getPlacePredictions({
        input: input,
        // types: ['(cities)'], // Removed restriction
        componentRestrictions: { country: 'in' }
      });

      if (response && response.predictions) {
        setSuggestions(response.predictions.map((prediction: { description: string }) => prediction.description));
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
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

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (geocoder) {
            geocoder.geocode({ location: { lat: latitude, lng: longitude } })
              .then((response) => {
                if (response.results[0]) {
                  setBookingForm(prev => ({ ...prev, pickupLocation: response.results[0].formatted_address }));
                  setShowPickupSuggestions(false);
                }
              })
              .catch((e) => console.error("Geocoder failed due to: " + e));
          }
        },
        () => {
          alert("Error: The Geolocation service failed.");
        }
      );
    } else {
      alert("Error: Your browser doesn't support geolocation.");
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
          // types: ['(cities)'], // Removed restriction
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
      }
    }
  };

  // use cline


  // // Handle stop suggestion selection
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
      {/* Header with Logo */}
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-white">MARCO</div>
            {/* <div className="hidden md:flex ml-10 space-x-6">
              <a href="#services" className="text-white hover:text-indigo-100 transition-colors">Services</a>
              <a href="#reviews" className="text-white hover:text-indigo-100 transition-colors">Reviews</a>
              <a href="#contact" className="text-white hover:text-indigo-100 transition-colors">Contact</a>
              <a href="#partner" className="text-white hover:text-indigo-100 transition-colors">Partner with us</a>
            </div> */}
          </div>
          {/* <button className="md:hidden bg-white/20 rounded-lg p-2 text-white hover:bg-white/30 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button> */}
          <div className="hidden md:block">
            <Link to={"/login"} className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Booking Form */}
      <section className="relative bg-gray-900 overflow-hidden min-h-[1100px] md:min-h-[700px]">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gray-900/70 bg-blend-multiply z-10" />
          <img
            src="/bg/carbg.jpg"
            alt="Background"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-12 text-white">
          <div className="flex flex-col md:flex-row gap-8 min-h-[620px] items-center">
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Reliable Travel Partner</h1>
              <p className="text-xl mb-8 text-indigo-50">Experience comfortable, safe and affordable cab services throughout India.</p>
              <div className="flex flex-wrap gap-4 mb-8">
                {data.serviceTypes.slice(0, 4).map((type, index) => (
                  <span key={index} className="px-4 py-2 bg-white/20 rounded-full text-sm">
                    {type}
                  </span>
                ))}
              </div>
              <div className="flex items-center ">
                <div className="flex -space-x-4">
                  {[1, 2, 3].map((idx) => (
                    <img
                      key={idx}
                      src={`/dummy/customer-${idx}.jpg`}
                      alt={`Customer ${idx}`}
                      className="w-12 h-12 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
                <div className="ml-4">
                  <div className="text-xl font-bold">500+</div>
                  <div className="text-sm text-indigo-100">Happy Customers</div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 text-black">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Book Your Ride</h2>
                </div>

                <form onSubmit={handleBookingSubmit} className="p-6">
                  <div className="mb-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-6">
                      <p className="text-sm text-blue-800">
                        <span className="text-red-500 font-bold mr-1">*</span> Fields marked with red asterisk are required for booking
                      </p>
                    </div>
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


                    <div className="mb-4" ref={pickupRef}>
                      <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 mb-1">
                        Pickup Location <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
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
                          onFocus={() => {
                            if (bookingForm.pickupLocation.trim() !== "") setShowPickupSuggestions(true);
                          }}
                          placeholder="Pickup location"
                          onKeyDown={(e) => handleKeyDown(e, pickupSuggestions, (val) => handleSuggestionSelect(val, 'pickup'), () => setShowPickupSuggestions(false))}
                          className="w-full p-3 pl-12 rounded-lg border border-gray-300 focus:ring focus:ring-indigo-200 focus:border-indigo-500"
                        />
                        {/* Show suggestions or Current Location option when input is focused or has text */}
                        {(showPickupSuggestions || bookingForm.pickupLocation === "") && (
                          <div className={`absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg ${!showPickupSuggestions && "invisible"}`}>
                            {/* Add Current Location option */}
                            <div
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 flex items-center text-indigo-600"
                              onClick={handleCurrentLocation}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Current Location
                            </div>

                            {pickupSuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${index === activeSuggestionIndex ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50"}`}
                                onClick={() => handleSuggestionSelect(suggestion, 'pickup')}
                                onMouseEnter={() => setActiveSuggestionIndex(index)}
                              >
                                {suggestion}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Additional Stops */}
                      {additionalStops.map((stop) => (
                        <div key={stop.id} className="mb-4 relative flex items-center" ref={el => { stopRefs.current[stop.id] = el; }}>
                          <div className="flex-1 relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              value={stop.location}
                              onChange={(e) => handleStopLocationChange(stop.id, e.target.value)}
                              placeholder="Stop location"
                              className="w-full p-3 pl-12 rounded-lg border border-gray-300 focus:ring focus:ring-indigo-200 focus:focus:border-indigo-500"
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

                      {bookingForm.tripType !== "Hourly Rental" ? (
                        <div className="mb-4" ref={destinationRef}>
                          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                            Drop Location <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              name="destination"
                              value={bookingForm.destination}
                              onChange={handleDestinationChange}
                              placeholder="Drop location"
                              onKeyDown={(e) => handleKeyDown(e, destinationSuggestions, (val) => handleSuggestionSelect(val, 'destination'), () => setShowDestinationSuggestions(false))}
                              className="w-full p-3 pl-12 rounded-lg border border-gray-300 focus:ring focus:ring-indigo-200 focus:border-indigo-500"
                            />
                            {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                                {destinationSuggestions.map((suggestion, index) => (
                                  <div
                                    key={index}
                                    className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${index === activeSuggestionIndex ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50"}`}
                                    onClick={() => handleSuggestionSelect(suggestion, 'destination')}
                                    onMouseEnter={() => setActiveSuggestionIndex(index)}
                                  >
                                    {suggestion}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 relative">
                          <div className="absolute left-3 top-3 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            disabled
                            value="Local / Within City Usage"
                            className="w-full p-3 pl-10 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                          />
                        </div>
                      )}

                    </div>

                    {bookingForm.tripType !== "Hourly Rental" ? (
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
                    ) : (
                      <div className="w-full p-3 rounded-lg border border-dashed border-gray-300 text-gray-400 mb-4 flex items-center justify-center bg-gray-50 cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Standard Package (8 Hr / 80 Km)
                      </div>
                    )}

                    <div className="mb-4">
                      <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Pickup Date & Time <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <DatePicker
                          selected={safeDate(bookingForm.pickupDate)}
                          onChange={(date: Date | null) => handleDateChange(date, 'pickupDate')}
                          showTimeSelect
                          timeCaption="Time"
                          timeIntervals={15}
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={new Date()}
                          filterTime={(time) => {
                            const now = new Date();
                            const selectedDate = safeDate(bookingForm.pickupDate) || new Date();
                            if (selectedDate.toDateString() === now.toDateString()) {
                              return time.getTime() > now.getTime();
                            }
                            return true;
                          }}
                          placeholderText="Select Date & Time"
                          className="w-full p-3 pr-10 rounded-lg border border-gray-300 focus:ring focus:ring-indigo-200 focus:border-indigo-500 cursor-pointer"
                          wrapperClassName="w-full"
                          required
                          fixedHeight
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>


                    {(bookingForm.tripType === 'Round Trip' || (bookingForm.tripType === 'One Way' && additionalStops.length > 0)) ? (
                      <div className="mb-4">
                        <label htmlFor="dropDate" className="block text-sm font-medium text-gray-700 mb-1">
                          {bookingForm.tripType === 'Round Trip' ? 'Drop Date & Time' : 'Drop Date & Time'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative" onClickCapture={(e) => {
                          if (!bookingForm.pickupDate) {
                            e.stopPropagation();
                            toast.error("Please select Pickup Date & Time first.", { id: 'pickup-first-error' });
                          }
                        }}>
                          <DatePicker
                            selected={safeDate(bookingForm.dropDate)}
                            onChange={(date: Date | null) => handleDateChange(date, 'dropDate')}
                            showTimeSelect
                            timeCaption="Time"
                            timeIntervals={15}
                            dateFormat="MMMM d, yyyy h:mm aa"
                            minDate={safeDate(bookingForm.pickupDate) || new Date()}
                            filterTime={(time) => {
                              const pickupDate = safeDate(bookingForm.pickupDate);
                              if (!pickupDate) return true;
                              if (time.toDateString() === pickupDate.toDateString()) {
                                return time.getTime() > pickupDate.getTime();
                              }
                              return true;
                            }}
                            disabled={!bookingForm.pickupDate}
                            placeholderText={bookingForm.pickupDate ? "Select Date & Time" : "Select Pickup First"}
                            className={`w-full p-3 pr-10 rounded-lg border border-gray-300 focus:ring focus:ring-indigo-200 focus:border-indigo-500 ${!bookingForm.pickupDate ? 'cursor-not-allowed bg-gray-50' : 'cursor-pointer'}`}
                            wrapperClassName="w-full"
                            required
                            fixedHeight
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          {bookingForm.tripType === 'Hourly Rental' ? 'Duration / Drop Time' : 'Return Date & Time'}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            disabled
                            value={bookingForm.tripType === 'Hourly Rental' ? "As per Selected Package" : "Select Round Trip to add return"}
                            className="w-full p-3 pr-10 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}


                    <button
                      type="submit"
                      className="w-full p-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Book your Cab
                    </button>

                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Why Travel with Marco Section */}
      < section id="services" className="py-16 bg-white" >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Travel with Marco?</h2>
            <p className="text-gray-600">Experience the best cab service with features designed for your comfort and convenience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
            {data.services.map((service) => (
              <div key={service.id} className="bg-white rounded-xl shadow-md p-6 transform transition-transform hover:scale-105">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto text-white">
                  <span className="text-xl">{service.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-center mb-4">{service.title}</h3>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleBookNow}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform transition-transform hover:-translate-y-1"
            >
              Book Your Cab Now
            </button>
          </div>
        </div>
      </section >

      {/* Customer Reviews Section */}
      < section id="reviews" className="py-16 bg-gradient-to-r from-indigo-50 to-indigo-50" >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">What Our Customers Say</h2>
            <p className="text-gray-600">Discover why travelers across India choose Marco for their journeys</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden mr-4 border-2 border-indigo-500">
                    <img src={review.avatarUrl} alt={review.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{review.name}</h3>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm text-gray-500 ml-1">({review.rating}.0)</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 italic">
                  "{review.comment}"
                </p>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm text-gray-500">
                  <span>Verified Trip</span>
                  <span>2 weeks ago</span>
                </div>
              </div>
            ))}
          </div>

          {/* <div className="flex justify-center mt-12">
            <button
              className="flex items-center text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
              onClick={() => toast.success("More reviews coming soon!", { id: 'more-reviews' })}
            >
              View all reviews
              <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div> */}
        </div>
      </section >

      {/* Contact & Partner Forms Section */}
      < section className="py-16 bg-white" >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Us Form */}
            <div id="contact" className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Contact Us</h2>
                <p className="text-indigo-100 text-sm">Drop a message, we're always here for you!</p>
              </div>

              <form onSubmit={handleContactSubmit} className="p-6">
                <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-6">
                  <p className="text-sm text-blue-800">
                    <span className="text-red-500 font-bold mr-1">*</span> Fields marked with red asterisk are required to contact us
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      placeholder="Enter your name"
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-indigo-200 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      placeholder="Your email address"
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-indigo-200 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <div className="bg-gray-100 p-3 rounded-l-lg border-y border-l border-gray-300 text-gray-600">+91</div>
                      <input
                        type="tel"
                        name="mobile"
                        value={contactForm.mobile}
                        onChange={handleContactChange}
                        placeholder="Your mobile number"
                        className="flex-1 p-3 rounded-r-lg border border-gray-300 focus:ring focus:ring-indigo-200 focus:border-indigo-500 max-w-[180px] sm:max-w-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={contactForm.message}
                      onChange={handleContactChange}
                      placeholder="Write your message for us"
                      rows={4}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-indigo-200 focus:border-indigo-500 max-h-32 overflow-y-auto"
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="mt-6 bg-gray-50 -mx-6 -mb-6 px-6 py-4 flex flex-col sm:flex-row justify-between items-center">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center mb-1">
                      <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">{data.contactInfo.email}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm text-gray-600">{data.contactInfo.phone}</span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>

            {/* Partner with us Form */}
            <div id="partner" className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Partner with Us</h2>
                <p className="text-indigo-100 text-sm">Attach your car with us and start earning!</p>
              </div>

              <form onSubmit={handlePartnerSubmit} className="p-6">
                <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-6">
                  <p className="text-sm text-blue-800">
                    <span className="text-red-500 font-bold mr-1">*</span> Fields marked with red asterisk are required to apply
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={partnerForm.name}
                      onChange={handlePartnerChange}
                      placeholder="Enter your name"
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-indigo-200 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={partnerForm.email}
                      onChange={handlePartnerChange}
                      placeholder="Your email address"
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-indigo-200 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <div className="bg-gray-100 p-3 rounded-l-lg border-y border-l border-gray-300 text-gray-600">+91</div>
                      <input
                        type="tel"
                        name="mobile"
                        value={partnerForm.mobile}
                        onChange={handlePartnerChange}
                        placeholder="Your mobile number"
                        className="flex-1 p-3 rounded-r-lg border border-gray-300 focus:ring focus:ring-indigo-200 focus:border-indigo-500 max-w-[180px] sm:max-w-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={partnerForm.message}
                      onChange={handlePartnerChange}
                      placeholder="Tell us about your car and services"
                      rows={4}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-indigo-200 focus:border-indigo-500 max-h-32 overflow-y-auto"
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="mt-6 bg-gray-50 -mx-6 -mb-6 px-6 py-4 flex flex-col sm:flex-row justify-between items-center">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center mb-1">
                      <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">{data.partnerInfo.email}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm text-gray-600">{data.partnerInfo.phone}</span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section >

      {/* Footer Section */}
      <Footer />
    </div >
  );
}
