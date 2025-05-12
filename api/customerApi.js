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


export const getProfile = () => api.get('customer/profile');
export const updateProfile = (data) => api.put('customer/update-profile', data);
export const changePassword = (data) => api.post('customer/change-password', data);
export const changeProfilePhoto = (data) => {
  const formData = new FormData();
  formData.append('ProfilePicture', {
    uri: data.uri,
    type: 'image/jpeg',
    name: 'profile.jpg'
  });
  return api.put('customer/change-profile-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
