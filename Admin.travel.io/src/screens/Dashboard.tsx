import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboardData, getAllPayments } from '../api/adminService'; // Import the API service

interface SummaryCard {
  title: string;
  value: number;
  change?: number; // Change is optional as it might not always be available from backend
  icon: string;
  path: string;
}

interface DashboardData {
  total_revenue: number;
  admin_commission: number;
  total_vendor_payments: number;
  total_partner_payments: number;
  pending_vendor_payments: number;
  pending_partner_payments: number;
  remaining_amount_to_pay: number;
  total_bookings: number;
  completed_bookings: number;
  active_vendors: number;
  active_partners: number;
}

// Keeping RecentActivity for now, as there's no direct backend equivalent in adminController.js
interface RecentActivity {
  id: string;
  type: 'booking' | 'user' | 'vendor' | 'payment';
  description: string;
  time: string;
  status: 'success' | 'pending' | 'failed';
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // TODO: Replace with actual token from authentication context
        const token = localStorage.getItem('marcocabs_admin_token'); 
        if(!token){
          throw new Error('No authentication token found');
        }
        const data: DashboardData = await getAdminDashboardData(token);

        setSummaryCards([
          {
            title: 'Total Revenue',
            value: data.total_revenue,
            icon: '💰',
            path: '/payments'
          },
          {
            title: 'Admin Commission',
            value: data.admin_commission,
            icon: '💼',
            path: '/payments'
          },
          {
            title: 'Total Bookings',
            value: data.total_bookings,
            icon: '📅',
            path: '/bookings'
          },
          {
            title: 'Completed Bookings',
            value: data.completed_bookings,
            icon: '✅',
            path: '/bookings'
          },
          {
            title: 'Active Vendors',
            value: data.active_vendors,
            icon: '🏢',
            path: '/vendors'
          },
          {
            title: 'Active Partners',
            value: data.active_partners,
            icon: '🤝',
            path: '/partners'
          },
          {
            title: 'Pending Vendor Payments',
            value: data.pending_vendor_payments,
            icon: '💸',
            path: '/payments/pending-vendor'
          },
          {
            title: 'Pending Partner Payments',
            value: data.pending_partner_payments,
            icon: '💳',
            path: '/payments/pending-partner'
          },
          {
            title: 'Remaining Amount to Pay',
            value: data.remaining_amount_to_pay,
            icon: '💲',
            path: '/payments'
          },
        ]);

        // Fetch recent payments for activity feed
        const paymentsData = await getAllPayments(token, 1, 5); // Get latest 5 payments
        const mappedRecentActivity: RecentActivity[] = paymentsData.payments.map((payment: any) => ({
          id: payment.id,
          type: payment.vendor_id ? 'payment' : 'payment', // Could be more specific if booking info is available
          description: payment.vendor_name 
            ? `Payment to vendor ${payment.vendor_name} for ₹${payment.amount.toLocaleString()}`
            : payment.partner_name
            ? `Payment to partner ${payment.partner_name} for ₹${payment.amount.toLocaleString()}`
            : `Payment of ₹${payment.amount.toLocaleString()}`,
          time: new Date(payment.created_at).toLocaleString(), // Format date nicely
          status: payment.status === 'completed' ? 'success' : 'pending', // Assuming 'completed' is success
        }));
        setRecentActivity(mappedRecentActivity);

      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
          {[...Array(9)].map((_, i) => ( // Adjusted to 9 cards
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6"> {/* Adjusted grid layout */}
        {summaryCards.map((card, index) => (
          <Link
            key={index}
            to={card.path}
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{card.icon}</span>
              {card.change !== undefined && ( // Only show change if available
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
