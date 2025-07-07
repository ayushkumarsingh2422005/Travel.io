import { useState, useEffect } from 'react';

interface UseDataResponse<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

const useData = <T>(endpoint: string): UseDataResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('marcocabs_admin_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, isLoading, error };
};

export default useData; 