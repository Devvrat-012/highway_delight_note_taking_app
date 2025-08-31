import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Sun, Moon, Monitor } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { login, sendOtp, verifyOtp, clearError } from '../store/slices/authSlice';
import { setTheme, useSystemTheme } from '../store/slices/themeSlice';
import { useTheme } from '../hooks/useTheme';
import Logo from '../components/Logo';
import GoogleSignInButton from '../components/GoogleSignInButton';

// Validation schemas
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please provide a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .optional(),
});

const otpSchema = yup.object({
  otp: yup
    .string()
    .length(6, 'OTP must be 6 digits')
    .matches(/^\d+$/, 'OTP must contain only numbers')
    .required('OTP is required'),
});

const SignIn: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { theme, isSystemTheme } = useTheme();
  
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [remember, setRemember] = useState(true);

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors }
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
    reset: resetOtp,
  } = useForm({
    resolver: yupResolver(otpSchema),
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onLoginSubmit = async (data: any) => {
    try {
  await dispatch(login({ ...data, remember })).unwrap();
      toast.success('Login successful!');
    } catch (err) {
      // Error is handled by the useEffect above
    }
  };

  const onOtpSubmit = async (data: any) => {
    try {
      await dispatch(verifyOtp({
        email: otpEmail,
        otp: data.otp,
        type: 'LOGIN',
        remember,
      })).unwrap();
      toast.success('Login successful!');
    } catch (err) {
      // Error is handled by the useEffect above
    }
  };

  const handleSendOtp = async (email: string) => {
    try {
      await dispatch(sendOtp(email)).unwrap();
      setOtpEmail(email);
      setIsOtpMode(true);
      toast.success('OTP sent to your email!');
    } catch (err) {
      // Error is handled by the useEffect above
    }
  };

  const setThemeHandler = (newTheme: 'light' | 'dark' | 'system') => {
    if (newTheme === 'system') {
      dispatch(useSystemTheme());
    } else {
      dispatch(setTheme(newTheme));
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Logo className="text-primary-600" width={47} height={32} />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Highway Delight</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sign in</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please login to continue to your account.
            </p>
          </div>

          {/* Theme Toggle */}
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setThemeHandler('light')}
              className={`p-2 rounded-lg transition-colors ${
                (theme === 'light' && !isSystemTheme) ? 'bg-primary-100 text-primary-600' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Sun size={16} />
            </button>
            <button
              onClick={() => setThemeHandler('dark')}
              className={`p-2 rounded-lg transition-colors ${
                (theme === 'dark' && !isSystemTheme) ? 'bg-primary-100 text-primary-600' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Moon size={16} />
            </button>
            <button
              onClick={() => setThemeHandler('system')}
              className={`p-2 rounded-lg transition-colors ${isSystemTheme ? 'bg-primary-100 text-primary-600' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <Monitor size={16} />
            </button>
          </div>

          {!isOtpMode ? (
            /* Login Form */
            <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  {...registerLogin('email')}
                  type="email"
                  className="input-field"
                  placeholder="jonas_kahnwald@gmail.com"
                />
                {loginErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {loginErrors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...registerLogin('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {loginErrors.password.message}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <hr className="flex-1 border-gray-300 dark:border-gray-600" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
                  <hr className="flex-1 border-gray-300 dark:border-gray-600" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const email = document.querySelector('input[type="email"]') as HTMLInputElement;
                    if (email?.value) {
                      handleSendOtp(email.value);
                    } else {
                      toast.error('Please enter your email first');
                    }
                  }}
                  className="btn-secondary w-full"
                >
                  Send OTP
                </button>

                <div className="flex items-center mt-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">Keep me signed in</label>
                </div>

                <div className="flex items-center space-x-2">
                  <hr className="flex-1 border-gray-300 dark:border-gray-600" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
                  <hr className="flex-1 border-gray-300 dark:border-gray-600" />
                </div>

                <GoogleSignInButton text="signin_with" mode="login" remember={remember} />
              </div>
            </form>
          ) : (
            /* OTP Form */
            <form onSubmit={handleSubmitOtp(onOtpSubmit)} className="space-y-6">
              {/* Email (pre-filled) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={otpEmail}
                  className="input-field"
                  readOnly
                />
              </div>

              {/* OTP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  OTP
                </label>
                <input
                  {...registerOtp('otp')}
                  type="text"
                  className="input-field text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
                {otpErrors.otp && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {otpErrors.otp.message}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Verifying...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOtpMode(false);
                    resetOtp();
                  }}
                  className="btn-secondary w-full"
                >
                  Back to Password
                </button>

                <button
                  type="button"
                  onClick={() => handleSendOtp(otpEmail)}
                  className="text-primary-600 hover:text-primary-700 text-sm w-full text-center"
                >
                  Resend OTP
                </button>
                <div className="text-xs text-gray-500 mt-1">Remember: {remember ? 'Yes' : 'No'}</div>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need an account?{' '}
              <Link
                to="/signup"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 to-primary-700 items-center justify-center p-8">
        <div className="text-center text-white space-y-6">
          <div className="w-32 h-32 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-8">
            <Logo className="text-white" width={64} height={43} />
          </div>
          <h3 className="text-3xl font-bold">Welcome Back!</h3>
          <p className="text-lg text-blue-100 max-w-md">
            Sign in to access your notes and continue your journey with Highway Delight.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
