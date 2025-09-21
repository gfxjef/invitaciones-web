/**
 * Simple Editor Component
 *
 * WHY: Provides a simplified editing interface for users who only want
 * to customize basic fields without the complexity of the advanced editor.
 * Category-aware to show relevant fields per event type.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface SimpleEditorProps {
  category: 'weddings' | 'kids' | 'corporate';
  initialData?: any;
  onSave?: (data: any) => void;
  onPreview?: (data: any) => void;
  isLoading?: boolean;
}

interface SimpleFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'date' | 'time' | 'textarea' | 'number' | 'tel';
  placeholder?: string;
  required?: boolean;
  section: string;
}

// Wedding Simple Fields
const WEDDING_SIMPLE_FIELDS: SimpleFieldConfig[] = [
  // Basic Info
  { key: 'couple_bride_name', label: 'Nombre de la Novia', type: 'text', placeholder: 'María', required: true, section: 'basic' },
  { key: 'couple_groom_name', label: 'Nombre del Novio', type: 'text', placeholder: 'Carlos', required: true, section: 'basic' },
  { key: 'event_date', label: 'Fecha de la Boda', type: 'date', required: true, section: 'basic' },
  { key: 'event_time', label: 'Hora de la Ceremonia', type: 'time', required: true, section: 'basic' },

  // Venue
  { key: 'event_venue_name', label: 'Nombre del Lugar', type: 'text', placeholder: 'Iglesia San José', required: true, section: 'venue' },
  { key: 'event_venue_address', label: 'Dirección', type: 'textarea', placeholder: 'Av. Principal 123, Lima', required: true, section: 'venue' },
  { key: 'event_venue_city', label: 'Ciudad', type: 'text', placeholder: 'Lima', section: 'venue' },

  // Contact
  { key: 'rsvp_phone', label: 'Teléfono de Contacto', type: 'tel', placeholder: '+51 999 999 999', section: 'contact' },
  { key: 'rsvp_whatsapp', label: 'WhatsApp', type: 'tel', placeholder: '51999999999', section: 'contact' },
  { key: 'rsvp_deadline', label: 'Confirmar Antes del', type: 'date', section: 'contact' },
];

// Kids Simple Fields
const KIDS_SIMPLE_FIELDS: SimpleFieldConfig[] = [
  // Basic Info
  { key: 'childName', label: 'Nombre del Niño/a', type: 'text', placeholder: 'Sofia', required: true, section: 'basic' },
  { key: 'age', label: 'Edad', type: 'number', placeholder: '5', required: true, section: 'basic' },
  { key: 'birthdayDate', label: 'Fecha de Cumpleaños', type: 'date', required: true, section: 'basic' },
  { key: 'partyTheme', label: 'Tema de la Fiesta', type: 'text', placeholder: 'Princesas', section: 'basic' },

  // Venue
  { key: 'partyLocation', label: 'Lugar de la Fiesta', type: 'text', placeholder: 'Casa de Sofia', required: true, section: 'venue' },
  { key: 'partyAddress', label: 'Dirección', type: 'textarea', placeholder: 'Av. Principal 123, Lima', required: true, section: 'venue' },
  { key: 'partyTime', label: 'Hora de Inicio', type: 'time', required: true, section: 'venue' },
  { key: 'partyEndTime', label: 'Hora de Finalización', type: 'time', section: 'venue' },

  // Contact
  { key: 'parentPhone', label: 'Teléfono de los Padres', type: 'tel', placeholder: '+51 999 999 999', section: 'contact' },
  { key: 'parentWhatsapp', label: 'WhatsApp', type: 'tel', placeholder: '51999999999', section: 'contact' },
  { key: 'rsvpDeadline', label: 'Confirmar Antes del', type: 'date', section: 'contact' },
];

export const SimpleEditor: React.FC<SimpleEditorProps> = ({
  category,
  initialData = {},
  onSave,
  onPreview,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<any>(initialData);
  const [activeTab, setActiveTab] = useState('basic');

  // Select fields based on category
  const fields = category === 'weddings' ? WEDDING_SIMPLE_FIELDS :
                 category === 'kids' ? KIDS_SIMPLE_FIELDS :
                 [];

  // Group fields by section
  const fieldsBySection = fields.reduce((acc, field) => {
    if (!acc[field.section]) {
      acc[field.section] = [];
    }
    acc[field.section].push(field);
    return acc;
  }, {} as Record<string, SimpleFieldConfig[]>);

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(formData);
    }
  };

  const renderField = (field: SimpleFieldConfig) => {
    const value = formData[field.key] || '';

    return (
      <div key={field.key} className="space-y-2">
        <Label htmlFor={field.key} className="text-sm font-medium">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </Label>

        {field.type === 'textarea' ? (
          <Textarea
            id={field.key}
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="min-h-[100px]"
          />
        ) : (
          <Input
            id={field.key}
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )}
      </div>
    );
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'basic': return category === 'weddings' ? 'Información Básica' : 'Datos del Cumpleaños';
      case 'venue': return category === 'weddings' ? 'Lugar de la Ceremonia' : 'Lugar de la Fiesta';
      case 'contact': return 'Información de Contacto';
      default: return section;
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'basic': return category === 'weddings' ? '💕' : '🎂';
      case 'venue': return category === 'weddings' ? '⛪' : '🏠';
      case 'contact': return '📞';
      default: return '📝';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {category === 'weddings' ? 'Editor Simple - Boda' :
           category === 'kids' ? 'Editor Simple - Cumpleaños' :
           'Editor Simple'}
        </h1>
        <p className="text-gray-600">
          Completa solo los campos básicos para crear tu {category === 'weddings' ? 'invitación de boda' : 'invitación de cumpleaños'}
        </p>
      </div>

      {/* Tabs for sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {Object.keys(fieldsBySection).map((section) => (
            <TabsTrigger key={section} value={section} className="text-sm">
              {getSectionIcon(section)} {getSectionTitle(section)}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(fieldsBySection).map(([section, sectionFields]) => (
          <TabsContent key={section} value={section}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{getSectionIcon(section)}</span>
                  {getSectionTitle(section)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {sectionFields.map(renderField)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
        <Button
          onClick={handlePreview}
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={isLoading}
        >
          👀 Vista Previa
        </Button>

        <Button
          onClick={handleSave}
          size="lg"
          className="flex-1"
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : '💾 Guardar Cambios'}
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500 mt-6">
        💡 <strong>Tip:</strong> Puedes cambiar al editor avanzado después para personalizar colores, fuentes y más detalles.
      </div>
    </div>
  );
};