import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
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
        {/* Izipay Classic CSS */}
        <link rel="stylesheet" href="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic.css" />
      </head>
      <body className={inter.className}>
        {/* Load Krypton SDK before components mount */}
        <Script
          src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js"
          strategy="beforeInteractive"
        />
        
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  )
}