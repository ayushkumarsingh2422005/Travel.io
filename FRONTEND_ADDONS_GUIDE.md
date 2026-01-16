# Frontend UI Reference - Add-Ons Booking Flow

## Component Structure

```
BookingFlow/
├── TripSelection.tsx         # Select trip type, dates, locations
├── CabCategorySelection.tsx  # Select car segment
├── AddOnsSelection.tsx       # Select add-ons (NEW)
├── PricingSummary.tsx        # Show price breakdown (UPDATED)
└── PaymentConfirmation.tsx   # Final payment
```

## Add-Ons Selection Component

### TypeScript Interface

```typescript
interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  pricing_type: 'fixed' | 'percentage';
  percentage_value?: number;
  category: 'luggage' | 'car_model' | 'cancellation' | 'pet' | 'other';
  icon_url?: string;
  is_active: boolean;
}

interface SelectedAddOn extends AddOn {
  calculated_price: number;
}
```

### React Component Example

```tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddOnsSelection: React.FC<{
  baseFare: number;
  onAddOnsChange: (addons: SelectedAddOn[], totalCost: number) => void;
}> = ({ baseFare, onAddOnsChange }) => {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([]);

  useEffect(() => {
    fetchAddOns();
  }, []);

  const fetchAddOns = async () => {
    try {
      const response = await axios.get('/user/add-ons');
      setAddOns(response.data.data);
    } catch (error) {
      console.error('Error fetching add-ons:', error);
    }
  };

  const calculateAddOnPrice = (addon: AddOn): number => {
    if (addon.pricing_type === 'fixed') {
      return addon.price;
    } else {
      return (baseFare * (addon.percentage_value || 0)) / 100;
    }
  };

  const toggleAddOn = (addon: AddOn) => {
    const isSelected = selectedAddOns.some(a => a.id === addon.id);
    
    let newSelected: SelectedAddOn[];
    if (isSelected) {
      newSelected = selectedAddOns.filter(a => a.id !== addon.id);
    } else {
      const calculated_price = calculateAddOnPrice(addon);
      newSelected = [...selectedAddOns, { ...addon, calculated_price }];
    }
    
    setSelectedAddOns(newSelected);
    
    const totalAddonCost = newSelected.reduce((sum, a) => sum + a.calculated_price, 0);
    onAddOnsChange(newSelected, baseFare + totalAddonCost);
  };

  return (
    <div className="add-ons-selection bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Select Add-Ons</h2>
      
      {addOns.map(addon => {
        const isSelected = selectedAddOns.some(a => a.id === addon.id);
        const price = calculateAddOnPrice(addon);
        
        return (
          <label
            key={addon.id}
            className={`flex items-center p-4 mb-3 border-2 rounded-lg cursor-pointer transition-all ${
              isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleAddOn(addon)}
              className="w-5 h-5 text-green-600"
            />
            
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">{addon.name}</span>
                <span className="text-green-600 font-bold">
                  {addon.pricing_type === 'percentage' 
                    ? `${addon.percentage_value}% (₹${price.toFixed(0)})` 
                    : `₹${price}`}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{addon.description}</p>
            </div>
          </label>
        );
      })}
    </div>
  );
};

export default AddOnsSelection;
```

## Pricing Summary Component

```tsx
interface PricingBreakdown {
  baseFare: number;
  tollCharges: number;
  stateTax: number;
  parkingCharges: number;
  driverNightCharges: number;
  addonCharges: number;
  total: number;
  adminCommission: number;
  driverPayout: number;
}

