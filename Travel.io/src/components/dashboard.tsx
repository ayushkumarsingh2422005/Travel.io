import React, { useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

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

interface DistanceMatrixService {
  getDistanceMatrix: (request: {
    origins: string[];
    destinations: string[];
    travelMode: 'DRIVING';
  }) => Promise<{
    rows: Array<{
      elements: Array<{
        distance: { text: string; value: number };
        duration: { text: string; value: number };
        status: string;
      }>;
    }>;
  }>;
}

export default function MarcoCabService() {
  // State to hold data that would come from API
  const [data, setData] = useState(initialData);
  
  // Form states
  const [bookingForm, setBookingForm] = useState({
    tripType: "Round Trip",
    pickupLocation: "",
    destination: "",
    mobileNumber: "",
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
  const [distanceMatrixService, setDistanceMatrixService] = useState<DistanceMatrixService | null>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<number>(0);
  const [calculatedDuration, setCalculatedDuration] = useState<string>('');
  const [pathCheckpoints, setPathCheckpoints] = useState<string[]>([]);

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
      libraries: ["places"]
    });

    loader.load().then((google) => {
      setAutocompleteService(new google.maps.places.AutocompleteService());
      setDistanceMatrixService(new google.maps.DistanceMatrixService());
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
  
    // Show distance alert
    if (calculatedDistance > 0) {
      const distanceInKm = (calculatedDistance / 1000).toFixed(1);
      const tripType = bookingForm.tripType === 'Round Trip' ? 'Round Trip' : 'One Way';
      const totalDistance = bookingForm.tripType === 'Round Trip' 
        ? (calculatedDistance * 2 / 1000).toFixed(1) 
        : distanceInKm;
      
      alert(`Trip Details:\nDistance: ${totalDistance} km\nDuration: ${calculatedDuration}\nTrip Type: ${tripType}`);
    } else {
      alert('Please enter valid pickup and destination locations');
    }
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
    setShowPickupSuggestions(true);
    await getLocationSuggestions(value, setPickupSuggestions);
  };

  // Handle destination input change
  const handleDestinationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBookingForm(prev => ({ ...prev, destination: value }));
    setShowDestinationSuggestions(true);
    await getLocationSuggestions(value, setDestinationSuggestions);
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
            showSuggestions: true
          };
        }
        return stop;
      })
    );

    if (autocompleteService && value) {
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
    setAdditionalStops(prev => 
      prev.map(stop => {
        if (stop.id === id) {
          return {
            ...stop,
            location: location,
            showSuggestions: false
          };
        }
        return stop;
      })
    );
  };

  // Calculate path and distance
  const calculatePath = async () => {
    if (!distanceMatrixService || !bookingForm.pickupLocation || !bookingForm.destination) return;

    try {
      // Prepare waypoints including additional stops
      const waypoints = [
        bookingForm.pickupLocation,
        ...additionalStops.map(stop => stop.location),
        bookingForm.destination
      ].filter(Boolean);

      // Calculate distance for one-way trip
      const oneWayResponse = await distanceMatrixService.getDistanceMatrix({
        origins: [waypoints[0]],
        destinations: [waypoints[waypoints.length - 1]],
        travelMode: 'DRIVING'
      });

      if (oneWayResponse.rows[0].elements[0].status === 'OK') {
        const oneWayDistance = oneWayResponse.rows[0].elements[0].distance.value;
        const oneWayDuration = oneWayResponse.rows[0].elements[0].duration.text;

        // For return trip, double the distance
        const totalDistance = bookingForm.tripType === 'Round Trip' 
          ? oneWayDistance * 2 
          : oneWayDistance;

        setCalculatedDistance(totalDistance);
        setCalculatedDuration(oneWayDuration);
        setPathCheckpoints(waypoints);
      }
    } catch (error) {
      console.error('Error calculating path:', error);
    }
  };

  // Update path calculation when relevant fields change
  useEffect(() => {
    if (bookingForm.pickupLocation && bookingForm.destination) {
      calculatePath();
    }
  }, [bookingForm.pickupLocation, bookingForm.destination, bookingForm.tripType, additionalStops]);

  return (
    <div className="flex flex-col min-h-screen bg-green-500">
      {/* Header with Logo */}
      <header className="bg-green-500 py-2 px-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-white">MARCO</div>
        <button className="bg-blue-600 rounded-full p-2">
          <div className="w-6 h-px bg-white mb-1"></div>
          <div className="w-6 h-px bg-white mb-1"></div>
          <div className="w-6 h-px bg-white"></div>
        </button>
      </header>
      
      {/* Booking Section */}
      <section className="bg-blue-600 p-4 mx-4 my-2 rounded-lg flex text-white relative">
        <div className="w-1/2 pr-4">
          <img src="/api/placeholder/400/320" alt="Driver with customer" className="rounded-lg w-full h-full object-cover" />
        </div>
        
        <div className="w-1/2 bg-white text-black p-4 rounded-lg">
          <form onSubmit={handleBookingSubmit}>
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center bg-white rounded-full p-2 border border-blue-500">
                <span className="text-blue-500 font-bold">Cabs</span>
              </div>
            </div>
            
            <div className="mb-4">
              <select 
                name="cabType"
                className="w-full p-2 rounded border border-gray-300 mb-3"
                value={bookingForm.cabType}
                onChange={handleBookingChange}
              >
                {data.cabOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              
              <div className="flex gap-2 mb-3">
                <button 
                  type="button"
                  className={`flex-1 py-2 px-4 rounded-full ${bookingForm.tripType === "Round Trip" ? "bg-green-500 text-white" : "bg-gray-200"}`}
                  onClick={() => handleTripTypeChange("Round Trip")}
                >
                  Round Trip
                </button>
                <button 
                  type="button"
                  className={`flex-1 py-2 px-4 rounded-full ${bookingForm.tripType === "One Way" ? "bg-green-500 text-white" : "bg-gray-200"}`}
                  onClick={() => handleTripTypeChange("One Way")}
                >
                  One Way
                </button>
              </div>
              
              <div className="mb-3 relative">
                <input 
                  type="text" 
                  name="pickupLocation"
                  value={bookingForm.pickupLocation}
                  onChange={handlePickupLocationChange}
                  placeholder="Enter pickup location" 
                  className="w-full p-2 rounded border border-gray-300" 
                />
                {showPickupSuggestions && pickupSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg">
                    {pickupSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
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
                <div key={stop.id} className="mb-3 relative flex items-center">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={stop.location}
                      onChange={(e) => handleStopLocationChange(stop.id, e.target.value)}
                      placeholder="Enter stop location" 
                      className="w-full p-2 rounded border border-gray-300" 
                    />
                    {stop.showSuggestions && stop.suggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg">
                        {stop.suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleStopSuggestionSelect(stop.id, suggestion)}
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
                    className="ml-2 p-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <div className="mb-3 relative">
                <input 
                  type="text" 
                  name="destination"
                  value={bookingForm.destination}
                  onChange={handleDestinationChange}
                  placeholder="Enter destination" 
                  className="w-full p-2 rounded border border-gray-300" 
                />
                {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg">
                    {destinationSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
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
                className="w-full p-2 rounded bg-green-500 text-white mb-3 flex items-center justify-center"
              >
                <span>Add stop</span>
                <span className="ml-1">+</span>
              </button>
              
              <div className="mb-3 relative flex">
                <div className="bg-gray-200 p-2 rounded-l border-y border-l border-gray-300">+91</div>
                <input 
                  type="text" 
                  name="mobileNumber"
                  value={bookingForm.mobileNumber}
                  onChange={handleBookingChange}
                  placeholder="Enter Mobile number" 
                  className="flex-1 p-2 rounded-r border border-gray-300" 
                />
              </div>
              
              {/* Display calculated path information */}
              {calculatedDistance > 0 && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <h3 className="font-bold mb-2">Trip Details</h3>
                  <p>Total Distance: {(calculatedDistance / 1000).toFixed(1)} km</p>
                  <p>Estimated Duration: {calculatedDuration}</p>
                  <p>Trip Type: {bookingForm.tripType}</p>
                  <div className="mt-2">
                    <p className="font-bold">Route:</p>
                    <ol className="list-decimal pl-4">
                      {pathCheckpoints.map((checkpoint, index) => (
                        <li key={index}>{checkpoint}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
              
              <button 
                type="submit"
                className="w-full p-2 rounded bg-green-500 text-white font-medium"
              >
                Check Price & Book
              </button>
            </div>
          </form>
        </div>
      </section>
      
      {/* Why Travel with Marco Section */}
      <section className="bg-white mx-4 my-2 p-6 rounded">
        <h2 className="text-2xl font-bold text-center mb-6">Why Travel with Marco ?</h2>
        
        <div className="flex justify-between mb-6">
          {data.services.map((service) => (
            <div key={service.id} className="flex flex-col items-center">
              <div className="bg-green-500 p-3 rounded-full mb-2">
                <span className="text-xl">{service.icon}</span>
              </div>
              <span className="font-medium">{service.title}</span>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-5 gap-4 mb-6">
          {data.services.map((service) => (
            <ul key={service.id} className="list-disc pl-5">
              {service.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          ))}
        </div>
        
        <div className="flex justify-center">
          <button 
            type="button"
            onClick={handleBookNow}
            className="px-8 py-3 bg-green-500 text-white font-medium rounded"
          >
            Book Cab Now
          </button>
        </div>
      </section>
      
      {/* Customer Reviews Section */}
      <section className="bg-green-500 mx-4 my-2 p-6 rounded">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">What Our Customers Say</h2>
        
        <div className="flex gap-4">
          {data.reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg p-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
                <img src={review.avatarUrl} alt={review.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">
                    {i < review.rating ? "★" : "☆"}
                  </span>
                ))}
              </div>
              
              <p className="text-center text-sm">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Contact & Partner Forms Section */}
      <section className="bg-white mx-4 my-2 p-6 rounded">
        <div className="flex">
          <div className="w-1/2 pr-6 border-r">
            <h2 className="text-2xl font-bold mb-2">Contact Us</h2>
            <p className="mb-4">Drop a message, We're always there for you!</p>
            
            <form onSubmit={handleContactSubmit}>
              <div className="mb-3">
                <label className="block mb-1">Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  placeholder="Enter your name" 
                  className="w-full p-2 border border-gray-300"
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="block mb-1">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  placeholder="Your email address" 
                  className="w-full p-2 border border-gray-300"
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="block mb-1">Mobile number</label>
                <input 
                  type="tel" 
                  name="mobile"
                  value={contactForm.mobile}
                  onChange={handleContactChange}
                  placeholder="Your mobile number" 
                  className="w-full p-2 border border-gray-300"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-1">Message</label>
                <textarea 
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  placeholder="Write your message for us." 
                  rows={4}
                  className="w-full p-2 border border-gray-300"
                  required
                ></textarea>
              </div>
              
              <div className="mb-3">
                <p>Email us at: {data.contactInfo.email}</p>
                <div className="flex justify-between items-center">
                  <p>Call us at: {data.contactInfo.phone}</p>
                  <button type="submit" className="bg-green-500 text-white px-4 py-1 rounded">Send Now</button>
                </div>
              </div>
            </form>
          </div>
          
          <div className="w-1/2 pl-6">
            <h2 className="text-2xl font-bold mb-2">Partner with us</h2>
            <p className="mb-4">Attach your car with us!</p>
            
            <form onSubmit={handlePartnerSubmit}>
              <div className="mb-3">
                <label className="block mb-1">Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={partnerForm.name}
                  onChange={handlePartnerChange}
                  placeholder="Enter your name" 
                  className="w-full p-2 border border-gray-300"
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="block mb-1">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={partnerForm.email}
                  onChange={handlePartnerChange}
                  placeholder="Your email address" 
                  className="w-full p-2 border border-gray-300"
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="block mb-1">Mobile number</label>
                <input 
                  type="tel" 
                  name="mobile"
                  value={partnerForm.mobile}
                  onChange={handlePartnerChange}
                  placeholder="Your mobile number" 
                  className="w-full p-2 border border-gray-300"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-1">Message</label>
                <textarea 
                  name="message"
                  value={partnerForm.message}
                  onChange={handlePartnerChange}
                  placeholder="Write your message for us." 
                  rows={4}
                  className="w-full p-2 border border-gray-300"
                  required
                ></textarea>
              </div>
              
              <div className="mb-3">
                <p>Email us at: {data.partnerInfo.email}</p>
                <div className="flex justify-between items-center">
                  <p>Call us at: {data.partnerInfo.phone}</p>
                  <button type="submit" className="bg-green-500 text-white px-4 py-1 rounded">Send Now</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}