// src/components/AddCar.tsx
import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast'; // Import toast
// import { useNavigate } from 'react-router-dom'; // Import useNavigate
import CarDetailsModal from '../components/CarDetailsModal'; // Import CarDetailsModal

interface Car {
  id: string; // Changed to string to match backend CHAR(64)
  vendor_id: string;
  model: string; // Maps to 'brand' in frontend
  registration_no: string; // Maps to 'rcNumber' in frontend
  rc_data?: string; // For 
  image?: string; // For car image
  no_of_seats: number;
  is_active: boolean; // TINYINT(1) in SQL often maps to boolean

  // Existing frontend-specific fields, to be retained or mapped
  brand: string; // Retained for UI display, will map to 'model' for API
  fuelType: string;
  carType: string;
  rcNumber: string; // Retained for UI display, will map to 'registration_no' for API
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
  rc_vehicle_category?: string; // Add this field
}

interface CabCategory {
  id: string;
  category: string;
  price_per_km: number;
}

// Car status classification data
const carStatusClasses = [
  { status: 'approved', class: 'bg-green-100 text-green-800' },
  { status: 'awaited', class: 'bg-yellow-100 text-yellow-800' },
  { status: 'rejected', class: 'bg-red-100 text-red-800' },
  { status: 'default', class: 'bg-gray-100 text-gray-800' }
];

// Permit status classification data
const permitStatusClasses = [
  { status: 'valid', class: 'bg-green-100 text-green-800' },
  { status: 'awaited', class: 'bg-yellow-100 text-yellow-800' },
  { status: 'expired', class: 'bg-red-100 text-red-800' },
  { status: 'default', class: 'bg-gray-100 text-gray-800' }
];

const API_ENDPOINTS = {
  CARS: '/vehicle',
  CAR_DETAILS: (id: string) => `/vehicle/${id}`,
  ADD_CAR: '/vehicle',
  UPDATE_CAR: (id: string) => `/vehicle/${id}`,
  DELETE_CAR: (id: string) => `/vehicle/${id}`,
  CREATE_CAR_WITH_RC: '/vehicle/with-rc',
  VERIFY_RC: '/vehicle/verify-rc',
  CAB_CATEGORIES: '/vehicle/cab-categories' // Add endpoint
};

