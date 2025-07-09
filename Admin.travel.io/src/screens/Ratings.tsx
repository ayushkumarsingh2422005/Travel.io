import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import { useSearch } from '../context/SearchContext';

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
    driver_name: 'Mike Johnson',
    vehicle_info: 'Toyota Camry (ABC123XY)',
    user_name: 'John Doe'
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
  {
    id: '543210abcdef7890',
    driver_id: 'driver789',
    vehicle_id: 'vehicle321',
    user_id: 'user999',
    rating: 2,
    review: 'Driver was late and not polite',
    created_at: '2024-04-12T09:00:00',
    driver_name: 'Alan Brown',
    vehicle_info: 'Hyundai Verna (JKL456)',
    user_name: 'Raj Mehta'
  }
];

const StarRating: React.FC<{ value: number }> = ({ value }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
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
  const { query } = useSearch();
  const [data, setData] = useState<Rating[]>(mockRatings);
  const [filtered, setFiltered] = useState<Rating[]>([]);

  useEffect(() => {
    const lower = query.toLowerCase();
    setFiltered(
      data.filter(
        (r) =>
          r.driver_name.toLowerCase().includes(lower) ||
          r.user_name.toLowerCase().includes(lower) ||
          r.vehicle_info.toLowerCase().includes(lower) ||
          r.review.toLowerCase().includes(lower)
      )
    );
  }, [query, data]);

  const countByRating = (n: number) => data.filter((r) => r.rating === n).length;
  const countBelow = (threshold: number) => data.filter((r) => r.rating < threshold).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ratings & Reviews</h1>
            <p className="mt-1 text-sm text-gray-600">
              All customer feedback and driver ratings
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center">
            <div className="bg-white/20 rounded-xl p-3">⭐</div>
            <div className="ml-5">
              <p className="text-sm font-medium text-white/80">Total Reviews</p>
              <p className="text-2xl font-bold mt-1">{filtered.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">5 Star</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{countByRating(5)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">4 Star</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{countByRating(4)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Below 4</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{countBelow(4)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm">
        <Table
          columns={columns}
          data={filtered}
          isLoading={false}
          title="Rating Records"
        />
      </div>
    </div>
  );
};

export default Ratings;
