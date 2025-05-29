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


export const getVehicles = (params) => api.get('/vehicles', { params });
export const getAllVehicles = (params) => api.get('/vehicles/admin/all', { params });
export const getVehicleById = (id) => api.get(`/vehicles/${id}`);
export const getVehicleBasicById = (id) => api.get(`/vehicles/basic/${id}`);
export const createVehicle = (data) => api.post('/vehicles', data);
export const updateVehicle = (id, data) => api.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);

export const restoreVehicle = async (vehicleId) => {
    try {
        const response = await api.post(`/Vehicles/restore/${vehicleId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};