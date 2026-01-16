import { useState, useEffect } from 'react';
import axios from 'axios';

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  pricing_type: 'fixed' | 'percentage';
  percentage_value: number | null;
  category: string;
}

interface AddOnsSelectorProps {
  baseFare: number;
  onAddOnsChange: (selectedAddOns: any[], totalCost: number) => void;
}

export default function AddOnsSelector({ baseFare, onAddOnsChange }: AddOnsSelectorProps) {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAddOns();
  }, []);

  const fetchAddOns = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/user/add-ons');
      if (response.data.success) {
        // Transform and parse strings to numbers to avoid calculation errors
        const parsedData = response.data.data.map((item: any) => ({
          ...item,
          price: parseFloat(item.price || '0'),
          percentage_value: parseFloat(item.percentage_value || '0')
        }));
        setAddOns(parsedData);
      }
    } catch (error) {
      console.error('Error fetching add-ons:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAddOnPrice = (addon: AddOn): number => {
    if (addon.pricing_type === 'fixed') {
      return addon.price;
    } else {
      return (baseFare * (addon.percentage_value || 0)) / 100;
    }
  };

  const handleToggleAddOn = (addonId: string) => {
    const newSelectedIds = selectedAddOnIds.includes(addonId)
      ? selectedAddOnIds.filter(id => id !== addonId)
      : [...selectedAddOnIds, addonId];
    
    setSelectedAddOnIds(newSelectedIds);

    // Calculate selected add-ons with prices
    const selected = addOns
      .filter(addon => newSelectedIds.includes(addon.id))
      .map(addon => ({
        id: addon.id,
        name: addon.name,
        price: calculateAddOnPrice(addon),
        price_type: addon.pricing_type
      }));

    // Calculate total
    const total = selected.reduce((sum, addon) => sum + addon.price, 0);

    onAddOnsChange(selected, total);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading add-ons...</p>
        </div>
      </div>
    );
  }

  if (addOns.length === 0) {
    return null; // Don't show if no add-ons available
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-green-700 to-green-600 text-white">
        <h2 className="text-xl font-bold flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Enhance Your Trip (Optional)
        </h2>
        <p className="text-green-100 text-sm mt-1">Select add-ons for a better travel experience</p>
      </div>

      <div className="p-6 space-y-3">
        {addOns.map(addon => {
          const isSelected = selectedAddOnIds.includes(addon.id);
          const price = calculateAddOnPrice(addon);

          return (
            <label
              key={addon.id}
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggleAddOn(addon.id)}
                className="w-5 h-5 text-green-600 mt-0.5 rounded focus:ring-2 focus:ring-green-500"
              />

              <div className="ml-4 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-medium text-gray-800 block">{addon.name}</span>
                    {addon.description && (
                      <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                    )}
                  </div>
                  <span className="text-green-600 font-bold ml-4 whitespace-nowrap">
                    ₹{Math.round(price)}
                    {addon.pricing_type === 'percentage' && (
                      <span className="text-xs font-normal text-gray-500 ml-1">({addon.percentage_value}%)</span>
                    )}
                  </span>
                </div>
              </div>
            </label>
          );
        })}

        {selectedAddOnIds.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-800">
              {selectedAddOnIds.length} add-on{selectedAddOnIds.length > 1 ? 's' : ''} selected
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