const PricingSummary: React.FC<{ pricing: PricingBreakdown }> = ({ pricing }) => {
  return (
    <div className="pricing-summary bg-blue-50 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4">Booking Summary</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Base Fare</span>
          <span className="font-medium">₹{pricing.baseFare.toFixed(2)}</span>
        </div>
        
        {pricing.tollCharges > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Toll Charges</span>
            <span className="font-medium">₹{pricing.tollCharges.toFixed(2)}</span>
          </div>
        )}
        
        {pricing.stateTax > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">State Tax</span>
            <span className="font-medium">₹{pricing.stateTax.toFixed(2)}</span>
          </div>
        )}
        
        {pricing.parkingCharges > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Parking</span>
            <span className="font-medium">₹{pricing.parkingCharges.toFixed(2)}</span>
          </div>
        )}
        
        {pricing.driverNightCharges > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Night Charges</span>
            <span className="font-medium">₹{pricing.driverNightCharges.toFixed(2)}</span>
          </div>
        )}
        
        {pricing.addonCharges > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Add-ons</span>
            <span className="font-medium text-green-600">₹{pricing.addonCharges.toFixed(2)}</span>
          </div>
        )}
        
        <div className="border-t-2 border-gray-300 pt-2 mt-2">
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount</span>
            <span className="text-green-600">₹{pricing.total.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="bg-gray-100 p-3 rounded mt-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Platform Fee (10%)</span>
            <span>₹{pricing.adminCommission.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600 mt-1">
            <span>Driver Receives (90%)</span>
            <span>₹{pricing.driverPayout.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <button className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition">
        Pay ₹{(pricing.total * 0.1).toFixed(0)} Advance & Book
      </button>
      
      <p className="text-xs text-gray-500 text-center mt-2">
        Please pay balance payment directly to driver during ride
      </p>
    </div>
  );
};
```

## Complete Booking Flow Example

```tsx
const BookingFlow = () => {
  const [step, setStep] = useState(1);
  const [tripDetails, setTripDetails] = useState({});
  const [cabCategory, setCabCategory] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [pricing, setPricing] = useState<PricingBreakdown>({
    baseFare: 0,
    tollCharges: 0,
    stateTax: 0,
    parkingCharges: 0,
    driverNightCharges: 0,
    addonCharges: 0,
    total: 0,
    adminCommission: 0,
    driverPayout: 0
  });

  const calculatePricing = (
    base: number,
    extras: any,
    addons: SelectedAddOn[]
  ) => {
    const addonCharges = addons.reduce((sum, a) => sum + a.calculated_price, 0);
    const total = base + extras.toll + extras.tax + extras.parking + 
                  extras.night + addonCharges;
    
    setPricing({
      baseFare: base,
      tollCharges: extras.toll,
      stateTax: extras.tax,
      parkingCharges: extras.parking,
      driverNightCharges: extras.night,
      addonCharges,
      total,
      adminCommission: total * 0.10,
      driverPayout: total * 0.90
    });
  };

  return (
    <div className="booking-container max-w-6xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {['Trip Details', 'Select Car', 'Add-Ons', 'Payment'].map((label, idx) => (
            <div key={idx} className={`flex items-center ${idx < step ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                idx < step ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}>
                {idx + 1}
              </div>
              <span className="ml-2 text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && <TripSelection onNext={(details) => { setTripDetails(details); setStep(2); }} />}
      {step === 2 && <CabCategorySelection onNext={(cat) => { setCabCategory(cat); setStep(3); }} />}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AddOnsSelection 
              baseFare={pricing.baseFare}
              onAddOnsChange={(addons, total) => {
                setSelectedAddOns(addons);
                calculatePricing(pricing.baseFare, {
                  toll: pricing.tollCharges,
                  tax: pricing.stateTax,
                  parking: pricing.parkingCharges,
                  night: pricing.driverNightCharges
                }, addons);
              }}
            />
          </div>
          <div>
            <PricingSummary pricing={pricing} />
          </div>
        </div>
      )}
      {step === 4 && <PaymentConfirmation pricing={pricing} addons={selectedAddOns} />}
    </div>
  );
};
```

## API Service Functions

```typescript
// services/bookingService.ts

export const fetchAddOns = async (): Promise<AddOn[]> => {
  const response = await axios.get('/user/add-ons');
  return response.data.data;
};

export const createBooking = async (bookingData: any) => {
  const response = await axios.post('/booking/create', bookingData);
  return response.data;
};

export const calculateFare = async (tripData: any) => {
  const response = await axios.post('/booking/calculate-fare', tripData);
  return response.data;
};
```

## State Management (Redux/Context)

```typescript
interface BookingState {
  tripType: 'one_way' | 'round_trip';
  microCategory: 'same_day' | 'multi_day';
  serviceCategory: 'outstation' | 'hourly_rental';
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: Date;
  dropDate: Date;
  distance: number;
  cabCategory: CabCategory | null;
  selectedAddOns: SelectedAddOn[];
  pricing: PricingBreakdown;
}
```

## Key Points for Frontend Implementation

1. **Real-time Price Calculation**: Update total whenever user selects/deselects add-ons
2. **Percentage Add-ons**: Calculate based on base fare, not total
3. **Validation**: Ensure user sees final price before payment
4. **Advance Payment**: Only 10% (admin commission) is paid upfront
5. **Balance Payment**: Show reminder that 90% is paid to driver directly
6. **Add-ons Display**: Group by category for better UX
7. **Price Breakdown**: Always show transparent breakdown
8. **Mobile Responsive**: Ensure add-ons are easily selectable on mobile

## Testing Checklist

- [ ] Fetch add-ons successfully
- [ ] Toggle add-ons (select/deselect)
- [ ] Calculate fixed-price add-ons correctly
- [ ] Calculate percentage-based add-ons correctly
- [ ] Show proper price breakdown
- [ ] Display 10% admin commission
- [ ] Display 90% driver payout
- [ ] Validate booking data before submission
- [ ] Handle API errors gracefully
- [ ] Mobile responsive design works
