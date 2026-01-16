import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  pricing_type: 'fixed' | 'percentage';
  percentage_value: number | null;
  category: string;
}

interface BookingFormData {
  name: string;
  mobile: string;
  email: string;
  pickupAddress: string;
  tripType: 'one_way' | 'round_trip';
  departureDate: string;
  selectedAddOns: string[];
  couponCode: string;
}

const BookingAddOnsSelection: React.FC = () => {
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    mobile: '',
    email: '',
    pickupAddress: '',
    tripType: 'one_way',
    departureDate: '',
    selectedAddOns: [],
    couponCode: ''
  });

  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [baseFare, setBaseFare] = useState(2500); // Example base fare
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAddOns();
  }, []);

  const fetchAddOns = async () => {
    try {
      const response = await axios.get('http://localhost:5000/user/add-ons');
      if (response.data.success) {
        setAddOns(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching add-ons:', error);
      toast.error('Failed to load add-ons');
    }
  };

  const calculateAddOnPrice = (addon: AddOn): number => {
    if (addon.pricing_type === 'fixed') {
      return addon.price;
    } else {
      return (baseFare * (addon.percentage_value || 0)) / 100;
    }
  };

  const calculateTotalAddOnCost = (): number => {
    return formData.selectedAddOns.reduce((total, addonId) => {
      const addon = addOns.find(a => a.id === addonId);
      if (addon) {
        return total + calculateAddOnPrice(addon);
      }
      return total;
    }, 0);
  };

  const calculateAdvancePayment = (): number => {
    const total = baseFare + calculateTotalAddOnCost();
    return total * 0.10; // 10% advance
  };

  const toggleAddOn = (addonId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAddOns: prev.selectedAddOns.includes(addonId)
        ? prev.selectedAddOns.filter(id => id !== addonId)
        : [...prev.selectedAddOns, addonId]
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.mobile || !formData.email || !formData.pickupAddress) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      // Here you would call your booking API
      const bookingData = {
        ...formData,
        baseFare,
        addonCost: calculateTotalAddOnCost(),
        totalCost: baseFare + calculateTotalAddOnCost(),
        advancePayment: calculateAdvancePayment(),
        selectedAddOnDetails: formData.selectedAddOns.map(id => {
          const addon = addOns.find(a => a.id === id);
          return addon ? {
            id: addon.id,
            name: addon.name,
            price: calculateAddOnPrice(addon)
          } : null;
        }).filter(Boolean)
      };

      console.log('Booking Data:', bookingData);
      // await axios.post('/api/booking/create', bookingData);

      toast.success('Booking initiated! Redirecting to payment...');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">MARCO</h1>
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-2xl shadow-2xl overflow-hidden">
          {/* Trip Type Header */}
          <div className="bg-blue-600 text-white p-6 rounded-t-lg">
            <h2 className="text-xl font-bold mb-2">Tripe type: {formData.tripType === 'one_way' ? 'One Way' : 'Round Trip'}</h2>
            <p className="text-sm">Departure Date & Time: {formData.departureDate || '31/12/2022 at 5:30 PM'}</p>
          </div>

          {/* User Details Form */}
          <div className="p-6 space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="tel"
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              name="pickupAddress"
              placeholder="Pickup Address"
              value={formData.pickupAddress}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Add-Ons Section */}
          <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-6 space-y-3">
            {addOns.map(addon => (
              <label
                key={addon.id}
                className="flex items-center justify-between p-3 bg-blue-400 rounded-lg cursor-pointer hover:bg-blue-300 transition-all"
              >
                <span className="text-white font-medium text-sm flex-1">
                  {addon.name} for Rs. {Math.round(calculateAddOnPrice(addon))}
                </span>
                <input
                  type="checkbox"
                  checked={formData.selectedAddOns.includes(addon.id)}
                  onChange={() => toggleAddOn(addon.id)}
                  className="w-5 h-5 text-blue-600 bg-white border-2 border-white rounded focus:ring-2 focus:ring-white"
                />
              </label>
            ))}

            {/* Terms and Conditions */}
            <label className="flex items-center p-3 bg-blue-400 rounded-lg cursor-pointer">
              <span className="text-white text-sm flex-1">
                I agree with <span className="text-blue-200 underline">Terms of Use</span> & <span className="text-blue-200 underline">Cancellation Policy</span> of this service
              </span>
              <input
                type="checkbox"
                className="w-5 h-5 text-blue-600 bg-white border-2 border-white rounded focus:ring-2 focus:ring-white"
              />
            </label>

            {/* Coupon Code */}
            <input
              type="text"
              name="couponCode"
              placeholder="Apply Coupon"
              value={formData.couponCode}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white bg-white text-gray-800"
            />

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all shadow-lg disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : `Pay Rs. ${Math.round(calculateAdvancePayment())} advance & book`}
            </button>

            {/* Payment Note */}
            <div className="text-center space-y-1">
              <p className="text-white text-xs">
                Note: Details will be shared 5 hrs prior pickup
              </p>
              <p className="text-white text-xs font-semibold">
                Please pay balance payment directly to driver during the ride.
              </p>
            </div>

            {/* Price Breakdown */}
            {formData.selectedAddOns.length > 0 && (
              <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-white text-sm font-semibold mb-2">Price Breakdown:</p>
                <div className="space-y-1 text-white text-xs">
                  <div className="flex justify-between">
                    <span>Base Fare:</span>
                    <span>₹{baseFare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Add-ons:</span>
                    <span>₹{Math.round(calculateTotalAddOnCost())}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm border-t border-white pt-1 mt-1">
                    <span>Total:</span>
                    <span>₹{Math.round(baseFare + calculateTotalAddOnCost())}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-2">
                    <span>Platform Fee (10%):</span>
                    <span>₹{Math.round(calculateAdvancePayment())}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Pay to Driver (90%):</span>
                    <span>₹{Math.round((baseFare + calculateTotalAddOnCost()) * 0.9)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingAddOnsSelection;
