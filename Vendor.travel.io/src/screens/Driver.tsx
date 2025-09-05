import React, { useState, useEffect } from 'react';
import axios from '../api/axios'
interface Driver {
  id: string;
  vendor_id ?: string;
  adress ?: string;
  name: string;
  phone: string;
  languages: string[];
  dl_number: string;
  dl_data: string; 
  dl_issue_date?: string; 
  dob?: string; 
  approved_by?:string;
  is_active ?: boolean;
  vehicle_id ?: string;
  address: string;
}

const DriverManagementComponent: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddDriverModal, setShowAddDriverModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const[error,setError]=useState('');
  const[success,setSuccess]=useState('');
  const[AutoFetchData,setAutoFetchData]=useState({
    name:'',
    IssueDate:'',
    ExpiryDate:'',
    address:'',
    dl_number:'',
    dl_data:'',
    dob:'' 
  });
  // Driver form data
  const [dlState, setDlState] = useState<string>('');
  const [dlRtoCode, setDlRtoCode] = useState<string>('');
  const [dlIssueYear, setDlIssueYear] = useState<string>('');
  const [dl_number, setdl_number] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['hindi','english']);
  const[phone,setPhone]=useState('');

  // State for Edit Driver Modal
  const [showEditDriverModal, setShowEditDriverModal] = useState<boolean>(false);
  const [currentDriverToEdit, setCurrentDriverToEdit] = useState<Driver | null>(null);
  const [editDlState, setEditDlState] = useState<string>('');
  const [editDlRtoCode, setEditDlRtoCode] = useState<string>('');
  const [editDlIssueYear, setEditDlIssueYear] = useState<string>('');
  const [editDlNumberPart, setEditDlNumberPart] = useState<string>('');
  const [editDateOfBirth, setEditDateOfBirth] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editAutoFetchData, setEditAutoFetchData] = useState({
    name: '',
    IssueDate: '',
    ExpiryDate: '',
    address: '',
    dl_number: '',
    dl_data: '',
    dob: ''
  });
  // const mockDrivers: Driver[] = [
  //   {
  //     id: '1',
  //     name: 'Akash Rai',
  //     phone: 'xx xxxx xxxx',
  //     languages: ['Hindi', 'English'],
  //     dl_number: 'UP522024(7)',
  //     dl_data: '06/09/2047',
  //     address: 'Approved'
  //   },
  //   {
  //     id: '2',
  //     name: 'Akash Rai',
  //     phone: 'xx xxxx xxxx',
  //     languages: ['Hindi', 'English'],
  //     dl_number: 'UP522024(7)',
  //     dl_data: '06/09/2047',
  //     address: 'Awaited'
  //   }
  // ];

  useEffect(() => {
    // Simulate API call to fetch drivers
    const fetchDrivers = async () => {
      setLoading(true);
      try {

          const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        setError('You must be logged in to verify your phone number.');
        return;
      }

        // Replace with actual API call
        const response = await axios.get('/driver', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // const data = await response.json();
        // setDrivers(data);

        console.log("Fetching Drivers")

        console.log(response);
        
        // Using mock data for demonstration
        // setTimeout(() => {
          setDrivers(response.data.drivers);
          setLoading(false);
        // }, 500);
      } catch (error) {
        console.error('Error fetching drivers:', error);
        setDrivers([]);
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.dl_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDriver = () => {
    setShowAddDriverModal(true);
  };

  const handleCloseModal = () => {
    console.log(selectedLanguages)
    setShowAddDriverModal(false);
    // Reset form fields
    setDlState('');
    setDlRtoCode('');
    setDlIssueYear('');
    setdl_number('');
    setDateOfBirth('');
    setSelectedLanguages([]);
  };

  const handleEditDriver = (driver: Driver) => {
    setCurrentDriverToEdit(driver);
    setShowEditDriverModal(true);

    // Parse DL number into 4 parts
    const dlNum = driver.dl_number;
    if (dlNum && dlNum.length >= 7) { // Assuming minimum length for parsing
      setEditDlState(dlNum.substring(0, 2)); // First 2 chars for State
      setEditDlRtoCode(dlNum.substring(2, 4)); // Next 2 for RTO Code
      setEditDlIssueYear(dlNum.substring(4, 8)); // Next 4 for Issue Year
      setEditDlNumberPart(dlNum.substring(8)); // Remaining for 7 Digits part
    } else {
      setEditDlState('');
      setEditDlRtoCode('');
      setEditDlIssueYear('');
      setEditDlNumberPart('');
    }

    setEditDateOfBirth(driver.dob || ''); // Pre-fill DOB
    setEditPhone(driver.phone);

    setEditAutoFetchData({
      name: driver.name,
      IssueDate: driver.dl_issue_date || '', // Assuming dl_issue_date exists in Driver interface
      ExpiryDate: driver.dl_data, // dl_data stores expiry date
      address: driver.address,
      dl_number: driver.dl_number,
      dl_data: '', // This might need to be parsed from dl_data if it's a JSON string
      dob: driver.dob || ''
    });
  };

  const handleCloseEditModal = () => {
    setShowEditDriverModal(false);
    setCurrentDriverToEdit(null);
    // Reset edit form fields
    setEditDlState('');
    setEditDlRtoCode('');
    setEditDlIssueYear('');
    setEditDlNumberPart('');
    setEditDateOfBirth('');
    setEditPhone('');
    setEditAutoFetchData({
      name: '',
      IssueDate: '',
      ExpiryDate: '',
      address: '',
      dl_number: '',
      dl_data: '',
      dob: ''
    });
  };

  const handleUpdateDriver = async () => {
    if (!currentDriverToEdit) return;

    try {
      const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        setError('You must be logged in to verify your phone number.');
        return;
      }

      const updatedDLNumber = editDlState + editDlRtoCode + editDlIssueYear + editDlNumberPart;
      const updatedDOB = editDateOfBirth; // Already in YYYY-MM-DD format

      const response = await axios.put(`/driver/${currentDriverToEdit.id}`, {
        name: editAutoFetchData.name,
        phone: editPhone,
        address: editAutoFetchData.address,
        dl_number: updatedDLNumber,
        dl_data: editAutoFetchData.ExpiryDate, // Assuming this is the expiry date string
        dob: updatedDOB,
        dl_issue_date: editAutoFetchData.IssueDate,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setSuccess('Driver updated successfully');
        setDrivers(prevDrivers =>
          prevDrivers.map(driver =>
            driver.id === currentDriverToEdit.id ? response.data.driver : driver
          )
        );
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error updating driver:', error);
      setError('Failed to update driver');
    } finally {
      handleCloseEditModal();
    }
  };

  const handleDeleteDriver = async(driverId: string) => {
    try {

        const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        setError('You must be logged in to verify your phone number.');
        return;
      }

      const response=await axios.delete(`/driver/${driverId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if(response.data.success){
          setSuccess(response.data.message)
          setDrivers(prevDrivers => prevDrivers.filter(driver => driver.id !== driverId));
        }
        else{
          setError(response.data.message)
        }
      
    } catch (error) {
        console.log(error);
        setError('Something Went Wrong');
    }
    // Implement delete driver functionality
  };
  
  const handleShowBookingHistory = (driverId: string) => {
    // Implement show booking history functionality
    alert(`Show booking history for driver ${driverId}`);
  };
  
  const handleConfirmAddDriver = async() => {
    // Implement add driver functionality with form validation
    // This would typically be an API call
    try {


       const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        setError('You must be logged in to verify your phone number.');
        return;
      }
      

      const response=await axios.post('/driver',{
        phone:phone,
      ...AutoFetchData,
      },{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      if(response.data.success){
        setSuccess('Driver Added Successfully');
        setDrivers((prev) => [...prev, response.data.driver]);
      }
      else{
        setError('Please Check Driver Details')
      }
      
    } catch (error) {
      console.log(error);
      setError('Please Check Driver Details')
    }
    finally {
      handleCloseModal();
    }
  };

  const handleChooseLanguages = () => {
    // This would typically open a language selection UI
    // For demo purposes, we'll just set some languages
    setSelectedLanguages(['Hindi', 'English']);
  };

  const handleFetchDetails=async()=>{
    try {

        const token = localStorage.getItem("marcocabs_vendor_token");
      if (!token) {
        setError('You must be logged in to verify your phone number.');
        return;
      }


      const DLNumber=dlState+dlRtoCode+dlIssueYear+dl_number;
       
    
      const [year, month, day] = dateOfBirth.split('-');
      const DOB = `${year}-${month}-${day}`;

      const response=await axios.post('/driver/verify-license',{
        dl_number:DLNumber,
        dob:DOB
      }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log(response.data);
        // setAutoFetchData(response.data.data);

        if(response.data.success){
        
          if(response.data.data.dl_status!=="ACTIVE"){
            setError('The Driving License is not Active');
            setSuccess('');
            return ;

          }
          console.log("setting the data");
          setAutoFetchData({
            name:response.data.data.name ?? '',
            IssueDate:response.data.data.date_of_issue ?? '',
            ExpiryDate:response.data.data.non_transport_to ?? '',
            address:response.data.data.complete_address ?? '',
            dl_number:response.data.data.dl_number ?? '',
            dl_data:JSON.stringify(response.data.data) ?? '',
            dob: response.data.data.dob ?? ''
          })
          setSuccess('Driver License Verified Successfully')

          setError('')
        }
        else{
        setError(response.data.message)
        setSuccess('');
        }

        
      
    } catch (error) {
      console.log(error);
      setError('Verification Failed');
      setSuccess('');
    }
  }

  const getaddressBadgeClass = (address: string) => {
    switch(address.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'awaited': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full">
      {
        error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
            <button className="float-right font-bold" onClick={() => setError('')}>X</button>
          </div>
        )

      }
      {
        success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
            <button className="float-right font-bold" onClick={() => setSuccess('')}>X</button>
          </div>
        )
      }
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[0, 1, 2].map((idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  {idx === 0 ? 'Total Drivers' : idx === 1 ? 'Approved Drivers' : 'Pending Approval'}
                </p>
                {loading ? (
                  <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {idx === 0
                      ? drivers.length
                      : idx === 1
                      ? drivers.filter(driver => driver.address === 'Approved').length
                      : drivers.filter(driver => driver.address === 'Awaited').length}
                  </p>
                )}
              </div>
              <div className={`p-3 ${idx === 0 ? 'bg-blue-100' : idx === 1 ? 'bg-green-100' : 'bg-yellow-100'} rounded-lg`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${idx === 0 ? 'text-blue-700' : idx === 1 ? 'text-green-700' : 'text-yellow-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {/* ...icon paths... */}
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Add Driver */}
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
              placeholder="Search driver by name or DL number"
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
            />
          </div>
          <button
            onClick={handleAddDriver}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Driver
          </button>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b"></th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Driver Name</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Phone No.</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Languages</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">DL Number</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">DL Expiry</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">address</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx}>
                    {Array.from({ length: 8 }).map((_, colIdx) => (
                      <td key={colIdx} className="p-4 border-b border-gray-100">
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-gray-500">
                    No drivers found. Add your first driver to get started.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm border-b border-gray-100 text-center">
                      <button
                        onClick={() => handleDeleteDriver(driver.id)}
                        className="text-red-500 p-1 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{driver.name}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">{driver.phone}</td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      {/* <div className="flex flex-wrap gap-1">
                        {driver.languages.map((lang, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                            {lang}
                          </span>
                        ))}
                      </div> */}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100 font-mono">{driver.dl_number}</td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">{driver.dl_data}</td>
                    <td className="p-4 text-sm border-b border-gray-100">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getaddressBadgeClass(driver.address)}`}>
                        {driver.address}
                      </span>
                    </td>
                    <td className="p-4 text-sm border-b border-gray-100">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShowBookingHistory(driver.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                        >
                          Bookings
                        </button>
                        <button
                          onClick={() => handleEditDriver(driver)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors"
                        >
                          Edit
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

      {/* Add Driver Modal */}
      {showAddDriverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-white text-xl font-semibold">Add New Driver</h2>
                <button 
                  onClick={handleCloseModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-green-50 mt-2">
                Only provide drivers that you know and can guarantee for good service
              </p>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                  <div className="flex gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h3 className="font-medium text-yellow-800 mb-1">Important Note</h3>
                      <p className="text-sm text-yellow-700">
                        You are responsible for the drivers you add to the platform. 
                        Make sure they are reliable and provide good service to customers.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Driver License Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Driver License Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DL Number</label>
                      <div className="grid grid-cols-4 gap-3">
                        <input
                          type="text"
                          placeholder="State"
                          value={dlState}
                          onChange={(e) => setDlState(e.target.value)}
                          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                          maxLength={2}
                        />
                        <input
                          type="text"
                          placeholder="RTO Code"
                          value={dlRtoCode}
                          onChange={(e) => setDlRtoCode(e.target.value)}
                          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                          maxLength={2}
                        />
                        <input
                          type="text"
                          placeholder="Issue Year"
                          value={dlIssueYear}
                          onChange={(e) => setDlIssueYear(e.target.value)}
                          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                          maxLength={4}
                        />
                        <input
                          type="text"
                          placeholder="7 Digits"
                          value={dl_number}
                          onChange={(e) => setdl_number(e.target.value)}
                          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                          maxLength={7}
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-1/2">
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          id="dateOfBirth"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                        />
                      </div>
                      
                      <div className="w-full md:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fetch Details</label>
                        <button
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          onClick={handleFetchDetails}
                        >
                          Verify & Fetch Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Auto Fetched Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Driver Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        placeholder="Auto fetch name"
                        disabled
                        value={AutoFetchData.name}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DL Issue Date</label>
                      <input
                        type="text"
                        placeholder="Auto fetch issue date"
                        disabled
                        value={AutoFetchData.IssueDate}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DL Expiring Date</label>
                      <input
                        type="text"
                        placeholder="Auto fetch expiry date"
                        disabled
                        value={AutoFetchData.ExpiryDate}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>
                </div>


                 <div>
                   <input
                          type="text"
                          placeholder="Phone Number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                          maxLength={12}
                        />
                 </div>


                {/* Document Upload */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Document Upload</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DL Image</label>
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-500 mb-1">Drop file here or</span>
                        <button className="text-sm text-green-600 font-medium">Browse Files</button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Driver Photo</label>
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm text-gray-500 mb-1">Drop file here or</span>
                        <button className="text-sm text-green-600 font-medium">Browse Files</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Languages Known</label>
                  <div className="bg-white border border-gray-300 rounded-lg">
                    <div className="p-4 flex flex-wrap gap-2">
                      {selectedLanguages.map((lang, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center">
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                          <button className="ml-2 text-green-600 hover:text-green-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                      <button 
                        onClick={handleChooseLanguages}
                        className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100"
                      >
                        + Add Language
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-200 flex justify-end gap-3">
              <button 
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button 
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                onClick={handleConfirmAddDriver}
              >
                Add Driver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {showEditDriverModal && currentDriverToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-white text-xl font-semibold">Edit Driver</h2>
                <button
                  onClick={handleCloseEditModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-green-50 mt-2">
                Update the details for {currentDriverToEdit.name}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Driver License Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Driver License Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DL Number</label>
                      <div className="grid grid-cols-4 gap-3">
                        <input
                          type="text"
                          placeholder="State"
                          value={editDlState}
                          onChange={(e) => setEditDlState(e.target.value)}
                          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                          maxLength={2}
                        />
                        <input
                          type="text"
                          placeholder="RTO Code"
                          value={editDlRtoCode}
                          onChange={(e) => setEditDlRtoCode(e.target.value)}
                          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                          maxLength={2}
                        />
                        <input
                          type="text"
                          placeholder="Issue Year"
                          value={editDlIssueYear}
                          onChange={(e) => setEditDlIssueYear(e.target.value)}
                          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                          maxLength={4}
                        />
                        <input
                          type="text"
                          placeholder="7 Digits"
                          value={editDlNumberPart}
                          onChange={(e) => setEditDlNumberPart(e.target.value)}
                          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                          maxLength={7}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-1/2">
                        <label htmlFor="editDateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          id="editDateOfBirth"
                          value={editDateOfBirth}
                          onChange={(e) => setEditDateOfBirth(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                        />
                      </div>

                      <div className="w-full md:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fetch Details</label>
                        <button
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          onClick={handleFetchDetails} // This will update AutoFetchData, not editAutoFetchData
                        >
                          Verify & Fetch Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Auto Fetched Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Driver Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        placeholder="Auto fetch name"
                        disabled
                        value={editAutoFetchData.name}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DL Issue Date</label>
                      <input
                        type="text"
                        placeholder="Auto fetch issue date"
                        disabled
                        value={editAutoFetchData.IssueDate}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DL Expiring Date</label>
                      <input
                        type="text"
                        placeholder="Auto fetch expiry date"
                        disabled
                        value={editAutoFetchData.ExpiryDate}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all"
                    maxLength={12}
                  />
                </div>

                {/* Document Upload (Placeholder for now) */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Document Upload</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DL Image</label>
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-500 mb-1">Drop file here or</span>
                        <button className="text-sm text-green-600 font-medium">Browse Files</button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Driver Photo</label>
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm text-gray-500 mb-1">Drop file here or</span>
                        <button className="text-sm text-green-600 font-medium">Browse Files</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Languages (Placeholder for now) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Languages Known</label>
                  <div className="bg-white border border-gray-300 rounded-lg">
                    {/* <div className="p-4 flex flex-wrap gap-2">
                      {currentDriverToEdit.languages.map((lang, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center">
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                          <button className="ml-2 text-green-600 hover:text-green-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                      <button
                        onClick={handleChooseLanguages}
                        className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100"
                      >
                        + Add Language
                      </button>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-200 flex justify-end gap-3">
              <button
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={handleCloseEditModal}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                onClick={handleUpdateDriver}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagementComponent;
