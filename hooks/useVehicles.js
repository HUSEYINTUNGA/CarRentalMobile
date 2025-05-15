import { useState, useCallback } from 'react';
import {
  getVehicles,
  getVehicleById,
  getVehicleCategories,
  getVehicleBrands,
  getVehicleFuelTypes,
  getVehicleTransmissionTypes,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../api/vehiclesApi';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [transmissionTypes, setTransmissionTypes] = useState([]);
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

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVehicleCategories();
      setCategories(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Kategoriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVehicleBrands();
      setBrands(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Markalar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFuelTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVehicleFuelTypes();
      setFuelTypes(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Yakıt tipleri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransmissionTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVehicleTransmissionTypes();
      setTransmissionTypes(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Vites tipleri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addVehicle = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createVehicle(data);
      await fetchVehicles();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Araç eklenemedi.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchVehicles]);

  const editVehicle = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateVehicle(id, data);
      await fetchVehicles();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Araç güncellenemedi.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchVehicles]);

  const removeVehicle = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await deleteVehicle(id);
      await fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Araç silinemedi.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchVehicles]);

  return {
    vehicles,
    selectedVehicle,
    categories,
    brands,
    fuelTypes,
    transmissionTypes,
    loading,
    error,
    fetchVehicles,
    fetchVehicleById,
    fetchCategories,
    fetchBrands,
    fetchFuelTypes,
    fetchTransmissionTypes,
    addVehicle,
    editVehicle,
    removeVehicle,
    setSelectedVehicle
  };
}; 