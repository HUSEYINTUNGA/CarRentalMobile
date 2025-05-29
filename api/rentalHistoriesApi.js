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

const handleApiResponse = (response) => {
  if (Array.isArray(response.data)) {
    return { success: true, data: response.data };
  }
  if (response.data && typeof response.data === 'object') {
    if (response.data.success === false) {
      throw new Error(response.data.message || 'Bir hata oluştu');
    }
    return response.data;
  }
  return { success: true, data: response.data };
};

export const getAllRentalHistories = () => api.get('/rentalhistories').then(handleApiResponse);
export const getRentalHistoriesByUserId = (userId) => api.get(`/rentalhistories/user/${userId}`).then(handleApiResponse);
export const getRentalHistoriesByVehicleId = (vehicleId) => api.get(`/rentalhistories/vehicle/${vehicleId}`).then(handleApiResponse);
export const createRentalRequest = (data) => api.post('/rentalhistories/create-request', data).then(handleApiResponse);
export const approveRentalRequest = (data) => api.post('/rentalhistories/approve', data).then(handleApiResponse);
export const rejectRentalRequest = (data) => api.post('/rentalhistories/reject', data).then(handleApiResponse);
export const getRentalRequests = () => api.get('/rentalhistories/requests').then(handleApiResponse);
export const getPendingRentalHistories = () => api.get('/rentalhistories/pending').then(handleApiResponse);
export const deletePendingRentalRequest = (id) => api.delete(`/rentalhistories/pending/${id}`).then(handleApiResponse); 