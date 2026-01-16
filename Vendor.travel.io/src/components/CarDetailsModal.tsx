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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-0 animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 rounded-t-xl sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-white text-xl font-bold">Car Details: {car.brand} ({car.rcNumber})</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-indigo-100 mt-2 text-sm font-medium">Detailed information about your vehicle.</p>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-8">
          {car.image && (
            <div className="flex justify-center">
              <img src={car.image} alt={`${car.brand} car`} className="max-h-64 rounded-xl shadow-lg object-cover w-full md:w-auto" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Brand Name</label>
              <p className="text-gray-900 font-bold text-lg">{car.brand}</p>
            </div>
            <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Model</label>
              <p className="text-gray-900 font-bold text-lg">{car.model}</p>
            </div>
            <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">RC Number</label>
              <p className="text-gray-900 font-bold text-lg">{car.rcNumber}</p>
            </div>
            <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Car Type</label>
              <p className="text-gray-900 font-bold text-lg">{car.carType}</p>
            </div>
            <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fuel Type</label>
              <p className="text-gray-900 font-bold text-lg">{car.fuelType}</p>
            </div>
            <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">No. of Seats</label>
              <p className="text-gray-900 font-bold text-lg">{car.no_of_seats}</p>
            </div>
            <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Make Year</label>
              <p className="text-gray-900 font-bold text-lg">{car.makeYear || 'N/A'}</p>
            </div>
            <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-center">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status</label>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(car.status)}`}>
                  {car.status}
                </span>
              </div>
            </div>
            <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-center">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Permit Type</label>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPermitBadgeClass(car.permit)}`}>
                  {car.permit}
                </span>
              </div>
            </div>
            {car.permitExpiry && (
              <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Permit Expiry</label>
                <p className="text-gray-900 font-bold text-lg">{new Date(car.permitExpiry).toLocaleDateString()}</p>
              </div>
            )}
            {car.insuranceExpiry && (
              <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Insurance Expiry</label>
                <p className="text-gray-900 font-bold text-lg">{new Date(car.insuranceExpiry).toLocaleDateString()}</p>
              </div>
            )}
            {car.fitnessExpiry && (
              <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fitness Expiry</label>
                <p className="text-gray-900 font-bold text-lg">{new Date(car.fitnessExpiry).toLocaleDateString()}</p>
              </div>
            )}
            {car.owner && (
              <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Owner</label>
                <p className="text-gray-900 font-bold text-lg">{car.owner}</p>
              </div>
            )}
            {car.chassis && (
              <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Chassis No.</label>
                <p className="text-gray-900 font-bold text-lg">{car.chassis}</p>
              </div>
            )}
            {car.engine && (
              <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Engine No.</label>
                <p className="text-gray-900 font-bold text-lg">{car.engine}</p>
              </div>
            )}
            {car.insuranceCompany && (
              <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Insurance Company</label>
                <p className="text-gray-900 font-bold text-lg">{car.insuranceCompany}</p>
              </div>
            )}
            {car.insurancePolicyNumber && (
              <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Insurance Policy No.</label>
                <p className="text-gray-900 font-bold text-lg">{car.insurancePolicyNumber}</p>
              </div>
            )}
            {car.luggage && (
              <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Luggage Carrier</label>
                <p className="text-gray-900 font-bold text-lg">{car.luggage}</p>
              </div>
            )}
            {car.sourcing && (
              <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sourcing</label>
                <p className="text-gray-900 font-bold text-lg">{car.sourcing}</p>
              </div>
            )}
            {car.rc_image_url && (
              <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100 col-span-1 md:col-span-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">RC Image</label>
                <a href={car.rc_image_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View RC Image
                </a>
              </div>
            )}
            {car.insurance_doc_url && (
              <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100 col-span-1 md:col-span-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Insurance Document</label>
                <a href={car.insurance_doc_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Insurance Document
                </a>
              </div>
            )}
            {car.fitness_doc_url && (
              <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100 col-span-1 md:col-span-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Fitness Document</label>
                <a href={car.fitness_doc_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Fitness Document
                </a>
              </div>
            )}
            {car.permit_doc_url && (
              <div className="detail-item p-4 bg-gray-50 rounded-xl border border-gray-100 col-span-1 md:col-span-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Permit Document</label>
                <a href={car.permit_doc_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Permit Document
                </a>
              </div>
            )}
            {car.rc_data && (
              <div className="detail-item md:col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Raw RC Data</label>
                <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto border border-gray-200">
                  <pre className="text-xs text-gray-700 font-mono">{JSON.stringify(JSON.parse(car.rc_data), null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-100 flex justify-end sticky bottom-0 z-10">
          <button
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-white hover:shadow-sm hover:border-gray-400 transition-all font-medium"
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
