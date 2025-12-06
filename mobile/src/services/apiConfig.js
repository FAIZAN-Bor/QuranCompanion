// API Configuration
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL - Update this based on your environment
// For Android emulator: http://10.0.2.2:5000
// For iOS simulator: http://localhost:5000
// For physical device: http://YOUR_IP_ADDRESS:5000
export const BASE_URL = 'http://10.112.238.60:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      // You can emit an event here to trigger navigation to login
    }
    return Promise.reject(error);
  }
);

export default api;
