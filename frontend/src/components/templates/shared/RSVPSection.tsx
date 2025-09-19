/**
 * RSVP Section Component
 *
 * WHY: Reusable RSVP form component that can be used across different templates
 * with customizable styling and validation.
 */

'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RSVPSectionProps, RSVPFormData } from '@/types/template';

export const RSVPSection: React.FC<RSVPSectionProps> = ({
  data,
  colors,
  rsvpData,
  className = '',
  isPreview = false,
  onSubmit
}) => {
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRSVP = async (status: 'confirmed' | 'declined') => {
    if (isPreview) return;

    setIsSubmitting(true);

    const formData: RSVPFormData = {
      guest_name: '', // This would come from a name input field
      status,
      number_of_guests: guestCount,
      message: message || undefined
    };

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      // Handle success (show confirmation, clear form, etc.)
    } catch (error) {
      console.error('RSVP submission failed:', error);
      // Handle error (show error message)
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!rsvpData.enabled) {
    return null;
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto ${className}`}>
      <h3 className="text-2xl font-bold text-center mb-6" style={{ color: colors.primary }}>
        Confirma tu Asistencia
      </h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
            ¿Podrás acompañarnos?
          </label>
          <div className="flex gap-4">
            <Button
              className="flex-1 text-white"
              style={{
                backgroundColor: colors.success || '#10B981',
                borderColor: colors.success || '#10B981'
              }}
              onClick={() => handleRSVP('confirmed')}
              disabled={isSubmitting || isPreview}
            >
              <Check className="w-4 h-4 mr-2" />
              ¡Sí, asistiré!
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              style={{
                borderColor: colors.error || '#EF4444',
                color: colors.error || '#EF4444'
              }}
              onClick={() => handleRSVP('declined')}
              disabled={isSubmitting || isPreview}
            >
              <X className="w-4 h-4 mr-2" />
              No podré asistir
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
            Número de acompañantes (incluyéndote)
          </label>
          <select
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2"
            style={{
              borderColor: colors.border,
              focusRingColor: colors.primary
            }}
            disabled={isPreview}
          >
            {Array.from({ length: rsvpData.max_guests || 5 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
            Mensaje especial (opcional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg resize-none focus:ring-2"
            style={{
              borderColor: colors.border,
              focusRingColor: colors.primary
            }}
            placeholder="Deja un mensaje de felicitaciones..."
            disabled={isPreview}
          />
        </div>

        {rsvpData.deadline && (
          <p className="text-sm text-center" style={{ color: colors.text_light }}>
            Por favor confirma antes del {new Date(rsvpData.deadline).toLocaleDateString()}
          </p>
        )}

        {rsvpData.message && (
          <div
            className="text-sm text-center p-3 rounded-lg"
            style={{
              backgroundColor: colors.background_alt,
              color: colors.text_light
            }}
          >
            {rsvpData.message}
          </div>
        )}

        {(rsvpData.phone || rsvpData.whatsapp || rsvpData.email) && (
          <div className="text-center">
            <p className="text-sm mb-2" style={{ color: colors.text_light }}>
              ¿Tienes dudas? Contáctanos:
            </p>
            <div className="flex justify-center gap-4 text-sm">
              {rsvpData.whatsapp && (
                <a
                  href={`https://wa.me/${rsvpData.whatsapp}`}
                  className="hover:opacity-80"
                  style={{ color: colors.accent }}
                >
                  WhatsApp
                </a>
              )}
              {rsvpData.phone && (
                <a
                  href={`tel:${rsvpData.phone}`}
                  className="hover:opacity-80"
                  style={{ color: colors.accent }}
                >
                  Teléfono
                </a>
              )}
              {rsvpData.email && (
                <a
                  href={`mailto:${rsvpData.email}`}
                  className="hover:opacity-80"
                  style={{ color: colors.accent }}
                >
                  Email
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};