import { useState, useCallback } from 'react';
import { addVehiclePhoto, deleteVehiclePhoto } from '../api/vehiclePhotosApi';

export const useVehiclePhotos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadVehiclePhoto = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await addVehiclePhoto(formData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Fotoğraf yüklenemedi.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeVehiclePhoto = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await deleteVehiclePhoto(id);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Fotoğraf silinemedi.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    uploadVehiclePhoto,
    removeVehiclePhoto
  };
}; 