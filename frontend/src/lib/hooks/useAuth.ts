/**
 * Custom Authentication Hooks
 * 
 * WHY: Provides convenient and reusable hooks for authentication operations
 * across the application. Includes automatic session management, login/logout
 * handlers, and route protection utilities.
 * 
 * WHAT: Collection of React hooks that interface with the auth store to
 * provide authentication functionality with loading states, error handling,
 * and automatic redirects.
 */

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  useAuthStore, 
  useAuth as useAuthFromStore, 
  useAuthActions,
  useIsAuthenticated,
  useAuthInitializing 
} from '@/store/authStore';
import { authApi, LoginRequest, RegisterRequest } from '@/lib/api';

/**
 * Main authentication hook
 * Provides user data, auth state, and common auth actions
 */
export function useAuthHook() {
  const auth = useAuthFromStore();
  const actions = useAuthActions();
  
  return {
    ...auth,
    ...actions,
  };
}

/**
 * Login hook with mutation handling
 */
export function useLogin() {
  const { login, setError } = useAuthActions();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      setError(null);
      const response = await authApi.login(credentials);
      return response;
    },
    onSuccess: (response) => {
      login(response);
      toast.success(`¡Bienvenido ${response.user.first_name}!`);
      
      // Redirect to dashboard or intended page
      const redirectTo = sessionStorage.getItem('auth_redirect') || '/mi-cuenta';
      sessionStorage.removeItem('auth_redirect');
      router.push(redirectTo);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });
}

/**
 * Register hook with mutation handling
 */
export function useRegister() {
  const { setError } = useAuthActions();
  const router = useRouter();

  return useMutation({
    mutationFn: async (userData: RegisterRequest) => {
      setError(null);
      const response = await authApi.register(userData);
      return response;
    },
    onSuccess: () => {
      toast.success('¡Registro exitoso! Ahora puedes iniciar sesión.');
      router.push('/login');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al registrar usuario';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });
}

/**
 * Logout hook
 */
export function useLogout() {
  const { logout } = useAuthActions();
  const router = useRouter();

  return useCallback(async () => {
    try {
      // Call backend logout if needed
      // await authApi.logout();
    } catch (error) {
      // Ignore logout errors, still clear local state
      console.warn('Logout API call failed:', error);
    } finally {
      logout(false);
      toast.success('Sesión cerrada correctamente');
      router.push('/');
    }
  }, [logout, router]);
}

/**
 * Route protection hook
 * Automatically redirects unauthenticated users to login
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const isAuthenticated = useIsAuthenticated();
  const isInitializing = useAuthInitializing();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth initialization to complete
    if (isInitializing) return;

    // If not authenticated, store current path and redirect
    if (!isAuthenticated) {
      sessionStorage.setItem('auth_redirect', pathname);
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isInitializing, router, redirectTo, pathname]);

  return {
    isAuthenticated,
    isInitializing,
    isLoading: isInitializing,
  };
}

/**
 * Guest route hook
 * Redirects authenticated users away from auth pages
 */
export function useRequireGuest(redirectTo: string = '/mi-cuenta') {
  const isAuthenticated = useIsAuthenticated();
  const isInitializing = useAuthInitializing();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth initialization to complete
    if (isInitializing) return;

    // If authenticated, redirect away from guest-only pages
    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isInitializing, router, redirectTo]);

  return {
    isAuthenticated,
    isInitializing,
    isLoading: isInitializing,
  };
}

/**
 * Session check hook
 * Periodically verifies the session is still valid
 */
export function useSessionCheck(intervalMs: number = 5 * 60 * 1000) { // 5 minutes
  const { verifySession, refreshTokens, isTokenExpired, shouldRefreshToken } = useAuthStore();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = async () => {
      try {
        // If token is expired, try to refresh
        if (isTokenExpired()) {
          console.log('Token expired, refreshing...');
          await refreshTokens();
          return;
        }

        // If token should be refreshed soon, refresh it
        if (shouldRefreshToken()) {
          console.log('Token needs refresh, refreshing...');
          await refreshTokens();
          return;
        }

        // For periodic checks, only verify if it's been a while since last verification
        const lastVerification = localStorage.getItem('last_session_check');
        const shouldVerify = !lastVerification || (Date.now() - parseInt(lastVerification)) > 600000; // 10 minutes
        
        if (shouldVerify) {
          console.log('Verifying session...');
          const isValid = await verifySession();
          if (isValid) {
            localStorage.setItem('last_session_check', Date.now().toString());
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        // Don't logout on session check errors - let the user continue
      }
    };

    // Check immediately
    checkSession();

    // Set up periodic checks
    const interval = setInterval(checkSession, intervalMs);

    return () => clearInterval(interval);
  }, [isAuthenticated, intervalMs, verifySession, refreshTokens, isTokenExpired, shouldRefreshToken]);
}

/**
 * Profile update hook
 */
export function useUpdateProfile() {
  const { setUser, setError } = useAuthActions();

  return useMutation({
    mutationFn: async (userData: Parameters<typeof authApi.updateProfile>[0]) => {
      setError(null);
      const updatedUser = await authApi.updateProfile(userData);
      return updatedUser;
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      toast.success('Perfil actualizado correctamente');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al actualizar perfil';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });
}

/**
 * Password change hook
 */
export function useChangePassword() {
  const { setError } = useAuthActions();

  return useMutation({
    mutationFn: async (passwordData: Parameters<typeof authApi.changePassword>[0]) => {
      setError(null);
      const response = await authApi.changePassword(passwordData);
      return response;
    },
    onSuccess: () => {
      toast.success('Contraseña cambiada correctamente');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al cambiar contraseña';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });
}

/**
 * Auth initialization hook
 * Should be called once at app startup
 */
export function useAuthInit() {
  const { initializeAuth } = useAuthActions();
  const isInitializing = useAuthInitializing();

  useEffect(() => {
    // Initialize auth on app startup
    initializeAuth();
  }, [initializeAuth]);

  return { isInitializing };
}

// Export useAuth as an alias to useAuthHook for compatibility
export const useAuth = useAuthHook;