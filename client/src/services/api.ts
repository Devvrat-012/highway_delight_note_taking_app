import axios, { type AxiosResponse } from 'axios';
import type { 
  ApiResponse, 
  AuthResponse, 
  OtpResponse, 
  User, 
  Note, 
  SignupDto, 
  LoginDto, 
  CreateNoteDto, 
  UpdateNoteDto 
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // prefer cookie-based auth; fall back to stored token if present
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const config = error.config || {};

    // Don't force a full-page redirect for auth-related requests (login/signup/verify/google)
    const url = config.url || '';
    const isAuthEndpoint = ['/auth/login', '/auth/signup', '/auth/verify-otp', '/auth/google', '/auth/send-otp'].some((u) => url.includes(u));
      // If caller opted out of redirect handling, skip redirect logic
      const skipRedirect = (config.headers && (config.headers['x-skip-redirect'] || config.headers['X-Skip-Redirect'])) ? true : false;

      if (status === 401) {
        // Remove any existing token
        localStorage.removeItem('token');

        // Debug log the 401 and request URL. Do NOT force a full-page redirect here —
        // let application code handle navigation based on auth state. For some flows
        // (initializeAuth/profile checks) a forced reload caused an infinite loop.
        console.warn('[api] 401 Unauthorized for', url, 'skipRedirect=', skipRedirect, 'isAuthEndpoint=', isAuthEndpoint);
      }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data: SignupDto): Promise<AxiosResponse<ApiResponse<OtpResponse>>> =>
    api.post('/auth/signup', data),
    
  login: (data: LoginDto): Promise<AxiosResponse<ApiResponse<AuthResponse>>> =>
    api.post('/auth/login', data),
    
  sendOtp: (email: string): Promise<AxiosResponse<ApiResponse<OtpResponse>>> =>
    api.post('/auth/send-otp', { email }),
    
  verifyOtp: (email: string, otp: string, type: string): Promise<AxiosResponse<ApiResponse<AuthResponse>>> =>
    api.post('/auth/verify-otp', { email, otp, type }),
    
  googleAuth: (credential: string, mode: 'login' | 'signup' = 'login'): Promise<AxiosResponse<ApiResponse<AuthResponse>>> =>
    api.post('/auth/google', { credential, mode }),
    
  logout: (): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/logout'),
};

// Notes API
export const notesAPI = {
  getNotes: (): Promise<AxiosResponse<ApiResponse<Note[]>>> =>
    api.get('/notes'),
    
  getNote: (id: string): Promise<AxiosResponse<ApiResponse<Note>>> =>
    api.get(`/notes/${id}`),
    
  createNote: (data: CreateNoteDto): Promise<AxiosResponse<ApiResponse<Note>>> =>
    api.post('/notes', data),
    
  updateNote: (id: string, data: UpdateNoteDto): Promise<AxiosResponse<ApiResponse<Note>>> =>
    api.put(`/notes/${id}`, data),
    
  deleteNote: (id: string): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/notes/${id}`),
};

// User API
export const userAPI = {
  getProfile: (): Promise<AxiosResponse<ApiResponse<User>>> =>
    api.get('/users/profile'),
    
  updateProfile: (data: Partial<User>): Promise<AxiosResponse<ApiResponse<User>>> =>
    api.put('/users/profile', data),
    
  deleteAccount: (): Promise<AxiosResponse<ApiResponse>> =>
    api.delete('/users/account'),
};

export default api;
