import { useState, useCallback } from 'react';
import { getRentalHistory, createRental, cancelRental } from '../api/customerApi';

export const useRentals = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRentalHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRentalHistory();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Kiralama geçmişi alınamadı.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewRental = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createRental(data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Kiralama oluşturulamadı.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelRentalById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await cancelRental(id);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Kiralama iptal edilemedi.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchRentalHistory,
    createNewRental,
    cancelRentalById,
  };
}; 