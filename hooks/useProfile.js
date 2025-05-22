import { useState, useCallback } from 'react';
import { getProfile, updateProfile, changePassword, changeProfilePhoto, deleteAccount, getUsers } from '../api/customerApi';

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

  const deleteAccountProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await deleteAccount();
    } catch (err) {
      setError(err.response?.data?.message || 'Hesap silinemedi.');
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
    deleteAccountProfile,
  };
};

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers(params);
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Kullanıcılar yüklenemedi.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { users, loading, error, fetchUsers };
}; 