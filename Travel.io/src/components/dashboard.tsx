import React, { useState, useEffect } from 'react';

// Initial JSON data that would normally come from API
const initialData = {
  popularCities: [
    "Ahmedabad", "Ahmednagar", "Ajmer", "Aligarh", "Allahabad", "Almora", "Alwar", "Ambala", "Ambemath", "Amritsar",
    "Andheri", "Anjad", "Asansol", "Aurangabad", "Azamgarh", "Bahraich", "Balsad", "Bangalore", "Bardoli"
  ],
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
  
  // Click handler: Add more cities
  const handleAddMoreCity = () => {
    console.log("Add more city clicked");
    // Implement functionality to add more cities
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
  
    // Submit to API...
  };
  

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
                  onChange={handleBookingChange}
                  placeholder="Enter pickup location" 
                  className="w-full p-2 rounded border border-gray-300" 
                />
                <span className="absolute right-2 top-2 text-gray-400">
                  ⊙
                </span>
              </div>
              
              <div className="mb-3 relative">
                <input 
                  type="text" 
                  name="destination"
                  value={bookingForm.destination}
                  onChange={handleBookingChange}
                  placeholder="Enter destination" 
                  className="w-full p-2 rounded border border-gray-300" 
                />
                <span className="absolute right-2 top-2 text-gray-400">
                  ⊙
                </span>
              </div>
              
              <button 
                type="button"
                onClick={handleAddMoreCity}
                className="w-full p-2 rounded bg-green-500 text-white mb-3 flex items-center justify-center"
              >
                <span>Add more city</span>
                <span className="ml-1">▼</span>
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
      
      {/* Popular Cities Footer */}
      <footer className="bg-green-500 mx-4 my-2 p-4 text-sm">
        <p className="font-medium mb-2">Popular Cities</p>
        <div className="text-xs mb-4">
          {data.popularCities.map((city, index) => (
            <React.Fragment key={city}>
              <a href="#" className="hover:underline">{city}</a>
              {index < data.popularCities.length - 1 && " | "}
            </React.Fragment>
          ))}
        </div>
        
        <div className="text-xs flex flex-wrap gap-x-2">
          {data.serviceTypes.map((service, index) => (
            <React.Fragment key={service}>
              <span>{service}</span>
              {index < data.serviceTypes.length - 1 && " | "}
            </React.Fragment>
          ))}
        </div>
      </footer>
    </div>
  );
}