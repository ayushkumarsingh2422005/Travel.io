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

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="w-1/2">
          <input
            type="text"
            placeholder="Search Driver by Name or Number"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2 rounded-full border border-gray-300"
          />
        </div>
        <button
          onClick={handleAddDriver}
          className="bg-green-500 text-white rounded-full px-6 py-2 font-medium flex items-center"
        >
          + Add New Driver
        </button>
      </div>

      {/* Drivers Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 p-3 text-center font-medium w-12"></th>
              <th className="border border-gray-300 p-3 text-center font-medium">
                Driver Name
              </th>
              <th className="border border-gray-300 p-3 text-center font-medium">
                Phone No.
              </th>
              <th className="border border-gray-300 p-3 text-center font-medium">
                Language
              </th>
              <th className="border border-gray-300 p-3 text-center font-medium">
                DL No.
              </th>
              <th className="border border-gray-300 p-3 text-center font-medium">
                Validity
              </th>
              <th className="border border-gray-300 p-3 text-center font-medium">
                Status
              </th>
              <th className="border border-gray-300 p-3 text-center font-medium">
                Booking history
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center p-4">
                  Loading drivers...
                </td>
              </tr>
            ) : filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-4">
                  No drivers found
                </td>
              </tr>
            ) : (
              filteredDrivers.map((driver) => (
                <tr key={driver.id}>
                  <td className="border border-gray-300 p-3 text-center">
                    <button
                      onClick={() => handleDeleteDriver(driver.id)}
                      className="text-red-500"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="#FF0000"/>
                      </svg>
                    </button>
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    {driver.name}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    {driver.phoneNumber}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    {driver.languages.join('/')}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    {driver.dlNumber}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    {driver.validity}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        driver.status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : driver.status === 'Awaited'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {driver.status}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    <button
                      onClick={() => handleShowBookingHistory(driver.id)}
                      className="bg-green-500 text-white rounded-full px-4 py-1"
                    >
                      Show
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Driver Modal */}
      {showAddDriverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-blue-700 p-6 rounded-lg text-white max-w-2xl w-full border-4 border-green-500">
            <div className="text-center mb-6 text-xl font-bold">
              ONLY PROVIDE THOSE DRIVERS THAT YOU KNOW
              <br />
              AND CAN GUARANTEE FOR GOOD SERVICE!
            </div>
            
            <div className="mb-4 flex items-center">
              <label className="mr-4 w-36">DL Number :</label>
              <input
                type="text"
                placeholder="State"
                value={dlState}
                onChange={(e) => setDlState(e.target.value)}
                className="rounded-full py-2 px-4 text-black mr-2"
              />
              <input
                type="text"
                placeholder="rto code"
                value={dlRtoCode}
                onChange={(e) => setDlRtoCode(e.target.value)}
                className="rounded-full py-2 px-4 text-black mr-2"
              />
              <input
                type="text"
                placeholder="issue yr"
                value={dlIssueYear}
                onChange={(e) => setDlIssueYear(e.target.value)}
                className="rounded-full py-2 px-4 text-black mr-2"
              />
              <input
                type="text"
                placeholder="7 digits"
                value={dlNumber}
                onChange={(e) => setDlNumber(e.target.value)}
                className="rounded-full py-2 px-4 text-black"
              />
            </div>
            
            <div className="mb-4 flex items-center">
              <label className="mr-4 w-36">DL Number :</label>
              <input
                type="date"
                placeholder="Select date of birth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="rounded-full py-2 px-4 text-black flex-1 mr-2"
              />
              <button
                className="bg-green-500 text-white rounded-full px-6 py-2"
              >
                Add driver
              </button>
            </div>
            
            <div className="mb-4 flex items-center">
              <label className="mr-4 w-36">Name :</label>
              <input
                type="text"
                placeholder="Auto fetch name"
                disabled
                className="rounded-full py-2 px-4 text-black bg-white flex-1"
              />
            </div>
            
            <div className="mb-4 flex items-center">
              <label className="mr-4 w-36">DL Issue date :</label>
              <input
                type="text"
                placeholder="Auto fetch Issue date"
                disabled
                className="rounded-full py-2 px-4 text-black bg-white flex-1"
              />
            </div>
            
            <div className="mb-4 flex items-center">
              <label className="mr-4 w-36">DL Validity :</label>
              <input
                type="text"
                placeholder="Auto fetch expiry date"
                disabled
                className="rounded-full py-2 px-4 text-black bg-white flex-1"
              />
            </div>
            
            <div className="mb-4 flex items-center">
              <label className="mr-4 w-36">DL Image:</label>
              <button className="bg-green-500 text-white rounded-full py-2 px-4 flex-1">
                Upload Image
              </button>
            </div>
            
            <div className="mb-4 flex items-center">
              <label className="mr-4 w-36">Driver Image</label>
              <button className="bg-green-500 text-white rounded-full py-2 px-4 flex-1">
                Upload Image
              </button>
            </div>
            
            <div className="mb-6 flex items-center">
              <label className="mr-4 w-36">Language Known :</label>
              <button 
                onClick={handleChooseLanguages}
                className="bg-green-500 text-white rounded-full py-2 px-4 flex-1"
              >
                Choose languages
              </button>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleConfirmAddDriver}
                className="bg-green-500 text-white rounded-full py-3 px-12 font-bold"
              >
                Confirm
              </button>
            </div>
            
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagementComponent;