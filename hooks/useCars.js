import { useState, useCallback } from 'react';
import { getCars, getCarDetails } from '../api/customerApi';

export const useCars = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCars();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Araçlar listelenemedi.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCarDetails = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCarDetails(id);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Araç detayları alınamadı.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchCars,
    fetchCarDetails,
  };
}; 