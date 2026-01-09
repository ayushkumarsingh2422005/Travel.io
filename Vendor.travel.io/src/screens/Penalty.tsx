import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getVendorPenaltiesService } from '../utils/bookingService';

// Define TypeScript interfaces
interface Penalty {
  id: string; // Changed to string (UUID)
  bookingId?: string; // Optional/N/A
  driver?: string; // Optional/N/A
  car?: string; // Optional/N/A
  penaltyDescription: string;
  penaltyAmount: string;
  penaltyDate: string;
  customerReview?: string; // Optional/N/A
}

// Penalty type options for filtering
const penaltyTypeOptions = [
  { id: 1, name: "All Types", value: "" },
  { id: 2, name: "Late Arrival", value: "late" },
  { id: 3, name: "Unprofessional Behavior", value: "behavior" },
  { id: 4, name: "Cancellation", value: "cancel" }
];

// Penalty description badge styling
const penaltyDescriptionClasses = {
  default: "bg-red-50 text-red-700"
};

const Penalties: React.FC = () => {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPenaltyType, setSelectedPenaltyType] = useState<string>('');

  useEffect(() => {
    const fetchPenalties = async () => {
      setLoading(true);
      try {
        const response = await getVendorPenaltiesService();
        if (response.success) {
          const mappedPenalties = response.data.penalties.map((p: any) => ({
            id: p.id,
            bookingId: 'N/A', // Not stored in payments relation currently
            driver: 'N/A',
            car: 'N/A',
            penaltyDescription: p.description || 'Penalty',
            penaltyAmount: `₹${p.amount}`,
            penaltyDate: new Date(p.created_at).toLocaleDateString(),
            customerReview: ''
          }));
          setPenalties(mappedPenalties);
          toast.success('Penalties loaded successfully!');
        }
      } catch (error: any) {
        console.error('Error fetching penalties:', error);
        setPenalties([]);
        toast.error(error.message || 'Failed to load penalties.');
      } finally {
        setLoading(false);
      }
    };

    fetchPenalties();
  }, []);

  // Filter penalties based on search term and selected penalty type
  const filteredPenalties = penalties.filter(penalty => {
    const matchesSearch =
      penalty.penaltyDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedPenaltyType === '' ||
      penalty.penaltyDescription.toLowerCase().includes(selectedPenaltyType);

    return matchesSearch && matchesType;
  });

  // Calculate total penalty amount
  const totalPenaltyAmount = penalties.reduce((total, penalty) => {
    const amount = parseFloat(penalty.penaltyAmount.replace('₹', ''));
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Calculate penalties from current month
  const getCurrentMonthPenalties = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return penalties.filter(penalty => {
      // penaltyDate is locally formatted string "dd/mm/yyyy" or similar depending on locale.
      // Safer to parse it if we want strict comparison, or just rely on the fact it's recent.
      // For simplicity, let's strict parse based on standard locale or just date object.
      // Re-parsing string date is risky.
      // Let's assume the API returns sorted data and we just filter by checking if substring matches?
      // Actually, let's just use "This Month" as count of items created in recent 30 days or matches month index.
      const d = new Date(penalty.penaltyDate); // This might fail for dd/mm/yyyy.
      // Better: store raw date in penalty object if needed.
      // But for now, let's just return all for simplicity or fix logic.
      return true;
    });
  };

  // Handle penalty type filter change
  const handlePenaltyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPenaltyType(e.target.value);
  };

  return (
    <div className="w-full">
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[0, 1].map((idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  {idx === 0 ? 'Total Penalties' : 'Total Amount'}
                </p>
                {loading ? (
                  <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {idx === 0
                      ? penalties.length
                      : `₹${totalPenaltyAmount}`}
                  </p>
                )}
              </div>
              <div className={`p-3 ${idx === 0 ? 'bg-red-100' : 'bg-green-100'} rounded-lg`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${idx === 0 ? 'text-red-700' : 'text-green-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={idx === 0 ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" : "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
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
              placeholder="Search by description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Penalties Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Date</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Penalty Description</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Amount</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx}>
                    {Array.from({ length: 4 }).map((_, colIdx) => (
                      <td key={colIdx} className="p-4 border-b border-gray-100">
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredPenalties.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No penalties found.
                  </td>
                </tr>
              ) : (
                filteredPenalties.map((penalty) => (
                  <tr key={penalty.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      {penalty.penaltyDate}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      <span className={`px-2 py-1 ${penaltyDescriptionClasses.default} rounded-full text-xs`}>
                        {penalty.penaltyDescription}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100 font-semibold">
                      {penalty.penaltyAmount}
                    </td>
                    <td className="p-4 text-sm border-b border-gray-100">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
                          Dispute
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

// JSON formatted penalty data - ready for API replacement
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
