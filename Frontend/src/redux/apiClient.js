import axios from 'axios';

const API_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5000/api" 
  : "https://adyanewsbackend.onrender.com/api";

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;