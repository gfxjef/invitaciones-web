/**
 * AuthModal Component
 *
 * WHY: Modal for user authentication (login/register) that can be used
 * across the app without losing page context. Optimized for quick conversions.
 *
 * WHAT: Tabbed modal with login and registration forms, integrated with
 * the existing auth system and hooks.
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useLogin, useRegister } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';
import { LoginRequest } from '@/lib/api';
import GoogleLoginButton from './GoogleLoginButton';

// Validation schemas
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
});

const registerSchema = z.object({
  first_name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z
    .string()
    .min(1, 'El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido'),
  phone: z
    .string()
    .optional()
    .refine(
      (phone) => !phone || /^(\+?51)?[9]\d{8}$/.test(phone.replace(/\s/g, '')),
      'Ingresa un número de teléfono peruano válido'
    ),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe tener al menos una minúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
  confirm_password: z
    .string()
    .min(1, 'Confirma tu contraseña'),
  accept_terms: z
    .boolean()
    .refine((val) => val === true, 'Debes aceptar los términos y condiciones'),
}).refine(
  (data) => data.password === data.confirm_password,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_password'],
  }
);

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  onAuthSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, initialTab = 'login', onAuthSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auth hooks
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  // Form hooks
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  // Handle successful auth
  const handleAuthSuccess = () => {
    onAuthSuccess?.();
    onClose();
  };

  // Login submission
  const handleLogin = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data as LoginRequest);
      handleAuthSuccess();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  // Register submission
  const handleRegister = async (data: RegisterFormData) => {
    try {
      const { accept_terms, confirm_password, ...registerData } = data;
      await registerMutation.mutateAsync({
        email: registerData.email,
        password: registerData.password,
        first_name: registerData.first_name,
        last_name: registerData.last_name,
        ...(registerData.phone && { phone: registerData.phone }),
      });

      // After successful registration, switch to login tab
      setActiveTab('login');
      loginForm.setValue('email', registerData.email);
      // Auto-login could be implemented here if the backend returns tokens on registration
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 id="auth-modal-title" className="text-2xl font-bold text-gray-900">
              {activeTab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {activeTab === 'login'
                ? 'Accede a tu cuenta para descargar'
                : 'Regístrate para descargar la invitación'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('login')}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium transition-colors",
              activeTab === 'login'
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium transition-colors",
              activeTab === 'register'
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Google OAuth Section */}
          <div className="mb-6">
            <GoogleLoginButton
              onSuccess={handleAuthSuccess}
              fullWidth
              text={activeTab === 'login' ? 'Iniciar sesión con Google' : 'Registrarse con Google'}
            />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">O {activeTab === 'login' ? 'inicia sesión' : 'regístrate'} con tu email</span>
              </div>
            </div>
          </div>

          {activeTab === 'login' ? (
            // Login Form
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...loginForm.register('email')}
                    type="email"
                    id="login-email"
                    className={cn(
                      "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors",
                      loginForm.formState.errors.email && "border-red-500 focus:ring-red-500 focus:border-red-500"
                    )}
                    placeholder="tu@email.com"
                    disabled={loginMutation.isPending}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...loginForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    className={cn(
                      "w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors",
                      loginForm.formState.errors.password && "border-red-500 focus:ring-red-500 focus:border-red-500"
                    )}
                    placeholder="Tu contraseña"
                    disabled={loginMutation.isPending}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loginMutation.isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2"
                disabled={loginMutation.isPending || !loginForm.formState.isValid}
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" className="text-white" />
                    Iniciando sesión...
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>
          ) : (
            // Register Form
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="register-first-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      {...registerForm.register('first_name')}
                      type="text"
                      id="register-first-name"
                      className={cn(
                        "w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm",
                        registerForm.formState.errors.first_name && "border-red-500 focus:ring-red-500 focus:border-red-500"
                      )}
                      placeholder="Juan"
                      disabled={registerMutation.isPending}
                    />
                  </div>
                  {registerForm.formState.errors.first_name && (
                    <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="register-last-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    {...registerForm.register('last_name')}
                    type="text"
                    id="register-last-name"
                    className={cn(
                      "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm",
                      registerForm.formState.errors.last_name && "border-red-500 focus:ring-red-500 focus:border-red-500"
                    )}
                    placeholder="Pérez"
                    disabled={registerMutation.isPending}
                  />
                  {registerForm.formState.errors.last_name && (
                    <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.last_name.message}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...registerForm.register('email')}
                    type="email"
                    id="register-email"
                    className={cn(
                      "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors",
                      registerForm.formState.errors.email && "border-red-500 focus:ring-red-500 focus:border-red-500"
                    )}
                    placeholder="tu@email.com"
                    disabled={registerMutation.isPending}
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              {/* Phone Field (Optional) */}
              <div>
                <label htmlFor="register-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono <span className="text-gray-500 text-xs">(opcional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...registerForm.register('phone')}
                    type="tel"
                    id="register-phone"
                    className={cn(
                      "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors",
                      registerForm.formState.errors.phone && "border-red-500 focus:ring-red-500 focus:border-red-500"
                    )}
                    placeholder="987654321"
                    disabled={registerMutation.isPending}
                  />
                </div>
                {registerForm.formState.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.phone.message}</p>
                )}
              </div>

              {/* Password Fields */}
              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...registerForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="register-password"
                    className={cn(
                      "w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors",
                      registerForm.formState.errors.password && "border-red-500 focus:ring-red-500 focus:border-red-500"
                    )}
                    placeholder="Mínimo 8 caracteres"
                    disabled={registerMutation.isPending}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={registerMutation.isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...registerForm.register('confirm_password')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="register-confirm-password"
                    className={cn(
                      "w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors",
                      registerForm.formState.errors.confirm_password && "border-red-500 focus:ring-red-500 focus:border-red-500"
                    )}
                    placeholder="Repite tu contraseña"
                    disabled={registerMutation.isPending}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={registerMutation.isPending}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {registerForm.formState.errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.confirm_password.message}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-2">
                <input
                  {...registerForm.register('accept_terms')}
                  type="checkbox"
                  id="register-accept-terms"
                  className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  disabled={registerMutation.isPending}
                />
                <label htmlFor="register-accept-terms" className="text-sm text-gray-700 leading-relaxed">
                  Acepto los términos de servicio y política de privacidad
                </label>
              </div>
              {registerForm.formState.errors.accept_terms && (
                <p className="text-sm text-red-600">{registerForm.formState.errors.accept_terms.message}</p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2"
                disabled={registerMutation.isPending || !registerForm.formState.isValid}
              >
                {registerMutation.isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" className="text-white" />
                    Creando cuenta...
                  </div>
                ) : (
                  'Crear Cuenta'
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
          <p className="text-xs text-gray-500 text-center">
            {activeTab === 'login'
              ? '¿No tienes cuenta? '
              : '¿Ya tienes cuenta? '}
            <button
              onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
              className="text-purple-600 hover:underline"
            >
              {activeTab === 'login' ? 'Crear una aquí' : 'Inicia sesión aquí'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}