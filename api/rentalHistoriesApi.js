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

export const getAllRentalHistories = () => api.get('/rentalhistories');
export const getRentalHistoriesByUserId = (userId) => api.get(`/rentalhistories/user/${userId}`);
export const getRentalHistoriesByVehicleId = (vehicleId) => api.get(`/rentalhistories/vehicle/${vehicleId}`);
export const createRentalRequest = (data) => api.post('/rentalhistories/create-request', data);
export const approveRentalRequest = (data) => api.post('/rentalhistories/approve', data);
export const rejectRentalRequest = (data) => api.post('/rentalhistories/reject', data);
export const getRentalRequests = () => api.get('/rentalhistories/requests'); 