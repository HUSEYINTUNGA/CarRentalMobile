import { useState, useCallback } from 'react';
import {
  createPaymentMethod,
  getPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod,
  getPaymentMethodById
} from '../api/paymentMethodsApi';

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPaymentMethods();
      setPaymentMethods(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Ödeme yöntemleri yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPaymentMethodById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPaymentMethodById(id);
      setSelectedPaymentMethod(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Ödeme yöntemi bilgisi alınamadı.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addPaymentMethod = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createPaymentMethod(data);
      await fetchPaymentMethods();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Ödeme yöntemi eklenemedi.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentMethods]);

  const editPaymentMethod = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updatePaymentMethod(data);
      await fetchPaymentMethods();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Ödeme yöntemi güncellenemedi.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentMethods]);

  const removePaymentMethod = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      await deletePaymentMethod(data);
      await fetchPaymentMethods();
    } catch (err) {
      setError(err.response?.data?.message || 'Ödeme yöntemi silinemedi.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentMethods]);

  return {
    paymentMethods,
    selectedPaymentMethod,
    loading,
    error,
    fetchPaymentMethods,
    fetchPaymentMethodById,
    addPaymentMethod,
    editPaymentMethod,
    removePaymentMethod,
    setSelectedPaymentMethod
  };
}; 