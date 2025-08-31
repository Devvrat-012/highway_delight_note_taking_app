import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User, AuthResponse, OtpResponse, SignupDto, LoginDto } from '../../types';
import { authAPI, userAPI } from '../../services/api';
import api from '../../services/api';

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isInitializing: true,
  error: null,
  isAuthenticated: false,
};

// Async thunks
export const signup = createAsyncThunk(
  'auth/signup',
  async (signupData: SignupDto, { rejectWithValue }) => {
    try {
      const response = await authAPI.signup(signupData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Signup failed');
    }
  }
);

export const login = createAsyncThunk<AuthResponse, any>(
  'auth/login',
  async (payload: any, { rejectWithValue }) => {
    try {
      const { remember, ...loginData } = payload;
      const response = await authAPI.login(loginData as LoginDto);
      const token = response.data.data!.token;
      if (remember) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const sendOtp = createAsyncThunk<OtpResponse, string>(
  'auth/sendOtp',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.sendOtp(email);
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  }
);

export const verifyOtp = createAsyncThunk<AuthResponse, any>(
  'auth/verifyOtp',
  async (payload: any, { rejectWithValue }) => {
    try {
      const { email, otp, type, remember } = payload;
      const response = await authAPI.verifyOtp(email, otp, type);
      const token = response.data.data!.token;
      if (remember) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const googleAuth = createAsyncThunk<AuthResponse, any>(
  'auth/googleAuth',
  async (payload: any, { rejectWithValue }) => {
    try {
      const { credential, mode = 'login', remember } = payload;
      const response = await authAPI.googleAuth(credential, mode);
      const token = response.data.data!.token;
      if (remember) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Google authentication failed');
    }
  }
);

// Initialize auth from localStorage (verify token with backend)
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { dispatch, rejectWithValue }) => {
    // Prefer persistent token, fall back to session token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    // If there is a token in storage, try validating via profile endpoint (will 401 if invalid)
    if (token) {
      try {
        const profileResp = await userAPI.getProfile();
        const user = profileResp.data.data;
        if (user) {
          dispatch(setUser(user));
        }

        return { success: true };
      } catch (error: any) {
        // Token invalid - remove from all storages
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        return rejectWithValue('Token invalid');
      }
    }

    // No stored token — attempt to initialize via cookie-based session by calling profile with credentials
    try {
      const profileResp = await api.get('/users/profile', { headers: { 'x-skip-redirect': '1' } });
      const user = profileResp.data.data;
      if (user) {
        // Server-side cookie authenticated the request
        dispatch(setUser(user));
        return { success: true };
      }
      return rejectWithValue('No session');
    } catch (error: any) {
      return rejectWithValue('No session');
    }
  }
);


export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      return null;
    } catch (error: any) {
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Send OTP
      .addCase(sendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Google Auth
      .addCase(googleAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(initializeAuth.fulfilled, (state) => {
        state.isInitializing = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isInitializing = false;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
