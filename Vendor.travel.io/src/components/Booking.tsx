import React, { useState, useEffect } from 'react';

// Define TypeScript interfaces
interface Trip {
  id: number;
  bookingId: string;
  tripType: string;
  carType: string;
  tripItinerary: string;
  startDate: string;
  reportingTime: string;
  pickupAddress: string;
  dropAddress: string;
  mandatoryRequirement: string;
  additionalInfo: string;
  status: string;
}

const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCarType, setSelectedCarType] = useState<string>('');
  
  useEffect(() => {
    // Load dummy data - replace with API call when ready
    setTrips(dummyTrips);
  }, []);

  // Placeholder filter function - replace with actual implementation
  const handleSearch = () => {
    console.log("Searching with filters:", { searchText, selectedCity, selectedCarType });
    // Implement your actual search/filter logic here
  };

  return (
    <>
      {/* Search and Filter Section */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="w-full md:w-auto">
          <select 
            className="bg-green-500 text-black px-6 py-3 rounded-full w-full md:w-60"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="">Select City</option>
            <option value="lucknow">Lucknow</option>
            <option value="varanasi">Varanasi</option>
            <option value="ayodhya">Ayodhya</option>
            <option value="delhi">Delhi</option>
          </select>
        </div>
        
        <div className="w-full md:w-auto">
          <select 
            className="bg-green-500 text-black px-6 py-3 rounded-full w-full md:w-60"
            value={selectedCarType}
            onChange={(e) => setSelectedCarType(e.target.value)}
          >
            <option value="">Select Car type</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="hatchback">Hatchback</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>
        
        <div className="w-full md:w-auto flex-grow">
          <input
            type="text"
            placeholder="Search by booking ID"
            className="border-2 border-black rounded-full p-3 w-full"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-auto">
          <button 
            className="bg-green-500 text-black px-8 py-3 rounded-full font-bold"
            onClick={handleSearch}
          >
            GO
          </button>
        </div>
      </div>

      {/* Trips Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr>
              <th className="border border-black p-2">Booking ID</th>
              <th className="border border-black p-2">Trip type</th>
              <th className="border border-black p-2">Car type</th>
              <th className="border border-black p-2">Trip Itinerary</th>
              <th className="border border-black p-2">Start Date</th>
              <th className="border border-black p-2">Reporting time</th>
              <th className="border border-black p-2">Pickup Address</th>
              <th className="border border-black p-2">Drop Address</th>
              <th className="border border-black p-2">Mandatory requirement</th>
              <th className="border border-black p-2"></th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.id}>
                <td className="border border-black p-2">{trip.bookingId}</td>
                <td className="border border-black p-2">{trip.tripType}</td>
                <td className="border border-black p-2">{trip.carType}</td>
                <td className="border border-black p-2">{trip.tripItinerary}</td>
                <td className="border border-black p-2">{trip.startDate}</td>
                <td className="border border-black p-2">{trip.reportingTime}</td>
                <td className="border border-black p-2">{trip.pickupAddress}</td>
                <td className="border border-black p-2">{trip.dropAddress}</td>
                <td className="border border-black p-2">{trip.mandatoryRequirement}</td>
                <td className="border border-black p-2">
                  {trip.additionalInfo && (
                    <div className="text-xs mb-2">
                      {trip.additionalInfo}
                    </div>
                  )}
                  {trip.status === 'pending' && (
                    <button className="bg-green-500 text-black px-4 py-1 rounded-full">
                      Confirm
                    </button>
                  )}
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
const dummyTrips = [
  {
    id: 1,
    bookingId: "12345",
    tripType: "One Way",
    carType: "Sedan",
    tripItinerary: "Lucknow - Ayodhya - Varanasi\n3 days 750 kms limit",
    startDate: "13/04/24",
    reportingTime: "05:30 AM",
    pickupAddress: "Lucknow Airport",
    dropAddress: "Varanasi Airport",
    mandatoryRequirement: "Luggage Carrier Model 2022 or above",
    additionalInfo: "6750\\- Toll + Parking + Night",
    status: "pending"
  },
  {
    id: 2,
    bookingId: "12346",
    tripType: "Round Trip",
    carType: "SUV",
    tripItinerary: "Delhi - Agra - Delhi\n2 days 500 kms limit",
    startDate: "15/04/24",
    reportingTime: "06:00 AM",
    pickupAddress: "Delhi Hotel Taj",
    dropAddress: "Delhi Hotel Taj",
    mandatoryRequirement: "Child Seat Required",
    additionalInfo: "",
    status: "confirmed"
  },
  {
    id: 3,
    bookingId: "12347",
    tripType: "Local",
    carType: "Hatchback",
    tripItinerary: "Lucknow City Tour\n1 day 100 kms limit",
    startDate: "18/04/24",
    reportingTime: "09:00 AM",
    pickupAddress: "Lucknow Railway Station",
    dropAddress: "Lucknow Railway Station",
    mandatoryRequirement: "None",
    additionalInfo: "2500\\- All inclusive",
    status: "pending"
  },
  {
    id: 4,
    bookingId: "12348",
    tripType: "One Way",
    carType: "Luxury",
    tripItinerary: "Varanasi - Prayagraj\n1 day 200 kms limit",
    startDate: "20/04/24",
    reportingTime: "10:00 AM",
    pickupAddress: "Varanasi BHU Gate",
    dropAddress: "Prayagraj Sangam",
    mandatoryRequirement: "English Speaking Driver",
    additionalInfo: "4500\\- Toll + Parking",
    status: "pending"
  }
];

export default Trips;