import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  token: null,
  user: null,
  loading: {
    signIn: false,
    signUp: false,
    verifyAccount: false,
    requestVerification: false,
    forgotPassword: false,
    resetPassword: false,
  },
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state, action) => {
      const type = action.payload;
      if (type && state.loading.hasOwnProperty(type)) {
        state.loading[type] = true;
      }
      state.error = null;
    },
    authSuccess: (state, action) => {
      const type = action.payload?.type;
      if (type && state.loading.hasOwnProperty(type)) {
        state.loading[type] = false;
      }
      if (action.payload?.token) state.token = action.payload.token;
      if (action.payload?.user) state.user = action.payload.user;
    },
    authFail: (state, action) => {
      const type = action.payload?.type;
      if (type && state.loading.hasOwnProperty(type)) {
        state.loading[type] = false;
      }
      state.error = action.payload?.error ?? action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
});

export const {
  authStart,
  authSuccess,
  authFail,
  logout,
  clearError
} = authSlice.actions;

export default authSlice.reducer;

export const logoutAsync = () => async (dispatch) => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('userRole');
  dispatch(logout());
};
