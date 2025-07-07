import React from 'react';
import Table from '../components/Table';
import useData from '../hooks/useData';

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
    discount_value: 15.00,
    min_order_value: 100.00,
    usage_limit: 100,
    expiry_date: '2024-06-30T23:59:59',
    is_active: 1,
    created_at: '2024-03-01T10:00:00',
    times_used: 45 // Additional field to track usage
  },
  {
    id: '9876543210fedcba',
    code: 'FIRSTRIDE',
    discount_type: 'fixed',
    discount_value: 50.00,
    min_order_value: 200.00,
    usage_limit: 1000,
    expiry_date: '2024-12-31T23:59:59',
    is_active: 1,
    created_at: '2024-03-02T11:30:00',
    times_used: 234
  },
  // Add more mock promo codes here
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
      <span className={getStatusClasses(value)}>
        {value ? 'Active' : 'Inactive'}
      </span>
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
  const { data, isLoading, error } = useData<PromoCode[]>('/api/promocodes');

  const handleExport = () => {
    if (!data) return;
    
    const csv = data.map((row: PromoCode) => 
      columns.map(col => row[col.id as keyof PromoCode]).join(',')
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'promocodes.csv';
    a.click();
  };

  if (error) {
    return <div className="text-red-600 p-4">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <Table
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        title="Promo Codes Management"
        onExport={handleExport}
      />
    </div>
  );
};

export default PromoCodes; 