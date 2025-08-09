/**
 * Auth Provider Component
 * 
 * WHY: Initializes authentication state on app startup and sets up
 * the auth store reference for API interceptors. Provides session
 * monitoring and automatic token refresh handling.
 * 
 * WHAT: React component that wraps the application to provide
 * authentication initialization, session checks, and cleanup.
 */

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAuthInit, useSessionCheck } from '@/lib/hooks/useAuth';
import { setAuthStoreRef } from '@/lib/api';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Initialize auth state
  const { isInitializing } = useAuthInit();
  
  // Set up periodic session checks for authenticated users
  useSessionCheck(5 * 60 * 1000); // Check every 5 minutes
  
  // Set up auth store reference for API interceptors
  useEffect(() => {
    setAuthStoreRef(useAuthStore);
  }, []);

  // Provide loading UI while auth is initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">g</span>
            </div>
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full animate-ping"></div>
          </div>
          <div className="text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}