import { useState, useCallback } from 'react';
import { getPaymentMethods, deletePaymentMethod as deletePaymentMethodApi } from '../api/paymentMethodsApi';

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPaymentMethods();
      setPaymentMethods(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Ödeme yöntemleri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePaymentMethod = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await deletePaymentMethodApi(id);
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Ödeme yöntemi silinirken bir hata oluştu.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    paymentMethods,
    loading,
    error,
    fetchPaymentMethods,
    deletePaymentMethod,
  };
}; 