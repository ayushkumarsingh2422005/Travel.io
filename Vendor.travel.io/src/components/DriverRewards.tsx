// src/components/DriverRewards.tsx
import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

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
  
  useEffect(() => {
    // Load dummy data - replace with API call when ready
    setDrivers(dummyDrivers);
  }, []);

  return (
    <>
      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search Driver by Name or Number"
          className="w-full md:w-1/2 lg:w-1/3 border-2 border-black rounded-full p-3"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Drivers Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr>
              <th className="border border-black p-2 w-12"></th>
              <th className="border border-black p-2">Driver Name</th>
              <th className="border border-black p-2">Phone No.</th>
              <th className="border border-black p-2">Language</th>
              <th className="border border-black p-2">DL No.</th>
              <th className="border border-black p-2">Validity</th>
              <th className="border border-black p-2">Reward Earned</th>
              <th className="border border-black p-2">Review</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td className="border border-black p-2">
                  <button className="text-red-500">
                    <Trash2 size={24} />
                  </button>
                </td>
                <td className="border border-black p-2">{driver.driverName}</td>
                <td className="border border-black p-2">{driver.phoneNo}</td>
                <td className="border border-black p-2">{driver.language}</td>
                <td className="border border-black p-2">{driver.dlNo}</td>
                <td className="border border-black p-2">{driver.validity}</td>
                <td className="border border-black p-2">{driver.rewardEarned}</td>
                <td className="border border-black p-2">
                  <button className="bg-green-500 text-black px-6 py-1 rounded-full">
                    Show
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
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
  },
  {
    id: 3,
    driverName: "",
    phoneNo: "",
    language: "",
    dlNo: "",
    validity: "",
    rewardEarned: ""
  }
];

export default DriverRewards;