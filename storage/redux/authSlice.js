import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  token: null,
  user: {
    id: null,
    email: null,
    name: null,
    surname: null,
    role: null
  },
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
      if (action.payload?.token) {
        state.token = action.payload.token;
        // Token'ı AsyncStorage'a kaydet
        AsyncStorage.setItem('token', action.payload.token);
      }
      if (action.payload?.user) {
        state.user = {
          id: action.payload.user.id,
          email: action.payload.user.email,
          name: action.payload.user.name,
          surname: action.payload.user.surname,
          role: action.payload.user.role
        };
        AsyncStorage.setItem('userId', action.payload.user.id);
        AsyncStorage.setItem('userEmail', action.payload.user.email);
        AsyncStorage.setItem('userName', action.payload.user.name);
        AsyncStorage.setItem('userSurname', action.payload.user.surname);
        AsyncStorage.setItem('userRole', action.payload.user.role);
      }
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
      state.user = {
        id: null,
        email: null,
        name: null,
        surname: null,
        role: null
      };
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
  // Tüm auth bilgilerini AsyncStorage'dan temizle
  await AsyncStorage.multiRemove([
    'token',
    'userId',
    'userEmail',
    'userName',
    'userSurname',
    'userRole'
  ]);
  dispatch(logout());
};
