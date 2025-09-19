/**
 * Account Preferences Component
 * 
 * WHY: Centralized user profile and account settings management
 * with preferences for notifications, privacy, billing, and
 * data management options.
 * 
 * WHAT: Comprehensive settings interface with profile editing,
 * notification preferences, security settings, and account
 * management features.
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Bell,
  Shield,
  CreditCard,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Check,
  X,
  AlertTriangle,
  Key,
  Smartphone,
  Globe,
  Heart,
  Star,
  Palette,
  Languages,
  Clock,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { authApi, type User as UserType, type NotificationPreferences } from '@/lib/api';
import toast from 'react-hot-toast';

interface UserPreferences extends UserType {
  theme_preference?: 'light' | 'dark' | 'auto';
  language_preference?: 'es' | 'en';
  timezone?: string;
  default_invitation_settings?: {
    rsvp_enabled: boolean;
    is_public: boolean;
    reminder_days: number;
  };
  privacy_settings?: {
    profile_visibility: 'public' | 'private';
    show_activity: boolean;
    allow_search: boolean;
  };
  billing_info?: {
    plan_type: 'standard' | 'exclusive';
    subscription_status: 'active' | 'inactive' | 'trial';
    next_billing_date?: string;
  };
}

// Mock user data
const mockUserData: UserPreferences = {
  id: 1,
  email: 'usuario@example.com',
  first_name: 'María',
  last_name: 'González',
  phone: '+51 999 888 777',
  role: 'user',
  is_active: true,
  email_verified: true,
  phone_verified: false,
  created_at: '2024-01-15T10:00:00Z',
  address: 'Av. Larco 123, Miraflores, Lima',
  birth_date: '1990-05-15',
  bio: 'Organizadora de eventos especializada en bodas y celebraciones especiales.',
  avatar_url: '/api/placeholder/150/150',
  two_factor_enabled: false,
  theme_preference: 'light',
  language_preference: 'es',
  timezone: 'America/Lima',
  default_invitation_settings: {
    rsvp_enabled: true,
    is_public: true,
    reminder_days: 7
  },
  privacy_settings: {
    profile_visibility: 'public',
    show_activity: true,
    allow_search: true
  },
  billing_info: {
    plan_type: 'exclusive',
    subscription_status: 'active',
    next_billing_date: '2024-09-15T00:00:00Z'
  },
  preferences: {
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: true,
    order_updates: true,
    invitation_reminders: true,
    guest_responses: true,
  }
};

export default function AccountPreferences() {
  const [userData, setUserData] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call
      // const response = await authApi.getProfile();
      // setUserData(response);
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 800));
      setUserData(mockUserData);
    } catch (error) {
      toast.error('Error cargando datos del perfil');
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (field: string, value: any) => {
    if (!userData) return;

    setIsSaving(true);
    try {
      // TODO: Replace with real API call
      // const response = await authApi.updateProfile({ [field]: value });
      // setUserData(response);
      
      // Using mock update for now
      await new Promise(resolve => setTimeout(resolve, 500));
      setUserData(prev => prev ? { ...prev, [field]: value } : null);
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      toast.error('Error actualizando el perfil');
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePreferences = async (section: string, preferences: any) => {
    if (!userData) return;

    setIsSaving(true);
    try {
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setUserData(prev => prev ? { ...prev, [section]: preferences } : null);
      toast.success('Preferencias actualizadas');
    } catch (error) {
      toast.error('Error actualizando preferencias');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwords.new.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Replace with real API call
      // await authApi.changePassword({
      //   current_password: passwords.current,
      //   new_password: passwords.new
      // });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Contraseña actualizada exitosamente');
      setShowPasswordChange(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error('Error al cambiar la contraseña');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!userData) return;

    setIsSaving(true);
    try {
      // TODO: Implement 2FA toggle
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserData(prev => prev ? { 
        ...prev, 
        two_factor_enabled: !prev.two_factor_enabled 
      } : null);
      toast.success(
        userData.two_factor_enabled 
          ? 'Autenticación de dos factores desactivada' 
          : 'Autenticación de dos factores activada'
      );
    } catch (error) {
      toast.error('Error configurando 2FA');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion
    toast.error('Función de eliminación de cuenta próximamente');
    setShowDeleteConfirm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const sections = [
    { id: 'profile', label: 'Perfil personal', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'privacy', label: 'Privacidad', icon: Shield },
    { id: 'invitations', label: 'Invitaciones', icon: Heart },
    { id: 'billing', label: 'Facturación', icon: CreditCard },
    { id: 'security', label: 'Seguridad', icon: Lock },
    { id: 'data', label: 'Datos y privacidad', icon: Download },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración de cuenta</h1>
          <p className="text-gray-600">Gestiona tu perfil y preferencias</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No se pudieron cargar los datos del perfil.</p>
        <Button onClick={loadUserData} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración de cuenta</h1>
        <p className="text-gray-600">Gestiona tu perfil y preferencias personales</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <section.icon className="w-5 h-5" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información personal
                </CardTitle>
                <CardDescription>
                  Actualiza tu información de contacto y datos personales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                    {userData.avatar_url ? (
                      <img src={userData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      Cambiar foto
                    </Button>
                    <p className="text-sm text-gray-500 mt-1">
                      JPG, PNG hasta 2MB
                    </p>
                  </div>
                </div>

                {/* Personal Info Form */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Nombre
                    </label>
                    <Input
                      value={userData.first_name}
                      onChange={(e) => handleUpdateProfile('first_name', e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Apellido
                    </label>
                    <Input
                      value={userData.last_name}
                      onChange={(e) => handleUpdateProfile('last_name', e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Email
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="email"
                        value={userData.email}
                        onChange={(e) => handleUpdateProfile('email', e.target.value)}
                        disabled={isSaving}
                      />
                      {userData.email_verified && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Teléfono
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="tel"
                        value={userData.phone || ''}
                        onChange={(e) => handleUpdateProfile('phone', e.target.value)}
                        disabled={isSaving}
                      />
                      {userData.phone_verified ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Button variant="outline" size="sm">
                          Verificar
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Dirección
                    </label>
                    <Input
                      value={userData.address || ''}
                      onChange={(e) => handleUpdateProfile('address', e.target.value)}
                      disabled={isSaving}
                      placeholder="Dirección completa"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Fecha de nacimiento
                    </label>
                    <Input
                      type="date"
                      value={userData.birth_date || ''}
                      onChange={(e) => handleUpdateProfile('birth_date', e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Zona horaria
                    </label>
                    <select
                      value={userData.timezone || 'America/Lima'}
                      onChange={(e) => handleUpdateProfile('timezone', e.target.value)}
                      disabled={isSaving}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="America/Lima">Lima (GMT-5)</option>
                      <option value="America/New_York">Nueva York (GMT-4)</option>
                      <option value="Europe/Madrid">Madrid (GMT+1)</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Biografía
                    </label>
                    <textarea
                      value={userData.bio || ''}
                      onChange={(e) => handleUpdateProfile('bio', e.target.value)}
                      disabled={isSaving}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Cuéntanos un poco sobre ti..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar cambios
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notificaciones
                </CardTitle>
                <CardDescription>
                  Configura qué notificaciones deseas recibir
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    {
                      key: 'email_notifications',
                      label: 'Notificaciones por email',
                      description: 'Recibe notificaciones importantes por correo electrónico'
                    },
                    {
                      key: 'sms_notifications',
                      label: 'Notificaciones SMS',
                      description: 'Recibe notificaciones urgentes por mensaje de texto'
                    },
                    {
                      key: 'marketing_emails',
                      label: 'Emails promocionales',
                      description: 'Recibe ofertas, promociones y novedades'
                    },
                    {
                      key: 'order_updates',
                      label: 'Actualizaciones de pedidos',
                      description: 'Notificaciones sobre el estado de tus compras'
                    },
                    {
                      key: 'invitation_reminders',
                      label: 'Recordatorios de invitaciones',
                      description: 'Recordatorios sobre eventos próximos y fechas importantes'
                    },
                    {
                      key: 'guest_responses',
                      label: 'Respuestas de invitados',
                      description: 'Notificación cuando alguien confirme o decline tu invitación'
                    }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{setting.label}</h4>
                        <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => {
                            const newPrefs = {
                              ...userData.preferences,
                              [setting.key]: !userData.preferences?.[setting.key as keyof typeof userData.preferences]
                            };
                            handleUpdatePreferences('preferences', newPrefs);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            userData.preferences?.[setting.key as keyof typeof userData.preferences]
                              ? 'bg-purple-600'
                              : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              userData.preferences?.[setting.key as keyof typeof userData.preferences]
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Seguridad de la cuenta
                  </CardTitle>
                  <CardDescription>
                    Configura la seguridad y autenticación de tu cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Password Change */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">Contraseña</h4>
                        <p className="text-sm text-gray-600">
                          Última actualización: hace 3 meses
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Cambiar contraseña
                      </Button>
                    </div>

                    {showPasswordChange && (
                      <div className="space-y-4 mt-4 pt-4 border-t">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Contraseña actual
                          </label>
                          <Input
                            type="password"
                            value={passwords.current}
                            onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                            placeholder="Ingresa tu contraseña actual"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Nueva contraseña
                          </label>
                          <Input
                            type="password"
                            value={passwords.new}
                            onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                            placeholder="Mínimo 6 caracteres"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Confirmar nueva contraseña
                          </label>
                          <Input
                            type="password"
                            value={passwords.confirm}
                            onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                            placeholder="Repite la nueva contraseña"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={handlePasswordChange} disabled={isSaving}>
                            {isSaving ? 'Actualizando...' : 'Actualizar contraseña'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowPasswordChange(false);
                              setPasswords({ current: '', new: '', confirm: '' });
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                          Autenticación de dos factores
                          {userData.two_factor_enabled && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Activado
                            </Badge>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Añade una capa extra de seguridad a tu cuenta
                        </p>
                      </div>
                      <Button
                        variant={userData.two_factor_enabled ? "outline" : "default"}
                        onClick={handleToggle2FA}
                        disabled={isSaving}
                      >
                        <Smartphone className="w-4 h-4 mr-2" />
                        {userData.two_factor_enabled ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Sesiones activas</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-gray-900">Sesión actual</p>
                            <p className="text-sm text-gray-600">
                              Chrome en Windows • Lima, Perú
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Activo ahora
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">iPhone</p>
                            <p className="text-sm text-gray-600">
                              Safari Mobile • Hace 2 horas
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          Cerrar sesión
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Billing Section */}
          {activeSection === 'billing' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Facturación y suscripción
                </CardTitle>
                <CardDescription>
                  Gestiona tu suscripción y métodos de pago
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Plan */}
                <div className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">Plan Exclusive</h4>
                      <p className="text-gray-600">Invitaciones personalizadas sin límites</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                      {userData.billing_info?.subscription_status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Precio mensual</p>
                      <p className="font-semibold text-gray-900">S/ 69.90</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Próxima facturación</p>
                      <p className="font-semibold text-gray-900">
                        {userData.billing_info?.next_billing_date 
                          ? formatDate(userData.billing_info.next_billing_date)
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <p className="font-semibold text-green-600">Renovación automática</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="outline">
                      Cambiar plan
                    </Button>
                    <Button variant="ghost" className="text-red-600">
                      Cancelar suscripción
                    </Button>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Método de pago</h4>
                    <Button variant="outline" size="sm">
                      Cambiar
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-600">Expira 12/2026</p>
                    </div>
                  </div>
                </div>

                {/* Billing History */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Historial de facturación</h4>
                  <div className="space-y-3">
                    {[
                      { date: '2024-08-15', amount: 'S/ 69.90', status: 'Pagado', invoice: 'INV-2024-0815' },
                      { date: '2024-07-15', amount: 'S/ 69.90', status: 'Pagado', invoice: 'INV-2024-0715' },
                      { date: '2024-06-15', amount: 'S/ 69.90', status: 'Pagado', invoice: 'INV-2024-0615' }
                    ].map((bill, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium text-gray-900">{bill.invoice}</p>
                          <p className="text-sm text-gray-600">{formatDate(bill.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{bill.amount}</p>
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                            {bill.status}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data & Privacy Section */}
          {activeSection === 'data' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Datos y privacidad
                </CardTitle>
                <CardDescription>
                  Gestiona tus datos personales y configuraciones de privacidad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Data Export */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Exportar datos</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Descarga una copia de todos tus datos almacenados en nuestra plataforma
                  </p>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Solicitar exportación
                  </Button>
                </div>

                {/* Account Deletion */}
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Eliminar cuenta
                  </h4>
                  <p className="text-sm text-red-700 mb-4">
                    Esta acción es permanente y no se puede deshacer. Se eliminarán todas tus invitaciones, 
                    datos y configuraciones de forma definitiva.
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-red-300 text-red-700 hover:bg-red-100"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar mi cuenta
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <AlertDialogTitle>Eliminar cuenta permanentemente</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pl-13">
              ¿Estás completamente seguro de que quieres eliminar tu cuenta?
              <br />
              <br />
              <strong>Esta acción eliminará permanentemente:</strong>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Tu perfil y todos tus datos personales</li>
                <li>Todas tus invitaciones y su contenido</li>
                <li>Tu historial de pedidos y facturas</li>
                <li>Todas las estadísticas y analíticas</li>
                <li>Acceso a tu suscripción actual</li>
              </ul>
              <br />
              <strong>Escribe "ELIMINAR" para confirmar:</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input 
            placeholder="Escribe ELIMINAR para confirmar"
            className="mt-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar cuenta definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}