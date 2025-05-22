import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from './config';
const BASE_URL = config.baseUrl;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dashboard API endpoints
export const getUserStats = () => api.get('/Dashboard/UserStats');
export const getVehicleStats = () => api.get('/Dashboard/VehicleStats');
export const getRentalStats = () => api.get('/Dashboard/RentalStats');

 