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
  forgotPasswordRequest,
  resetPasswordRequest,
} from '../api/authApi';

import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { token, user, loading, error } = useSelector((state) => state.auth);

  const signIn = async ({ emailOrUsername, password }) => {
    try {
      dispatch(authStart('signIn'));
      const response = await signInRequest({ emailOrUsername, password });

      const { token, user } = response.data;
      const { role, name, surname, email } = user;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userRole', role);

      dispatch(authSuccess({
        type: 'signIn',
        token,
        user: {
          name,
          surname,
          email,
          role
        }
      }));

      return { success: true, role };
    } catch (err) {
      dispatch(authFail({ type: 'signIn', error: err?.response?.data || 'Sunucu hatası' }));
      return { success: false, error: err?.response?.data };
    }
  };

  const signUp = async (formData) => {
    try {
      dispatch(authStart('signUp'));
      const response = await signUpRequest(formData);
      dispatch(authSuccess({ type: 'signUp' }));
      return { success: true, data: response.data };
    } catch (err) {
      dispatch(authFail({ type: 'signUp', error: err?.response?.data || 'Kayıt başarısız' }));
      return { success: false, error: err?.response?.data };
    }
  };

  const verifyAccount = async ({ Email, VerificationCode }) => {
    try {
      dispatch(authStart('verifyAccount'));
      const response = await verifyAccountRequest({ Email, VerificationCode });
      dispatch(authSuccess({ type: 'verifyAccount' }));
      return { success: true, data: response.data };
    } catch (err) {
      dispatch(authFail({ type: 'verifyAccount', error: err?.response?.data || 'Doğrulama başarısız' }));
      return { success: false, error: err?.response?.data };
    }
  };

  const requestVerification = async (email) => {
    try {
      dispatch(authStart('requestVerification'));
      const response = await requestVerificationRequest({ email });
      dispatch(authSuccess({ type: 'requestVerification' }));
      return { success: true, data: response.data };
    } catch (err) {
      dispatch(authFail({ type: 'requestVerification', error: err?.response?.data || 'Kod gönderilemedi' }));
      return { success: false, error: err?.response?.data };
    }
  };

  const forgotPassword = async (email) => {
    try {
      dispatch(authStart('forgotPassword'));
      const response = await forgotPasswordRequest(email);
      dispatch(authSuccess({ type: 'forgotPassword' }));
      return { success: true, data: response.data };
    } catch (err) {
      dispatch(authFail({ type: 'forgotPassword', error: err?.response?.data || 'Şifre sıfırlama başarısız' }));
      return { success: false, error: err?.response?.data };
    }
  };

  const resetPassword = async ({ email, verificationCode, newPassword }) => {
    try {
      dispatch(authStart('resetPassword'));
      const response = await resetPasswordRequest({ email, verificationCode, newPassword });
      dispatch(authSuccess({ type: 'resetPassword' }));
      return { success: true, data: response.data };
    } catch (err) {
      dispatch(authFail({ type: 'resetPassword', error: err?.response?.data || 'Şifre sıfırlama başarısız' }));
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
    forgotPassword,
    resetPassword,
    logout,
    token,
    user,
    loadingStates: {
      signIn: loading.signIn,
      signUp: loading.signUp,
      verifyAccount: loading.verifyAccount,
      requestVerification: loading.requestVerification,
      forgotPassword: loading.forgotPassword,
      resetPassword: loading.resetPassword,
    },
    error,
    clearError: () => dispatch(clearError()),
  };
};
