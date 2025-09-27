/**
 * Google OAuth Provider Component
 *
 * WHY: Provides Google OAuth context to the entire application using the
 * @react-oauth/google library. Centralizes Google OAuth configuration
 * and makes it available to all child components.
 *
 * WHAT: Wrapper component that initializes Google OAuth with client ID
 * and provides the Google OAuth context to the component tree.
 */

'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';

interface GoogleAuthProviderProps {
  children: ReactNode;
}

export function GoogleAuthProvider({ children }: GoogleAuthProviderProps) {
  // Get Google Client ID from environment
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // If no Google Client ID is configured, render children without OAuth
  if (!googleClientId) {
    console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID not configured. Google OAuth will be disabled.');
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  );
}

export default GoogleAuthProvider;