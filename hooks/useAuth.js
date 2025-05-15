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
  changeUserRoleRequest,
} from '../api/authApi';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as jwtDecode from 'jwt-decode';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { token, user, loading, error } = useSelector((state) => state.auth);

  const signIn = async ({ emailOrUsername, password }) => {
    try {
      dispatch(authStart('signIn'));
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

      dispatch(authSuccess({
        type: 'signIn',
        token,
        user: userData
      }));

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
      dispatch(authFail({ type: 'signIn', error: errorMessage }));
      return { success: false, error: errorMessage };
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
