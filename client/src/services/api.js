import axios from 'axios';

// Create an Axios instance with base URL pointing to Express backend
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request Interceptor: Automatically attach the authorization token to headers if it exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('astitva_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centrally handle global responses or specific error conditions (e.g. 401 token expiry)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, clean up token (optionally trigger logout)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('astitva_token');
      // In a real application, you might want to redirect to login or dispatch a logout event here
    }
    return Promise.reject(error);
  }
);

export default API;
