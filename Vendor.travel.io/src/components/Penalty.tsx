import React, { useState, useEffect } from 'react';

// Define TypeScript interfaces
interface Penalty {
  id: number;
  bookingId: string;
  driver: string;
  car: string;
  penaltyDescription: string;
  penaltyAmount: string;
  penaltyDate: string;
  customerReview: string;
}

const Penalties: React.FC = () => {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  
  useEffect(() => {
    // Load dummy data - replace with API call when ready
    setPenalties(dummyPenalties);
  }, []);

  return (
    <>
      {/* Title */}
      <div className="mb-6">
        <div className="bg-green-500 text-white text-xl font-bold py-4 px-8 rounded-full inline-block">
          Penalties
        </div>
      </div>

      {/* Penalties Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr>
              <th className="border border-black p-2">Booking ID</th>
              <th className="border border-black p-2">Driver</th>
              <th className="border border-black p-2">Car</th>
              <th className="border border-black p-2">Penalty Description</th>
              <th className="border border-black p-2">Penalty amount</th>
              <th className="border border-black p-2">Penalty Date</th>
              <th className="border border-black p-2">Customer review</th>
            </tr>
          </thead>
          <tbody>
            {penalties.map((penalty) => (
              <tr key={penalty.id}>
                <td className="border border-black p-2">{penalty.bookingId}</td>
                <td className="border border-black p-2">{penalty.driver}</td>
                <td className="border border-black p-2">{penalty.car}</td>
                <td className="border border-black p-2">{penalty.penaltyDescription}</td>
                <td className="border border-black p-2">{penalty.penaltyAmount}</td>
                <td className="border border-black p-2">{penalty.penaltyDate}</td>
                <td className="border border-black p-2">{penalty.customerReview}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// Dummy data in JSON format
const dummyPenalties = [
  {
    id: 1,
    bookingId: "B001",
    driver: "Rahul Singh",
    car: "Swift Dzire",
    penaltyDescription: "Late arrival",
    penaltyAmount: "₹200",
    penaltyDate: "12/03/2025",
    customerReview: "Driver was 30 minutes late"
  },
  {
    id: 2,
    bookingId: "B002",
    driver: "Amit Kumar",
    car: "Ertiga",
    penaltyDescription: "Unprofessional behavior",
    penaltyAmount: "₹500",
    penaltyDate: "15/03/2025",
    customerReview: "Rude to passengers"
  },
  {
    id: 3,
    bookingId: "B003",
    driver: "Priya Sharma",
    car: "WagonR",
    penaltyDescription: "Unclean vehicle",
    penaltyAmount: "₹300",
    penaltyDate: "18/03/2025",
    customerReview: "Car interior was dirty"
  },
  {
    id: 4,
    bookingId: "B004",
    driver: "Vikram Patel",
    car: "Honda City",
    penaltyDescription: "Cancellation",
    penaltyAmount: "₹400",
    penaltyDate: "20/03/2025",
    customerReview: "Last minute cancellation"
  }
];

export default Penalties;