import React, { useState, useEffect } from 'react';

interface Transaction {
  bookingId: string;
  tripType: string;
  tripItinerary: string;
  amountEarned: number;
  penalty?: number;
  customerReview?: string;
  paymentStatus: string;
}

interface WalletStats {
  currentBalance: number;
  lifetimeEarnings: number;
}

// Trip type classification data
const tripTypeClasses = [
  { type: "airport", class: "bg-blue-100 text-blue-700" },
  { type: "outstation", class: "bg-purple-100 text-purple-700" },
  { type: "local", class: "bg-yellow-100 text-yellow-700" },
  { type: "default", class: "bg-gray-100 text-gray-700" }
];

// Payment status classification data
const paymentStatusClasses = [
  { status: "completed", class: "bg-green-100 text-green-800" },
  { status: "pending", class: "bg-yellow-100 text-yellow-800" },
  { status: "failed", class: "bg-red-100 text-red-800" },
  { status: "default", class: "bg-gray-100 text-gray-700" }
];

// Filter options data
const filterOptions = [
  { id: 1, name: "Lifetime earning", value: "lifetime" },
  { id: 2, name: "Last month", value: "month" },
  { id: 3, name: "Last week", value: "week" }
];

const WalletComponent: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletStats, setWalletStats] = useState<WalletStats>({
    currentBalance: 2000,
    lifetimeEarnings: 36000
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('Lifetime earning');

  useEffect(() => {
    // Simulate API call to fetch wallet data
    const fetchWalletData = async () => {
      setLoading(true);
      try {
        // Replace with your actual API call
        // const response = await fetch('/api/wallet');
        // const data = await response.json();
        // setTransactions(data.transactions);
        // setWalletStats(data.stats);
        
        // Using mock data for demonstration
        setTimeout(() => {
          setTransactions(mockTransactions);
          setWalletStats(mockWalletStatsData);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        setTransactions([]);
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [filterType]);

  const handleTopUp = () => {
    // Implement top-up functionality
    alert('Top-up functionality will be implemented here');
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
  };

  const getTripTypeClass = (type: string) => {
    const found = tripTypeClasses.find(item => item.type.toLowerCase() === type.toLowerCase());
    return found ? found.class : tripTypeClasses.find(item => item.type === "default")?.class;
  };

  const getPaymentStatusClass = (status: string) => {
    const found = paymentStatusClasses.find(item => item.status.toLowerCase() === status.toLowerCase());
    return found ? found.class : paymentStatusClasses.find(item => item.status === "default")?.class;
  };

  return (
    <div className="w-full">
      {/* Wallet Balance and Top-up Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col col-span-2">
          <span className="text-gray-500 text-sm font-medium mb-2">Current Balance</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-800">
              {loading ? "-" : `₹${walletStats.currentBalance.toLocaleString()}`}
            </span>
            <button 
              onClick={handleTopUp}
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-2 font-medium text-sm transition-colors flex items-center"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Top-up
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col">
          <span className="text-gray-500 text-sm font-medium mb-2">Lifetime Earnings</span>
          <span className="text-3xl font-bold text-gray-800">
            {loading ? "-" : `₹${walletStats.lifetimeEarnings.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Transaction History</h2>
          <select 
            value={filterType}
            onChange={handleFilterChange}
            className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg px-4 py-2 text-gray-700 bg-white transition-all"
            disabled={loading}
          >
            {filterOptions.map(option => (
              <option key={option.id} value={option.name}>{option.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Booking ID</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Trip Type</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Trip Itinerary</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Amount Earned</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Penalty</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Review</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    <div className="flex justify-center items-center py-8">
                      <svg className="animate-spin h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.bookingId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">{transaction.bookingId}</td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTripTypeClass(transaction.tripType)}`}>
                        {transaction.tripType}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">{transaction.tripItinerary}</td>
                    <td className="p-4 text-sm font-medium text-gray-900 border-b border-gray-100">₹{transaction.amountEarned}</td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      {transaction.penalty ? (
                        <span className="text-red-600 font-medium">₹{transaction.penalty}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      {transaction.customerReview ? (
                        <div className="flex items-center">
                          <span className="text-amber-500 mr-1">★</span>
                          <span>{transaction.customerReview}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-sm border-b border-gray-100">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusClass(transaction.paymentStatus)}`}>
                        {transaction.paymentStatus}
                      </span>
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

// JSON formatted mock transaction data - ready for API replacement
const mockTransactions = [
  {
    id: 1,
    bookingId: 'BK-1001',
    tripType: 'Airport',
    tripItinerary: 'City Center → Airport',
    amountEarned: 350,
    customerReview: '4.8',
    paymentStatus: 'Completed'
  },
  {
    id: 2,
    bookingId: 'BK-1002',
    tripType: 'Outstation',
    tripItinerary: 'City → Hill Station',
    amountEarned: 1200,
    penalty: 50,
    customerReview: '4.2',
    paymentStatus: 'Completed'
  },
  {
    id: 3,
    bookingId: 'BK-1003',
    tripType: 'Local',
    tripItinerary: 'Home → Shopping Mall',
    amountEarned: 220,
    customerReview: '5.0',
    paymentStatus: 'Pending'
  }
];

// Mock wallet stats data that can be replaced with API data
const mockWalletStatsData = {
  currentBalance: 2000,
  lifetimeEarnings: 36000
};

export default WalletComponent;