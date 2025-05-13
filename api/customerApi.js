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
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('Token alındı:', token ? 'Token var' : 'Token yok');
    console.log('Token değeri:', token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header:', config.headers.Authorization);
    } else {
      console.log('Token bulunamadı, istek token olmadan gönderiliyor');
    }
    return config;
  } catch (error) {
    console.error('Token alınamadı:', error);
    return config;
  }
});

api.interceptors.response.use(
  (response) => {
    console.log('API Başarılı:', response.config.url);
    return response;
  },
  async (error) => {
    console.error('API Hatası:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers
    });
    return Promise.reject(error);
  }
);

export const getProfile = () => {
  console.log('getProfile çağrıldı, endpoint:', `${BASE_URL}customer/profile`);
  return api.get('customer/profile');
};

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

export const deleteAccount = () => api.delete('customer/delete-account');
