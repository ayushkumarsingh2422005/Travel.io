import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import { useSearch } from '../context/SearchContext';

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
}

const dummyPayments: Payment[] = [
  {
    id: '1234567890abcdef',
    vendor_id: 'vendor123',
    partner_id: null,
    amount: 25000,
    status: 'completed',
    type: 'withdrawal',
    created_at: '2024-03-01T10:00:00',
    vendor_name: 'John Smith',
    partner_name: null
  },
  {
    id: '9876543210fedcba',
    vendor_id: null,
    partner_id: 'partner456',
    amount: 15000,
    status: 'pending',
    type: 'withdrawal',
    created_at: '2024-03-02T11:30:00',
    vendor_name: null,
    partner_name: 'Jane Doe'
  },
  {
    id: '4567891230aaaaaa',
    vendor_id: 'vendor456',
    partner_id: null,
    amount: 8000,
    status: 'failed',
    type: 'deposit',
    created_at: '2024-03-04T15:45:00',
    vendor_name: 'Ravi Kumar',
    partner_name: null
  }
];

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

const columns = [
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

const Payments: React.FC = () => {
  const { query } = useSearch();

  const [data, setData] = useState<Payment[]>(dummyPayments);
  const [filtered, setFiltered] = useState<Payment[]>([]);
  const [isLoading] = useState(false);

  useEffect(() => {
    const lower = query.toLowerCase();
    setFiltered(
      data.filter(
        (p) =>
          p.vendor_name?.toLowerCase().includes(lower) ||
          p.partner_name?.toLowerCase().includes(lower) ||
          p.id.toLowerCase().includes(lower)
      )
    );
  }, [query, data]);

  const handleExport = () => {
    // Optional CSV export logic
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="mt-1 text-sm text-gray-600">
              Monitor all transactions between vendors and partners
            </p>
          </div>
          <button
            onClick={() => {}}
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
            <span>Add Payment</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center">
            <div className="bg-white/20 rounded-xl p-3">💰</div>
            <div className="ml-5">
              <p className="text-sm font-medium text-white/80">Total Payments</p>
              <p className="text-2xl font-bold mt-1">{data.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {filtered.filter(p => p.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {filtered.filter(p => p.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Failed</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {filtered.filter(p => p.status === 'failed').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm">
        <Table
          columns={columns}
          data={filtered || []}
          isLoading={isLoading}
          title="Payment Records"
          onExport={handleExport}
        />
      </div>
    </div>
  );
};

export default Payments;
