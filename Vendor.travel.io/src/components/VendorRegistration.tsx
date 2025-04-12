import React, { useState } from 'react';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  return (
    <div className="min-h-screen bg-[#00FF00]">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-[#00FF00]">
        <div className="text-3xl font-bold text-[#0066FF]">2⭐</div>
        <div className="text-4xl font-bold text-[#0066FF]">MARCO</div>
        <button className="text-4xl text-[#0066FF] w-10 h-10 flex items-center justify-center">
          ☰
        </button>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Hero Text */}
          <div className="bg-[#0066FF] text-white rounded-2xl p-4 text-center">
            <h1 className="text-2xl font-bold">
              Zero Commission,
              <br />
              Fair Compensation!
            </h1>
          </div>

          {/* Form Title */}
          <h2 className="text-2xl font-semibold text-center text-white">
            Marco Vendor application
          </h2>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="city"
              placeholder="Select your city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-full bg-white"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-full bg-white"
            />

            <input
              type="tel"
              name="mobile"
              placeholder="Mobile number"
              value={formData.mobile}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-full bg-white"
            />

            <input
              type="number"
              name="numberOfCars"
              placeholder="Number of cars on your name"
              value={formData.numberOfCars}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-full bg-white"
            />

            <input
              type="text"
              name="fullName"
              placeholder="Your full name as per Aadhar card"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-full bg-white"
            />

            <div className="flex gap-2">
              <input
                type="text"
                name="aadharNumber"
                placeholder="Aadhar Number"
                value={formData.aadharNumber}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 rounded-full bg-white"
              />
              <input
                type="text"
                name="aadharOTP"
                placeholder="OTP"
                value={formData.aadharOTP}
                onChange={handleInputChange}
                className="w-24 px-4 py-3 rounded-full bg-white"
              />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                name="panNumber"
                placeholder="PAN Number"
                value={formData.panNumber}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 rounded-full bg-white"
              />
              <input
                type="text"
                name="panOTP"
                placeholder="OTP"
                value={formData.panOTP}
                onChange={handleInputChange}
                className="w-24 px-4 py-3 rounded-full bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0066FF] text-white py-3 rounded-full font-semibold hover:bg-[#0055DD] transition-colors"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorRegistration;