import React from 'react';
import Table from '../components/Table';
import useData from '../hooks/useData';

interface Vehicle {
  id: string;
  vendor_id: string;
  model: string;
  registration_no: string;
  image: string;
  no_of_seats: number;
  is_active: number;
  vendor_name: string;
  created_at: string;
}

const mockVehicles: Vehicle[] = [
  {
    id: '1234567890abcdef',
    vendor_id: 'vendor123',
    model: 'Toyota Camry',
    registration_no: 'ABC123XY',
    image: 'https://example.com/car.jpg',
    no_of_seats: 4,
    is_active: 1,
    vendor_name: 'John Smith', // Joined from vendors table
    created_at: '2024-02-15T10:00:00'
  },
  // Add more mock vehicles here
];

const columns = [
  { 
    id: 'registration_no', 
    label: 'Registration', 
    minWidth: 120 
  },
  { id: 'model', label: 'Model', minWidth: 150 },
  { id: 'vendor_name', label: 'Vendor', minWidth: 170 },
  { 
    id: 'no_of_seats', 
    label: 'Seats', 
    minWidth: 100,
    format: (value: number) => value.toString()
  },
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
    id: 'image', 
    label: 'Image', 
    minWidth: 100,
    format: (value: string) => (
      value ? (
        <img 
          src={value} 
          alt="Vehicle" 
          className="w-12 h-12 object-cover rounded"
        />
      ) : 'No Image'
    )
  },
  { 
    id: 'created_at', 
    label: 'Added On', 
    minWidth: 170,
    format: (value: string) => new Date(value).toLocaleDateString()
  }
];

const Vehicles: React.FC = () => {
  // const { data, isLoading, error } = useData<Vehicle[]>('/api/vehicles');

  // const handleExport = () => {
  //   if (!data) return;
    
  //   const csv = data.map((row: Vehicle) => 
  //     columns.map(col => row[col.id as keyof Vehicle]).join(',')
  //   ).join('\n');
    
  //   const blob = new Blob([csv], { type: 'text/csv' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = 'vehicles.csv';
  //   a.click();
  // };

  // if (error) {
  //   return <div className="text-red-600 p-4">Error: {error}</div>;
  // }

  return (
    <div className="p-6">
      <Table
        columns={columns}
        data={mockVehicles}
        isLoading={false}
        title="Vehicles Management"
        // onExport={handleExport}
      />
    </div>
  );
};

export default Vehicles; 