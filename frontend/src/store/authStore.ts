/**
 * Zustand Auth Store
 * 
 * WHY: Centralized authentication state management with persistent storage
 * and automatic token refresh handling. Provides reactive state for user
 * authentication status across the entire application.
 * 
 * WHAT: Authentication state store with user data, token management,
 * automatic session verification, and secure localStorage synchronization.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { User, authApi, AuthResponse } from '@/lib/api';

interface AuthState {
  // Authentication data
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  // Loading states
  isLoading: boolean;
  isInitializing: boolean;
  isRefreshing: boolean;
  
  // Error state
  error: string | null;
  
  // Session info
  expiresAt: number | null;
  
  // Actions
  login: (response: AuthResponse) => void;
  logout: (redirect?: boolean) => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  setLoading: (loading: boolean) => void;
  setInitializing: (initializing: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setError: (error: string | null) => void;
  
  // Session management
  initializeAuth: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  verifySession: () => Promise<boolean>;
  isTokenExpired: () => boolean;
  shouldRefreshToken: () => boolean;
  
  // Utilities
  reset: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // Refresh 5 minutes before expiry

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: true,
      isRefreshing: false,
      error: null,
      expiresAt: null,

      // Basic setters
      login: (response: AuthResponse) => set((state) => {
        state.user = response.user;
        state.accessToken = response.access_token;
        state.refreshToken = response.refresh_token;
        state.isAuthenticated = true;
        state.expiresAt = Date.now() + (response.expires_in * 1000);
        state.error = null;
        
        // Update localStorage for backward compatibility
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
          localStorage.setItem('user_data', JSON.stringify(response.user));
        }
      }),

      logout: (redirect = true) => set((state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.expiresAt = null;
        state.error = null;
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          
          // Redirect to login if requested
          if (redirect) {
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
              window.location.href = '/login';
            }
          }
        }
      }),

      setUser: (user: User) => set((state) => {
        state.user = user;
        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_data', JSON.stringify(user));
        }
      }),

      setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => set((state) => {
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.expiresAt = Date.now() + (expiresIn * 1000);
        
        // Update localStorage and mark login time
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
          localStorage.setItem('last_login_time', Date.now().toString());
        }
      }),

      setLoading: (loading: boolean) => set((state) => {
        state.isLoading = loading;
      }),

      setInitializing: (initializing: boolean) => set((state) => {
        state.isInitializing = initializing;
      }),

      setRefreshing: (refreshing: boolean) => set((state) => {
        state.isRefreshing = refreshing;
      }),

      setError: (error: string | null) => set((state) => {
        state.error = error;
      }),

      // Session management
      initializeAuth: async () => {
        const state = get();
        state.setInitializing(true);
        state.setError(null);

        try {
          // Check for stored tokens
          if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem('auth_token');
            const storedRefreshToken = localStorage.getItem('refresh_token');
            const storedUserData = localStorage.getItem('user_data');

            if (storedToken && storedRefreshToken && storedUserData) {
              // Restore from localStorage
              set((state) => {
                state.accessToken = storedToken;
                state.refreshToken = storedRefreshToken;
                state.user = JSON.parse(storedUserData);
                state.isAuthenticated = true;
                // Assume token expires in 15 minutes if not stored
                state.expiresAt = Date.now() + (15 * 60 * 1000);
              });

              // Skip verification if we just logged in (token is fresh)
              const lastLogin = localStorage.getItem('last_login_time');
              const isRecentLogin = lastLogin && (Date.now() - parseInt(lastLogin)) < 30000; // 30 seconds
              
              if (!isRecentLogin) {
                // Only verify session if it's not a recent login
                const isValid = await state.verifySession();
                if (!isValid) {
                  // Try to refresh tokens
                  const refreshed = await state.refreshTokens();
                  if (!refreshed) {
                    state.logout(false);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          state.setError('Error al inicializar autenticación');
          state.logout(false);
        } finally {
          state.setInitializing(false);
        }
      },

      refreshTokens: async () => {
        const state = get();
        if (!state.refreshToken || state.isRefreshing) {
          return false;
        }

        state.setRefreshing(true);
        state.setError(null);

        try {
          const response = await authApi.refreshToken({
            refresh_token: state.refreshToken,
          });

          state.setTokens(
            response.access_token,
            response.refresh_token,
            response.expires_in
          );

          // Update user data if provided
          if (response.user) {
            state.setUser(response.user);
          }

          return true;
        } catch (error) {
          console.error('Token refresh error:', error);
          state.setError('Sesión expirada');
          state.logout(true);
          return false;
        } finally {
          state.setRefreshing(false);
        }
      },

      verifySession: async () => {
        const state = get();
        if (!state.accessToken) {
          return false;
        }

        try {
          const user = await authApi.getProfile();
          state.setUser(user);
          return true;
        } catch (error) {
          console.error('Session verification error:', error);
          return false;
        }
      },

      isTokenExpired: () => {
        const state = get();
        if (!state.expiresAt) return true;
        return Date.now() >= state.expiresAt;
      },

      shouldRefreshToken: () => {
        const state = get();
        if (!state.expiresAt) return false;
        return Date.now() >= (state.expiresAt - TOKEN_REFRESH_BUFFER);
      },

      // Utilities
      reset: () => set((state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.isInitializing = false;
        state.isRefreshing = false;
        state.error = null;
        state.expiresAt = null;
      }),

      getAuthHeaders: () => {
        const state = get();
        if (!state.accessToken) return {};
        return {
          'Authorization': `Bearer ${state.accessToken}`,
        };
      },
    })),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        expiresAt: state.expiresAt,
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle migration if needed in future versions
        if (version < 1) {
          return {
            ...persistedState,
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            expiresAt: null,
          };
        }
        return persistedState;
      },
    }
  )
);

/**
 * Auth Store Selectors
 * WHY: Optimized selectors to prevent unnecessary re-renders
 */
export const useAuth = () => useAuthStore(state => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  isInitializing: state.isInitializing,
  isRefreshing: state.isRefreshing,
  error: state.error,
}));

export const useAuthActions = () => useAuthStore(state => ({
  login: state.login,
  logout: state.logout,
  setUser: state.setUser,
  setLoading: state.setLoading,
  setError: state.setError,
  initializeAuth: state.initializeAuth,
  refreshTokens: state.refreshTokens,
  verifySession: state.verifySession,
}));

export const useAuthTokens = () => useAuthStore(state => ({
  accessToken: state.accessToken,
  refreshToken: state.refreshToken,
  expiresAt: state.expiresAt,
  isTokenExpired: state.isTokenExpired(),
  shouldRefreshToken: state.shouldRefreshToken(),
  getAuthHeaders: state.getAuthHeaders(),
}));

export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);
export const useAuthInitializing = () => useAuthStore(state => state.isInitializing);