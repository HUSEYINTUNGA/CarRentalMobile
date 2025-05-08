import { useState, useCallback } from 'react';
import { getProfile, updateProfile, changePassword, changeProfilePhoto } from '../api/customerApi';

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProfile();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Profil bilgileri alınamadı.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfileData = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateProfile(data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Profil güncellenemedi.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await changePassword(data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Şifre güncellenemedi.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePhoto = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await changeProfilePhoto(data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Profil fotoğrafı güncellenemedi.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchProfile,
    updateProfileData,
    updatePassword,
    updatePhoto,
  };
}; 