// src/components/DriverRewards.tsx
import React, { useState, useEffect } from 'react';

// Define TypeScript interfaces
interface Driver {
  id: number;
  driverName: string;
  phoneNo: string;
  language: string;
  dlNo: string;
  validity: string;
  rewardEarned: string;
}

const DriverRewards: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Simulate API call to fetch driver rewards
    const fetchDrivers = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        // const response = await fetch('/api/driver-rewards');
        // const data = await response.json();
        // setDrivers(data);
        
        // Using mock data for demonstration
        setTimeout(() => {
          setDrivers(dummyDrivers);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching driver rewards:', error);
        setDrivers([]);
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const filteredDrivers = drivers.filter(driver => 
    driver.driverName.toLowerCase().includes(searchText.toLowerCase()) ||
    driver.dlNo.toLowerCase().includes(searchText.toLowerCase()) ||
    driver.phoneNo.toLowerCase().includes(searchText.toLowerCase())
  );

  // Calculate total rewards earned by all drivers
  const totalRewardsEarned = drivers.reduce((total, driver) => {
    const amount = parseFloat(driver.rewardEarned?.split(' ')[0] || '0');
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);

  const handleDeleteDriver = (id: number) => {
    setDrivers(prevDrivers => prevDrivers.filter(driver => driver.id !== id));
  };

  const handleShowReviews = (id: number) => {
    // Implement show reviews functionality
    alert(`Show reviews for driver ${id}`);
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
                  {idx === 0 ? 'Total Drivers' : idx === 1 ? 'Total Rewards' : 'Average Reward'}
                </p>
                {loading ? (
                  <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {idx === 0
                      ? drivers.length
                      : idx === 1
                      ? totalRewardsEarned + ' INR'
                      : drivers.length > 0 ? (totalRewardsEarned / drivers.length).toFixed(0) + ' INR' : 0}
                  </p>
                )}
              </div>
              <div className={`p-3 ${idx === 0 ? 'bg-blue-100' : idx === 1 ? 'bg-yellow-100' : 'bg-green-100'} rounded-lg`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${idx === 0 ? 'text-blue-700' : idx === 1 ? 'text-yellow-700' : 'text-green-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {/* ...icon paths... */}
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Actions */}
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
              placeholder="Search by driver name, phone or DL number"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500">
              <option value="">Sort By: Rewards (High to Low)</option>
              <option value="rewards_low">Sort By: Rewards (Low to High)</option>
              <option value="name_asc">Sort By: Name (A to Z)</option>
              <option value="name_desc">Sort By: Name (Z to A)</option>
            </select>
            <button className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data
            </button>
          </div>
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
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Language</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">DL No.</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Validity</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Reward Earned</th>
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
                    No drivers found with the specified search criteria.
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
                      <div className="font-medium">{driver.driverName || "—"}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      {driver.phoneNo || "—"}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      {driver.language ? (
                        <div className="flex flex-wrap gap-1">
                          {driver.language.split('/').map((lang, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                              {lang.trim()}
                            </span>
                          ))}
                        </div>
                      ) : "—"}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100 font-mono">
                      {driver.dlNo || "—"}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      {driver.validity || "—"}
                    </td>
                    <td className="p-4 text-sm border-b border-gray-100">
                      {driver.rewardEarned ? (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          {driver.rewardEarned}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="p-4 text-sm border-b border-gray-100">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShowReviews(driver.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                        >
                          Reviews
                        </button>
                        <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors">
                          Add Reward
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
    </div>
  );
};

// Dummy data in JSON format
const dummyDrivers = [
  {
    id: 1,
    driverName: "Akash Rai",
    phoneNo: "xx xxxx xxxx",
    language: "Hindi/English",
    dlNo: "UP522024(7)",
    validity: "06/09/2047",
    rewardEarned: "200 INR"
  },
  {
    id: 2,
    driverName: "Akash Rai",
    phoneNo: "xx xxxx xxxx",
    language: "Hindi/English",
    dlNo: "UP522024(7)",
    validity: "06/09/2047",
    rewardEarned: "200 INR"
  }
];

export default DriverRewards;