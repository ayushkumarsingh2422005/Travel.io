import React from 'react';
import Table from '../components/Table';
import useData from '../hooks/useData';

interface Driver {
  id: string;
  vendor_id: string;
  name: string;
  phone: string;
  address: string;
  license: string;
  is_active: number;
  vehicle_id: string;
  vendor_name: string;
  vehicle_info: string;
  created_at: string;
}

const mockDrivers: Driver[] = [
  {
    id: '1234567890abcdef',
    vendor_id: 'vendor123',
    name: 'Mike Johnson',
    phone: '+1234567890',
    address: '123 Driver St, City',
    license: 'DL123456789',
    is_active: 1,
    vehicle_id: 'vehicle456',
    vendor_name: 'John Smith', // Joined from vendors table
    vehicle_info: 'Toyota Camry (ABC123XY)', // Joined from vehicles table
    created_at: '2024-02-01T10:00:00'
  },
  // Add more mock drivers here
];

const columns = [
  { id: 'name', label: 'Name', minWidth: 170 },
  { id: 'phone', label: 'Phone', minWidth: 120 },
  { id: 'vendor_name', label: 'Vendor', minWidth: 170 },
  { id: 'vehicle_info', label: 'Assigned Vehicle', minWidth: 200 },
  { id: 'license', label: 'License No', minWidth: 120 },
  { 
    id: 'is_active', 
    label: 'Status', 
    minWidth: 100,
    format: (value: number) => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value ? 'Active' : 'Inactive'}
      </span>
    )
  },
  { 
    id: 'created_at', 
    label: 'Added On', 
    minWidth: 170,
    format: (value: string) => new Date(value).toLocaleDateString()
  }
];

const Drivers: React.FC = () => {
  // const { data, isLoading, error } = useData<Driver[]>('/api/drivers');

  // console.log(data);

  // const handleExport = () => {
  //   if (!data) return;
    
  //   const csv = data.map((row: Driver) => 
  //     columns.map(col => row[col.id as keyof Driver]).join(',')
  //   ).join('\n');
    
  //   const blob = new Blob([csv], { type: 'text/csv' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = 'drivers.csv';
  //   a.click();
  // };

  // if (error) {
  //   return <div className="text-red-600 p-4">Error: {error}</div>;
  // }

  return (
    <div className="p-6">
      <Table
        columns={columns}
        data={ mockDrivers}
        isLoading={false}
        title="Drivers Management"
        // onExport={handleExport}
      />
    </div>
  );
};

export default Drivers; 