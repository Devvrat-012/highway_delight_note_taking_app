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
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  title: string;
  content?: string;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
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

// Theme types
export type Theme = 'light' | 'dark';

// Google OAuth types
export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}
