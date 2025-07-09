import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import { useSearch } from '../context/SearchContext';

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  usage_limit: number;
  expiry_date: string;
  is_active: number;
  created_at: string;
  times_used: number;
}

const mockPromoCodes: PromoCode[] = [
  {
    id: '1234567890abcdef',
    code: 'SUMMER2024',
    discount_type: 'percentage',
    discount_value: 15.0,
    min_order_value: 100.0,
    usage_limit: 100,
    expiry_date: '2024-06-30T23:59:59',
    is_active: 1,
    created_at: '2024-03-01T10:00:00',
    times_used: 45
  },
  {
    id: '9876543210fedcba',
    code: 'FIRSTRIDE',
    discount_type: 'fixed',
    discount_value: 50.0,
    min_order_value: 200.0,
    usage_limit: 1000,
    expiry_date: '2024-12-31T23:59:59',
    is_active: 1,
    created_at: '2024-03-02T11:30:00',
    times_used: 234
  },
  {
    id: '543210abcdef9876',
    code: 'EXPIRED50',
    discount_type: 'fixed',
    discount_value: 50,
    min_order_value: 150,
    usage_limit: 100,
    expiry_date: '2023-12-31T23:59:59',
    is_active: 0,
    created_at: '2023-06-10T14:00:00',
    times_used: 95
  }
];

const getTypeClasses = (type: PromoCode['discount_type']) => {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
  return type === 'percentage'
    ? `${baseClasses} bg-blue-100 text-blue-800`
    : `${baseClasses} bg-purple-100 text-purple-800`;
};

const getExpiryClasses = (date: string) => {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
  const isExpired = new Date(date) < new Date();
  return isExpired
    ? `${baseClasses} bg-red-100 text-red-800`
    : `${baseClasses} bg-gray-100 text-gray-800`;
};

const getStatusClasses = (isActive: number) => {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
  return isActive
    ? `${baseClasses} bg-green-100 text-green-800`
    : `${baseClasses} bg-red-100 text-red-800`;
};

const columns = [
  { id: 'code', label: 'Code', minWidth: 120 },
  {
    id: 'discount_type',
    label: 'Type',
    minWidth: 100,
    format: (value: PromoCode['discount_type']) => (
      <span className={getTypeClasses(value)}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    )
  },
  {
    id: 'discount_value',
    label: 'Discount',
    minWidth: 100,
    format: (value: number, row: PromoCode) =>
      row.discount_type === 'percentage' ? `${value}%` : `₹${value}`
  },
  {
    id: 'min_order_value',
    label: 'Min Order',
    minWidth: 120,
    format: (value: number) => `₹${value}`
  },
  {
    id: 'usage_limit',
    label: 'Usage',
    minWidth: 120,
    format: (value: number, row: PromoCode) => `${row.times_used}/${value}`
  },
  {
    id: 'expiry_date',
    label: 'Expires',
    minWidth: 170,
    format: (value: string) => (
      <span className={getExpiryClasses(value)}>
        {new Date(value).toLocaleDateString()}
      </span>
    )
  },
  {
    id: 'is_active',
    label: 'Status',
    minWidth: 100,
    format: (value: number) => (
      <span className={getStatusClasses(value)}>{value ? 'Active' : 'Inactive'}</span>
    )
  },
  {
    id: 'created_at',
    label: 'Created',
    minWidth: 170,
    format: (value: string) => new Date(value).toLocaleDateString()
  }
];

const PromoCodes: React.FC = () => {
  const { query } = useSearch();

  const [data, setData] = useState<PromoCode[]>(mockPromoCodes);
  const [filtered, setFiltered] = useState<PromoCode[]>([]);

  useEffect(() => {
    const lower = query.toLowerCase();
    setFiltered(
      data.filter(
        (p) =>
          p.code.toLowerCase().includes(lower) ||
          (p.is_active ? 'active' : 'inactive').includes(lower) ||
          (p.discount_type && p.discount_type.toLowerCase().includes(lower)) ||
          (p.expiry_date && new Date(p.expiry_date).toLocaleDateString().toLowerCase().includes(lower))
      )
                 
    );
  }, [query, data]);

  const isExpired = (promo: PromoCode) =>
    new Date(promo.expiry_date) < new Date();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage discount codes, expirations, and usage
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
            <span>Add Code</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center">
            <div className="bg-white/20 rounded-xl p-3">🏷️</div>
            <div className="ml-5">
              <p className="text-sm font-medium text-white/80">Total Promo Codes</p>
              <p className="text-2xl font-bold mt-1">{filtered.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Active Codes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {filtered.filter((p) => p.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Expired</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {filtered.filter(isExpired).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm">
        <Table
          columns={columns}
          data={filtered || []}
          isLoading={false}
          title="Promo Code List"
        />
      </div>
    </div>
  );
};

export default PromoCodes;
