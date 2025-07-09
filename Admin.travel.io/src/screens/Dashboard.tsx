import  { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface SummaryCard {
  title: string;
  value: number;
  change: number;
  icon: string;
  path: string;
}

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

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSummaryCards([
        {
          title: 'Total Users',
          value: 15423,
          change: 12.5,
          icon: '👥',
          path: '/users'
        },
        {
          title: 'Active Bookings',
          value: 284,
          change: 8.2,
          icon: '📅',
          path: '/bookings'
        },
        {
          title: 'Total Revenue',
          value: 842560,
          change: 15.8,
          icon: '💰',
          path: '/payments'
        },
        {
          title: 'Active Vendors',
          value: 126,
          change: 4.3,
          icon: '🏢',
          path: '/vendors'
        }
      ]);

      setRecentActivity([
        {
          id: '1',
          type: 'booking',
          description: 'New booking from John Doe',
          time: '5 minutes ago',
          status: 'success'
        },
        {
          id: '2',
          type: 'payment',
          description: 'Payment received for booking #12345',
          time: '10 minutes ago',
          status: 'success'
        },
        {
          id: '3',
          type: 'vendor',
          description: 'New vendor registration: ABC Cabs',
          time: '15 minutes ago',
          status: 'pending'
        },
        {
          id: '4',
          type: 'user',
          description: 'New user registration: Jane Smith',
          time: '20 minutes ago',
          status: 'success'
        },
        {
          id: '5',
          type: 'booking',
          description: 'Booking #12344 cancelled',
          time: '25 minutes ago',
          status: 'failed'
        }
      ]);

      setLoading(false);
    }, 1000);
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
          {[...Array(4)].map((_, i) => (
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

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {summaryCards.map((card, index) => (
          <Link
            key={index}
            to={card.path}
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{card.icon}</span>
              <span className={`text-sm font-medium ${
                card.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {card.change >= 0 ? '+' : ''}{card.change}%
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {card.title.includes('Revenue') ? '₹' : ''}{card.value.toLocaleString()}
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