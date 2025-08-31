import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from './redux';
import { googleAuth } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

// Define types without global declaration to avoid conflicts
interface GoogleInitConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: string | number;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface GoogleAccounts {
  id: {
    initialize: (config: GoogleInitConfig) => void;
    renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void;
    prompt: () => void;
  };
}

interface GoogleApi {
  accounts: GoogleAccounts;
}

// Use type assertion instead of global declaration
declare const google: GoogleApi;

export const useGoogleAuth = (mode: 'login' | 'signup' = 'login', remember: boolean = true) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleGoogleResponse = useCallback(async (response: GoogleCredentialResponse) => {
    try {
      await dispatch(googleAuth({ credential: response.credential, mode, remember })).unwrap();
      toast.success('Google authentication successful!');
      navigate('/dashboard');
    } catch (error) {
      if (mode === 'login') {
        toast.error('No account found with this email. Please sign up first.');
      } else {
        toast.error('Google authentication failed');
      }
    }
  }, [dispatch, navigate, mode]);

  const initializeGoogleAuth = useCallback(() => {
    // Use type assertion to access google from window
    const googleApi = (window as any).google as GoogleApi | undefined;
    
    if (googleApi?.accounts?.id) {
      googleApi.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    }
  }, [handleGoogleResponse]);

  const renderGoogleButton = useCallback((
    element: HTMLElement | null, 
    config: GoogleButtonConfig = {}
  ) => {
    // Use type assertion to access google from window
    const googleApi = (window as any).google as GoogleApi | undefined;
    
    if (element && googleApi?.accounts?.id) {
      googleApi.accounts.id.renderButton(element, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 280, // Use number instead of string for width
        ...config,
      });
    }
  }, []);

  return {
    initializeGoogleAuth,
    renderGoogleButton,
  };
};