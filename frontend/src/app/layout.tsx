import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Navigation from '@/components/ui/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Invitaciones Digitales para tu Boda',
  description: 'Crea invitaciones digitales únicas y personalizadas para tu boda. Planes Standard y Exclusivo disponibles.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Izipay Checkout SDK */}
        <script src="https://sandbox-checkout.izipay.pe/payments/v1/js/index.js"></script>
      </head>
      <body className={inter.className}>
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  )
}