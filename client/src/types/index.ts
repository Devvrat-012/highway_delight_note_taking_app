// Base types
export type Theme = 'light' | 'dark';

// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  dateOfBirth?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
  dateOfBirth?: string;
  password?: string;
  googleId?: string;
}

export interface LoginDto {
  email: string;
  password?: string;
  otp?: string;
}

export interface SignupDto {
  email: string;
  name: string;
  dateOfBirth?: string;
  password?: string;
}

// Note related types
export interface Note {
  id: string;
  title: string;
  content?: string;
  completed?: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  title: string;
  content?: string;
  completed?: boolean;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
  completed?: boolean;
}

// Auth related types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface OtpResponse {
  message: string;
  email: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: ValidationError[];
}

// Google OAuth types
export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

// Redux state types
export interface AppState {
  auth: AuthState;
  notes: NotesState;
  theme: ThemeState;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitializing?: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  currentNote: Note | null;
}

export interface ThemeState {
  theme: Theme;
  isSystemTheme: boolean;
}

// Form types
export interface SignupFormData {
  email: string;
  name: string;
  dateOfBirth?: string;
  password?: string;
}

export interface LoginFormData {
  email: string;
  password?: string;
}

export interface OtpFormData {
  otp: string;
}

export interface NoteFormData {
  title: string;
  content?: string;
}
