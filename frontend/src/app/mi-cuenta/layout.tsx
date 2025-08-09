/**
 * User Account Layout (/mi-cuenta)
 * 
 * WHY: Provides consistent navigation and layout structure for all
 * user account pages. Includes sidebar navigation and handles
 * authentication state.
 * 
 * WHAT: Layout component with sidebar navigation, user info display,
 * and protected route functionality.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  User, 
  Package, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  Heart,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useIsAuthenticated, useAuthInitializing } from '@/store/authStore';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Use real auth state
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthInitializing();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(pathname));
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  const handleLogout = () => {
    // This should use the logout function from auth store
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    router.push('/');
  };

  // Navigation items
  const navigationItems = [
    {
      label: 'Dashboard',
      href: '/mi-cuenta',
      icon: User,
      active: pathname === '/mi-cuenta',
      description: 'Resumen de tu cuenta'
    },
    {
      label: 'Mis Pedidos',
      href: '/mi-cuenta/pedidos',
      icon: Package,
      active: pathname.startsWith('/mi-cuenta/pedidos'),
      description: 'Historial de compras'
    },
    {
      label: 'Mis Invitaciones',
      href: '/mi-cuenta/invitaciones',
      icon: FileText,
      active: pathname.startsWith('/mi-cuenta/invitaciones'),
      description: 'Gestionar invitaciones'
    },
    ...(user?.role === 'ADMIN' ? [{
      label: 'Cupones Admin',
      href: '/mi-cuenta/admin/cupones',
      icon: Tag,
      active: pathname.startsWith('/mi-cuenta/admin/cupones'),
      description: 'Gestionar cupones y descuentos'
    }] : []),
    {
      label: 'Mi Perfil',
      href: '/mi-cuenta/perfil',
      icon: Settings,
      active: pathname.startsWith('/mi-cuenta/perfil'),
      description: 'Configuración de cuenta'
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirecting...
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mi Cuenta</h1>
                <p className="text-gray-600">Gestiona tu perfil y pedidos</p>
              </div>
            </div>
            
            {/* User Avatar */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.first_name?.charAt(0) || ''}{user?.last_name?.charAt(0) || ''}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-sm text-gray-600">Miembro desde {user?.created_at ? new Date(user.created_at).getFullYear() : '2024'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className={`lg:w-64 flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden sticky top-24">
              {/* User Info */}
              <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-purple-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user?.first_name?.charAt(0) || ''}{user?.last_name?.charAt(0) || ''}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Verificado</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>Cliente VIP</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-4">
                <div className="space-y-1">
                  {navigationItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
                        item.active 
                          ? "bg-purple-600 text-white shadow-sm" 
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 flex-shrink-0 ${
                          item.active ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                        }`} />
                        <div className="min-w-0 flex-1">
                          <div className={`font-medium text-sm ${
                            item.active ? "text-white" : "text-gray-900"
                          }`}>
                            {item.label}
                          </div>
                          <div className={`text-xs mt-0.5 ${
                            item.active ? "text-purple-100" : "text-gray-500"
                          }`}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Logout */}
                <div className="mt-6 pt-4 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Cerrar Sesión
                  </Button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}