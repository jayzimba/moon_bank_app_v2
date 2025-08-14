import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore, startSessionTimer, stopSessionTimer } from '@/stores/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, updateLastActivity, checkSessionExpiry } = useAuthStore();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Start session timer when component mounts
    startSessionTimer();

    // Cleanup timer when component unmounts
    return () => {
      stopSessionTimer();
    };
  }, []);

  useEffect(() => {
    // Handle app state changes (foreground/background)
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        if (isAuthenticated) {
          // Check if session is still valid
          const expired = checkSessionExpiry();
          if (!expired) {
            // Update last activity when app becomes active
            updateLastActivity();
          }
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [isAuthenticated, checkSessionExpiry, updateLastActivity]);

  return <>{children}</>;
}
