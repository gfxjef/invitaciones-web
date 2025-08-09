/**
 * User Profile & Configuration Page (/mi-cuenta/perfil)
 * 
 * WHY: Comprehensive user profile management including personal information,
 * password changes, notification preferences, and account security settings.
 * Essential for user account management and personalization.
 * 
 * WHAT: Multi-section profile page with forms for personal data, security
 * settings, preferences, and account management functionality.
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle,
  Settings,
  Camera,
  Trash2,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs } from '@/components/ui/custom-tabs';
import { authApi, type User as UserType } from '@/lib/api';
import { useUser } from '@/store/authStore';
import toast from 'react-hot-toast';

// Form validation schemas
const profileSchema = z.object({
  first_name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  last_name: z.string().min(2, 'Apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  address: z.string().optional(),
  birth_date: z.string().optional(),
  bio: z.string().max(500, 'La biografía no puede exceder 500 caracteres').optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Contraseña actual requerida'),
  new_password: z.string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe contener al menos una mayúscula, una minúscula y un número'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Las contraseñas no coinciden",
  path: ["confirm_password"],
});

const notificationSchema = z.object({
  email_notifications: z.boolean(),
  sms_notifications: z.boolean(),
  marketing_emails: z.boolean(),
  order_updates: z.boolean(),
  invitation_reminders: z.boolean(),
  guest_responses: z.boolean(),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;
type NotificationForm = z.infer<typeof notificationSchema>;

// Mock user data with extended profile information
const mockUserData = {
  id: 1,
  email: 'maria@ejemplo.com',
  first_name: 'María',
  last_name: 'González',
  phone: '+51 987 654 321',
  address: 'Av. Lima 123, Miraflores, Lima',
  birth_date: '1990-05-15',
  bio: 'Organizadora de eventos con pasión por los detalles. Me encanta crear momentos especiales e inolvidables.',
  role: 'user',
  created_at: '2024-01-15T10:30:00Z',
  avatar_url: null,
  email_verified: true,
  phone_verified: false,
  two_factor_enabled: false,
  last_login: '2024-07-25T14:20:00Z',
  preferences: {
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: true,
    order_updates: true,
    invitation_reminders: true,
    guest_responses: true,
  },
  stats: {
    total_orders: 3,
    total_invitations: 5,
    member_since: '2024-01-15',
  },
};

export default function PerfilPage() {
  const authUser = useUser();
  const [user, setUser] = useState(authUser || mockUserData);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Update local user state when auth user changes
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      birth_date: user.birth_date || '',
      bio: user.bio || '',
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  // Notifications form
  const {
    register: registerNotifications,
    handleSubmit: handleSubmitNotifications,
    formState: { errors: notificationErrors },
    setValue: setNotificationValue,
    watch: watchNotifications,
  } = useForm<NotificationForm>({
    resolver: zodResolver(notificationSchema),
    defaultValues: user.preferences,
  });

  const onSubmitProfile = async (data: ProfileForm) => {
    setIsUpdatingProfile(true);
    try {
      // TODO: Replace with real API call
      // const updatedUser = await authApi.updateProfile(data);
      // setUser(updatedUser);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({ ...user, ...data });
      
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error('Error actualizando el perfil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onSubmitPassword = async (data: PasswordForm) => {
    setIsUpdatingPassword(true);
    try {
      // TODO: Implement password change API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Contraseña actualizada correctamente');
      resetPassword();
    } catch (error) {
      toast.error('Error actualizando la contraseña');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const onSubmitNotifications = async (data: NotificationForm) => {
    setIsUpdatingNotifications(true);
    try {
      // TODO: Implement notification preferences API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser({ 
        ...user, 
        preferences: {
          email_notifications: data.email_notifications,
          sms_notifications: data.sms_notifications,
          marketing_emails: data.marketing_emails,
          order_updates: data.order_updates,
          invitation_reminders: data.invitation_reminders,
          guest_responses: data.guest_responses,
        }
      });
      toast.success('Preferencias actualizadas correctamente');
    } catch (error) {
      toast.error('Error actualizando las preferencias');
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const handleAvatarUpload = () => {
    toast('Función de subida de avatar próximamente');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      toast.error('Función de eliminación de cuenta próximamente');
    }
  };

  const handleExportData = () => {
    toast('Exportando datos del usuario...');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const tabs = [
    {
      id: 'profile',
      label: 'Información Personal',
      icon: User,
    },
    {
      id: 'security',
      label: 'Seguridad',
      icon: Shield,
    },
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: Bell,
    },
    {
      id: 'account',
      label: 'Configuración de Cuenta',
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
      </div>

      {/* User Summary Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-medium text-2xl">
                  {user.first_name?.charAt(0) || ''}{user.last_name?.charAt(0) || ''}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
              onClick={handleAvatarUpload}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {user.first_name || 'Usuario'} {user.last_name || ''}
              </h2>
              <div className="flex items-center gap-2">
                {user.email_verified === true && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                )}
                {user.two_factor_enabled === true && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <Shield className="w-3 h-3 mr-1" />
                    2FA
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-gray-600 mb-2">{user.email || 'email@ejemplo.com'}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Miembro desde {formatDate(user.created_at || new Date().toISOString())}</span>
              <span>•</span>
              <span>{user.stats?.total_orders || 0} pedidos</span>
              <span>•</span>
              <span>{user.stats?.total_invitations || 0} invitaciones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border">
        {/* Personal Information Tab */}
        {activeTab === 'profile' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Información Personal
              </h3>
              <p className="text-gray-600">
                Actualiza tu información personal y de contacto
              </p>
            </div>

            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      {...registerProfile('first_name')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>
                  {profileErrors.first_name && (
                    <p className="text-red-500 text-sm mt-1">{profileErrors.first_name.message}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      {...registerProfile('last_name')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>
                  {profileErrors.last_name && (
                    <p className="text-red-500 text-sm mt-1">{profileErrors.last_name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      {...registerProfile('email')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>
                  {profileErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{profileErrors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      {...registerProfile('phone')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Birth Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de nacimiento
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      {...registerProfile('birth_date')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    {...registerProfile('address')}
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biografía
                </label>
                <textarea
                  {...registerProfile('bio')}
                  rows={4}
                  placeholder="Cuéntanos un poco sobre ti..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                />
                {profileErrors.bio && (
                  <p className="text-red-500 text-sm mt-1">{profileErrors.bio.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? (
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
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Seguridad de la cuenta
              </h3>
              <p className="text-gray-600">
                Gestiona la contraseña y configuraciones de seguridad
              </p>
            </div>

            <div className="space-y-8">
              {/* Change Password */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Cambiar contraseña</h4>
                <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña actual *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        {...registerPassword('current_password')}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {passwordErrors.current_password && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.current_password.message}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva contraseña *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          {...registerPassword('new_password')}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      {passwordErrors.new_password && (
                        <p className="text-red-500 text-sm mt-1">{passwordErrors.new_password.message}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar contraseña *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          {...registerPassword('confirm_password')}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      {passwordErrors.confirm_password && (
                        <p className="text-red-500 text-sm mt-1">{passwordErrors.confirm_password.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isUpdatingPassword}>
                      {isUpdatingPassword ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Actualizando...
                        </>
                      ) : (
                        'Actualizar contraseña'
                      )}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Security Settings */}
              <div className="pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-4">Configuraciones adicionales</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Autenticación de dos factores</p>
                      <p className="text-sm text-gray-600">
                        Añade una capa extra de seguridad a tu cuenta
                      </p>
                    </div>
                    <Button
                      variant={user.two_factor_enabled === true ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toast('Función 2FA próximamente')}
                    >
                      {user.two_factor_enabled === true ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Verificación de teléfono</p>
                      <p className="text-sm text-gray-600">
                        Verifica tu número de teléfono para mayor seguridad
                      </p>
                    </div>
                    <Button
                      variant={user.phone_verified === true ? "outline" : "default"}
                      size="sm"
                      onClick={() => toast('Verificación de teléfono próximamente')}
                    >
                      {user.phone_verified === true ? 'Verificado' : 'Verificar'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Preferencias de notificaciones
              </h3>
              <p className="text-gray-600">
                Configura cómo y cuándo quieres recibir notificaciones
              </p>
            </div>

            <form onSubmit={handleSubmitNotifications(onSubmitNotifications)} className="space-y-6">
              {/* Email Notifications */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Notificaciones por email</h4>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...registerNotifications('email_notifications')}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">Notificaciones generales</p>
                      <p className="text-sm text-gray-600">
                        Recibir actualizaciones importantes sobre tu cuenta
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...registerNotifications('order_updates')}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">Actualizaciones de pedidos</p>
                      <p className="text-sm text-gray-600">
                        Notificaciones sobre el estado de tus pedidos
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...registerNotifications('invitation_reminders')}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">Recordatorios de invitaciones</p>
                      <p className="text-sm text-gray-600">
                        Recordatorios sobre fechas importantes de eventos
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...registerNotifications('guest_responses')}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">Respuestas de invitados</p>
                      <p className="text-sm text-gray-600">
                        Notificaciones cuando alguien responde a tus invitaciones
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...registerNotifications('marketing_emails')}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">Correos promocionales</p>
                      <p className="text-sm text-gray-600">
                        Ofertas especiales y noticias sobre nuevas plantillas
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* SMS Notifications */}
              <div className="pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-4">Notificaciones SMS</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...registerNotifications('sms_notifications')}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Notificaciones SMS</p>
                    <p className="text-sm text-gray-600">
                      Recibir notificaciones urgentes por mensaje de texto
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end pt-6 border-t">
                <Button type="submit" disabled={isUpdatingNotifications}>
                  {isUpdatingNotifications ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar preferencias
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Account Settings Tab */}
        {activeTab === 'account' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Configuración de cuenta
              </h3>
              <p className="text-gray-600">
                Gestiona tu cuenta y datos personales
              </p>
            </div>

            <div className="space-y-6">
              {/* Account Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Información de la cuenta</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ID de usuario:</span>
                    <span className="text-sm font-medium text-gray-900">#{user.id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fecha de registro:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(user.created_at || new Date().toISOString())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Último acceso:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(user.last_login)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tipo de cuenta:</span>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Data Export */}
              <div className="pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-4">Exportar datos</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Download className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">Descargar mis datos</p>
                      <p className="text-sm text-blue-700 mb-3">
                        Obtén una copia de toda tu información personal y actividad en la plataforma
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportData}
                        className="border-blue-200 text-blue-700 hover:bg-blue-100"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Solicitar exportación
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-4 text-red-600">Zona de peligro</h4>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900">Eliminar cuenta</p>
                      <p className="text-sm text-red-700 mb-3">
                        Esta acción eliminará permanentemente tu cuenta y todos los datos asociados.
                        Esta acción no se puede deshacer.
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteAccount}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar cuenta
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}