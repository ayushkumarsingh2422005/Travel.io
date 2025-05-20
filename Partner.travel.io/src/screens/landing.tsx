import React, { useState, useEffect } from 'react';

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

export default function MarcoCabService() {
  // State to hold data that would come from API
  const [data, setData] = useState(initialData);
  
  // Form states
  const [bookingForm, setBookingForm] = useState({
    fullName: "",
    businessName: "",
    gstOrPan: "",
    businessCity: "",
    phone: ""
  });
  
  // Effect to simulate API data fetch
  useEffect(() => {
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
  
  // Form submission: Booking
  const handleBookingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Registration form submitted:", bookingForm);
    // Implement registration submission logic here
  };

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
          <button className="md:hidden bg-white/20 rounded-lg p-2 text-white hover:bg-white/30 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <div className="hidden md:block">
            <a href="tel:+918800990099" className="bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors">
              Call Us
            </a>
          </div>
        </div>
      </header>
      
      {/* Hero Section with Booking Form */}
      <section className="bg-[url('./bg/partner.jpg')] bg-cover bg-center relative">
        {/* Add a dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="container mx-auto px-4 py-12 relative">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Partner with Marco</h1>
              <p className="text-xl mb-8 text-green-50">Join our network of trusted business partners and grow your business with us.</p>
              
              {/* Business Benefits List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-green-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-white">Expand your business reach across India</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-green-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-white">Access to premium business clients</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-green-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-white">Dedicated business support team</p>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-sm text-green-50">Active Partners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">50+</div>
                  <div className="text-sm text-green-50">Cities</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-sm text-green-50">Partner Satisfaction</div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 text-black">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Business Registration</h2>
                </div>
                
                <form onSubmit={handleBookingSubmit} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        name="fullName"
                        value={bookingForm.fullName}
                        onChange={handleBookingChange}
                        placeholder="Enter your full name" 
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hotel or Business Name</label>
                      <input 
                        type="text" 
                        name="businessName"
                        value={bookingForm.businessName}
                        onChange={handleBookingChange}
                        placeholder="Enter your business name" 
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GST Number or PAN</label>
                      <input 
                        type="text" 
                        name="gstOrPan"
                        value={bookingForm.gstOrPan}
                        onChange={handleBookingChange}
                        placeholder="Enter GST number or PAN" 
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business City</label>
                      <input 
                        type="text" 
                        name="businessCity"
                        value={bookingForm.businessCity}
                        onChange={handleBookingChange}
                        placeholder="Enter your business city" 
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <div className="flex">
                        <div className="bg-gray-100 p-3 rounded-l-lg border-y border-l border-gray-300 text-gray-600">+91</div>
                        <input 
                          type="tel" 
                          name="phone"
                          value={bookingForm.phone}
                          onChange={handleBookingChange}
                          placeholder="Enter your phone number" 
                          className="flex-1 p-3 rounded-r-lg border border-gray-300 focus:ring focus:ring-green-200 focus:border-green-500"
                          pattern="[0-9]{10}"
                          title="Please enter a valid 10-digit phone number"
                          required
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Enter a valid 10-digit phone number</p>
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full mt-6 p-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
                  >
                    Register Now
                  </button>
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
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Partner with Marco?</h2>
            <p className="text-gray-600">Experience the best business partnership with features designed for your growth</p>
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
              onClick={() => document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform transition-transform hover:-translate-y-1"
            >
              Register Your Business
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