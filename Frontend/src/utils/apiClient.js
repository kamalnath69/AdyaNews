import axios from 'axios';

const API_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5000/api" 
  : "https://adyanewsbackend.onrender.com/api";

// Create axios instance with consistent configuration
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: false, // Explicitly disable credentials
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token from localStorage to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;