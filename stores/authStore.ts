import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  user_id: number;
  username: string;
  email: string;
  phone_number?: string;
  status: string;
  created_at: string;
}

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpiry: number | null;
  lastActivity: number | null;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateLastActivity: () => void;
  checkSessionExpiry: () => boolean;
  clearSession: () => void;
}

const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      sessionExpiry: null,
      lastActivity: null,

      // Actions
      login: (user: User) => {
        const now = Date.now();
        set({
          user,
          isAuthenticated: true,
          sessionExpiry: now + SESSION_TIMEOUT,
          lastActivity: now,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          sessionExpiry: null,
          lastActivity: null,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      updateLastActivity: () => {
        const now = Date.now();
        set({
          lastActivity: now,
          sessionExpiry: now + SESSION_TIMEOUT,
        });
      },

      checkSessionExpiry: () => {
        const { sessionExpiry, lastActivity } = get();
        const now = Date.now();

        // Check if session has expired
        if (sessionExpiry && now > sessionExpiry) {
          get().logout();
          return true; // Session expired
        }

        // Check if user has been inactive for too long
        if (lastActivity && (now - lastActivity) > SESSION_TIMEOUT) {
          get().logout();
          return true; // Session expired due to inactivity
        }

        return false; // Session is still valid
      },

      clearSession: () => {
        set({
          user: null,
          isAuthenticated: false,
          sessionExpiry: null,
          lastActivity: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionExpiry: state.sessionExpiry,
        lastActivity: state.lastActivity,
      }),
    }
  )
);

// Auto-logout timer
let sessionTimer: NodeJS.Timeout | null = null;

export const startSessionTimer = () => {
  // Clear existing timer
  if (sessionTimer) {
    clearInterval(sessionTimer);
  }

  // Start new timer that checks every 5 seconds
  sessionTimer = setInterval(() => {
    const { isAuthenticated, checkSessionExpiry } = useAuthStore.getState();
    
    if (isAuthenticated) {
      const expired = checkSessionExpiry();
      if (expired) {
        console.log('Session expired - auto logout');
        // You can add a notification here if needed
      }
    }
  }, 5000);
};

export const stopSessionTimer = () => {
  if (sessionTimer) {
    clearInterval(sessionTimer);
    sessionTimer = null;
  }
};
