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
      setWalletStats(walletStats);
      try {
        // Replace with your actual API call
        // const response = await fetch('/api/wallet');
        // const data = await response.json();
        // setTransactions(data.transactions);
        // setWalletStats(data.stats);
        
        // Using mock data for demonstration
        setTimeout(() => {
          setTransactions(mockTransactions);
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

  // Mock data for demonstration
  const mockTransactions: Transaction[] = [
    {
      bookingId: 'BK-1001',
      tripType: 'Airport',
      tripItinerary: 'City Center → Airport',
      amountEarned: 350,
      customerReview: '4.8',
      paymentStatus: 'Completed'
    },
    {
      bookingId: 'BK-1002',
      tripType: 'Outstation',
      tripItinerary: 'City → Hill Station',
      amountEarned: 1200,
      penalty: 50,
      customerReview: '4.2',
      paymentStatus: 'Completed'
    },
    {
      bookingId: 'BK-1003',
      tripType: 'Local',
      tripItinerary: 'Home → Shopping Mall',
      amountEarned: 220,
      customerReview: '5.0',
      paymentStatus: 'Pending'
    }
  ];

  const handleTopUp = () => {
    // Implement top-up functionality
    alert('Top-up functionality will be implemented here');
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Wallet Balance and Top-up */}
      <div className="flex mb-6 gap-4">
        <div className="flex-1 bg-green-500 text-white rounded-full py-4 px-8 flex justify-between items-center">
          <span className="text-xl font-medium">Wallet Balance</span>
          <span className="text-xl font-bold">INR. {walletStats.currentBalance}</span>
        </div>
        <button 
          onClick={handleTopUp}
          className="bg-blue-700 text-white rounded-full px-12 py-4 font-medium"
        >
          Top-up
        </button>
      </div>

      {/* Filter and Lifetime Earning */}
      <div className="flex mb-6 gap-4">
        <div className="flex-1">
          <select 
            value={filterType}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded-full px-6 py-3 text-lg appearance-none bg-white"
            style={{ 
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
              backgroundSize: "1.5em"
            }}
          >
            <option>Lifetime earning</option>
            <option>Last month</option>
            <option>Last week</option>
          </select>
        </div>
        <div className="border border-gray-300 rounded-full px-6 py-3 min-w-64 flex items-center justify-center">
          <span className="text-lg font-bold">{walletStats.lifetimeEarnings} INR</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 p-3 text-center font-medium">
                Booking ID
              </th>
              <th className="border border-gray-300 p-3 text-center font-medium">
                Trip type
              </th>
              <th className="border border-gray-300 p-3 text-center font-medium">
                Trip Itinerary
              </th>
              <th className="border border-gray-300 p-3 text-center font-medium">
                Amount Earned
              </th>
              <th className="border border-gray-300 p-3 text-center font-medium">
                Penalty (if any)
              </th>
              <th className="border border-gray-300 p-3 text-center font-medium">
                Customer review
              </th>
              <th className="border border-gray-300 p-3 text-center font-medium">
                Payment status
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center p-4">
                  Loading transactions...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-4">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.bookingId}>
                  <td className="border border-gray-300 p-3 text-center">
                    {transaction.bookingId}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    {transaction.tripType}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    {transaction.tripItinerary}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    ₹{transaction.amountEarned}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    {transaction.penalty ? `₹${transaction.penalty}` : '-'}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    {transaction.customerReview ? `${transaction.customerReview}★` : 'N/A'}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        transaction.paymentStatus === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : transaction.paymentStatus === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
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
  );
};

export default WalletComponent;