import React, { useEffect, useState, useCallback } from 'react';
import Table from '../components/Table';
import { useSearch } from '../context/SearchContext';
import { toast } from 'react-toastify';
import { getAllPayments, getPendingVendorPayments, getPendingPartnerPayments, payVendor, payPartner, getFinancialAnalytics } from '../api/adminService';

interface Payment {
  id: string;
  vendor_id: string | null;
  partner_id: string | null;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  type: 'withdrawal' | 'deposit';
  created_at: string;
  vendor_name: string | null;
  partner_name: string | null;
  booking_id?: string; // For pending vendor payments
  transaction_id?: string; // For pending partner payments
}

interface FinancialAnalyticsData {
  total_revenue: number;
  admin_commission: number;
  vendor_earnings: number;
  partner_commissions: number;
}

const getStatusClasses = (status: Payment['status']) => {
  const base = 'px-2 py-1 text-xs font-medium rounded-full';
  return {
    completed: `${base} bg-green-100 text-green-800`,
    pending: `${base} bg-yellow-100 text-yellow-800`,
    failed: `${base} bg-red-100 text-red-800`
  }[status];
};

const getTypeClasses = (type: Payment['type']) => {
  const base = 'px-2 py-1 text-xs font-medium rounded-full';
  return type === 'withdrawal'
    ? `${base} bg-blue-100 text-blue-800`
    : `${base} bg-purple-100 text-purple-800`;
};

