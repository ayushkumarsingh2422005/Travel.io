import React from 'react';

interface Car {
  id: string;
  vendor_id: string;
  model: string;
  registration_no: string;
  rc_data?: string;
  image?: string;
  no_of_seats: number;
  is_active: boolean;
  brand: string;
  fuelType: string;
  carType: string;
  rcNumber: string;
  permit: string;
  status: string;
  chassis?: string;
  engine?: string;
  insuranceExpiry?: string;
  permitExpiry?: string | null;
  fitnessExpiry?: string;
  owner?: string;
  makeYear?: number;
  lastUpdated?: string;
  insuranceCompany?: string;
  insurancePolicyNumber?: string;
  luggage?: string; // Added for luggage carrier info
  sourcing?: string; // Added for sourcing info
  rc_image_url?: string;
  insurance_doc_url?: string;
  fitness_doc_url?: string;
  permit_doc_url?: string;
}

interface CarDetailsModalProps {
  car: Car;
  onClose: () => void;
  getStatusBadgeClass: (status: string) => string;
  getPermitBadgeClass: (permit: string) => string;
}

const CarDetailsModal: React.FC<CarDetailsModalProps> = ({ car, onClose, getStatusBadgeClass, getPermitBadgeClass }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-white text-xl font-semibold">Car Details: {car.brand} ({car.rcNumber})</h2>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-green-50 mt-2">Detailed information about your vehicle.</p>
        </div>
        
        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {car.image && (
            <div className="flex justify-center">
              <img src={car.image} alt={`${car.brand} car`} className="max-h-60 rounded-lg shadow-md object-cover" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="detail-item">
              <label className="block text-sm font-medium text-gray-700">Brand Name</label>
              <p className="text-gray-900 font-semibold">{car.brand}</p>
            </div>
            <div className="detail-item">
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <p className="text-gray-900 font-semibold">{car.model}</p>
            </div>
            <div className="detail-item">
              <label className="block text-sm font-medium text-gray-700">RC Number</label>
              <p className="text-gray-900 font-semibold">{car.rcNumber}</p>
            </div>
            <div className="detail-item">
              <label className="block text-sm font-medium text-gray-700">Car Type</label>
              <p className="text-gray-900 font-semibold">{car.carType}</p>
            </div>
            <div className="detail-item">
              <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
              <p className="text-gray-900 font-semibold">{car.fuelType}</p>
            </div>
            <div className="detail-item">
              <label className="block text-sm font-medium text-gray-700">No. of Seats</label>
              <p className="text-gray-900 font-semibold">{car.no_of_seats}</p>
            </div>
            <div className="detail-item">
              <label className="block text-sm font-medium text-gray-700">Make Year</label>
              <p className="text-gray-900 font-semibold">{car.makeYear || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(car.status)}`}>
                {car.status}
              </span>
            </div>
            <div className="detail-item">
              <label className="block text-sm font-medium text-gray-700">Permit Type</label>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPermitBadgeClass(car.permit)}`}>
                {car.permit}
              </span>
            </div>
            {car.permitExpiry && (
              <div className="detail-item">
                <label className="block text-sm font-medium text-gray-700">Permit Expiry</label>
                <p className="text-gray-900 font-semibold">{new Date(car.permitExpiry).toLocaleDateString()}</p>
              </div>
            )}
            {car.insuranceExpiry && (
              <div className="detail-item">
                <label className="block text-sm font-medium text-gray-700">Insurance Expiry</label>
                <p className="text-gray-900 font-semibold">{new Date(car.insuranceExpiry).toLocaleDateString()}</p>
              </div>
            )}
            {car.fitnessExpiry && (
              <div className="detail-item">
                <label className="block text-sm font-medium text-gray-700">Fitness Expiry</label>
                <p className="text-gray-900 font-semibold">{new Date(car.fitnessExpiry).toLocaleDateString()}</p>
              </div>
            )}
            {car.owner && (
              <div className="detail-item">
                <label className="block text-sm font-medium text-gray-700">Owner</label>
                <p className="text-gray-900 font-semibold">{car.owner}</p>
              </div>
            )}
            {car.chassis && (
              <div className="detail-item">
                <label className="block text-sm font-medium text-gray-700">Chassis No.</label>
                <p className="text-gray-900 font-semibold">{car.chassis}</p>
              </div>
            )}
            {car.engine && (
              <div className="detail-item">
                <label className="block text-sm font-medium text-gray-700">Engine No.</label>
                <p className="text-gray-900 font-semibold">{car.engine}</p>
              </div>
            )}
            {car.insuranceCompany && (
              <div className="detail-item">
                <label className="block text-sm font-medium text-gray-700">Insurance Company</label>
                <p className="text-gray-900 font-semibold">{car.insuranceCompany}</p>
              </div>
            )}
            {car.insurancePolicyNumber && (
              <div className="detail-item">
                <label className="block text-sm font-medium text-gray-700">Insurance Policy No.</label>
                <p className="text-gray-900 font-semibold">{car.insurancePolicyNumber}</p>
              </div>
            )}
            {car.luggage && (
              <div className="detail-item">
                <label className="block text-sm font-medium text-gray-700">Luggage Carrier</label>
                <p className="text-gray-900 font-semibold">{car.luggage}</p>
              </div>
            )}
            {car.sourcing && (
              <div className="detail-item">
                <label className="block text-sm font-medium text-gray-700">Sourcing</label>
                <p className="text-gray-900 font-semibold">{car.sourcing}</p>
              </div>
            )}
            {car.rc_image_url && (
              <div className="detail-item">
                <label className="block text-sm font-medium text-gray-700">RC Image</label>
                <a href={car.rc_image_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">View RC Image</a>
              </div>
            )}
            {car.insurance_doc_url && (
              <div className="detail-item">
                <label className="block text-sm font-medium text-gray-700">Insurance Document</label>
                <a href={car.insurance_doc_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">View Insurance Document</a>
              </div>
            )}
            {car.fitness_doc_url && (
              <div className="detail-item">
                <label className="block text-sm font-medium text-gray-700">Fitness Document</label>
                <a href={car.fitness_doc_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">View Fitness Document</a>
              </div>
            )}
            {car.permit_doc_url && (
              <div className="detail-item">
                <label className="block text-sm font-medium text-gray-700">Permit Document</label>
                <a href={car.permit_doc_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">View Permit Document</a>
              </div>
            )}
            {car.rc_data && (
              <div className="detail-item md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Raw RC Data</label>
                <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto">{JSON.stringify(JSON.parse(car.rc_data), null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-200 flex justify-end">
          <button 
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsModal;
