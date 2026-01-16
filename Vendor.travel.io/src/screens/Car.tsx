// src/components/AddCar.tsx
import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import CarDetailsModal from '../components/CarDetailsModal';

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
  rc_vehicle_category?: string;
}

interface CabCategory {
  id: string;
  segment: string;
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
  CAB_CATEGORIES: '/vehicle/cab-categories'
};

const AddCarForm: React.FC = () => {
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
      if (fetchedCarDetails?.model) formData.append('model', fetchedCarDetails.model);
      if (fetchedCarDetails?.registration_no) formData.append('registration_no', fetchedCarDetails.registration_no);
      if (fetchedCarDetails?.no_of_seats) formData.append('no_of_seats', String(fetchedCarDetails.no_of_seats));
      if (newCar.car_image) formData.append('image', newCar.car_image);
      if (rawRcData) formData.append('rc_data', JSON.stringify(rawRcData));
      if (selectedCategory) formData.append('rc_vehicle_category', selectedCategory);

      const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        toast.error('You must be logged in to add a car.');
        return;
      }

      await axios.post(API_ENDPOINTS.CREATE_CAR_WITH_RC, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      fetchCars();
      handleCloseForm();
      toast.success('Car added successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add car. Please try again.');
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
        toast.error('You must be logged in to fetch cars.');
        return;
      }
      const response = await axios.get(API_ENDPOINTS.CARS, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
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
      console.log("Error fetching cars:", err);
      toast.error(err.response?.data?.message || "Error fetching car data");
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
        toast.error('You must be logged in to delete cars.');
        return;
      }
      await axios.delete(API_ENDPOINTS.DELETE_CAR(selectedCarForDeletion.id),
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      fetchCars();
      closeDeleteCarModal();
      toast.success('Car deleted successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete car");
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
        toast.error('You must be logged in to verify car details.');
        return;
      }

      if (rcCache[fullRcNumber]) {
        setFetchedCarDetails(rcCache[fullRcNumber]);
        return;
      }

      const response = await axios.post(API_ENDPOINTS.VERIFY_RC, { vehicle_number: fullRcNumber }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const ResponseData = response.data.data;
      if (ResponseData.status !== "Success") {
        toast.error("Failed to fetch car details. Please check the RC number and try again.");
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
        permit: ResponseData.data.permit_type,
        permitExpiry: ResponseData.data.permit_valid_upto,
        no_of_seats: ResponseData.data.vehicle_seat_capacity,
        insuranceCompany: ResponseData.data.vehicle_insurance_company_name,
        insurancePolicyNumber: ResponseData.data.vehicle_insurance_policy_number,
        makeYear: new Date(ResponseData.data.reg_date).getFullYear(),
      };

      setFetchedCarDetails(carDetails);
      setRcCache(prev => ({ ...prev, [fullRcNumber]: carDetails }));

      setLoading(false);
      toast.success('Car details fetched successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch car details. Please check the RC number and try again.");
      setLoading(false);
      setFetchedCarDetails(null);
    }
  };

  const handleCloseForm = () => {
    setShowAddCarForm(false);
    setFormStep('auto-fetch');
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
          <div key={idx} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
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
              <div className={`p-3 ${idx === 0 ? 'bg-indigo-100' : idx === 1 ? 'bg-green-100' : 'bg-yellow-100'} rounded-lg`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${idx === 0 ? 'text-indigo-700' : idx === 1 ? 'text-green-700' : 'text-yellow-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {idx === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 19H5V5h14m0 0a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h14z" /> /* Use a car icon ideally */}
                  {idx === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />}
                  {idx === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Add New Car */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search car by RC number or Brand"
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200"
              disabled={loading}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              className={`px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium shadow-md shadow-indigo-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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

      {/* Car List Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-50/50">
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
                        className="text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                        onClick={() => openDeleteCarModal(car)}
                        title="Delete Car"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium text-gray-900">{car.brand}</div>
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
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors"
                          onClick={() => {
                            setSelectedCarDetails(car);
                            setShowCarDetailsModal(true);
                          }}
                        >
                          View Details
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
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 scrollbar-hide">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-white text-xl font-bold">
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
              <p className="text-indigo-100 mt-2 text-sm">
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
                  <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl mb-6">
                    <div className="flex gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="font-bold text-indigo-800 mb-1">Enter RC Details</h3>
                        <p className="text-sm text-indigo-700">
                          Input your Registration Certificate details to fetch car information
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* RC Details Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">RC Number</label>
                    <div className="grid grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="State"
                        className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all font-mono"
                        maxLength={2}
                        value={rcState}
                        onChange={(e) => setRcState(e.target.value.toUpperCase())}
                      />
                      <input
                        type="text"
                        placeholder="RTO"
                        className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all font-mono"
                        maxLength={2}
                        value={rtoCode}
                        onChange={(e) => setRtoCode(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Year"
                        className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all font-mono"
                        maxLength={2}
                        value={issueYear}
                        onChange={(e) => setIssueYear(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="4 Digits"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all font-mono"
                        maxLength={4}
                        value={rcDigits}
                        onChange={(e) => setRcDigits(e.target.value)}
                      />
                    </div>
                    <div className="mt-4">
                      <button
                        className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md shadow-indigo-200"
                        onClick={handleFetchCarDetails}
                        disabled={loading}
                      >
                        {loading ? 'Fetching...' : 'Fetch Car Details'}
                      </button>
                    </div>
                  </div>

                  {/* Auto Fetched Details */}
                  {fetchedCarDetails && (
                    <div className="space-y-4 mt-8 animate-fade-in">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm mr-2">✓</span>
                        Auto Fetched Details
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Owner Name</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 font-medium"
                            disabled
                            value={fetchedCarDetails?.owner || 'N/A'}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Brand Name</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 font-medium"
                            disabled
                            value={fetchedCarDetails?.brand || 'N/A'}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Model Name</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 font-medium"
                            disabled
                            value={fetchedCarDetails?.model || 'N/A'}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Vehicle Class</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 font-medium"
                            disabled
                            value={fetchedCarDetails?.carType || 'N/A'}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Fuel Type</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 font-medium"
                            disabled
                            value={fetchedCarDetails?.fuelType || 'N/A'}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Registration Date</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 font-medium"
                            disabled
                            value={fetchedCarDetails?.registration_no ? new Date(fetchedCarDetails.makeYear ? String(fetchedCarDetails.makeYear) : Date.now()).toLocaleDateString() : 'N/A'}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Seat Capacity</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 font-medium"
                            disabled
                            value={fetchedCarDetails?.no_of_seats || 'N/A'}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cab Category <span className="text-red-500">*</span></label>
                          <select
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all bg-white"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                          >
                            <option value="">Select a category</option>
                            {cabCategories.map((cat) => (
                              <option key={cat.id} value={cat.segment}>
                                {cat.segment} (₹{cat.price_per_km}/km)
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">Select the category that best fits this vehicle.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                    onClick={handleCloseForm}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md shadow-indigo-200 ${!fetchedCarDetails || !selectedCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleNextToAddCar}
                    disabled={!fetchedCarDetails || !selectedCategory}
                  >
                    Next Step
                  </button>
                </div>
              </div>
            ) : (
              // Add Car Form Content
              <div className="p-6">
                <div className="space-y-6">
                  <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg mb-6">
                    <div className="flex gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="font-medium text-indigo-800 mb-1">Required Documents</h3>
                        <p className="text-sm text-indigo-700">
                          Please upload clear images/PDFs of your documents.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Car Details Section */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Upload Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'RC Image', key: 'rc_image' as keyof typeof newCar },
                        { label: 'Car Image', key: 'car_image' as keyof typeof newCar },
                        { label: 'Insurance Doc', key: 'insurance_doc' as keyof typeof newCar },
                        { label: 'Fitness Doc', key: 'fitness_doc' as keyof typeof newCar },
                        { label: 'Permit Doc', key: 'permit_doc' as keyof typeof newCar }
                      ].map((doc) => (
                        <div key={doc.key}>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{doc.label}</label>
                          <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors relative">
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setNewCar({ ...newCar, [doc.key]: e.target.files[0] });
                                }
                              }}
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {newCar[doc.key] ? (
                              <span className="text-sm text-indigo-600 font-bold truncate max-w-full px-2">{(newCar[doc.key] as File).name}</span>
                            ) : (
                              <>
                                <span className="text-sm text-gray-500 mb-1">Click to upload</span>
                                <span className="text-xs text-gray-400">or drag and drop</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Details Section */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 mt-6">Additional Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="luggageCarrier" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Luggage Carrier</label>
                        <select
                          id="luggageCarrier"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all bg-white"
                          value={newCar.luggage}
                          onChange={(e) => setNewCar({ ...newCar, luggage: e.target.value })}
                        >
                          <option value="">Select availability</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="sourcing" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Sourcing</label>
                        <select
                          id="sourcing"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all bg-white"
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
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                    onClick={() => setFormStep('auto-fetch')}
                  >
                    Back
                  </button>
                  <button
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md shadow-indigo-200"
                    onClick={handleAddCar}
                  >
                    Submit Vehicle
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900">
              Delete Car?
            </h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete <span className="font-bold text-gray-800">{selectedCarForDeletion.brand} ({selectedCarForDeletion.rcNumber})</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-colors duration-150 font-medium"
                onClick={closeDeleteCarModal}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg transition-colors duration-150 font-medium shadow-md shadow-red-200"
                onClick={handleDeleteCar}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCarForm;
