// src/components/AddCar.tsx
import React, { useState } from 'react';

interface Car {
  brand: string;
  fuelType: string;
  carType: string;
  rcNumber: string;
  permit: string;
  status: string;
}

const AddCarForm: React.FC = () => {
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [showAutoFetchForm, setShowAutoFetchForm] = useState(false);
  const [cars, setCars] = useState<Car[]>([
    { 
      brand: 'Swift Dzire', 
      fuelType: 'CNG + Petrol', 
      carType: 'Sedan',
      rcNumber: 'UPXXPRXXXX',
      permit: 'Valid',
      status: 'Approved'
    },
    { 
      brand: 'Ertiga', 
      fuelType: 'CNG + Petrol', 
      carType: 'SUV',
      rcNumber: 'UPXXPRXXXX',
      permit: 'Awaited',
      status: 'Awaited'
    }
  ]);

  const handleDeleteCar = (index: number) => {
    const newCars = [...cars];
    newCars.splice(index, 1);
    setCars(newCars);
  };

  return (
    <div className="flex flex-col">
      {/* Search and Add New Car */}
      <div className="flex justify-between mb-4">
        <div className="border-2 border-gray-300 rounded-full px-4 py-2 w-1/2">
          Search Car by RC number
        </div>
        <button 
          className="bg-green-500 text-white rounded-full px-6 py-2"
          onClick={() => setShowAddCarForm(true)}
        >
          + Add New Car
        </button>
      </div>

      {/* Car List Table */}
      <div className="border border-gray-300 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="p-2 border-r border-gray-300 w-12"></th>
              <th className="p-2 border-r border-gray-300">Car Brand</th>
              <th className="p-2 border-r border-gray-300">Car type</th>
              <th className="p-2 border-r border-gray-300">RC Number</th>
              <th className="p-2 border-r border-gray-300">Permit</th>
              <th className="p-2 border-r border-gray-300">Status</th>
              <th className="p-2 border-r border-gray-300">Booking history</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car, index) => (
              <tr key={index} className="border-b border-gray-300">
                <td className="p-3 border-r border-gray-300 text-center">
                  <button 
                    className="text-red-500 text-2xl"
                    onClick={() => handleDeleteCar(index)}
                  >
                    🗑️
                  </button>
                </td>
                <td className="p-3 border-r border-gray-300">
                  {car.brand}<br />
                  <span className="text-sm">{car.fuelType}</span>
                </td>
                <td className="p-3 border-r border-gray-300">{car.carType}</td>
                <td className="p-3 border-r border-gray-300">{car.rcNumber}</td>
                <td className="p-3 border-r border-gray-300">{car.permit}</td>
                <td className="p-3 border-r border-gray-300">{car.status}</td>
                <td className="p-3 border-r border-gray-300">
                  <button className="bg-green-500 text-white rounded-full px-6 py-1">
                    Show
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Car Modal */}
      {showAddCarForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-blue-700 text-white p-6 rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-center text-xl mb-4">
              Make Sure All The Cars Are in Good Condition & Well Maintained
            </h2>
            
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">RC Image :</span>
                <button className="bg-green-500 text-white px-6 py-2 rounded-full md:w-2/3">
                  Upload Image
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Car Image :</span>
                <button className="bg-green-500 text-white px-6 py-2 rounded-full md:w-2/3">
                  Upload Image
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Brand name :</span>
                <select className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3">
                  <option value="">Select brand name</option>
                  <option value="Maruti">Maruti</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Tata">Tata</option>
                </select>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Fuel type:</span>
                <select className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3">
                  <option value="">Select fuel type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG + Petrol">CNG + Petrol</option>
                </select>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Car Make Year :</span>
                <input
                  type="number"
                  className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3"
                  placeholder="Car make year"
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Upload Insurance Doc :</span>
                <button className="bg-green-500 text-white px-6 py-2 rounded-full md:w-2/3">
                  Upload Image
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Insurers Name :</span>
                <select className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3">
                  <option value="">Select Name</option>
                  <option value="HDFC ERGO">HDFC ERGO</option>
                  <option value="ICICI Lombard">ICICI Lombard</option>
                  <option value="Bajaj Allianz">Bajaj Allianz</option>
                </select>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Insurance Policy No.</span>
                <input
                  className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3"
                  placeholder="Write policy number"
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Insurance expiry date :</span>
                <input
                  type="date"
                  className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3"
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Fitness Document :</span>
                <button className="bg-green-500 text-white px-6 py-2 rounded-full md:w-2/3">
                  Upload Image
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Fitness Expiry Date :</span>
                <input
                  type="date"
                  className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3"
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Permit Document :</span>
                <button className="bg-green-500 text-white px-6 py-2 rounded-full md:w-2/3">
                  Upload Image
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Permit expiry date :</span>
                <input
                  type="date"
                  className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3"
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Permit Type :</span>
                <select className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3">
                  <option value="">Select permit type</option>
                  <option value="All India">All India</option>
                  <option value="State">State</option>
                  <option value="Local">Local</option>
                </select>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Luggage Carrier :</span>
                <select className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3">
                  <option value="">Select availability</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Sourcing :</span>
                <select className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3">
                  <option value="">Select ownership type</option>
                  <option value="Own">Own</option>
                  <option value="Leased">Leased</option>
                  <option value="Partner">Partner</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <button 
                className="bg-green-500 text-white px-10 py-2 rounded-full"
                onClick={() => setShowAddCarForm(false)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Fetch Modal */}
      {showAutoFetchForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-blue-700 text-white p-6 rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-center text-xl mb-4">
              Make Sure All The Cars Are in Good Condition & Well Maintained
            </h2>
            
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">RC Number :</span>
                <div className="flex flex-wrap gap-2 md:w-2/3">
                  <input className="bg-white text-black px-3 py-1 rounded-lg flex-1 min-w-0" placeholder="State" />
                  <input className="bg-white text-black px-3 py-1 rounded-lg flex-1 min-w-0" placeholder="rto code" />
                  <input className="bg-white text-black px-3 py-1 rounded-lg flex-1 min-w-0" placeholder="issue yr" />
                  <input className="bg-white text-black px-3 py-1 rounded-lg flex-1 min-w-0" placeholder="4 digits" />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button className="bg-green-500 text-white px-6 py-2 rounded-full">
                  Add Car
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Owner name :</span>
                <input 
                  className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3" 
                  placeholder="Auto fetch name"
                  disabled
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Brand Name :</span>
                <input 
                  className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3" 
                  placeholder="Auto fetch name"
                  disabled
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Maker Name :</span>
                <input 
                  className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3" 
                  placeholder="Auto fetch name"
                  disabled
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Vehicle Class :</span>
                <input 
                  className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3" 
                  placeholder="Auto fetch"
                  disabled
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Fuel Type :</span>
                <input 
                  className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3" 
                  placeholder="Auto fetch"
                  disabled
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Chassis Number :</span>
                <input 
                  className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3" 
                  placeholder="Auto fetch"
                  disabled
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Engine Number :</span>
                <input 
                  className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3" 
                  placeholder="Auto fetch"
                  disabled
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Registration Date :</span>
                <input 
                  className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3" 
                  placeholder="Auto fetch"
                  disabled
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Fitness Expiry Date :</span>
                <input 
                  className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3" 
                  placeholder="Auto fetch"
                  disabled
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="md:w-1/3">Insurance Expiry Date :</span>
                <input 
                  className="bg-white text-black px-4 py-2 rounded-lg w-full md:w-2/3"
                  placeholder="Auto fetch"
                  disabled
                />
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <button 
                className="bg-green-500 text-white px-10 py-2 rounded-full"
                onClick={() => setShowAutoFetchForm(false)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCarForm;