import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getVendorPenaltiesService, submitPenaltyDisputeService } from '../utils/bookingService';

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
  status: string;
  disputeStatus?: string;
  disputeId?: string;
}

// Penalty description badge styling
const penaltyDescriptionClasses = {
  default: "bg-red-50 text-red-700"
};

const Penalties: React.FC = () => {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Dispute Modal state
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [selectedPenaltyId, setSelectedPenaltyId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPenalties();
  }, []);

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
          customerReview: '',
          status: p.status,
          disputeStatus: p.dispute_status,
          disputeId: p.dispute_id
        }));
        setPenalties(mappedPenalties);
      }
    } catch (error: any) {
      console.error('Error fetching penalties:', error);
      setPenalties([]);
      // toast.error(error.message || 'Failed to load penalties.'); // Suppress initial load error if API not ready
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDisputeModal = (penaltyId: string) => {
    setSelectedPenaltyId(penaltyId);
    setDisputeReason('');
    setIsDisputeModalOpen(true);
  };

  const handleSubmitDispute = async () => {
    if (!selectedPenaltyId || !disputeReason.trim()) {
      toast.error('Please provide a reason for the dispute.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitPenaltyDisputeService(selectedPenaltyId, disputeReason);
      if (response.success) {
        toast.success('Dispute submitted successfully!');
        setIsDisputeModalOpen(false);
      } else {
        toast.error(response.message || 'Failed to submit dispute.');
      }
    } catch (error: any) {
      console.error('Error submitting dispute:', error);
      toast.error(error.response?.data?.message || 'Error occurred while submitting dispute.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptPenalty = async (penaltyId: string) => {
    if (!window.confirm('Are you sure you want to accept and pay this penalty? This will deduct the amount from your wallet.')) {
      return;
    }

    setLoading(true);
    try {
      const { acceptPenaltyService } = await import('../utils/bookingService');
      const response = await acceptPenaltyService(penaltyId);
      if (response.success) {
        toast.success('Penalty accepted and paid successfully!');
        fetchPenalties();
      } else {
        toast.error(response.message || 'Failed to accept penalty.');
      }
    } catch (error: any) {
      console.error('Error accepting penalty:', error);
      toast.error(error.response?.data?.message || 'Error occurred while accepting penalty.');
    } finally {
      setLoading(false);
    }
  };

  // Filter penalties based on search term and selected penalty type
  const filteredPenalties = penalties.filter(penalty => {
    const matchesSearch =
      penalty.penaltyDescription.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Calculate total penalty amount
  const totalPenaltyAmount = penalties.reduce((total, penalty) => {
    const amount = parseFloat(penalty.penaltyAmount.replace('₹', ''));
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);

  const getStatusBadge = (penalty: Penalty) => {
    if (penalty.status === 'completed') return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium border border-green-200">Paid</span>;
    if (penalty.status === 'failed') return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium border border-gray-200">Cancelled</span>;

    // If pending, check dispute status
    if (penalty.disputeStatus === 'pending') return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium border border-yellow-200">Disputed</span>;
    if (penalty.disputeStatus === 'rejected') return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium border border-red-200">Dispute Rejected</span>;

    return <span className="bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs font-medium border border-red-200">Pending</span>;
  };

  return (
    <div className="w-full relative">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Penalties & Disputes</h1>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[0, 1].map((idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  {idx === 0 ? 'Total Penalties' : 'Total Outstanding Amount'}
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
              <div className={`p-3 ${idx === 0 ? 'bg-red-50' : 'bg-orange-50'} rounded-lg`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${idx === 0 ? 'text-red-600' : 'text-orange-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {idx === 0 ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
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
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Penalties Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Date</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Penalty Description</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Amount</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Status</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">Actions</th>
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
              ) : filteredPenalties.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <p className="font-medium">No penalties found</p>
                      <p className="text-sm mt-1">Great job! You have no active penalties.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPenalties.map((penalty) => (
                  <tr key={penalty.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      {penalty.penaltyDate}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-100">
                      <span className={`px-2 py-1 ${penaltyDescriptionClasses.default} rounded-md text-xs font-medium`}>
                        {penalty.penaltyDescription}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-900 border-b border-gray-100 font-bold">
                      {penalty.penaltyAmount}
                    </td>
                    <td className="p-4 text-sm border-b border-gray-100">
                      {getStatusBadge(penalty)}
                    </td>
                    <td className="p-4 text-sm border-b border-gray-100">
                      <div className="flex gap-2">
                        {penalty.status === 'pending' && !penalty.disputeStatus && (
                          <>
                            <button
                              onClick={() => handleOpenDisputeModal(penalty.id)}
                              className="px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                            >
                              Dispute
                            </button>
                            <button
                              onClick={() => handleAcceptPenalty(penalty.id)}
                              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                              Pay Now
                            </button>

                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispute Modal */}
      {isDisputeModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-black transform transition-all scale-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Dispute Penalty</h3>
              <button
                onClick={() => setIsDisputeModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 border border-transparent hover:bg-gray-100 rounded-full p-1 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-800">
              Please explain why you are disputing this penalty. Our team will review your request and get back to you within 24-48 hours.
            </p>

            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none h-32 resize-none mb-6 transition-all"
              placeholder="Enter your detailed reason for dispute..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setIsDisputeModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDispute}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 shadow-md shadow-indigo-200"
                disabled={isSubmitting || !disputeReason.trim()}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Penalties;
