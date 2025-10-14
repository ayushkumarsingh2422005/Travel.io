import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Link, useNavigate } from 'react-router-dom';

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
      avatarUrl: "/api/placeholder/64/64"
    },
    {
      id: 2,
      name: "Customer 2",
      rating: 4,
      comment: "It was a really great journey from Manali to Delhi and the driver was very polite and cooperative.",
      avatarUrl: "/api/placeholder/64/64"
    },
    {
      id: 3,
      name: "Customer 3",
      rating: 5,
      comment: "It was a really great journey from Manali to Delhi and the driver was very polite and cooperative.",
      avatarUrl: "/api/placeholder/64/64"
    },
    {
      id: 4,
      name: "Customer 4",
      rating: 4,
      comment: "It was a really great journey from Manali to Delhi and the driver was very polite and cooperative.",
      avatarUrl: "/api/placeholder/64/64"
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

export default function MarcoCabService() {
  const navigate = useNavigate();
  // State to hold data that would come from API
  const [data, setData] = useState(initialData);
  
  // Form states
  const [bookingForm, setBookingForm] = useState({
    tripType: "Round Trip",
    pickupLocation: "",
    destination: "",
    cabType: "Outstation"
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
    });
  }, []);

  type FormState = Record<string, string>;

  const handleInputChange = <T extends FormState>(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    formSetter: React.Dispatch<React.SetStateAction<T>>
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
  
  // Contact form handler
  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    handleInputChange(e, setContactForm);
  };
  
  // Partner form handler
  const handlePartnerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    handleInputChange(e, setPartnerForm);
  };
  
  // Trip type selector
  const handleTripTypeChange = (type: string) => {
    setBookingForm(prev => ({ ...prev, tripType: type }));
  };
  
  // Click handler: Book now
  const handleBookNow = () => {
    console.log("Book Now clicked");
    // Implement book now functionality
  };
  
  // Form submission: Contact
  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Contact form submitted:", contactForm);
  
    // Submit to API...
  
    // Reset form
    setContactForm({ name: "", email: "", mobile: "", message: "" });
  };
  
  // Form submission: Partner
  const handlePartnerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Partner form submitted:", partnerForm);
  
    // Submit to API...
  
    // Reset form
    setPartnerForm({ name: "", email: "", mobile: "", message: "" });
  };
  
  // Form submission: Booking
  const handleBookingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Booking form submitted:", bookingForm);

    // Prepare basic route data for navigation
    const routeData = {
      pickup: bookingForm.pickupLocation,
      destination: bookingForm.destination,
      stops: additionalStops.map(stop => stop.location),
      tripType: bookingForm.tripType
    };

    console.log(routeData);
    

    // Navigate to prices page with route data
    navigate('/prices', { state: routeData });
  };

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
    const fullLocation = `${location}, Maharashtra, India`; // Append state and country
    if (type === 'pickup') {
      setBookingForm(prev => ({ ...prev, pickupLocation: fullLocation }));
      setShowPickupSuggestions(false);
    } else {
      setBookingForm(prev => ({ ...prev, destination: fullLocation }));
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
      }
    }
  };

  // Handle stop suggestion selection
  const handleStopSuggestionSelect = (id: number, location: string) => {
    const fullLocation = `${location}, Maharashtra, India`; // Append state and country
    setAdditionalStops(prev => 
      prev.map(stop => {
        if (stop.id === id) {
          return {
            ...stop,
            location: fullLocation,
            showSuggestions: false
          };
        }
        return stop;
      })
    );
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
      {/* Header with Logo */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-white">MARCO</div>
            <div className="hidden md:flex ml-10 space-x-6">
              <a href="#services" className="text-white hover:text-green-100 transition-colors">Services</a>
              <a href="#reviews" className="text-white hover:text-green-100 transition-colors">Reviews</a>
              <a href="#contact" className="text-white hover:text-green-100 transition-colors">Contact</a>
              <a href="#partner" className="text-white hover:text-green-100 transition-colors">Partner with us</a>
            </div>
          </div>
          {/* <button className="md:hidden bg-white/20 rounded-lg p-2 text-white hover:bg-white/30 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button> */}
          <div className="hidden md:block">
            <Link to={"/login"} className="bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors">
              Call Us
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section with Booking Form */}
      <section className="bg-[url('/bg/carbg.jpg')] bg-cover bg-center text-white bg-gray-500 bg-blend-multiply">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Reliable Travel Partner</h1>
              <p className="text-xl mb-8 text-green-50">Experience comfortable, safe and affordable cab services throughout India.</p>
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
                  <div className="text-sm text-green-100">Happy Customers</div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 text-black">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Book Your Ride</h2>
                </div>
                
                <form onSubmit={handleBookingSubmit} className="p-6">
                  <div className="mb-6">
                    <select 
                      name="cabType"
                      className="w-full p-3 rounded-lg border  border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500 mb-4"
                      value={bookingForm.cabType}
                      onChange={handleBookingChange}
                    >
                      {data.cabOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    
                    <div className="flex gap-2 mb-4">
                      <button 
                        type="button"
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                          bookingForm.tripType === "Round Trip" 
                            ? "bg-green-600 text-white" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() => handleTripTypeChange("Round Trip")}
                      >
                        Round Trip
                      </button>
                      <button 
                        type="button"
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                          bookingForm.tripType === "One Way" 
                            ? "bg-green-600 text-white" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() => handleTripTypeChange("One Way")}
                      >
                        One Way
                      </button>
                    </div>
                    
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
                        className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-h-500" 
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

                    {/* Additional Stops */}
                    {additionalStops.map((stop) => (
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
                            className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:focus:border-green-500" 
                          />
                          {stop.showSuggestions && stop.suggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg top-full">
                              {stop.suggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  onClick={() => {
                                    handleStopSuggestionSelect(stop.id, suggestion);
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
                    
                    <div className="mb-4 relative" ref={destinationRef}>
                      <div className="absolute left-3 top-3 text-gray-400">
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
                        placeholder="Destination" 
                        className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500" 
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
                    
                    <button 
                      type="button"
                      onClick={handleAddStop}
                      className="w-full p-3 rounded-lg border border-dashed border-green-500 text-green-600 mb-4 flex items-center justify-center hover:bg-green-50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Stop
                    </button>
                 
                    
                    <button 
                      type="submit"
                      className="w-full p-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
                    >
                      Check Price & Book
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why Travel with Marco Section */}
      <section id="services" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Travel with Marco?</h2>
            <p className="text-gray-600">Experience the best cab service with features designed for your comfort and convenience</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
            {data.services.map((service) => (
              <div key={service.id} className="bg-white rounded-xl shadow-md p-6 transform transition-transform hover:scale-105">
                <div className="bg-gradient-to-r from-green-500 to-green-600 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto text-white">
                  <span className="text-xl">{service.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-center mb-4">{service.title}</h3>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform transition-transform hover:-translate-y-1"
            >
              Book Your Cab Now
            </button>
          </div>
        </div>
      </section>
      
      {/* Customer Reviews Section */}
      <section id="reviews" className="py-16 bg-gradient-to-r from-green-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">What Our Customers Say</h2>
            <p className="text-gray-600">Discover why travelers across India choose Marco for their journeys</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden mr-4 border-2 border-green-500">
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
          
          <div className="flex justify-center mt-12">
            <button className="flex items-center text-green-600 font-medium hover:text-green-700 transition-colors">
              View all reviews
              <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>
      
      {/* Contact & Partner Forms Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Us Form */}
            <div id="contact" className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Contact Us</h2>
                <p className="text-green-100 text-sm">Drop a message, we're always here for you!</p>
              </div>
              
              <form onSubmit={handleContactSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      placeholder="Enter your name" 
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      placeholder="Your email address" 
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <div className="flex">
                      <div className="bg-gray-100 p-3 rounded-l-lg border-y border-l border-gray-300 text-gray-600">+91</div>
                      <input 
                        type="tel" 
                        name="mobile"
                        value={contactForm.mobile}
                        onChange={handleContactChange}
                        placeholder="Your mobile number" 
                        className="flex-1 p-3 rounded-r-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500 max-w-[180px] sm:max-w-none"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea 
                      name="message"
                      value={contactForm.message}
                      onChange={handleContactChange}
                      placeholder="Write your message for us" 
                      rows={4}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500"
                      required
                    ></textarea>
                  </div>
                </div>
                
                <div className="mt-6 bg-gray-50 -mx-6 -mb-6 px-6 py-4 flex flex-col sm:flex-row justify-between items-center">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center mb-1">
                      <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">{data.contactInfo.email}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm text-gray-600">{data.contactInfo.phone}</span>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
            
            {/* Partner with us Form */}
            <div id="partner" className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Partner with Us</h2>
                <p className="text-green-100 text-sm">Attach your car with us and start earning!</p>
              </div>
              
              <form onSubmit={handlePartnerSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={partnerForm.name}
                      onChange={handlePartnerChange}
                      placeholder="Enter your name" 
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={partnerForm.email}
                      onChange={handlePartnerChange}
                      placeholder="Your email address" 
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <div className="flex">
                      <div className="bg-gray-100 p-3 rounded-l-lg border-y border-l border-gray-300 text-gray-600">+91</div>
                      <input 
                        type="tel" 
                        name="mobile"
                        value={partnerForm.mobile}
                        onChange={handlePartnerChange}
                        placeholder="Your mobile number" 
                        className="flex-1 p-3 rounded-r-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500 max-w-[180px] sm:max-w-none"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea 
                      name="message"
                      value={partnerForm.message}
                      onChange={handlePartnerChange}
                      placeholder="Tell us about your car and services" 
                      rows={4}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500"
                      required
                    ></textarea>
                  </div>
                </div>
                
                <div className="mt-6 bg-gray-50 -mx-6 -mb-6 px-6 py-4 flex flex-col sm:flex-row justify-between items-center">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center mb-1">
                      <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">{data.partnerInfo.email}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm text-gray-600">{data.partnerInfo.phone}</span>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      
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
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882-.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
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
              <Link to="/privacy-policy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-use" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/cancellation-policy" className="text-sm text-gray-400 hover:text-white transition-colors">Cancellation & Refund Policy</Link>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
