import { useState, useCallback } from 'react';
import {
  getVehicles,
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleBasicById,
  restoreVehicle as restoreVehicleApi
} from '../api/vehiclesApi';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVehicles = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVehicles(params);
      setVehicles(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Araçlar yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllVehicles = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllVehicles(params);
      setVehicles(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Tüm araçlar yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVehicleById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVehicleById(id);
      setSelectedVehicle(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Araç bilgisi alınamadı.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVehicleBasicById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVehicleBasicById(id);
      setSelectedVehicle(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Araç temel bilgisi alınamadı.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addVehicle = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createVehicle(data);
      await fetchAllVehicles();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Araç eklenemedi.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAllVehicles]);

  const editVehicle = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateVehicle(id, data);
      await fetchAllVehicles();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Araç güncellenemedi.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAllVehicles]);

  const removeVehicle = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await deleteVehicle(id);
      await fetchAllVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Araç silinemedi.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAllVehicles]);

  const restoreVehicle = async (vehicleId) => {
    try {
        setLoading(true);
        await restoreVehicleApi(vehicleId);
        await fetchAllVehicles();
        return true;
    } catch (err) {
        setError(err.message || 'Araç geri yüklenirken bir hata oluştu.');
        return false;
    } finally {
        setLoading(false);
    }
};

  return {
    vehicles,
    selectedVehicle,
    loading,
    error,
    fetchVehicles,
    fetchAllVehicles,
    fetchVehicleById,
    fetchVehicleBasicById,
    addVehicle,
    editVehicle,
    removeVehicle,
    setSelectedVehicle,
    restoreVehicle
  };
}; 