import { useDispatch, useSelector } from 'react-redux';
import {
  authStart,
  authSuccess,
  authFail,
  logoutAsync,
  clearError,
} from '../storage/redux/authSlice';

import {
  signInRequest,
  signUpRequest,
  verifyAccountRequest,
  requestVerificationRequest,
} from '../api/authApi';

import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { token, user, loading, error } = useSelector((state) => state.auth);

  const signIn = async ({ emailOrUsername, password }) => {
    try {
      dispatch(authStart());
      const response = await signInRequest({ emailOrUsername, password });

      const { token, username, role } = response.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userRole', role); // ROLE saklanıyor

      dispatch(authSuccess({
        token,
        user: {
          username,
          role
        }
      }));

      return { success: true };
    } catch (err) {
      dispatch(authFail(err?.response?.data || 'Sunucu hatası'));
      return { success: false, error: err?.response?.data };
    }
  };

  const signUp = async (formData) => {
    try {
      dispatch(authStart());
      const response = await signUpRequest(formData);
      return { success: true, data: response.data };
    } catch (err) {
      dispatch(authFail(err?.response?.data || 'Kayıt başarısız'));
      return { success: false, error: err?.response?.data };
    }
  };

  const verifyAccount = async ({ email, verificationCode }) => {
    try {
      dispatch(authStart());
      const response = await verifyAccountRequest({ email, verificationCode });
      return { success: true, data: response.data };
    } catch (err) {
      dispatch(authFail(err?.response?.data || 'Doğrulama başarısız'));
      return { success: false, error: err?.response?.data };
    }
  };

  const requestVerification = async (email) => {
    try {
      dispatch(authStart());
      const response = await requestVerificationRequest({ email });
      return { success: true, data: response.data };
    } catch (err) {
      dispatch(authFail(err?.response?.data || 'Kod gönderilemedi'));
      return { success: false, error: err?.response?.data };
    }
  };

  const logout = async () => {
    await dispatch(logoutAsync());
  };

  return {
    signIn,
    signUp,
    verifyAccount,
    requestVerification,
    logout,
    token,
    user,
    loadingStates: { signIn: loading },
    error,
    clearError: () => dispatch(clearError()),
  };
};
