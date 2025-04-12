import React, { useState, useEffect } from 'react';

interface FormData {
  city: string;
  email: string;
  mobile: string;
  numberOfCars: string;
  fullName: string;
  aadharNumber: string;
  aadharOTP: string;
  panNumber: string;
  panOTP: string;
}

const VendorRegistration: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    city: '',
    email: '',
    mobile: '',
    numberOfCars: '',
    fullName: '',
    aadharNumber: '',
    aadharOTP: '',
    panNumber: '',
    panOTP: ''
  });
  
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [otpSent, setOtpSent] = useState<{aadhar: boolean, pan: boolean}>({
    aadhar: false,
    pan: false
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [citiesLoading, setCitiesLoading] = useState<boolean>(true);
  const [cities, setCities] = useState<string[]>([]);

  // Simulate loading cities data
  useEffect(() => {
    setCitiesLoading(true);
    
    // Simulate API fetch with setTimeout
    const timer = setTimeout(() => {
      setCities([
        'Delhi',
        'Mumbai',
        'Bangalore',
        'Hyderabad',
        'Chennai',
        'Kolkata',
        'Pune',
        'Jaipur',
        'Lucknow',
        'Ahmedabad'
      ]);
      setCitiesLoading(false);
    }, 1500);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const sendOtp = (type: 'aadhar' | 'pan') => {
    // Simulate OTP sending
    console.log(`Sending OTP for ${type}`);
    setOtpSent(prev => ({
      ...prev,
      [type]: true
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission with delay
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      // Add your form submission logic here
    }, 2000);
  };
  
  const nextStep = () => {
    setStepIndex(prev => Math.min(prev + 1, 2));
  };
  
  const prevStep = () => {
    setStepIndex(prev => Math.max(prev - 1, 0));
  };

  // Spinner component for loading states
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center">
      <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-green-600 font-bold text-2xl">MARCO</div>
          <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Vendor Portal</span>
        </div>
        <button className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full p-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        {/* Steps Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="w-full absolute top-1/2 h-0.5 bg-gray-200 -z-10"></div>
            {[0, 1, 2].map((step) => (
              <div 
                key={step} 
                className={`flex flex-col items-center ${step <= stepIndex ? 'text-green-600' : 'text-gray-400'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 ${
                  step < stepIndex 
                    ? 'bg-green-600 text-white' 
                    : step === stepIndex 
                    ? 'bg-white border-2 border-green-600 text-green-600' 
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}>
                  {step < stepIndex ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step + 1
                  )}
                </div>
                <span className="text-xs font-medium">
                  {step === 0 ? 'Basic Info' : step === 1 ? 'Identity' : 'Verification'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-6 mb-8 shadow-md">
          <h1 className="text-2xl font-bold">
            Zero Commission, Fair Compensation!
          </h1>
          <p className="mt-2 text-green-50">
            Join our vendor network and enjoy benefits that help your business grow.
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {stepIndex === 0 
              ? 'Basic Information' 
              : stepIndex === 1 
              ? 'Identity Details' 
              : 'Verify Your Details'}
          </h2>

          {isSubmitting && (
            <div className="mb-6">
              <div className="flex flex-col items-center justify-center py-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Submitting your registration...</h3>
                <LoadingSpinner />
                <p className="text-sm text-gray-500 mt-3">Please wait while we process your information</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {stepIndex === 0 && (
              <>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Select City</label>
                    <div className="relative">
                      <select
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={citiesLoading}
                        className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all appearance-none ${citiesLoading ? 'text-gray-400' : 'text-gray-700'}`}
                      >
                        <option value="">{citiesLoading ? 'Loading cities...' : 'Select your city'}</option>
                        {!citiesLoading && cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        {citiesLoading ? (
                          <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      placeholder="Enter your mobile number"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="numberOfCars" className="block text-sm font-medium text-gray-700 mb-1">Number of Cars</label>
                    <input
                      type="number"
                      id="numberOfCars"
                      name="numberOfCars"
                      placeholder="Number of cars on your name"
                      value={formData.numberOfCars}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {stepIndex === 1 && (
              <>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      placeholder="Your full name as per Aadhar card"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="aadharNumber" className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        id="aadharNumber"
                        name="aadharNumber"
                        placeholder="Enter 12-digit Aadhar number"
                        value={formData.aadharNumber}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => sendOtp('aadhar')}
                        className={`px-4 py-2 rounded-lg ${
                          otpSent.aadhar 
                            ? 'bg-gray-100 text-green-600 border border-green-200' 
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        {otpSent.aadhar ? 'Resend OTP' : 'Get OTP'}
                      </button>
                    </div>
                  </div>

                  {otpSent.aadhar && (
                    <div>
                      <label htmlFor="aadharOTP" className="block text-sm font-medium text-gray-700 mb-1">Aadhar OTP</label>
                      <input
                        type="text"
                        id="aadharOTP"
                        name="aadharOTP"
                        placeholder="Enter OTP sent to your Aadhar"
                        value={formData.aadharOTP}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        id="panNumber"
                        name="panNumber"
                        placeholder="Enter 10-digit PAN number"
                        value={formData.panNumber}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => sendOtp('pan')}
                        className={`px-4 py-2 rounded-lg ${
                          otpSent.pan 
                            ? 'bg-gray-100 text-green-600 border border-green-200' 
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        {otpSent.pan ? 'Resend OTP' : 'Get OTP'}
                      </button>
                    </div>
                  </div>

                  {otpSent.pan && (
                    <div>
                      <label htmlFor="panOTP" className="block text-sm font-medium text-gray-700 mb-1">PAN OTP</label>
                      <input
                        type="text"
                        id="panOTP"
                        name="panOTP"
                        placeholder="Enter OTP sent for PAN verification"
                        value={formData.panOTP}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {stepIndex === 2 && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Review Your Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">City</p>
                      <p className="font-medium">{formData.city || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{formData.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mobile</p>
                      <p className="font-medium">{formData.mobile || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Number of Cars</p>
                      <p className="font-medium">{formData.numberOfCars || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{formData.fullName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Aadhar Number</p>
                      <p className="font-medium">{formData.aadharNumber ? `XXXX-XXXX-${formData.aadharNumber.slice(-4)}` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">PAN Number</p>
                      <p className="font-medium">{formData.panNumber ? `XXXXX${formData.panNumber.slice(-5)}` : '—'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-medium text-yellow-800 mb-1">Important Note</h3>
                      <p className="text-sm text-yellow-700">
                        By submitting this form, you confirm that all provided information is accurate. 
                        False information may lead to rejection of your application.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="rounded text-green-600 focus:ring-green-500 h-4 w-4"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the <a href="#" className="text-green-600 hover:underline">Terms and Conditions</a>
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-gray-100">
              {stepIndex > 0 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              ) : (
                <div></div> 
              )}
              
              {stepIndex < 2 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit Application
                </button>
              )}
            </div>
          </form>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          Already registered? <a href="#" className="text-green-600 hover:underline">Sign in to your account</a>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 p-4 text-center text-sm text-gray-500">
        © 2023 Marco. All rights reserved.
      </footer>
    </div>
  );
};

export default VendorRegistration;