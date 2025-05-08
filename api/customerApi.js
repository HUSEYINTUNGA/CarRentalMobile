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

// Profil işlemleri
export const getProfile = () => api.get('/api/customer/profile');
export const updateProfile = (data) => api.put('/api/customer/update-profile', data);
export const changePassword = (data) => api.post('/api/customer/change-password', data);
export const changeProfilePhoto = (data) => {
  const formData = new FormData();
  formData.append('ProfilePicture', {
    uri: data.uri,
    type: 'image/jpeg',
    name: 'profile.jpg'
  });
  return api.put('/api/customer/change-profile-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Araç işlemleri
export const getCars = () => api.get('/api/customer/cars');
export const getCarDetails = (id) => api.get(`/api/customer/cars/${id}`);

// Kiralama işlemleri
export const getRentalHistory = () => api.get('/api/customer/rentals');
export const createRental = (data) => api.post('/api/customer/rentals', data);
export const cancelRental = (id) => api.post(`/api/customer/rentals/${id}/cancel`); 