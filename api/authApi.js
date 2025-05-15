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

export const signInRequest = (data) => api.post('/auth/signin', data);
export const signUpRequest = (data) => api.post('/auth/signup', data);
export const verifyAccountRequest = (data) => api.post('/auth/verify-account', data);
export const requestVerificationRequest = (data) => api.post('/auth/request-verification', data);
export const forgotPasswordRequest = (email) => api.post('/auth/forgot-password', { email });
export const resetPasswordRequest = (data) => api.post('/auth/reset-password', data);
export const changeUserRoleRequest = (data) => api.post('/auth/change-user-role', data);
