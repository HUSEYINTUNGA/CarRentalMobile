import { useState, useCallback } from 'react';
import {
  getAllRentalHistories,
  getRentalHistoriesByUserId,
  getRentalHistoriesByVehicleId,
  createRentalRequest,
  approveRentalRequest,
  rejectRentalRequest,
  getRentalRequests
} from '../api/rentalHistoriesApi';

export const useRentalHistories = () => {
  const [rentalHistories, setRentalHistories] = useState([]);
  const [selectedRental, setSelectedRental] = useState(null);
  const [rentalRequests, setRentalRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllRentalHistories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllRentalHistories();
      setRentalHistories(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Kiralama geçmişleri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRentalHistoriesByUserId = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRentalHistoriesByUserId(userId);
      setRentalHistories(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Kullanıcıya ait kiralama geçmişleri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRentalHistoriesByVehicleId = useCallback(async (vehicleId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRentalHistoriesByVehicleId(vehicleId);
      setRentalHistories(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Araca ait kiralama geçmişleri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRentalRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRentalRequests();
      setRentalRequests(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Kiralama talepleri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createRental = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createRentalRequest(data);
      await fetchAllRentalHistories();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Kiralama talebi oluşturulamadı.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAllRentalHistories]);

  const approveRental = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await approveRentalRequest(data);
      await fetchRentalRequests();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Kiralama talebi onaylanamadı.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRentalRequests]);

  const rejectRental = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await rejectRentalRequest(data);
      await fetchRentalRequests();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Kiralama talebi reddedilemedi.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRentalRequests]);

  return {
    rentalHistories,
    selectedRental,
    rentalRequests,
    loading,
    error,
    fetchAllRentalHistories,
    fetchRentalHistoriesByUserId,
    fetchRentalHistoriesByVehicleId,
    fetchRentalRequests,
    createRental,
    approveRental,
    rejectRental,
    setSelectedRental
  };
}; 