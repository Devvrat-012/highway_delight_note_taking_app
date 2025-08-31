import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Sun, Moon, Monitor, Calendar } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { signup, verifyOtp, sendOtp, clearError } from '../store/slices/authSlice';
import { setTheme, useSystemTheme } from '../store/slices/themeSlice';
import { useTheme } from '../hooks/useTheme';
import Logo from '../components/Logo';
import GoogleSignInButton from '../components/GoogleSignInButton';

// Validation schemas
const signupSchema = yup.object({
  email: yup
    .string()
    .email('Please provide a valid email address')
    .required('Email is required'),
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .required('Name is required'),
  dateOfBirth: yup
    .string()
    .required('Date of birth is required')
    .test('is-date', 'Please enter a valid date', (val) => {
      if (!val) return false;
      const d = new Date(val);
      return !Number.isNaN(d.getTime());
    })
    .test('not-in-future', 'Date of birth cannot be in the future', (val) => {
      if (!val) return false;
      const d = new Date(val);
      const now = new Date();
      // compare only date portion
      return d.setHours(0, 0, 0, 0) <= now.setHours(0, 0, 0, 0);
    }),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional(),
});

const otpSchema = yup.object({
  otp: yup
    .string()
    .length(6, 'OTP must be 6 digits')
    .matches(/^\d+$/, 'OTP must contain only numbers')
    .required('OTP is required'),
});

const SignUp: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { theme, isSystemTheme } = useTheme();

  const [isOtpMode, setIsOtpMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signupData, setSignupData] = useState<any>(null);

  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: signupErrors },
    setValue,
  } = useForm({
    resolver: yupResolver(signupSchema),
  });

  // today's date in YYYY-MM-DD for input max
  const today = new Date().toISOString().split('T')[0];

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

  const onSignupSubmit = async (data: any) => {
    try {
      await dispatch(signup(data)).unwrap();
      setSignupData(data);
      setIsOtpMode(true);
      toast.success('Please check your email for verification code');
    } catch (err) {
      // Error is handled by the useEffect above
    }
  };

  const onOtpSubmit = async (data: any) => {
    try {
      await dispatch(verifyOtp({
        email: signupData?.email || '',
        otp: data.otp,
        type: 'SIGNUP',
        remember: true,
      })).unwrap();
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the useEffect above
    }
  };

  const handleResendOtp = async (email?: string) => {
    const targetEmail = email || signupData?.email;
    if (!targetEmail) {
      toast.error('Email not available to resend OTP');
      return;
    }

    try {
      await dispatch(sendOtp(targetEmail)).unwrap();
      toast.success('OTP resent to your email');
    } catch (err) {
      // Error handled by useEffect
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sign up</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Sign up to enjoy the feature of HD
            </p>
          </div>

          {/* Theme Toggle */}
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setThemeHandler('light')}
              className={`p-2 rounded-lg transition-colors ${(theme === 'light' && !isSystemTheme) ? 'bg-primary-100 text-primary-600' : 'text-gray-600 dark:text-gray-400'
                }`}
            >
              <Sun size={16} />
            </button>
            <button
              onClick={() => setThemeHandler('dark')}
              className={`p-2 rounded-lg transition-colors ${(theme === 'dark' && !isSystemTheme) ? 'bg-primary-100 text-primary-600' : 'text-gray-600 dark:text-gray-400'
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
            /* Signup Form */
            <form onSubmit={handleSubmitSignup(onSignupSubmit)} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  {...registerSignup('name')}
                  type="text"
                  className="input-field"
                  placeholder="Jonas Khanwald"
                />
                {signupErrors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {signupErrors.name.message}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  {/* Use native date input; open picker on focus or calendar icon click when supported */}
                  <input
                    {...registerSignup('dateOfBirth')}
                    type="date"
                    className="input-field pr-12"
                    max={today}
                    onFocus={(e) => {
                      const target = e.target as HTMLInputElement & { showPicker?: () => void };
                      // modern browsers have showPicker
                      if (typeof target.showPicker === 'function') {
                        try { target.showPicker(); } catch (e) { /* ignore */ }
                      }
                    }}
                    onChange={(e) => setValue('dateOfBirth', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = (e.currentTarget.parentElement as HTMLElement)?.querySelector('input[type="date"]') as HTMLInputElement & { showPicker?: () => void } | null;
                      if (input) {
                        input.focus();
                        if (typeof input.showPicker === 'function') {
                          try { input.showPicker(); } catch (err) { /* ignore */ }
                        }
                      }
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                    aria-label="Open calendar"
                  >
                    <Calendar size={20} />
                  </button>
                </div>
                {signupErrors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {signupErrors.dateOfBirth.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  {...registerSignup('email')}
                  type="email"
                  className="input-field"
                  placeholder="jonas_kahnwald@gmail.com"
                />
                {signupErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {signupErrors.email.message}
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
                    {...registerSignup('password')}
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
                {signupErrors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {signupErrors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Creating Account...
                    </>
                  ) : (
                    'Get OTP'
                  )}
                </button>
                <div className="flex items-center space-x-2">
                  <hr className="flex-1 border-gray-300 dark:border-gray-600" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
                  <hr className="flex-1 border-gray-300 dark:border-gray-600" />
                </div>

                <GoogleSignInButton text="signup_with" mode="signup" remember={true} />
              </div>
            </form>
          ) : (
            /* OTP Verification Form */
            <form onSubmit={handleSubmitOtp(onOtpSubmit)} className="space-y-6">
              {/* Email (pre-filled) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={signupData?.email || ''}
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
                <button
                  type="button"
                  onClick={() => handleResendOtp(signupData?.email)}
                  className="text-primary-600 pt-5 hover:text-primary-700 text-sm w-full text-center"
                >
                  Resend OTP
                </button>
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
                    'Sign up'
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
                  Back to Form
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/signin"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
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
          <h3 className="text-3xl font-bold">Join Highway Delight!</h3>
          <p className="text-lg text-blue-100 max-w-md">
            Create your account and start organizing your thoughts with our beautiful note-taking experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
