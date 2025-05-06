import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  token: null,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    authFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
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