const AddCarForm: React.FC = () => {
  // const navigate = useNavigate(); // Initialize useNavigate hook
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [formStep, setFormStep] = useState<'auto-fetch' | 'add-car'>('auto-fetch');
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // State for RC auto-fetch form
  const [rcState, setRcState] = useState<string>('');
  const [rtoCode, setRtoCode] = useState<string>('');
  const [issueYear, setIssueYear] = useState<string>('');
  const [rcDigits, setRcDigits] = useState<string>('');
  const [fetchedCarDetails, setFetchedCarDetails] = useState<Partial<Car> | null>(null);
  const [rawRcData, setRawRcData] = useState<any>(null);
  const [rcCache, setRcCache] = useState<Record<string, Partial<Car>>>({});
  const [cabCategories, setCabCategories] = useState<CabCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // State for Add Car form
  const [newCar, setNewCar] = useState<{
    rc_image: File | null;
    car_image: File | null;
    insurance_doc: File | null;
    fitness_doc: File | null;
    permit_doc: File | null;
    luggage: string;
    sourcing: string;
  }>({
    rc_image: null,
    car_image: null,
    insurance_doc: null,
    fitness_doc: null,
    permit_doc: null,
    luggage: '',
    sourcing: '',
  });

  // State for Car Details Modal
  const [showCarDetailsModal, setShowCarDetailsModal] = useState(false);
  const [selectedCarDetails, setSelectedCarDetails] = useState<Car | null>(null);
  const [showDeleteCarModal, setShowDeleteCarModal] = useState(false);
  const [selectedCarForDeletion, setSelectedCarForDeletion] = useState<Car | null>(null);


  const handleAddCar = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      console.log(fetchedCarDetails?.model);

      console.log(rawRcData);

      if (fetchedCarDetails?.model) {

        formData.append('model', fetchedCarDetails.model);
      }
      if (fetchedCarDetails?.registration_no) {
        formData.append('registration_no', fetchedCarDetails.registration_no);
      }
      if (fetchedCarDetails?.no_of_seats) {
        formData.append('no_of_seats', String(fetchedCarDetails.no_of_seats));
      }

      if (newCar.car_image) {
        formData.append('image', newCar.car_image);
      }

      if (rawRcData) {
        formData.append('rc_data', JSON.stringify(rawRcData));
      }

      const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        toast.error('You must be logged in to add a car.'); // Error toast
        return;
      }
      // use form data when u want to upload files currently just data 
      // await axios.post(API_ENDPOINTS.CREATE_CAR_WITH_RC, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //     Authorization: `Bearer ${token}`,
      //   },
      // });

      await axios.post(API_ENDPOINTS.CREATE_CAR_WITH_RC, {
        model: fetchedCarDetails?.model,
        registration_no: fetchedCarDetails?.registration_no,
        no_of_seats: fetchedCarDetails?.no_of_seats,
        rc_data: rawRcData,
        rc_vehicle_category: selectedCategory, // Add category to payload
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      fetchCars();
      handleCloseForm();
      toast.success('Car added successfully!'); // Success toast
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add car. Please try again.'); // Error toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
    fetchCabCategories();
  }, []);

  const fetchCabCategories = async () => {
    try {
      const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) return;
      const response = await axios.get(API_ENDPOINTS.CAB_CATEGORIES, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCabCategories(response.data.cab_categories);
      }
    } catch (error) {
      console.error("Error fetching cab categories:", error);
    }
  };

  const fetchCars = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        toast.error('You must be logged in to fetch cars.'); // Error toast
        return;
      } // Assuming token is stored in localStorage
      const response = await axios.get(API_ENDPOINTS.CARS, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response.data);
      const mappedCars = response.data.vehicles.map((car: any) => ({
        ...car,
        brand: car.model,
        rcNumber: car.registration_no,
        status: car.is_active ? 'approved' : 'awaited',
        permit: car.rc_permit_type || 'N/A',
        permitExpiry: car.rc_permit_valid_upto,
        fuelType: car.rc_type || 'N/A',
        carType: car.rc_class || 'N/A',
        makeYear: car.rc_reg_date ? new Date(car.rc_reg_date).getFullYear() : undefined,
        lastUpdated: car.updated_at,
      }));
      setCars(mappedCars);
      setLoading(false);
    } catch (err: any) {
      console.log("Error fetching cars:");
      console.log(err);
      toast.error(err.response?.data?.message || "Error fetching car data"); // Error toast
      setLoading(false);
    }
  };

  const handleDeleteCar = async () => {
    if (!selectedCarForDeletion) {
      toast.error('No car selected for deletion.');
      return;
    }
    try {
      const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        toast.error('You must be logged in to delete cars.'); // Error toast
        return;
      } // Assuming token is stored in localStorage
      await axios.delete(API_ENDPOINTS.DELETE_CAR(selectedCarForDeletion.id),
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      fetchCars(); // Refresh the car list
      closeDeleteCarModal();
      toast.success('Car deleted successfully!'); // Success toast
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete car"); // Error toast
    }
  };

  const openDeleteCarModal = (car: Car) => {
    setSelectedCarForDeletion(car);
    setShowDeleteCarModal(true);
  };

  const closeDeleteCarModal = () => {
    setShowDeleteCarModal(false);
    setSelectedCarForDeletion(null);
  };

  const getStatusBadgeClass = (status: string): string => {
    const found = carStatusClasses.find(item => item.status.toLowerCase() === status.toLowerCase());
    return found ? found.class : carStatusClasses.find(item => item.status === 'default')?.class || '';
  };

  const getPermitBadgeClass = (permit: string): string => {
    const found = permitStatusClasses.find(item => item.status.toLowerCase() === permit.toLowerCase());
    return found ? found.class : permitStatusClasses.find(item => item.status === 'default')?.class || '';
  };

  // Filter cars based on search term
  const filteredCars = cars.filter(car =>
    car.rcNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );



  const handleFetchCarDetails = async () => {
    try {
      setLoading(true);
      const fullRcNumber = `${rcState}${rtoCode}${issueYear}${rcDigits}`;
      const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        toast.error('You must be logged in to verify car details.'); // Error toast
        return;
      }

      if (rcCache[fullRcNumber]) {
        console.log("Using cached RC data for:", fullRcNumber, rcCache[fullRcNumber]);
        setFetchedCarDetails(rcCache[fullRcNumber]);
        return;
      }

      const response = await axios.post(API_ENDPOINTS.VERIFY_RC, { vehicle_number: fullRcNumber }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const ResponseData = response.data.data;
      console.log(ResponseData);
      if (ResponseData.status !== "Success") {
        toast.error("Failed to fetch car details. Please check the RC number and try again."); // Error toast
        setLoading(false);
        setFetchedCarDetails(null);
        return;
      }
      setRawRcData(ResponseData);
      const carDetails: Partial<Car> = {
        owner: ResponseData.data.owner,
        brand: ResponseData.data.vehicle_manufacturer_name,
        model: ResponseData.data.model,
        carType: ResponseData.data.class,
        fuelType: ResponseData.data.type,
        chassis: ResponseData.data.chassis,
        engine: ResponseData.data.engine,
        registration_no: fullRcNumber,
        fitnessExpiry: ResponseData.data.rc_expiry_date,
        insuranceExpiry: ResponseData.data.vehicle_insurance_upto,
        permit: ResponseData.data.permit_type, permitExpiry: ResponseData.data.permit_valid_upto,
        no_of_seats: ResponseData.data.vehicle_seat_capacity,
        insuranceCompany: ResponseData.data.vehicle_insurance_company_name,
        insurancePolicyNumber: ResponseData.data.vehicle_insurance_policy_number,
        makeYear: new Date(ResponseData.data.reg_date).getFullYear(),
      };

      setFetchedCarDetails(carDetails);

      // ✅ Save to cache
      setRcCache(prev => ({ ...prev, [fullRcNumber]: carDetails }));

      setLoading(false);
      toast.success('Car details fetched successfully!'); // Success toast
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch car details. Please check the RC number and try again."); // Error toast
      setLoading(false);
      setFetchedCarDetails(null);
    }
  };

  const handleCloseForm = () => {
    setShowAddCarForm(false);
    setFormStep('auto-fetch'); // Reset to first step when closing
    setRcState('');
    setRtoCode('');
    setIssueYear('');
    setRcDigits('');
    setFetchedCarDetails(null);
    setRawRcData(null);
  };

  const handleNextToAddCar = () => {
    setFormStep('add-car');
  };

  return (
    <div className="w-full">
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[0, 1, 2].map((idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  {idx === 0 ? 'Total Cars' : idx === 1 ? 'Approved Cars' : 'Pending Approval'}
                </p>
                {loading ? (
                  <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {idx === 0
                      ? cars.length
                      : idx === 1
                        ? cars.filter(car => car.status.toLowerCase() === 'approved').length
                        : cars.filter(car => car.status.toLowerCase() === 'awaited').length}
                  </p>
                )}
              </div>
              <div className={`p-3 ${idx === 0 ? 'bg-green-100' : idx === 1 ? 'bg-green-100' : 'bg-yellow-100'} rounded-lg`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${idx === 0 ? 'text-green-700' : idx === 1 ? 'text-green-700' : 'text-yellow-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {/* ...icon paths... */}
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Add New Car */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search car by RC number"
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
              disabled={loading}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              className={`px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                setShowAddCarForm(true);
                setFormStep('auto-fetch');
              }}
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Car
            </button>
          </div>
        </div>
      </div>

      {/* Error message if any */}

      {/* Car List Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b"></th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Car Details</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Car Type</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">RC Number</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Permit</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Status</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx}>
                    {Array.from({ length: 7 }).map((_, colIdx) => (
                      <td key={colIdx} className="p-4 border-b border-gray-100">
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredCars?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    {cars.length > 0 ? 'No cars match your search criteria.' : 'No cars found. Add your first car to get started.'}
                  </td>
                </tr>
              ) : (
                filteredCars?.map((car) => (
                  <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm border-b border-gray-100 text-center">
                      <button
                        className="text-red-500 p-1 hover:bg-red-50 rounded-full transition-colors"
                        onClick={() => openDeleteCarModal(car)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{car.brand}</div>
                      <div className="text-xs text-gray-500 mt-1">{car.fuelType}</div>
                      {car.makeYear && (
                        <div className="text-xs text-gray-500 mt-1">Make: {car.makeYear}</div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">{car.carType}</td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100 font-mono">{car.rcNumber}</td>
                    <td className="p-4 text-sm border-b border-gray-100">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPermitBadgeClass(car.permit)}`}>
                        {car.permit}
                      </span>
                      {car.permitExpiry && (
                        <div className="text-xs text-gray-500 mt-1">
                          Exp: {new Date(car.permitExpiry).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm border-b border-gray-100">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(car.status)}`}>
                        {car.status}
                      </span>
                      {car.lastUpdated && (
                        <div className="text-xs text-gray-500 mt-1">
                          Updated: {new Date(car.lastUpdated).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm border-b border-gray-100">
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                          onClick={() => {
                            setSelectedCarDetails(car);
                            setShowCarDetailsModal(true);
                          }}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Car Modal */}
      {showAddCarForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-white text-xl font-semibold">
                  {formStep === 'auto-fetch' ? 'Auto Fetch Car Details' : 'Add New Car'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-green-50 mt-2">
                {formStep === 'auto-fetch'
                  ? 'Enter RC details to automatically fetch your car information'
                  : 'Make sure all the cars are in good condition and well maintained'}
              </p>
            </div>

            {/* Modal Body */}
            {formStep === 'auto-fetch' ? (
              // Auto Fetch Form Content
              <div className="p-6">
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                    <div className="flex gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="font-medium text-green-800 mb-1">Enter RC Details</h3>
                        <p className="text-sm text-green-700">
                          Input your Registration Certificate details to fetch car information
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* RC Details Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">RC Number</label>
                    <div className="grid grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="State"
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                        maxLength={2}
                        value={rcState}
                        onChange={(e) => setRcState(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="RTO Code"
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                        maxLength={2}
                        value={rtoCode}
                        onChange={(e) => setRtoCode(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Issue Year"
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                        maxLength={2}
                        value={issueYear}
                        onChange={(e) => setIssueYear(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="4 Digits"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                        maxLength={4}
                        value={rcDigits}
                        onChange={(e) => setRcDigits(e.target.value)}
                      />
                    </div>
                    <div className="mt-3">
                      <button
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        onClick={handleFetchCarDetails}
                      >
                        Fetch Car Details
                      </button>
                    </div>
                  </div>

                  {/* Auto Fetched Details */}
                  <div className="space-y-4 mt-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Auto Fetched Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                        <input
                          type="text"
                          placeholder="Auto fetch name"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 disabled:bg-gray-100 disabled:text-gray-500 enabled:bg-white enabled:text-gray-900"
                          disabled={!fetchedCarDetails || !!rawRcData?.data?.owner}
                          value={fetchedCarDetails?.owner || ''}
                          onChange={(e) => setFetchedCarDetails(prev => prev ? ({ ...prev, owner: e.target.value }) : prev)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                        <input
                          type="text"
                          placeholder="Auto fetch name"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 disabled:bg-gray-100 disabled:text-gray-500 enabled:bg-white enabled:text-gray-900"
                          disabled={!fetchedCarDetails || !!rawRcData?.data?.vehicle_manufacturer_name}
                          value={fetchedCarDetails?.brand || ''}
                          onChange={(e) => setFetchedCarDetails(prev => prev ? ({ ...prev, brand: e.target.value }) : prev)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maker Name</label>
                        <input
                          type="text"
                          placeholder="Auto fetch name"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 disabled:bg-gray-100 disabled:text-gray-500 enabled:bg-white enabled:text-gray-900"
                          disabled={!fetchedCarDetails || !!rawRcData?.data?.model}
                          value={fetchedCarDetails?.model || ''}
                          onChange={(e) => setFetchedCarDetails(prev => prev ? ({ ...prev, model: e.target.value }) : prev)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Class</label>
                        <input
                          type="text"
                          placeholder="Auto fetch"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 disabled:bg-gray-100 disabled:text-gray-500 enabled:bg-white enabled:text-gray-900"
                          disabled={!fetchedCarDetails || !!rawRcData?.data?.class}
                          value={fetchedCarDetails?.carType || ''}
                          onChange={(e) => setFetchedCarDetails(prev => prev ? ({ ...prev, carType: e.target.value }) : prev)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                        <input
                          type="text"
                          placeholder="Auto fetch"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 disabled:bg-gray-100 disabled:text-gray-500 enabled:bg-white enabled:text-gray-900"
                          disabled={!fetchedCarDetails || !!rawRcData?.data?.type}
                          value={fetchedCarDetails?.fuelType || ''}
                          onChange={(e) => setFetchedCarDetails(prev => prev ? ({ ...prev, fuelType: e.target.value }) : prev)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chassis Number</label>
                        <input
                          type="text"
                          placeholder="Auto fetch"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 disabled:bg-gray-100 disabled:text-gray-500 enabled:bg-white enabled:text-gray-900"
                          disabled={!fetchedCarDetails || !!rawRcData?.data?.chassis}
                          value={fetchedCarDetails?.chassis || ''}
                          onChange={(e) => setFetchedCarDetails(prev => prev ? ({ ...prev, chassis: e.target.value }) : prev)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Engine Number</label>
                        <input
                          type="text"
                          placeholder="Auto fetch"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 disabled:bg-gray-100 disabled:text-gray-500 enabled:bg-white enabled:text-gray-900"
                          disabled={!fetchedCarDetails || !!rawRcData?.data?.engine}
                          value={fetchedCarDetails?.engine || ''}
                          onChange={(e) => setFetchedCarDetails(prev => prev ? ({ ...prev, engine: e.target.value }) : prev)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                        <input
                          type="text"
                          placeholder="Auto fetch"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                          disabled
                          value={fetchedCarDetails?.registration_no || ''}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Expiry Date</label>
                        <input
                          type="text"
                          placeholder="Auto fetch"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 disabled:bg-gray-100 disabled:text-gray-500 enabled:bg-white enabled:text-gray-900"
                          disabled={!fetchedCarDetails || !!rawRcData?.data?.rc_expiry_date}
                          value={fetchedCarDetails?.fitnessExpiry || ''}
                          onChange={(e) => setFetchedCarDetails(prev => prev ? ({ ...prev, fitnessExpiry: e.target.value }) : prev)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Expiry Date</label>
                        <input
                          type="text"
                          placeholder="Auto fetch"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 disabled:bg-gray-100 disabled:text-gray-500 enabled:bg-white enabled:text-gray-900"
                          disabled={!fetchedCarDetails || !!rawRcData?.data?.vehicle_insurance_upto}
                          value={fetchedCarDetails?.insuranceExpiry || ''}
                          onChange={(e) => setFetchedCarDetails(prev => prev ? ({ ...prev, insuranceExpiry: e.target.value }) : prev)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Permit Type</label>
                        <input
                          type="text"
                          placeholder="Auto fetch"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 disabled:bg-gray-100 disabled:text-gray-500 enabled:bg-white enabled:text-gray-900"
                          disabled={!fetchedCarDetails || !!rawRcData?.data?.permit_type}
                          value={fetchedCarDetails?.permit || ''}
                          onChange={(e) => setFetchedCarDetails(prev => prev ? ({ ...prev, permit: e.target.value }) : prev)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Permit Expiry</label>
                        <input
                          type="text"
                          placeholder="Auto fetch"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 disabled:bg-gray-100 disabled:text-gray-500 enabled:bg-white enabled:text-gray-900"
                          disabled={!fetchedCarDetails || !!rawRcData?.data?.permit_valid_upto}
                          value={fetchedCarDetails?.permitExpiry || ''}
                          onChange={(e) => setFetchedCarDetails(prev => prev ? ({ ...prev, permitExpiry: e.target.value }) : prev)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Seat Capacity</label>
                        <input
                          type="text"
                          placeholder="Auto fetch"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 disabled:bg-gray-100 disabled:text-gray-500 enabled:bg-white enabled:text-gray-900"
                          disabled={!fetchedCarDetails || !!rawRcData?.data?.vehicle_seat_capacity}
                          value={fetchedCarDetails?.no_of_seats || ''}
                          onChange={(e) => setFetchedCarDetails(prev => prev ? ({ ...prev, no_of_seats: Number(e.target.value) }) : prev)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Company</label>
                        <input
                          type="text"
                          placeholder="Auto fetch"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 disabled:bg-gray-100 disabled:text-gray-500 enabled:bg-white enabled:text-gray-900"
                          disabled={!fetchedCarDetails || !!rawRcData?.data?.vehicle_insurance_company_name}
                          value={fetchedCarDetails?.insuranceCompany || ''}
                          onChange={(e) => setFetchedCarDetails(prev => prev ? ({ ...prev, insuranceCompany: e.target.value }) : prev)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Policy Number</label>
                        <input
                          type="text"
                          placeholder="Auto fetch"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 disabled:bg-gray-100 disabled:text-gray-500 enabled:bg-white enabled:text-gray-900"
                          disabled={!fetchedCarDetails || !!rawRcData?.data?.vehicle_insurance_policy_number}
                          value={fetchedCarDetails?.insurancePolicyNumber || ''}
                          onChange={(e) => setFetchedCarDetails(prev => prev ? ({ ...prev, insurancePolicyNumber: e.target.value }) : prev)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cab Category <span className="text-red-500">*</span></label>
                        <select
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all bg-white"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          <option value="">Select a category</option>
                          {cabCategories.map((cat) => (
                            <option key={cat.id} value={cat.category}>
                              {cat.category} (₹{cat.price_per_km}/km)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-200 flex justify-end gap-3">
                  <button
                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={handleCloseForm}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    onClick={handleNextToAddCar}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              // Add Car Form Content
              <div className="p-6">
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                    <div className="flex gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="font-medium text-green-800 mb-1">Required Documents</h3>
                        <p className="text-sm text-green-700">
                          Please have your RC, insurance, permit, and vehicle images ready to upload.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Car Details Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Car Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">RC Image</label>
                        <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
                          <input
                            type="file"
                            className="hidden"
                            id="rc-image-upload"
                            onChange={(e) => {
                              if (e.target.files) {
                                setNewCar({ ...newCar, rc_image: e.target.files[0] });
                              }
                            }}
                          />
                          <label htmlFor="rc-image-upload" className="cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-500 mb-1">Drop file here or</span>
                            <span className="text-sm text-green-600 font-medium">Browse Files</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Car Image</label>
                        <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
                          <input
                            type="file"
                            className="hidden"
                            id="car-image-upload"
                            onChange={(e) => {
                              if (e.target.files) {
                                setNewCar({ ...newCar, car_image: e.target.files[0] });
                              }
                            }}
                          />
                          <label htmlFor="car-image-upload" className="cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-500 mb-1">Drop file here or</span>
                            <span className="text-sm text-green-600 font-medium">Browse Files</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fitness and Permit Section */}
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Document</label>
                        <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
                          <input
                            type="file"
                            className="hidden"
                            id="insurance-doc-upload"
                            onChange={(e) => {
                              if (e.target.files) {
                                setNewCar({ ...newCar, insurance_doc: e.target.files[0] });
                              }
                            }}
                          />
                          <label htmlFor="insurance-doc-upload" className="cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm text-gray-500 mb-1">Drop file here or</span>
                            <span className="text-sm text-green-600 font-medium">Browse Files</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Document</label>
                        <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
                          <input
                            type="file"
                            className="hidden"
                            id="fitness-doc-upload"
                            onChange={(e) => {
                              if (e.target.files) {
                                setNewCar({ ...newCar, fitness_doc: e.target.files[0] });
                              }
                            }}
                          />
                          <label htmlFor="fitness-doc-upload" className="cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm text-gray-500 mb-1">Drop file here or</span>
                            <span className="text-sm text-green-600 font-medium">Browse Files</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Permit Document</label>
                        <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
                          <input
                            type="file"
                            className="hidden"
                            id="permit-doc-upload"
                            onChange={(e) => {
                              if (e.target.files) {
                                setNewCar({ ...newCar, permit_doc: e.target.files[0] });
                              }
                            }}
                          />
                          <label htmlFor="permit-doc-upload" className="cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm text-gray-500 mb-1">Drop file here or</span>
                            <span className="text-sm text-green-600 font-medium">Browse Files</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Additional Details Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="luggageCarrier" className="block text-sm font-medium text-gray-700 mb-1">Luggage Carrier</label>
                        <select
                          id="luggageCarrier"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                          value={newCar.luggage}
                          onChange={(e) => setNewCar({ ...newCar, luggage: e.target.value })}
                        >
                          <option value="">Select availability</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="sourcing" className="block text-sm font-medium text-gray-700 mb-1">Sourcing</label>
                        <select
                          id="sourcing"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                          value={newCar.sourcing}
                          onChange={(e) => setNewCar({ ...newCar, sourcing: e.target.value })}
                        >
                          <option value="">Select ownership type</option>
                          <option value="Own">Own</option>
                          <option value="Leased">Leased</option>
                          <option value="Partner">Partner</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-200 flex justify-end gap-3">
                  <button
                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setFormStep('auto-fetch')}
                  >
                    Back
                  </button>
                  <button
                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    onClick={handleAddCar}
                  >
                    Add Car
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Car Details Modal */}
      {showCarDetailsModal && selectedCarDetails && (
        <CarDetailsModal
          car={selectedCarDetails}
          onClose={() => setShowCarDetailsModal(false)}
          getStatusBadgeClass={getStatusBadgeClass}
          getPermitBadgeClass={getPermitBadgeClass}
        />
      )}

      {/* Delete Car Confirmation Modal */}
      {showDeleteCarModal && selectedCarForDeletion && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              Delete Car <span className="break-all">{selectedCarForDeletion.brand} ({selectedCarForDeletion.rcNumber})</span>
            </h3>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete this car? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors duration-150"
                onClick={closeDeleteCarModal}
              >
                No, Keep Car
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-150"
                onClick={handleDeleteCar}
              >
                Yes, Delete Car
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCarForm;
