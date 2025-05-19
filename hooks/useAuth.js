import { useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as jwtDecode from 'jwt-decode';
import {
  signInRequest,
  signUpRequest,
  verifyAccountRequest,
  requestVerificationRequest,
  forgotPasswordRequest,
  resetPasswordRequest,
  changeUserRoleRequest,
} from '../api/authApi';

export const useAuth = () => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState({
    signIn: false,
    signUp: false,
    verifyAccount: false,
    requestVerification: false,
    forgotPassword: false,
    resetPassword: false,
  });
  const [error, setError] = useState(null);

  const signIn = async ({ emailOrUsername, password }) => {
    try {
      setLoading(prev => ({ ...prev, signIn: true }));
      setError(null);
      const response = await signInRequest({ emailOrUsername, password });

      if (!response.data || !response.data.token) {
        throw new Error('Geçersiz sunucu yanıtı');
      }

      const { token, user } = response.data;
      const decodedToken = jwtDecode.jwtDecode(token);

      const userData = {
        id: user.id || decodedToken.nameid,
        name: user.name || decodedToken.firstName,
        surname: user.surname || decodedToken.lastName,
        email: user.email || decodedToken.email,
        role: user.role || decodedToken.role
      };

      setToken(token);
      setUser(userData);

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userId', userData.id);
      await AsyncStorage.setItem('userEmail', userData.email);
      await AsyncStorage.setItem('userName', userData.name);
      await AsyncStorage.setItem('userSurname', userData.surname);
      await AsyncStorage.setItem('userRole', userData.role);

      return { 
        success: true, 
        role: userData.role,
        user: userData
      };
    } catch (err) {
      const errorMessage = err?.response?.data || err?.message || 'Sunucu hatası';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(prev => ({ ...prev, signIn: false }));
    }
  };

  const signUp = async (formData) => {
    try {
      setLoading(prev => ({ ...prev, signUp: true }));
      setError(null);
      const response = await signUpRequest(formData);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err?.response?.data || 'Kayıt başarısız';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(prev => ({ ...prev, signUp: false }));
    }
  };

  const verifyAccount = async ({ Email, VerificationCode }) => {
    try {
      setLoading(prev => ({ ...prev, verifyAccount: true }));
      setError(null);
      const response = await verifyAccountRequest({ Email, VerificationCode });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err?.response?.data || 'Doğrulama başarısız';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(prev => ({ ...prev, verifyAccount: false }));
    }
  };

  const requestVerification = async (email) => {
    try {
      setLoading(prev => ({ ...prev, requestVerification: true }));
      setError(null);
      const response = await requestVerificationRequest({ email });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err?.response?.data || 'Kod gönderilemedi';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(prev => ({ ...prev, requestVerification: false }));
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(prev => ({ ...prev, forgotPassword: true }));
      setError(null);
      const response = await forgotPasswordRequest(email);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err?.response?.data || 'Şifre sıfırlama başarısız';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(prev => ({ ...prev, forgotPassword: false }));
    }
  };

  const resetPassword = async ({ email, verificationCode, newPassword }) => {
    try {
      setLoading(prev => ({ ...prev, resetPassword: true }));
      setError(null);
      const response = await resetPasswordRequest({ email, verificationCode, newPassword });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err?.response?.data || 'Şifre sıfırlama başarısız';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(prev => ({ ...prev, resetPassword: false }));
    }
  };

  const logout = async () => {
    try {
      setToken(null);
      setUser(null);
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userName');
      await AsyncStorage.removeItem('userSurname');
      await AsyncStorage.removeItem('userRole');
    } catch (err) {
      console.error('Çıkış yapılırken hata oluştu:', err);
      throw err;
    }
  };

  const getUserInfo = () => {
    if (!user) return null;
    
    return {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
      fullName: `${user.name} ${user.surname}`
    };
  };

  const changeUserRole = async (data) => {
    try {
      const response = await changeUserRoleRequest(data);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err?.response?.data };
    }
  };

  return {
    signIn,
    signUp,
    verifyAccount,
    requestVerification,
    forgotPassword,
    resetPassword,
    logout,
    changeUserRole,
    token,
    user: getUserInfo(),
    loadingStates: loading,
    error,
    clearError: () => setError(null),
  };
};
