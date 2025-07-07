import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/admin',
  // Add headers or auth tokens if needed
});

export default axiosInstance;
