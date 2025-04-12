import React, { useState, useEffect } from 'react';

interface Driver {
  id: string;
  name: string;
  phoneNumber: string;
  languages: string[];
  dlNumber: string;
  validity: string;
  status: 'Approved' | 'Awaited' | 'Rejected';
}

const DriverManagementComponent: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddDriverModal, setShowAddDriverModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Driver form data
  const [dlState, setDlState] = useState<string>('');
  const [dlRtoCode, setDlRtoCode] = useState<string>('');
  const [dlIssueYear, setDlIssueYear] = useState<string>('');
  const [dlNumber, setDlNumber] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['hindi','english']);
  
  const mockDrivers: Driver[] = [
    {
      id: '1',
      name: 'Akash Rai',
      phoneNumber: 'xx xxxx xxxx',
      languages: ['Hindi', 'English'],
      dlNumber: 'UP522024(7)',
      validity: '06/09/2047',
      status: 'Approved'
    },
    {
      id: '2',
      name: 'Akash Rai',
      phoneNumber: 'xx xxxx xxxx',
      languages: ['Hindi', 'English'],
      dlNumber: 'UP522024(7)',
      validity: '06/09/2047',
      status: 'Awaited'
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch drivers
    const fetchDrivers = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        // const response = await fetch('/api/drivers');
        // const data = await response.json();
        // setDrivers(data);
        
        // Using mock data for demonstration
        setTimeout(() => {
          setDrivers(mockDrivers);
          setLoading(false);
        }, 500);
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
    driver.dlNumber.toLowerCase().includes(searchTerm.toLowerCase())
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
    setDlNumber('');
    setDateOfBirth('');
    setSelectedLanguages([]);
  };

  const handleDeleteDriver = (driverId: string) => {
    // Implement delete driver functionality
    setDrivers(prevDrivers => prevDrivers.filter(driver => driver.id !== driverId));
  };
  
  const handleShowBookingHistory = (driverId: string) => {
    // Implement show booking history functionality
    alert(`Show booking history for driver ${driverId}`);
  };
  
  const handleConfirmAddDriver = () => {
    // Implement add driver functionality with form validation
    // This would typically be an API call
    alert('Driver added successfully!');
    handleCloseModal();
  };

  const handleChooseLanguages = () => {
    // This would typically open a language selection UI
    // For demo purposes, we'll just set some languages
    setSelectedLanguages(['Hindi', 'English']);
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'awaited': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full">
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Drivers</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{drivers.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Approved Drivers</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {drivers.filter(driver => driver.status === 'Approved').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {drivers.filter(driver => driver.status === 'Awaited').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
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
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Validity</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Status</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-gray-500">
                    <div className="flex justify-center items-center py-8">
                      <svg className="animate-spin h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </td>
                </tr>
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
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">{driver.phoneNumber}</td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      <div className="flex flex-wrap gap-1">
                        {driver.languages.map((lang, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100 font-mono">{driver.dlNumber}</td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">{driver.validity}</td>
                    <td className="p-4 text-sm border-b border-gray-100">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(driver.status)}`}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm border-b border-gray-100">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShowBookingHistory(driver.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                        >
                          Bookings
                        </button>
                        <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors">
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
                          maxLength={2}
                        />
                        <input
                          type="text"
                          placeholder="7 Digits"
                          value={dlNumber}
                          onChange={(e) => setDlNumber(e.target.value)}
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
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DL Issue Date</label>
                      <input
                        type="text"
                        placeholder="Auto fetch issue date"
                        disabled
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DL Validity</label>
                      <input
                        type="text"
                        placeholder="Auto fetch expiry date"
                        disabled
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>
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
    </div>
  );
};

export default DriverManagementComponent;