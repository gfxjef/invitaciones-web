/**
 * Login Page Component
 * 
 * WHY: Provides user authentication functionality allowing existing users
 * to log into their accounts. Integrates with the backend auth API and
 * handles token storage and user redirection.
 * 
 * WHAT: Complete login form with validation, error handling, loading states,
 * and automatic redirection to user dashboard or previous page after successful
 * authentication.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useLogin, useRequireGuest } from '@/lib/hooks/useAuth';

// Validation schema using Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // Use guest route protection
  const { isLoading: isRedirecting } = useRequireGuest();
  
  // Use login mutation hook
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  // Show loading while redirecting authenticated users
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Back Button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>

        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">g</span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-800">raphica</h1>
              <p className="text-sm text-gray-600 -mt-1">EVENTOS</p>
            </div>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-gray-600">
            Ingresa a tu cuenta para crear invitaciones increíbles
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 border">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className={`w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  placeholder="tu@email.com"
                  disabled={loginMutation.isPending}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-base font-medium"
              disabled={loginMutation.isPending || !isValid}
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

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link
                href="/register"
                className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <Link
              href="#"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                toast('Funcionalidad de recuperación de contraseña próximamente', {
                  icon: 'ℹ️',
                });
              }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Al iniciar sesión aceptas nuestros{' '}
            <Link href="#" className="text-purple-600 hover:underline">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="#" className="text-purple-600 hover:underline">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}