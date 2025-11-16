import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal'; // Import Modal component
import { getAdminStats, getWebsiteReachStats, applyVendorPenalty } from '../api/adminService'; // Import the new API services

interface SummaryCard {
  title: string;
  value: number;
  change?: number;
  icon: string;
  path: string;
}

interface OverallStats {
  total_users: number;
  total_vendors: number;
  active_vendors: number;
  suspended_vendors: number;
  total_drivers: number;
  active_drivers: number;
  total_partners: number;
  total_vehicles: number;
  active_vehicles: number;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  admin_commission: number;
}

interface RecentActivityItem {
  new_users: number;
  new_vendors: number;
  new_bookings: number;
  completed_bookings: number;
  revenue_7_days: number;
}

interface TopVendor {
  id: string;
  name: string;
  email: string;
  star_rating: number;
  total_bookings: number;
  completed_bookings: number;
  total_earnings: number;
}

interface AdminStatsData {
  overall: OverallStats;
  recent_activity: RecentActivityItem;
  top_vendors: TopVendor[];
}

interface WebsiteReachData {
  period: string;
  total_users: number;
  new_users_in_period: number;
  verified_users: {
    total: number;
    phone_verified: number;
    profile_completed: number;
  };
  vendors: {
    total: number;
    active_vendors: number;
    suspended_vendors: number;
    new_this_month: number;
  };
  drivers: {
    total: number;
    active_drivers: number;
    new_this_month: number;
  };
  partners: {
    total: number;
    verified_partners: number;
  };
  leads: {
    unique_leads: number;
    total_leads: number;
  };
  user_growth: Array<{
    month: string;
    month_name: string;
    new_users: number;
  }>;
}

