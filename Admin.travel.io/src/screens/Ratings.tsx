import React from 'react';
import Table from '../components/Table';
import useData from '../hooks/useData';

interface Rating {
  id: string;
  driver_id: string;
  vehicle_id: string;
  user_id: string;
  rating: number;
  review: string;
  created_at: string;
  driver_name: string;
  vehicle_info: string;
  user_name: string;
}

const mockRatings: Rating[] = [
  {
    id: '1234567890abcdef',
    driver_id: 'driver123',
    vehicle_id: 'vehicle456',
    user_id: 'user789',
    rating: 4,
    review: 'Great service, very professional driver',
    created_at: '2024-03-01T10:00:00',
    driver_name: 'Mike Johnson', // Joined from drivers table
    vehicle_info: 'Toyota Camry (ABC123XY)', // Joined from vehicles table
    user_name: 'John Doe' // Joined from users table
  },
  {
    id: '9876543210fedcba',
    driver_id: 'driver456',
    vehicle_id: 'vehicle789',
    user_id: 'user123',
    rating: 5,
    review: 'Excellent ride, very comfortable and clean car',
    created_at: '2024-03-02T11:30:00',
    driver_name: 'David Wilson',
    vehicle_info: 'Honda Civic (XYZ789)',
    user_name: 'Jane Smith'
  },
  // Add more mock ratings here
];

const StarRating: React.FC<{ value: number }> = ({ value }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= value ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const columns = [
  { 
    id: 'rating', 
    label: 'Rating', 
    minWidth: 120,
    format: (value: number) => <StarRating value={value} />
  },
  { id: 'driver_name', label: 'Driver', minWidth: 170 },
  { id: 'vehicle_info', label: 'Vehicle', minWidth: 170 },
  { id: 'user_name', label: 'Customer', minWidth: 170 },
  { 
    id: 'review', 
    label: 'Review', 
    minWidth: 300,
    format: (value: string) => value || 'No review'
  },
  { 
    id: 'created_at', 
    label: 'Date', 
    minWidth: 170,
    format: (value: string) => new Date(value).toLocaleString()
  }
];

const Ratings: React.FC = () => {
  // const { data, isLoading, error } = useData<Rating[]>('/api/ratings');

  // const handleExport = () => {
  //   if (!data) return;
    
  //   const csv = data.map((row: Rating) => 
  //     columns.map(col => row[col.id as keyof Rating]).join(',')
  //   ).join('\n');
    
  //   const blob = new Blob([csv], { type: 'text/csv' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = 'ratings.csv';
  //   a.click();
  // };

  // if (error) {
  //   return <div className="text-red-600 p-4">Error: {error}</div>;
  // }

  return (
    <div className="p-6">
      <Table
        columns={columns}
        data={ mockRatings}
        isLoading={false}
        title="Ratings & Reviews"
        // onExport={handleExport}
      />
    </div>
  );
};

export default Ratings; 