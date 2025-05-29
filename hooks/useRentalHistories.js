import { useState, useCallback } from 'react';
import {
  getAllRentalHistories,
  getRentalHistoriesByUserId,
  getRentalHistoriesByVehicleId,
  createRentalRequest,
  approveRentalRequest,
  rejectRentalRequest,
  getRentalRequests,
  getPendingRentalHistories,
  deletePendingRentalRequest
} from '../api/rentalHistoriesApi';

export const useRentalHistories = () => {
  const [rentalHistories, setRentalHistories] = useState([]);
  const [pendingRentalHistories, setPendingRentalHistories] = useState([]);
  const [selectedRental, setSelectedRental] = useState(null);
  const [rentalRequests, setRentalRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingError, setPendingError] = useState(null);
  const [apiError, setApiError] = useState(null);

  const handleError = (error, defaultMessage) => {
    const errorMessage = error.response?.data?.Message || defaultMessage;
    const errorData = error.response?.data?.Data;
    setApiError({ message: errorMessage, data: errorData });
    return { message: errorMessage, data: errorData };
  };

  const fetchAllRentalHistories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setApiError(null);
      const response = await getAllRentalHistories();
      setRentalHistories(response.data);
    } catch (err) {
      handleError(err, 'Kiralama geçmişleri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRentalHistoriesByUserId = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      setApiError(null);
      const response = await getRentalHistoriesByUserId(userId);
      setRentalHistories(response.data);
    } catch (err) {
      handleError(err, 'Kullanıcıya ait kiralama geçmişleri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRentalHistoriesByVehicleId = useCallback(async (vehicleId) => {
    try {
      setLoading(true);
      setError(null);
      setApiError(null);
      const response = await getRentalHistoriesByVehicleId(vehicleId);
      setRentalHistories(response.data);
    } catch (err) {
      handleError(err, 'Araca ait kiralama geçmişleri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRentalRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setApiError(null);
      const response = await getRentalRequests();
      setRentalRequests(response.data);
    } catch (err) {
      handleError(err, 'Kiralama talepleri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingRentalHistories = useCallback(async () => {
    try {
      setPendingLoading(true);
      setPendingError(null);
      setApiError(null);
      const response = await getPendingRentalHistories();
      setPendingRentalHistories(response.data);
    } catch (err) {
      handleError(err, 'Bekleyen kiralama istekleri yüklenemedi.');
    } finally {
      setPendingLoading(false);
    }
  }, []);

  const createRental = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      setApiError(null);
      const response = await createRentalRequest(data);
      return response.data;
    } catch (err) {
      const error = handleError(err, 'Kiralama talebi oluşturulamadı.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveRental = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      setApiError(null);
      const response = await approveRentalRequest(data);
      await fetchRentalRequests();
      return response.data;
    } catch (err) {
      const error = handleError(err, 'Kiralama talebi onaylanamadı.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchRentalRequests]);

  const rejectRental = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      setApiError(null);
      const response = await rejectRentalRequest(data);
      await fetchRentalRequests();
      return response.data;
    } catch (err) {
      const error = handleError(err, 'Kiralama talebi reddedilemedi.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchRentalRequests]);

  const removePendingRentalRequest = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      setApiError(null);
      await deletePendingRentalRequest(id);
      const updated = pendingRentalHistories.filter(r => r.Id !== id);
      setPendingRentalHistories(updated);
    } catch (err) {
      handleError(err, 'Bekleyen kiralama isteği silinemedi.');
    } finally {
      setLoading(false);
    }
  }, [pendingRentalHistories]);

  return {
    rentalHistories,
    pendingRentalHistories,
    selectedRental,
    rentalRequests,
    loading,
    pendingLoading,
    error,
    pendingError,
    apiError,
    fetchAllRentalHistories,
    fetchRentalHistoriesByUserId,
    fetchRentalHistoriesByVehicleId,
    fetchRentalRequests,
    createRental,
    approveRental,
    rejectRental,
    setSelectedRental,
    fetchPendingRentalHistories,
    removePendingRentalRequest
  };
}; 