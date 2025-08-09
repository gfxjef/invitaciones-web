/**
 * Auth Debugger Component (Development Only)
 * 
 * WHY: Provides debugging information about the current authentication state
 * during development. Shows token status, user data, and allows manual
 * testing of authentication flows.
 * 
 * WHAT: Debug component displaying auth store state with manual controls
 * for logout, refresh tokens, and session verification.
 */

'use client';

import { useState } from 'react';
import { useAuth, useAuthActions, useAuthTokens } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { RefreshCw, LogOut, CheckCircle, XCircle, User, Clock } from 'lucide-react';

interface AuthDebuggerProps {
  showInProduction?: boolean;
}

export function AuthDebugger({ showInProduction = false }: AuthDebuggerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, isAuthenticated, isLoading, isInitializing, isRefreshing, error } = useAuth();
  const { logout, refreshTokens, verifySession } = useAuthActions();
  const { accessToken, refreshToken, expiresAt, isTokenExpired, shouldRefreshToken } = useAuthTokens();

  // Don't show in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const handleRefreshTokens = async () => {
    try {
      await refreshTokens();
    } catch (error) {
      console.error('Manual token refresh failed:', error);
    }
  };

  const handleVerifySession = async () => {
    try {
      await verifySession();
    } catch (error) {
      console.error('Manual session verification failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isExpanded ? (
        <Button
          onClick={() => setIsExpanded(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-full w-12 h-12 p-0"
          title="Auth Debug"
        >
          <User className="w-5 h-5" />
        </Button>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Auth Debug</h3>
            <Button
              onClick={() => setIsExpanded(false)}
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>

          {/* Authentication Status */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Authenticated:</span>
              <div className="flex items-center gap-1">
                {isAuthenticated ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-xs ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  {isAuthenticated ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Loading:</span>
              <span className={`text-xs ${isLoading ? 'text-yellow-600' : 'text-gray-400'}`}>
                {isLoading ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Initializing:</span>
              <span className={`text-xs ${isInitializing ? 'text-yellow-600' : 'text-gray-400'}`}>
                {isInitializing ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Refreshing:</span>
              <span className={`text-xs ${isRefreshing ? 'text-blue-600' : 'text-gray-400'}`}>
                {isRefreshing ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {/* User Data */}
          {user && (
            <div className="mb-4 p-2 bg-gray-50 rounded">
              <h4 className="text-sm font-medium text-gray-900 mb-1">User:</h4>
              <p className="text-xs text-gray-600">{user.first_name} {user.last_name}</p>
              <p className="text-xs text-gray-600">{user.email}</p>
              <p className="text-xs text-gray-600">Role: {user.role}</p>
            </div>
          )}

          {/* Token Status */}
          <div className="mb-4 p-2 bg-gray-50 rounded">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Tokens:</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Has Access:</span>
                <span className={`text-xs ${accessToken ? 'text-green-600' : 'text-red-600'}`}>
                  {accessToken ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Has Refresh:</span>
                <span className={`text-xs ${refreshToken ? 'text-green-600' : 'text-red-600'}`}>
                  {refreshToken ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Expired:</span>
                <span className={`text-xs ${isTokenExpired ? 'text-red-600' : 'text-green-600'}`}>
                  {isTokenExpired ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Should Refresh:</span>
                <span className={`text-xs ${shouldRefreshToken ? 'text-yellow-600' : 'text-green-600'}`}>
                  {shouldRefreshToken ? 'Yes' : 'No'}
                </span>
              </div>
              
              <p className="text-xs text-gray-500">
                Expires: {formatDate(expiresAt)}
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded">
              <h4 className="text-sm font-medium text-red-900 mb-1">Error:</h4>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {isAuthenticated && (
              <>
                <Button
                  onClick={handleRefreshTokens}
                  disabled={isRefreshing}
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh Tokens
                </Button>

                <Button
                  onClick={handleVerifySession}
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verify Session
                </Button>

                <Button
                  onClick={handleLogout}
                  size="sm"
                  variant="destructive"
                  className="w-full text-xs"
                >
                  <LogOut className="w-3 h-3 mr-1" />
                  Logout
                </Button>
              </>
            )}

            <div className="text-xs text-gray-400 text-center pt-2">
              <Clock className="w-3 h-3 inline mr-1" />
              Debug Mode
            </div>
          </div>
        </div>
      )}
    </div>
  );
}