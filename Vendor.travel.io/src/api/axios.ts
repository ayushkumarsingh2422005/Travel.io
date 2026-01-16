import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/vendor',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('marcocabs_vendor_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('marcocabs_vendor_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance; 