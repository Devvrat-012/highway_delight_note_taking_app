import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ThemeState, Theme } from '../../types';

// Get system theme preference
const getSystemTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// Get saved theme from localStorage or use system preference
const getSavedTheme = (): { theme: Theme; isSystemTheme: boolean } => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const isSystemTheme = localStorage.getItem('isSystemTheme') === 'true';
    
    if (savedTheme && !isSystemTheme) {
      return { theme: savedTheme, isSystemTheme: false };
    }
  }
  
  return { theme: getSystemTheme(), isSystemTheme: true };
};

const { theme: initialTheme, isSystemTheme: initialIsSystemTheme } = getSavedTheme();

const initialState: ThemeState = {
  theme: initialTheme,
  isSystemTheme: initialIsSystemTheme,
};

// Apply theme to document
const applyTheme = (theme: Theme) => {
  if (typeof window !== 'undefined') {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }
};

// Apply initial theme
applyTheme(initialTheme);

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      state.isSystemTheme = false;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
        localStorage.setItem('isSystemTheme', 'false');
      }
      
      // Apply theme
      applyTheme(action.payload);
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      state.isSystemTheme = false;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme);
        localStorage.setItem('isSystemTheme', 'false');
      }
      
      // Apply theme
      applyTheme(newTheme);
    },
    useSystemTheme: (state) => {
      const systemTheme = getSystemTheme();
      state.theme = systemTheme;
      state.isSystemTheme = true;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('isSystemTheme', 'true');
        localStorage.removeItem('theme');
      }
      
      // Apply theme
      applyTheme(systemTheme);
    },
    updateSystemTheme: (state) => {
      if (state.isSystemTheme) {
        const systemTheme = getSystemTheme();
        state.theme = systemTheme;
        applyTheme(systemTheme);
      }
    },
  },
});

export const { setTheme, toggleTheme, useSystemTheme, updateSystemTheme } = themeSlice.actions;
export default themeSlice.reducer;
