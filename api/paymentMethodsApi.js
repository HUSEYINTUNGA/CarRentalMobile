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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error);
  }
);

export const getPaymentMethods = () => api.get('paymentmethods/list');

export const createPaymentMethod = (data) => api.post('paymentmethods/create', data);

export const updatePaymentMethod = (data) => api.put('paymentmethods/update', data);

export const deletePaymentMethod = (id) => api.delete('paymentmethods/delete', { data: { PaymentMethodId: id } });

export const getPaymentMethodById = (id) => api.get(`paymentmethods/${id}`); 