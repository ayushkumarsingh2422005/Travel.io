import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface WalletTransaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  created_at: string;
  balance_after: number;
}

interface WalletStats {
  currentBalance: number;
  lifetimeEarnings: number;
}

const WalletComponent: React.FC = () => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [walletStats, setWalletStats] = useState<WalletStats>({
    currentBalance: 0,
    lifetimeEarnings: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<number>(500);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      // Fetch Profile for Stats
      const profileRes = await api.get('/profile');
      if (profileRes.data.success) {
        setWalletStats({
          currentBalance: profileRes.data.vendor.amount || 0,
          lifetimeEarnings: profileRes.data.vendor.total_earnings || 0
        });
      }

      // Fetch Transaction History
      const historyRes = await api.get('/wallet/history');
      if (historyRes.data.success) {
        setTransactions(historyRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    if (rechargeAmount < 100) {
      toast.error('Minimum recharge amount is ₹100');
      return;
    }

    setProcessing(true);
    try {
      const orderRes = await api.post('/wallet/recharge/create', { amount: rechargeAmount });

      if (orderRes.data.success) {
        const options = {
          key: orderRes.data.key_id,
          amount: orderRes.data.amount,
          currency: orderRes.data.currency,
          name: "Travel.io",
          description: "Vendor Wallet Recharge",
          order_id: orderRes.data.order_id,
          handler: async function (response: any) {
            try {
              const verifyRes = await api.post('/wallet/recharge/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: rechargeAmount
              });

              if (verifyRes.data.success) {
                toast.success('Wallet Recharged Successfully!');
                setShowRechargeModal(false);
                fetchWalletData(); // Refresh data
              } else {
                toast.error('Payment verification failed');
              }
            } catch (error) {
              toast.error('Payment verification error');
            }
          },
          prefill: {
            name: "Vendor",
            email: "vendor@example.com",
            contact: ""
          },
          theme: {
            color: "#6366F1" // Indigo
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error("Recharge Error", error);
      toast.error("Failed to initiate recharge");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full relative">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Wallet Dashboard</h1>

      {/* Wallet Balance and Top-up Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col col-span-2 border border-blue-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-50"></div>
          <span className="text-gray-500 text-sm font-medium mb-2 relative z-10">Current Balance</span>
          <div className="flex items-end justify-between relative z-10">
            {loading ? (
              <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
            ) : (
              <div className="flex flex-col">
                <span className={`text-4xl font-bold ${walletStats.currentBalance < 500 ? 'text-red-500' : 'text-gray-900'}`}>
                  ₹{walletStats.currentBalance.toLocaleString()}
                </span>
                {walletStats.currentBalance < 500 && (
                  <span className="text-sm text-red-500 font-medium mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Low Balance! Min ₹500 required.
                  </span>
                )}
              </div>
            )}
            <button
              onClick={() => setShowRechargeModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-2.5 font-medium text-sm transition-all shadow-md shadow-indigo-200 flex items-center transform hover:-translate-y-0.5"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Add Money
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-50 rounded-full blur-2xl opacity-50"></div>
          <span className="text-gray-500 text-sm font-medium mb-2 relative z-10">Lifetime Earnings</span>
          {loading ? (
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          ) : (
            <span className="text-3xl font-bold text-gray-900 relative z-10">
              ₹{walletStats.lifetimeEarnings.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">Transaction History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Date & Time</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Description</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Type</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Amount</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Balance After</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx}>
                    {Array.from({ length: 5 }).map((_, colIdx) => (
                      <td key={colIdx} className="p-4 border-b border-gray-100">
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                      <p className="font-medium">No transactions found yet</p>
                      <p className="text-sm mt-1">Your wallet activity will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-600 border-b border-gray-100">
                      {new Date(t.created_at).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4 text-sm text-gray-800 border-b border-gray-100 font-medium">
                      {t.description || 'Transaction'}
                    </td>
                    <td className="p-4 text-sm border-b border-gray-100">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {t.type.toUpperCase()}
                      </span>
                    </td>
                    <td className={`p-4 text-sm font-bold border-b border-gray-100 ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'credit' ? '+' : '-'}₹{t.amount}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100 font-mono">
                      ₹{t.balance_after}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-auto transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Money</h3>
              <button onClick={() => setShowRechargeModal(false)} className="text-gray-400 hover:text-gray-500 bg-gray-50 p-1 rounded-full transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-xl">₹</span>
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-2xl font-bold text-gray-800"
                  placeholder="500"
                />
              </div>
              <div className="flex justify-between gap-2 mt-4">
                {[500, 1000, 2000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setRechargeAmount(amt)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${rechargeAmount === amt ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-center text-gray-500 mb-4">
              Secured by Razorpay. Updates balance instantly.
            </p>

            <button
              onClick={handleRecharge}
              disabled={processing || rechargeAmount <= 0}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all
                            ${processing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300 transform hover:-translate-y-0.5'}
                        `}
            >
              {processing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : `Proceed to Pay ₹${rechargeAmount}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletComponent;
