import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { useAppSelector, useAppDispatch } from './hooks/redux';
import { initializeAuth } from './store/slices/authSlice';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import { useTheme } from './hooks/useTheme';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { theme } = useTheme();
  const { isInitializing } = useAppSelector((state) => state.auth as any);

  React.useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <div className={`min-h-screen ${theme}`}>
      {isInitializing ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="loader mb-4" />
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        </div>
      ) : (
        <Router>
          <Routes>
            {/* Public routes */}
            <Route
              path="/signin"
              element={!isAuthenticated ? <SignIn /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="/signup"
              element={!isAuthenticated ? <SignUp /> : <Navigate to="/dashboard" replace />}
            />

            {/* Protected route */}
            <Route
              path="/dashboard"
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/signin" replace />}
            />

            {/* Default redirect */}
            <Route
              path="/"
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/signin"} replace />}
            />

            {/* Catch all */}
            <Route
              path="*"
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/signin"} replace />}
            />
          </Routes>
        </Router>
      )}

      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#374151' : '#FFFFFF',
            color: theme === 'dark' ? '#F9FAFB' : '#111827',
            border: theme === 'dark' ? '1px solid #4B5563' : '1px solid #E5E7EB',
          },
        }}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
