import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch } from '../hooks/redux';
import { googleAuth } from '../store/slices/authSlice';

interface GoogleSignInButtonProps {
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  className?: string;
  mode?: 'login' | 'signup';
  remember?: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  text = 'continue_with',
  theme = 'outline',
  size = 'large',
  className = '',
  mode = 'login',
  remember = true,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRendered, setHasRendered] = useState(false);
  const [fallbackClicked, setFallbackClicked] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleGoogleResponse = async (response: any) => {
    try {
      await dispatch(googleAuth({ credential: response.credential, mode, remember })).unwrap();
      toast.success('Google authentication successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Auth error:', error);
      if (mode === 'login') {
        toast.error('No account found with this email. Please sign up first.');
      } else {
        toast.error('Google authentication failed');
      }
    }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError('Google Client ID not found in environment variables');
      setIsLoading(false);
      return;
    }

    const initializeGoogle = () => {
      // Use type assertion to access google API
      const googleApi = (window as any).google;
      
      if (!googleApi?.accounts?.id) {
        setError('Google Identity Services not loaded');
        setIsLoading(false);
        return;
      }

      try {
        // Clear previous content
        if (buttonRef.current) {
          buttonRef.current.innerHTML = '';
        }

        // Initialize Google Sign-In
        googleApi.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the button
        if (buttonRef.current) {
          googleApi.accounts.id.renderButton(buttonRef.current, {
            text,
            theme,
            size,
            shape: 'rectangular',
            logo_alignment: 'left',
            width: '100%',
          });

          setTimeout(() => {
            const child = buttonRef.current?.firstElementChild as HTMLElement | null;
            const hasContent = (buttonRef.current?.innerHTML.length || 0) > 0;
            const hasChildren = (buttonRef.current?.children.length || 0) > 0;
            const rendered = !!(hasContent || hasChildren);

            if (child) {
              child.style.width = '100%';
              child.style.maxWidth = '100%';
              child.style.display = 'block';
              child.style.boxSizing = 'border-box';
            }

            if (rendered) {
              setHasRendered(true);
            } else {
              setHasRendered(false);
              setError(null);
            }
          }, 200);
        }

        setIsLoading(false);
        setError(null);

      } catch (err: any) {
        console.error('❌ Initialization error:', err);
        setError(`Initialization failed: ${err.message}`);
        setIsLoading(false);
      }
    };

    // Check if Google SDK is already loaded
    const googleApi = (window as any).google;
    if (googleApi?.accounts?.id) {
      setTimeout(initializeGoogle, 100);
    } else {
      
      // Poll for Google SDK availability
      let attempts = 0;
      const maxAttempts = 30;
      
      const checkInterval = setInterval(() => {
        attempts++;
        const currentGoogleApi = (window as any).google;
        
        if (currentGoogleApi?.accounts?.id) {
          clearInterval(checkInterval);
          initializeGoogle();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          setError('Google Identity Services failed to load within 15 seconds');
          setIsLoading(false);
          console.error('❌ Timeout waiting for Google SDK');
        }
      }, 500);

      return () => clearInterval(checkInterval);
    }
  }, [text, theme, size, mode]);

  return (
    <div className={`w-full ${className}`}>
      {/* Loading State */}
      {isLoading && (
        <div className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading Google Sign-In...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="w-full p-3 border border-red-300 rounded-lg bg-red-50 text-center">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Google Button Container */}
      {!isLoading && !error && (
        <div
          ref={buttonRef}
          className="w-full flex justify-center"
          style={{ minHeight: 44 }}
        />
      )}

      {/* Fallback native button when SDK-rendered button is not available */}
  {!isLoading && !hasRendered && !fallbackClicked && (
        <div className="w-full flex justify-center">
          <button
            type="button"
    onClick={() => {
      setFallbackClicked(true);
              const googleApi = (window as any).google;
              if (!googleApi?.accounts?.id) {
                setError('Google Identity Services not loaded');
                return;
              }

              try {
                // Try to render again and then prompt
                if (buttonRef.current) {
                  googleApi.accounts.id.renderButton(buttonRef.current, {
                    text,
                    theme,
                    size,
                    shape: 'rectangular',
                    logo_alignment: 'left',
                    width: '100%',
                  });

                  setTimeout(() => {
                    const child = buttonRef.current?.firstElementChild as HTMLElement | null;
                    if (child) {
                      child.style.width = '100%';
                      child.style.maxWidth = '100%';
                      child.style.display = 'block';
                      child.style.boxSizing = 'border-box';
                    }
                  }, 100);
                }

                // Prompt chooser (this will show the account chooser / One Tap)
                if (typeof googleApi.accounts.id.prompt === 'function') {
                  googleApi.accounts.id.prompt();
                }
              } catch (err: any) {
                console.error('❌ Fallback trigger failed:', err);
                setError('Failed to trigger Google Sign-In');
              }
            }}
            className="btn-secondary w-full flex items-center justify-center"
          >
            Continue with Google
          </button>
        </div>
      )}
    </div>
  );
};

export default GoogleSignInButton;