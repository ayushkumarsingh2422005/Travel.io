import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader } from '@googlemaps/js-api-loader';
import UserAvatar from '../components/UserAvatar';
import toast from 'react-hot-toast';
import axios from '../api/axios';

const cabOptions = ["Outstation", "Local", "Airport"];

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
  const [cabData, setCabData] = useState<any[]>([]);
  const data = cabOptions;
  // State to hold data that would come from API
  
  // Form states
  const [bookingForm, setBookingForm] = useState({
    tripType: "Round Trip",
    pickupLocation: "",
    destination: "",
    stops: [],
    cabType: "Outstation",
    pickupDate: "",
    dropDate: ""
  });

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

  // type FormState = Record<string, string>;

  // The issue is a type mismatch: handleInputChange expects a formSetter for a generic FormState (Record<string, string>),
  // but setBookingForm is typed for a more specific shape (with fields like tripType, pickupLocation, etc).
  // The types are not compatible because the booking form state is not just Record<string, string>.

  // Solution: Remove the generic and just type handleInputChange for the actual booking form state shape.

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    formSetter: React.Dispatch<React.SetStateAction<{
      tripType: string;
      pickupLocation: string;
      destination: string;
      stops: never[];
      cabType: string;
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

  const [filters, setFilters] = useState({
    minPrice: '0',
    maxPrice: '2000',
    minSeats: '1',
    maxSeats: '20',
    searchTerm: '',
    ac: false,
    sortBy: 'per_km_charge', // 'per_km_charge' | 'no_of_seats' | 'model'
    fuelType: 'all' // 'all' | 'Petrol' | 'Diesel' | 'CNG'
  });

  
  
  const searchCabs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        min_seats: filters.minSeats || 0,
        max_seats: filters.maxSeats || 50,
        min_price_per_km: filters.minPrice || 0,
        max_price_per_km: filters.maxPrice || 200000,
        sort_by: filters.sortBy,
        location: bookingForm.pickupLocation || '',
        ac: filters.ac,
        fuel_type: filters.fuelType === 'all' ? '' : filters.fuelType,
        search_term: filters.searchTerm,
      };

      const response = await axios.get('/vehicles/search', { params });

      console.log(response);

      if (response.data.success) {
        setCabData(response.data.data.vehicles);
      } else {
        toast.error(response.data.message || 'Failed to fetch cabs');
      }
    } catch (error) {
      console.error('Error searching for cabs:', error);
      toast.error('An error occurred while searching for cabs.');
    } finally {
      setLoading(false);
    }
  }, [filters, bookingForm.pickupLocation]);

  // Form submission: Booking
  const handleBookingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate required fields
    const errors = [];
    
    if (!bookingForm.pickupLocation.trim()) {
      errors.push('Pickup location is required');
    }
    
    if (!bookingForm.destination.trim()) {
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
    
    // Check if return date is after pickup date for round trips
    if (bookingForm.tripType === 'Round Trip' && bookingForm.pickupDate && bookingForm.dropDate) {
      const pickupDateTime = new Date(bookingForm.pickupDate);
      const dropDateTime = new Date(bookingForm.dropDate);
      if (dropDateTime <= pickupDateTime) {
        errors.push('Return date must be after pickup date');
      }
    }
    
    if (errors.length > 0) {
      // Show validation errors
      errors.forEach(error => toast.error(error));
      return;
    }
    
    // If all validations pass, proceed with search
    searchCabs();
  };

  const handleBook = (cab: any) => {
    const currentStops = additionalStops.map(stop => stop.location).filter(Boolean);
    navigate('/prices', { 
      state: { 
        pickup: bookingForm.pickupLocation,
        destination: bookingForm.destination,
        tripType: bookingForm.tripType,
        pickupDate: bookingForm.pickupDate,
        dropDate: bookingForm.dropDate,
        stops: currentStops,
        cabType: cab.model,
        vehicle_id: cab.id,
      } 
    });
  };

  const handleFaqClick = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  useEffect(() => {
    const identifier = setTimeout(() => {
      searchCabs();
    }, 500);
    return () => {
      clearTimeout(identifier);
    };
  }, [searchCabs]);

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
      <header className="bg-gradient-to-r from-green-600 to-green-700 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">Select Your Cab</div>
          <UserAvatar/>
        </div>
      </header>
      {/* Booking Form Section */}
{/* Booking Section */}
<div className="container mx-auto px-4 pt-6">
  <div className="bg-white shadow-md rounded-xl p-6">
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm text-blue-800">
        <span className="text-red-500">*</span> Fields marked with red asterisk are required for booking
      </p>
    </div>
    <form onSubmit={handleBookingSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cab Type */}
        <select 
          name="cabType"
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500"
          value={bookingForm.cabType}
          onChange={handleBookingChange}
        >
          {data.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        {/* Trip Type */}
        <div className="flex gap-2">
          {["Round Trip", "One Way"].map(type => (
            <button 
              key={type}
              type="button"
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                bookingForm.tripType === type 
                  ? "bg-green-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => handleTripTypeChange(type)}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Pickup Location */}
        <div className="relative" ref={pickupRef}>
          <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Location <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            id="pickupLocation"
            name="pickupLocation"
            value={bookingForm.pickupLocation}
            onChange={handlePickupLocationChange}
            placeholder="Pickup location" 
            className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500" 
            required
          />
          {/* Suggestions */}
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

        {/* Destination */}
        <div className="relative" ref={destinationRef}>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
            Destination <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            id="destination"
            name="destination"
            value={bookingForm.destination}
            onChange={handleDestinationChange}
            placeholder="Destination" 
            className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500" 
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
      </div>

      {/* Additional Stops */}
      {additionalStops.map((stop) => (
        <div key={stop.id} className="mt-4 relative flex items-center" ref={el => { stopRefs.current[stop.id] = el; }}>
          <input 
            type="text" 
            value={stop.location}
            onChange={(e) => handleStopLocationChange(stop.id, e.target.value)}
            placeholder="Stop location" 
            className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500" 
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
          <button
            type="button"
            onClick={() => handleRemoveStop(stop.id)}
            className="ml-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
          >
            ×
          </button>
        </div>
      ))}

      {/* Add Stop Button */}
      <button 
        type="button"
        onClick={handleAddStop}
        className="w-full mt-4 p-3 rounded-lg border border-dashed border-green-500 text-green-600 flex items-center justify-center hover:bg-green-50 transition-colors"
      >
        + Add Stop
      </button>

      {/* Date and Time Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500"
            required
          />
        </div>

        {bookingForm.tripType === "Round Trip" && (
          <div>
            <label htmlFor="dropDate" className="block text-sm font-medium text-gray-700 mb-1">
              Return Date & Time <span className="text-red-500">*</span>
            </label>
            <input 
              type="datetime-local" 
              id="dropDate"
              name="dropDate"
              value={bookingForm.dropDate}
              onChange={handleBookingChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500"
              required
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button 
        type="submit"
        className="w-full mt-4 p-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
      >
        Search Available Cabs
      </button>
    </form>
  </div>
</div>

       
      {/* Filters Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-5">Filter Cabs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Search Term */}
            <div>
              <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                id="searchTerm"
                placeholder="Search cabs..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200 focus:border-green-500"
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              />
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">Min Price/km</label>
                <input
                  type="number"
                  id="minPrice"
                  placeholder="Min Price"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200 focus:border-green-500"
                  value={filters.minPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">Max Price/km</label>
                <input
                  type="number"
                  id="maxPrice"
                  placeholder="Max Price"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200 focus:border-green-500"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                />
              </div>
            </div>

            {/* Seat Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="minSeats" className="block text-sm font-medium text-gray-700 mb-1">Min Seats</label>
                <input
                  type="number"
                  id="minSeats"
                  placeholder="Min Seats"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200 focus:border-green-500"
                  value={filters.minSeats}
                  onChange={(e) => setFilters(prev => ({ ...prev, minSeats: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="maxSeats" className="block text-sm font-medium text-gray-700 mb-1">Max Seats</label>
                <input
                  type="number"
                  id="maxSeats"
                  placeholder="Max Seats"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200 focus:border-green-500"
                  value={filters.maxSeats}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxSeats: e.target.value }))}
                />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                id="sortBy"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200 focus:border-green-500"
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              >
                <option value="per_km_charge">Price per km</option>
                <option value="no_of_seats">Number of Seats</option>
                <option value="model">Model Name</option>
              </select>
            </div>

            {/* Fuel Type */}
            <div>
              <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
              <select
                id="fuelType"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200 focus:border-green-500"
                value={filters.fuelType}
                onChange={(e) => setFilters(prev => ({ ...prev, fuelType: e.target.value }))}
              >
                <option value="all">All Fuel Types</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
              </select>
            </div>

            {/* AC Only Checkbox */}
            <div className="flex items-end pb-1"> {/* Align with other inputs */}
              <label htmlFor="acOnly" className="flex items-center space-x-2 cursor-pointer text-gray-700">
                <input
                  type="checkbox"
                  id="acOnly"
                  checked={filters.ac}
                  onChange={(e) => setFilters(prev => ({ ...prev, ac: e.target.checked }))}
                  className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500"
                />
                <span>AC Only</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Cabs Grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center animate-pulse">
                  <div className="w-44 h-20 bg-gray-200 rounded mb-4" />
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="w-full h-10 bg-gray-200 rounded" />
                </div>
              ))
            : cabData.map((cab) => (
                <div key={cab.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
                  <img src={cab.image || 'https://via.placeholder.com/180x80?text=No+Image'} alt={cab.model} className="w-44 h-20 object-contain mb-4" />
                  <div className="text-xl font-bold mb-1">{cab.model}</div>
                  <div className="text-gray-600 mb-2 text-center">{cab.rc_vehicle_manufacturer_name}</div>
                  <div className="flex items-center mb-2">
                    <div className="text-2xl font-bold text-green-700">₹{cab.per_km_charge}/km</div>
                    <div className="ml-2 flex items-center text-yellow-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="ml-1">{cab.vendor_rating}</span>
                    </div>
                  </div>
                  <div className="w-full space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Seats:</span>
                      <span className="font-semibold">{cab.no_of_seats}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-semibold">{cab.rc_body_type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-semibold">{cab.rc_vehicle_category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Color:</span>
                      <span className="font-semibold">{cab.rc_vehicle_colour}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Year:</span>
                      <span className="font-semibold">{cab.rc_vehicle_manufacturing_month_year}</span>
                    </div>
                  </div>
                  {/* Amenities can be added here later if available from the API */}
                  <button
                    className="w-full p-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors mt-auto"
                    onClick={() => handleBook(cab)}
                  >
                    Book Now
                  </button>
                </div>
              ))}
        </div>
        {cabData.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="text-xl text-gray-600">No cabs found matching your criteria</div>
          </div>
        )}
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
                className={`transition-all duration-300 border rounded-xl shadow-md overflow-hidden ${isOpen ? 'border-l-8 border-green-600 bg-green-50' : 'border-gray-200 bg-white'}`}
              >
                <button
                  className="w-full flex justify-between items-center px-6 py-5 font-semibold text-lg text-gray-800 focus:outline-none hover:bg-green-100 transition-colors"
                  onClick={() => handleFaqClick(idx)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <svg
                    className={`w-6 h-6 ml-4 transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-green-600' : 'rotate-0 text-gray-400'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`transition-all duration-300 px-6 text-gray-700 text-base bg-green-50 ${isOpen ? 'max-h-96 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'} whitespace-pre-line`}
                  style={{ overflow: 'hidden' }}
                >
                  {faq.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-2xl font-bold">MARCO</div>
              <p className="text-gray-400 text-sm mt-1">Your reliable travel partner across India</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Marco Cab Services. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
