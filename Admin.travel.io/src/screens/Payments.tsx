import React from 'react';
import Table from '../components/Table';
import useData from '../hooks/useData';

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

const mockPayments: Payment[] = [
  {
    id: '1234567890abcdef',
    vendor_id: 'vendor123',
    partner_id: null,
    amount: 25000,
    status: 'completed',
    type: 'withdrawal',
    created_at: '2024-03-01T10:00:00',
    vendor_name: 'John Smith', // Joined from vendors table
    partner_name: null // Joined from partners table
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
    partner_name: 'Jane Doe' // Joined from partners table
  },
  // Add more mock payments here
];

const getStatusClasses = (status: Payment['status']) => {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
  switch (status) {
    case 'completed':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'pending':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'failed':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

const getTypeClasses = (type: Payment['type']) => {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
  return type === 'withdrawal' 
    ? `${baseClasses} bg-blue-100 text-blue-800`
    : `${baseClasses} bg-red-100 text-red-800`;
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
  // const { data, isLoading, error } = useData<Payment[]>('/api/payments');

  // const handleExport = () => {
  //   if (!data) return;
    
  //   const csv = data.map((row: Payment) => 
  //     columns.map(col => row[col.id as keyof Payment]).join(',')
  //   ).join('\n');
    
  //   const blob = new Blob([csv], { type: 'text/csv' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = 'payments.csv';
  //   a.click();
  // };

  // if (error) {
  //   return <div className="text-red-600 p-4">Error: {error}</div>;
  // }

  return (
    <div className="p-6">
      <Table
        columns={columns}
        data={mockPayments}
        isLoading={false}
        title="Payments Management"
        // onExport={handleExport}
      />
    </div>
  );
};

export default Payments; 