interface MappedRecentActivityItem {
  id: string;
  type: 'user' | 'vendor' | 'booking' | 'payment';
  description: string;
  time: string;
  status: string;
  vendorData?: TopVendor; // Optional vendor data for penalty modal
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>([]);
  const [recentActivity, setRecentActivity] = useState<MappedRecentActivityItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // State for modals
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);
  const [selectedVendorForPenalty, setSelectedVendorForPenalty] = useState<TopVendor | null>(null);
  const [penaltyDetails, setPenaltyDetails] = useState({ amount: '', reason: '' });

  const token = localStorage.getItem('marcocabs_admin_token');

  const handleOpenPenaltyModal = (vendor: TopVendor) => {
    setSelectedVendorForPenalty(vendor);
    setIsPenaltyModalOpen(true);
    setPenaltyDetails({ amount: '', reason: '' });
  };

  const handleClosePenaltyModal = () => {
    setIsPenaltyModalOpen(false);
    setSelectedVendorForPenalty(null);
    setPenaltyDetails({ amount: '', reason: '' });
  };

  const handlePenaltyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPenaltyDetails((prev) => ({ ...prev, [name]: value }));
  };

  const fetchDashboardData = useCallback(async () => {
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const adminStats: AdminStatsData = await getAdminStats(token);
      const websiteReach: WebsiteReachData = await getWebsiteReachStats(token, 'month'); // Fetch monthly reach stats

      const { overall, recent_activity, top_vendors } = adminStats;

      setSummaryCards([
        {
          title: 'Total Revenue',
          value: overall.total_revenue,
          icon: '💰',
          path: '/payments',
        },
        {
          title: 'Admin Commission',
          value: overall.admin_commission,
          icon: '💼',
          path: '/payments',
        },
        {
          title: 'Total Bookings',
          value: overall.total_bookings,
          icon: '📅',
          path: '/bookings',
        },
        {
          title: 'Completed Bookings',
          value: overall.completed_bookings,
          icon: '✅',
          path: '/bookings',
        },
        {
          title: 'Active Vendors',
          value: overall.active_vendors,
          icon: '🏢',
          path: '/vendors',
        },
        {
          title: 'Active Drivers',
          value: overall.active_drivers,
          icon: '🤝',
          path: '/drivers',
        },
        {
          title: 'Total Users',
          value: overall.total_users,
          icon: '👤',
          path: '/users',
        },
        {
          title: 'New Users (This Month)',
          value: websiteReach.new_users_in_period,
          icon: '📈',
          path: '/users',
        },
        {
          title: 'Revenue (Last 7 Days)',
          value: recent_activity.revenue_7_days,
          icon: '💸',
          path: '/payments',
        },
      ]);

      // Map recent activity from adminStats.recent_activity
      const mappedRecentActivity: MappedRecentActivityItem[] = [
        {
          id: 'new_users',
          type: 'user',
          description: `${recent_activity.new_users} new users registered`,
          time: 'Last 7 days',
          status: 'success',
        },
        {
          id: 'new_vendors',
          type: 'vendor',
          description: `${recent_activity.new_vendors} new vendors joined`,
          time: 'Last 7 days',
          status: 'success',
        },
        {
          id: 'new_bookings',
          type: 'booking',
          description: `${recent_activity.new_bookings} new bookings created`,
          time: 'Last 7 days',
          status: 'success',
        },
        {
          id: 'completed_bookings',
          type: 'booking',
          description: `${recent_activity.completed_bookings} bookings completed`,
          time: 'Last 7 days',
          status: 'success',
        },
        // Add top vendors as recent activity for now, or create a separate section
        ...top_vendors.slice(0, 3).map((vendor) => ({
          id: vendor.id,
          type: 'vendor' as const, // Explicitly cast to literal type
          description: `Top Vendor: ${vendor.name} (${vendor.total_bookings} bookings, ₹${vendor.total_earnings.toLocaleString()})`,
          time: 'Overall',
          status: 'success',
          vendorData: vendor, // Pass vendor data for penalty modal
        })),
      ];
      setRecentActivity(mappedRecentActivity);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]); // Add token to useCallback dependencies

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleConfirmApplyPenalty = async () => {
    if (!token || !selectedVendorForPenalty) {
      setError('No authentication token found or vendor not selected');
      return;
    }
    const penaltyAmount = parseFloat(penaltyDetails.amount);
    const penaltyReason = penaltyDetails.reason.trim();

    if (penaltyAmount > 0 && penaltyReason) {
      setLoading(true); // Use dashboard's loading state
      try {
        await applyVendorPenalty(token, selectedVendorForPenalty.id, penaltyAmount, penaltyReason);
        alert('Penalty applied successfully!');
        fetchDashboardData(); // Call the function to refresh data
        handleClosePenaltyModal();
      } catch (err: any) {
        setError(err.message || 'Failed to apply penalty');
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      alert('Penalty amount must be greater than 0 and reason is required.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 p-4 bg-red-100 rounded-lg">Error: {error}</div>;
  }

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        {summaryCards.map((card, index) => (
          <Link
            key={index}
            to={card.path}
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{card.icon}</span>
              {card.change !== undefined && (
                <span className={`text-sm font-medium ${
                  card.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.change >= 0 ? '+' : ''}{card.change}%
                </span>
              )}
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {card.title.includes('Revenue') || card.title.includes('Amount') || card.title.includes('Payments') ? '₹' : ''}{card.value.toLocaleString()}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-6">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-lg">
                {activity.type === 'booking' ? '📅' :
                 activity.type === 'payment' ? '💳' :
                 activity.type === 'vendor' ? '🏢' : '👤'}
              </span>
              <div className="ml-4 flex-1">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500">{activity.time}</span>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </span>
                  {activity.type === 'vendor' && activity.vendorData && (
                    <button
                      className="ml-2 p-1.5 text-yellow-600 hover:text-white hover:bg-yellow-600 rounded-lg transition-colors duration-200"
                      onClick={() => handleOpenPenaltyModal(activity.vendorData as TopVendor)}
                      title="Apply Penalty"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Penalty Modal (for Dashboard) */}
      <Modal isOpen={isPenaltyModalOpen} onClose={handleClosePenaltyModal} title="Apply Penalty" size="md">
        {selectedVendorForPenalty && (
          <div className="space-y-4">
            <div>
              <label htmlFor="penaltyAmount" className="block text-sm font-medium text-gray-700">
                Penalty Amount (₹)
              </label>
              <input
                type="number"
                id="penaltyAmount"
                name="amount"
                value={penaltyDetails.amount}
                onChange={handlePenaltyInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="e.g., 500"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="penaltyReason" className="block text-sm font-medium text-gray-700">
                Reason for Penalty
              </label>
              <textarea
                id="penaltyReason"
                name="reason"
                value={penaltyDetails.reason}
                onChange={handlePenaltyInputChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="e.g., Violation of terms, late delivery"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                onClick={handleClosePenaltyModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                onClick={handleConfirmApplyPenalty}
              >
                Apply Penalty
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
