import React from 'react';
import { useNavigate } from 'react-router-dom';

const VendorRegistration: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#00FF00] relative">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="text-3xl font-bold text-[#0066FF]">2⭐</div>
        <div className="text-4xl font-bold text-[#0066FF]">MARCO</div>
        <button className="text-4xl text-[#0066FF] bg-[#0066FF] bg-opacity-10 rounded-full w-12 h-12 flex items-center justify-center">
          ☰
        </button>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 pt-8">
        <div className="max-w-2xl mx-auto">
          {/* Hero Text Box */}
          <div className="bg-[#0066FF] text-white rounded-2xl p-6 mb-8 shadow-lg">
            <h1 className="text-3xl font-bold text-center">
              Zero Commission,
              <br />
              Fair Compensation!
            </h1>
          </div>

          {/* Application Title */}
          <h2 className="text-2xl font-semibold text-white text-center mb-8">
            Marco Vendor application
          </h2>

          {/* Options Container */}
          <div className="space-y-6">
            {/* Single Car Option */}
            <button
              onClick={() => navigate('/register-car')}
              className="w-full bg-[#0066FF] text-white text-xl py-6 px-8 rounded-2xl shadow-lg hover:bg-[#0055DD] transition-colors duration-300 text-center"
            >
              I have my own car and want to join Marco.
            </button>

            {/* Divider */}
            <div className="text-center text-white text-2xl font-bold">
              OR
            </div>

            {/* Fleet Option */}
            <button
              onClick={() => navigate('/register-fleet')}
              className="w-full bg-[#0066FF] text-white text-xl py-6 px-8 rounded-2xl shadow-lg hover:bg-[#0055DD] transition-colors duration-300 text-center"
            >
              I own a fleet and I want to add my fleet to Marco.
            </button>
          </div>
        </div>
      </div>

      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 z-[-1] opacity-50"
        style={{
          backgroundImage: 'url("/path-to-your-car-background-image.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'multiply'
        }}
      />
    </div>
  );
};

export default VendorRegistration;