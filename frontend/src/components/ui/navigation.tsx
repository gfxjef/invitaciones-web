/**
 * Main Navigation Component - Optimized for faster builds
 * 
 * WHY: Centralized navigation component that provides consistent
 * navigation experience across the application. Now with dynamic imports
 * for better performance.
 */

'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  User,
  LogOut,
  Package,
  FileText,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartCount, useCartTotal } from '@/store/cartStore';
import { useAuth } from '@/store/authStore';
import { useLogout } from '@/lib/hooks/useAuth';

// Dynamic import for MiniCart to reduce initial bundle
const MiniCart = dynamic(() => import('./mini-cart').then(mod => ({ default: mod.MiniCart })), {
  ssr: false,
  loading: () => <div className="absolute right-0 top-full mt-2 w-96 h-32 bg-white rounded-lg shadow-lg border z-50 animate-pulse" />
});

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false);
  
  const cartCount = useCartCount();
  const cartTotal = useCartTotal();
  
  // Use auth store instead of localStorage
  const { user, isAuthenticated, isInitializing } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logoutMutation();
  };

  const navigationItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Plantillas', href: '/plantillas' },
    { label: 'Precios', href: '/#precios' },
    { label: 'Proceso', href: '/#proceso' },
    { label: 'Testimonios', href: '/#testimonios' },
  ];

  const userMenuItems = [
    { label: 'Mi Perfil', href: '/mi-cuenta', icon: User },
    { label: 'Mis Pedidos', href: '/mi-cuenta/pedidos', icon: Package },
    { label: 'Mis Invitaciones', href: '/mi-cuenta/invitaciones', icon: FileText },
    { label: 'Configuración', href: '/mi-cuenta/configuracion', icon: Settings },
  ];

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">AmiraGift</h1>
              <p className="text-xs text-gray-600 -mt-1">INVITACIONES DIGITALES</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-gray-700 hover:text-purple-600 transition-colors ${
                  pathname === item.href ? 'text-purple-600 font-medium' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Cart */}
            <div className="relative">
              <button
                onClick={() => setIsCartDropdownOpen(!isCartDropdownOpen)}
                className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="text-red-500 font-medium">
                  S/ {cartTotal.toFixed(2)}
                </span>
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {cartCount}
                  </Badge>
                )}
              </button>
              <MiniCart 
                isOpen={isCartDropdownOpen} 
                onClose={() => setIsCartDropdownOpen(false)} 
              />
            </div>

            {/* User Menu */}
            {isInitializing ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
                  title={`${user.first_name || 'Usuario'} ${user.last_name || ''}`}
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.first_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user.first_name || 'Usuario'}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.first_name || 'Usuario'} {user.last_name || ''}
                      </p>
                      <p className="text-xs text-gray-500">{user.email || 'email@ejemplo.com'}</p>
                    </div>
                    
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    ))}
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/login')}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => router.push('/register')}
                >
                  Registrarse
                </Button>
              </div>
            )}

            {/* Language Toggle */}
            <span className="text-sm text-gray-600">ES</span>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-4 space-y-4">
              {/* Navigation Items */}
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block py-2 text-gray-700 hover:text-purple-600 transition-colors ${
                    pathname === item.href ? 'text-purple-600 font-medium' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <hr className="my-4" />

              {/* Cart */}
              <Link
                href="/carrito"
                className="flex items-center gap-2 py-2 text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Carrito (S/ {cartTotal.toFixed(2)})</span>
                {cartCount > 0 && (
                  <Badge className="bg-red-500 text-white text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Link>

              {/* User Section */}
              {isInitializing ? (
                <div className="flex items-center gap-3 py-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
              ) : isAuthenticated && user ? (
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="py-2 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.first_name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.first_name || 'Usuario'} {user.last_name || ''}
                        </p>
                        <p className="text-sm text-gray-500">{user.email || 'email@ejemplo.com'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="space-y-1">
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 py-2 text-gray-700 hover:text-purple-600 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 py-2 text-red-600 hover:text-red-700 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      router.push('/login');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      router.push('/register');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Registrarse
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(isMobileMenuOpen || isUserMenuOpen || isCartDropdownOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsUserMenuOpen(false);
            setIsCartDropdownOpen(false);
          }}
        />
      )}
    </nav>
  );
}