const Payments: React.FC = () => {
  const { query } = useSearch();

  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [pendingVendorPayments, setPendingVendorPayments] = useState<Payment[]>([]);
  const [pendingPartnerPayments, setPendingPartnerPayments] = useState<Payment[]>([]);
  const [financialAnalytics, setFinancialAnalytics] = useState<FinancialAnalyticsData | null>(null);

  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending-vendor' | 'pending-partner'>('all');

  const token = localStorage.getItem('marcocabs_admin_token');

  const fetchData = useCallback(async () => {
    if (!token) {
      toast.error('No authentication token found');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [allPaymentsRes, pendingVendorRes, pendingPartnerRes, financialAnalyticsRes] = await Promise.all([
        getAllPayments(token),
        getPendingVendorPayments(token),
        getPendingPartnerPayments(token),
        getFinancialAnalytics(token),
      ]);

      setAllPayments(allPaymentsRes.payments);
      setPendingVendorPayments(pendingVendorRes.payments);
      setPendingPartnerPayments(pendingPartnerRes.payments);
      setFinancialAnalytics(financialAnalyticsRes.revenue_breakdown);

    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch payments data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const lower = query.toLowerCase();
    let currentData: Payment[] = [];

    if (activeTab === 'all') {
      currentData = allPayments;
    } else if (activeTab === 'pending-vendor') {
      currentData = pendingVendorPayments;
    } else if (activeTab === 'pending-partner') {
      currentData = pendingPartnerPayments;
    }

    setFilteredPayments(
      currentData.filter(
        (p) =>
          p.vendor_name?.toLowerCase().includes(lower) ||
          p.partner_name?.toLowerCase().includes(lower) ||
          p.id.toLowerCase().includes(lower) ||
          p.status.toLowerCase().includes(lower) ||
          p.type.toLowerCase().includes(lower) ||
          p.amount.toString().includes(lower)
      )
    );
  }, [query, allPayments, pendingVendorPayments, pendingPartnerPayments, activeTab]);

  const handlePayVendor = async (booking_id: string, vendor_id: string, amount: number) => {
    if (!token) {
      toast.error('No authentication token found');
      return;
    }
    try {
      await payVendor(token, booking_id, vendor_id, amount);
      toast.success('Vendor paid successfully!');
      fetchData(); // Refresh data
    } catch (err: any) {
      toast.error(err.message || 'Failed to pay vendor');
      console.error(err);
    }
  };

  const handlePayPartner = async (transaction_id: string, partner_id: string, amount: number) => {
    if (!token) {
      toast.error('No authentication token found');
      return;
    }
    try {
      await payPartner(token, transaction_id, partner_id, amount);
      toast.success('Partner paid successfully!');
      fetchData(); // Refresh data
    } catch (err: any) {
      toast.error(err.message || 'Failed to pay partner');
      console.error(err);
    }
  };

  const allPaymentsColumns = [
    {
      id: 'id',
      label: 'Payment ID',
      minWidth: 170,
      format: (value: string) => value.substring(0, 8)
    },
    {
      id: 'type',
      label: 'Type',
      minWidth: 120,
      format: (value: Payment['type']) => (
        <span className={getTypeClasses(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: Payment['status']) => (
        <span className={getStatusClasses(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      id: 'amount',
      label: 'Amount',
      minWidth: 120,
      format: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      id: 'vendor_name',
      label: 'Vendor',
      minWidth: 170,
      format: (value: string | null) => value || '-'
    },
    {
      id: 'partner_name',
      label: 'Partner',
      minWidth: 170,
      format: (value: string | null) => value || '-'
    },
    {
      id: 'created_at',
      label: 'Created',
      minWidth: 170,
      format: (value: string) => new Date(value).toLocaleString()
    }
  ];

  const pendingVendorPaymentsColumns = [
    { id: 'booking_id', label: 'Booking ID', minWidth: 130 },
    { id: 'vendor_name', label: 'Vendor Name', minWidth: 170 },
    { id: 'vendor_email', label: 'Vendor Email', minWidth: 170 },
    { id: 'pickup_location', label: 'Pickup', minWidth: 150 },
    { id: 'dropoff_location', label: 'Drop-off', minWidth: 150 },
    {
      id: 'amount',
      label: 'Amount',
      minWidth: 120,
      format: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      id: 'created_at',
      label: 'Booking Date',
      minWidth: 170,
      format: (value: string) => new Date(value).toLocaleString()
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 100,
      format: (_: any, row: any) => (
        <button
          onClick={() => handlePayVendor(row.booking_id, row.vendor_id, row.amount)}
          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          Pay
        </button>
      ),
    },
  ];

  const pendingPartnerPaymentsColumns = [
    { id: 'transaction_id', label: 'Transaction ID', minWidth: 130 },
    { id: 'partner_name', label: 'Partner Name', minWidth: 170 },
    { id: 'partner_email', label: 'Partner Email', minWidth: 170 },
    { id: 'company_name', label: 'Company', minWidth: 150 },
    {
      id: 'amount',
      label: 'Commission Amount',
      minWidth: 120,
      format: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      id: 'created_at',
      label: 'Transaction Date',
      minWidth: 170,
      format: (value: string) => new Date(value).toLocaleString()
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 100,
      format: (_: any, row: any) => (
        <button
          onClick={() => handlePayPartner(row.transaction_id, row.partner_id, row.amount)}
          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          Pay
        </button>
      ),
    },
  ];

  const handleExport = () => {
    // Implement export logic based on activeTab and filteredPayments
    console.log('Exporting data for tab:', activeTab, filteredPayments);
  };

  const getTableTitle = () => {
    switch (activeTab) {
      case 'all':
        return 'All Payment Records';
      case 'pending-vendor':
        return 'Pending Vendor Payments';
      case 'pending-partner':
        return 'Pending Partner Payments';
      default:
        return 'Payment Records';
    }
  };

  const getTableColumns = () => {
    switch (activeTab) {
      case 'all':
        return allPaymentsColumns;
      case 'pending-vendor':
        return pendingVendorPaymentsColumns;
      case 'pending-partner':
        return pendingPartnerPaymentsColumns;
      default:
        return allPaymentsColumns;
    }
  };



  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="mt-1 text-sm text-gray-600">
              Monitor all transactions and manage payouts
            </p>
          </div>
          {/* Make Payments button - for initiating new payments to vendors/partners */}
          <button
            onClick={() => alert('Make Payments functionality to be implemented')}
            className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 active:bg-red-800 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Make Payments</span>
          </button>
        </div>
      </div>

      {/* Tabs for different payment views */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('all')}
            className={`${activeTab === 'all'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            All Payments
          </button>
          <button
            onClick={() => setActiveTab('pending-vendor')}
            className={`${activeTab === 'pending-vendor'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Pending Vendor Payments
          </button>
          <button
            onClick={() => setActiveTab('pending-partner')}
            className={`${activeTab === 'pending-partner'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Pending Partner Payments
          </button>
        </nav>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center">
            <div className="bg-white/20 rounded-xl p-3">💰</div>
            <div className="ml-5">
              <p className="text-sm font-medium text-white/80">Total Payments</p>
              <p className="text-2xl font-bold mt-1">{financialAnalytics?.total_revenue.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Admin Commission</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₹{financialAnalytics?.admin_commission.toLocaleString() || '0'}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Vendor Earnings</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₹{financialAnalytics?.vendor_earnings.toLocaleString() || '0'}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Partner Commissions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₹{financialAnalytics?.partner_commissions.toLocaleString() || '0'}
          </p>
        </div>
      </div>


      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm">
        <Table
          columns={getTableColumns()}
          data={filteredPayments || []}
          isLoading={isLoading}
          title={getTableTitle()}
          onExport={handleExport}
        />
      </div>
    </div>
  );
};

export default Payments;
