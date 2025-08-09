/**
 * Register Page Component
 * 
 * WHY: Provides user registration functionality for new users to create
 * accounts. Handles form validation, password confirmation, terms acceptance,
 * and integrates with backend registration API.
 * 
 * WHAT: Complete registration form with comprehensive validation, error handling,
 * loading states, and automatic redirection to login page after successful
 * account creation.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useRegister, useRequireGuest } from '@/lib/hooks/useAuth';

// Validation schema using Zod
const registerSchema = z.object({
  first_name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  last_name: z
    .string()
    .min(1, 'El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede tener más de 50 caracteres'),
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
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe tener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe tener al menos un número'),
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

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Use guest route protection
  const { isLoading: isRedirecting } = useRequireGuest();
  
  // Use register mutation hook
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  // Watch password for real-time validation feedback
  const password = watch('password');

  // Show loading while redirecting authenticated users
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4">
        <LoadingSpinner />
      </div>
    );
  }

  const onSubmit = async (data: RegisterFormData) => {
    // Remove accept_terms and confirm_password from the data sent to API
    const { accept_terms, confirm_password, ...registerData } = data;
    
    registerMutation.mutate({
      email: registerData.email,
      password: registerData.password,
      first_name: registerData.first_name,
      last_name: registerData.last_name,
      ...(registerData.phone && { phone: registerData.phone }),
    });
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: 'gray' };
    
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    
    if (strength <= 2) return { strength, text: 'Débil', color: 'red' };
    if (strength <= 3) return { strength, text: 'Media', color: 'yellow' };
    if (strength <= 4) return { strength, text: 'Fuerte', color: 'green' };
    return { strength, text: 'Muy Fuerte', color: 'green' };
  };

  const passwordStrength = getPasswordStrength(password || '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4 py-8">
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
            Crear Cuenta
          </h2>
          <p className="mt-2 text-gray-600">
            Únete a nosotros y crea invitaciones increíbles
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 border">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('first_name')}
                    type="text"
                    id="first_name"
                    className={`w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                      errors.first_name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                    }`}
                    placeholder="Juan"
                    disabled={registerMutation.isPending}
                  />
                </div>
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <div className="relative">
                  <input
                    {...register('last_name')}
                    type="text"
                    id="last_name"
                    className={`w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                      errors.last_name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                    }`}
                    placeholder="Pérez"
                    disabled={registerMutation.isPending}
                  />
                </div>
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                )}
              </div>
            </div>

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
                  disabled={registerMutation.isPending}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono <span className="text-gray-500">(opcional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('phone')}
                  type="tel"
                  id="phone"
                  className={`w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  placeholder="987654321"
                  disabled={registerMutation.isPending}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
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
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.color === 'red' ? 'bg-red-500' :
                          passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${
                      passwordStrength.color === 'red' ? 'text-red-600' :
                      passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirm_password')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm_password"
                  className={`w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.confirm_password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
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
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <input
                {...register('accept_terms')}
                type="checkbox"
                id="accept_terms"
                className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                disabled={registerMutation.isPending}
              />
              <label htmlFor="accept_terms" className="text-sm text-gray-700 leading-relaxed">
                Acepto los{' '}
                <Link href="#" className="text-purple-600 hover:underline">
                  Términos de Servicio
                </Link>{' '}
                y la{' '}
                <Link href="#" className="text-purple-600 hover:underline">
                  Política de Privacidad
                </Link>
              </label>
            </div>
            {errors.accept_terms && (
              <p className="text-sm text-red-600">{errors.accept_terms.message}</p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-base font-medium"
              disabled={registerMutation.isPending || !isValid}
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

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link
                href="/login"
                className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Tus datos están protegidos por nuestras políticas de seguridad
          </p>
        </div>
      </div>
    </div>
  );
}