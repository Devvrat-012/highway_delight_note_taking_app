import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './redux';
import { updateSystemTheme } from '../store/slices/themeSlice';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const { theme, isSystemTheme } = useAppSelector((state) => state.theme);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (isSystemTheme) dispatch(updateSystemTheme());
    };

    // If we're using system theme, sync immediately and then listen for changes
    if (isSystemTheme) {
      dispatch(updateSystemTheme());

      // Prefer modern addEventListener, fall back to addListener for older browsers
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else if (typeof (mediaQuery as any).addListener === 'function') {
        (mediaQuery as any).addListener(handleChange);
        return () => (mediaQuery as any).removeListener(handleChange);
      }
    }
  }, [isSystemTheme, dispatch]);

  return { theme, isSystemTheme };
};
