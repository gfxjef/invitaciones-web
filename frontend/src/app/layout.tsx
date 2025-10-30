import type { Metadata } from 'next'
import { Inter, Great_Vibes, Montserrat } from 'next/font/google'
import './globals.css'
import '@/styles/izipay-custom.css'
import { Providers } from './providers'
import Navigation from '@/components/ui/navigation'

const inter = Inter({ subsets: ['latin'] })

// Great Vibes for elegant script text (couple names, romantic headings)
const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-great-vibes'
})

// Montserrat for clean headers and navigation
const montserrat = Montserrat({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat'
})

export const metadata: Metadata = {
  title: 'AmiraGift - Invitaciones Digitales para tu Boda',
  description: 'Crea invitaciones digitales únicas y personalizadas para tu boda con AmiraGift. Planes Standard y Exclusivo disponibles.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Los temas de Izipay se cargan localmente en los componentes que los usan */}
      </head>
      <body className={`${inter.className} ${greatVibes.variable} ${montserrat.variable}`}>
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  )
}