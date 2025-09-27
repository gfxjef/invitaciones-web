/**
 * Google Login Button Component
 *
 * WHY: Provides a reusable Google OAuth login button that integrates
 * with the existing authentication system. Handles Google OAuth flow
 * and communicates with the backend for token verification.
 *
 * WHAT: Button component that triggers Google OAuth, sends credentials
 * to the backend for verification, and handles successful authentication
 * using the existing auth hooks and store.
 */

'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAuthActions } from '@/store/authStore';
import { authApi } from '@/lib/api';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  fullWidth?: boolean;
  text?: string;
}

interface GoogleOAuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
    provider: string;
    role: string;
    is_active: boolean;
    email_verified: boolean;
    created_at: string;
  };
  expires_in: number;
}

export function GoogleLoginButton({
  onSuccess,
  onError,
  disabled = false,
  variant = 'outline',
  size = 'default',
  fullWidth = false,
  text = 'Continuar con Google'
}: GoogleLoginButtonProps) {
  const { login, setError } = useAuthActions();
  const router = useRouter();

  // Google OAuth verification mutation
  const googleAuthMutation = useMutation({
    mutationFn: async (credential: string): Promise<GoogleOAuthResponse> => {
      const response = await authApi.verifyGoogleToken({ credential });
      return response;
    },
    onSuccess: (data) => {
      // Use existing login action to store tokens and user data
      login(data);
      toast.success(`¡Bienvenido ${data.user.first_name}!`);

      // Redirect to dashboard or intended page (same logic as useLogin)
      const redirectTo = sessionStorage.getItem('auth_redirect') || '/mi-cuenta';
      sessionStorage.removeItem('auth_redirect');
      router.push(redirectTo);

      // Execute optional success callback
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión con Google';
      setError(errorMessage);
      toast.error(errorMessage);
      onError?.(error);
    },
  });

  // Handle Google credential response
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (credentialResponse.credential) {
        await googleAuthMutation.mutateAsync(credentialResponse.credential);
      } else {
        throw new Error('No credential received from Google');
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      onError?.(error);
    }
  };

  // Handle Google OAuth errors
  const handleGoogleError = () => {
    console.error('Google OAuth failed');
    const errorMessage = 'Error al conectar con Google. Por favor intenta de nuevo.';
    setError(errorMessage);
    toast.error(errorMessage);
    onError?.('Google OAuth failed');
  };

  const isLoading = googleAuthMutation.isPending;

  // Show loading state with custom button if mutation is pending
  if (isLoading) {
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled
        className={`
          ${fullWidth ? 'w-full' : ''}
          flex items-center justify-center gap-3
          border border-gray-300
          bg-gray-50 text-gray-500
        `}
      >
        <LoadingSpinner size="sm" className="text-gray-600" />
        <span className="text-sm font-medium">Conectando...</span>
      </Button>
    );
  }

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        text="continue_with"
        shape="rectangular"
        theme="outline"
        size="large"
        width={fullWidth ? '100%' : undefined}
        locale="es"
      />
    </div>
  );
}

export default GoogleLoginButton;