import axios from 'axios';
import { config } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: config.baseUrl,
});

api.interceptors.request.use(
  async (request) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  },
  (error) => Promise.reject(error)
);

export const getVehicleARModel = async (vehicleId) => {
  try {
    const response = await api.get(`/VehicleARModel/vehicle3d/${vehicleId}`);
    return {
      success: response.data.Success,
      message: response.data.Message,
      data: response.data.Data
    };
  } catch (error) {
    console.error('AR model getirme hatası:', error);
    return {
      success: false,
      message: error.response?.data?.Message || error.message || 'AR model getirme hatası',
      data: null
    };
  }
};

export const createVehicleARModel = async (arModelData) => {
  try {
    const response = await api.post('/VehicleARModel/create', arModelData);
    return {
      success: response.data.Success,
      message: response.data.Message,
      data: response.data.Data
    };
  } catch (error) {
    console.error('AR model oluşturma hatası:', error);
    return {
      success: false,
      message: error.response?.data?.Message || error.message || 'AR model oluşturma hatası',
      data: null
    };
  }
}; 