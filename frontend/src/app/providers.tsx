'use client'

import dynamic from 'next/dynamic'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { GoogleAuthProvider } from '@/components/auth'

// Dynamic import for Toaster to reduce initial bundle size
const Toaster = dynamic(() => import('react-hot-toast').then(mod => ({ default: mod.Toaster })), {
  ssr: false
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1, // Reduce retries for faster builds
            gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleAuthProvider>
        <AuthProvider>
          <Toaster position="top-right" />
          {children}
        </AuthProvider>
      </GoogleAuthProvider>
    </QueryClientProvider>
  )
}