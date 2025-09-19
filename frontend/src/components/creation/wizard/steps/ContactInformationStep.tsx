/**
 * Contact Information Step Component
 * 
 * WHY: Sixth step that collects contact information for the couple,
 * allowing guests to reach out with questions or concerns. Essential
 * for guest support and emergency communications.
 * 
 * WHAT: Form for collecting multiple contact methods including emails,
 * phone numbers, social media links, wedding website URLs, and
 * registry information. Supports both bride and groom contacts.
 * 
 * HOW: Uses validated input fields with format checking, optional
 * field toggles, and preview of how contact info will appear.
 */

import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MessageCircle,
  Instagram,
  Facebook,
  Globe,
  Gift,
  Heart,
  ExternalLink,
  User,
  Users,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WizardStep, StepSection, StepField } from '../WizardStep';
import { WizardStepProps } from '../InvitationWizard';

export const ContactInformationStep: React.FC<WizardStepProps> = ({
  data,
  errors,
  onUpdate,
  onNext,
  onBack,
  isLoading
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [contactPreferences, setContactPreferences] = useState({
    showGroomContact: data.show_groom_contact !== false,
    showBrideContact: data.show_bride_contact !== false,
    showJointContact: data.show_joint_contact || false,
    showSocialMedia: data.show_social_media || false,
    showRegistry: data.show_registry || false
  });

  const handlePreferenceToggle = (preference: keyof typeof contactPreferences, value: boolean) => {
    setContactPreferences(prev => ({ ...prev, [preference]: value }));
    onUpdate('contact', preference, value);
  };

  const handleContinue = () => {
    onNext();
  };

  const getError = (section: string, field: string) => {
    return errors[section]?.[field];
  };

  // Validation helper
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string) => {
    return /^\+?[\d\s\-\(\)]{8,20}$/.test(phone);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <WizardStep isLoading={isLoading}>
      <div className="space-y-8">
        {/* Contact Preferences */}
        <StepSection 
          title="Información de Contacto"
          description="Permite que tus invitados se comuniquen contigo si tienen preguntas"
        >
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="flex items-center cursor-pointer p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={contactPreferences.showGroomContact}
                  onChange={(e) => handlePreferenceToggle('showGroomContact', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                />
                <User className="w-4 h-4 ml-3 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">Contacto del Novio</span>
              </label>

              <label className="flex items-center cursor-pointer p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={contactPreferences.showBrideContact}
                  onChange={(e) => handlePreferenceToggle('showBrideContact', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                />
                <User className="w-4 h-4 ml-3 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">Contacto de la Novia</span>
              </label>

              <label className="flex items-center cursor-pointer p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={contactPreferences.showJointContact}
                  onChange={(e) => handlePreferenceToggle('showJointContact', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                />
                <Users className="w-4 h-4 ml-3 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">Contacto Conjunto</span>
              </label>

              <label className="flex items-center cursor-pointer p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={contactPreferences.showSocialMedia}
                  onChange={(e) => handlePreferenceToggle('showSocialMedia', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                />
                <Instagram className="w-4 h-4 ml-3 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">Redes Sociales</span>
              </label>

              <label className="flex items-center cursor-pointer p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={contactPreferences.showRegistry}
                  onChange={(e) => handlePreferenceToggle('showRegistry', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                />
                <Gift className="w-4 h-4 ml-3 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">Mesa de Regalos</span>
              </label>
            </div>
          </div>
        </StepSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Individual Contacts */}
          <div className="space-y-6">
            {/* Groom Contact */}
            {contactPreferences.showGroomContact && (
              <StepSection 
                title="Contacto del Novio"
                description="Información de contacto del novio"
              >
                <StepField 
                  label="Email del Novio"
                  error={getError('contact', 'contact_groom_email')}
                >
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      placeholder="carlos@email.com"
                      value={data.contact_groom_email || ''}
                      onChange={(e) => onUpdate('contact', 'contact_groom_email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                        data.contact_groom_email && !isValidEmail(data.contact_groom_email)
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                </StepField>

                <StepField 
                  label="Teléfono del Novio"
                  error={getError('contact', 'contact_groom_phone')}
                >
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      placeholder="+51 999 999 999"
                      value={data.contact_groom_phone || ''}
                      onChange={(e) => onUpdate('contact', 'contact_groom_phone', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                        data.contact_groom_phone && !isValidPhone(data.contact_groom_phone)
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                </StepField>

                <StepField 
                  label="WhatsApp del Novio"
                  description="Si es diferente al teléfono principal"
                >
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      placeholder="+51 999 999 999"
                      value={data.contact_groom_whatsapp || ''}
                      onChange={(e) => onUpdate('contact', 'contact_groom_whatsapp', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>
                </StepField>
              </StepSection>
            )}

            {/* Bride Contact */}
            {contactPreferences.showBrideContact && (
              <StepSection 
                title="Contacto de la Novia"
                description="Información de contacto de la novia"
              >
                <StepField 
                  label="Email de la Novia"
                  error={getError('contact', 'contact_bride_email')}
                >
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      placeholder="maria@email.com"
                      value={data.contact_bride_email || ''}
                      onChange={(e) => onUpdate('contact', 'contact_bride_email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                        data.contact_bride_email && !isValidEmail(data.contact_bride_email)
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                </StepField>

                <StepField 
                  label="Teléfono de la Novia"
                  error={getError('contact', 'contact_bride_phone')}
                >
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      placeholder="+51 999 999 999"
                      value={data.contact_bride_phone || ''}
                      onChange={(e) => onUpdate('contact', 'contact_bride_phone', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                        data.contact_bride_phone && !isValidPhone(data.contact_bride_phone)
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                </StepField>

                <StepField 
                  label="WhatsApp de la Novia"
                  description="Si es diferente al teléfono principal"
                >
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      placeholder="+51 999 999 999"
                      value={data.contact_bride_whatsapp || ''}
                      onChange={(e) => onUpdate('contact', 'contact_bride_whatsapp', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>
                </StepField>
              </StepSection>
            )}

            {/* Joint Contact */}
            {contactPreferences.showJointContact && (
              <StepSection 
                title="Contacto Conjunto"
                description="Email o teléfono compartido de la pareja"
              >
                <StepField 
                  label="Email Conjunto"
                  error={getError('contact', 'contact_joint_email')}
                >
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      placeholder="carlosymaria@email.com"
                      value={data.contact_joint_email || ''}
                      onChange={(e) => onUpdate('contact', 'contact_joint_email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                        data.contact_joint_email && !isValidEmail(data.contact_joint_email)
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                </StepField>

                <StepField 
                  label="Teléfono de Contacto Principal"
                >
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      placeholder="+51 999 999 999"
                      value={data.contact_joint_phone || ''}
                      onChange={(e) => onUpdate('contact', 'contact_joint_phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>
                </StepField>
              </StepSection>
            )}
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            {/* Social Media */}
            {contactPreferences.showSocialMedia && (
              <StepSection 
                title="Redes Sociales"
                description="Enlaces a redes sociales de la pareja"
              >
                <StepField label="Instagram">
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="@carlosymaria"
                      value={data.social_instagram || ''}
                      onChange={(e) => onUpdate('contact', 'social_instagram', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>
                </StepField>

                <StepField label="Facebook">
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="url"
                      placeholder="https://facebook.com/carlosymaria"
                      value={data.social_facebook || ''}
                      onChange={(e) => onUpdate('contact', 'social_facebook', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                        data.social_facebook && !isValidUrl(data.social_facebook)
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                </StepField>

                <StepField 
                  label="Website de la Boda"
                  description="Si tienen un sitio web personalizado"
                >
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="url"
                      placeholder="https://carlosymaria.com"
                      value={data.wedding_website || ''}
                      onChange={(e) => onUpdate('contact', 'wedding_website', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                        data.wedding_website && !isValidUrl(data.wedding_website)
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                </StepField>
              </StepSection>
            )}

            {/* Registry Information */}
            {contactPreferences.showRegistry && (
              <StepSection 
                title="Mesa de Regalos"
                description="Información sobre regalos y lista de novios"
              >
                <StepField 
                  label="Enlace a Mesa de Regalos"
                  description="URL de tu lista de regalos"
                >
                  <div className="relative">
                    <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="url"
                      placeholder="https://mesaderegalos.com/carlosymaria"
                      value={data.registry_url || ''}
                      onChange={(e) => onUpdate('contact', 'registry_url', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                        data.registry_url && !isValidUrl(data.registry_url)
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                </StepField>

                <StepField 
                  label="Mensaje sobre Regalos"
                  description="Instrucciones especiales sobre regalos"
                >
                  <textarea
                    placeholder="Tu presencia es nuestro mejor regalo. Si deseas obsequiarnos algo más, puedes encontrar opciones en nuestra mesa de regalos."
                    value={data.registry_message || ''}
                    onChange={(e) => onUpdate('contact', 'registry_message', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                    maxLength={400}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {(data.registry_message || '').length}/400
                  </div>
                </StepField>

                <StepField 
                  label="Número de Cuenta (Opcional)"
                  description="Para transferencias bancarias"
                >
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Banco - Número de cuenta"
                      value={data.bank_account || ''}
                      onChange={(e) => onUpdate('contact', 'bank_account', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>
                </StepField>
              </StepSection>
            )}
          </div>
        </div>

        {/* Preview Toggle */}
        <div className="flex items-center gap-4 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Ocultar Vista Previa
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Ver Vista Previa
              </>
            )}
          </Button>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <StepSection 
            title="Vista Previa de Contacto"
            description="Así aparecerá la información de contacto en tu invitación"
          >
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    ¿Dudas o Preguntas?
                  </h3>
                  <p className="text-gray-600">
                    No dudes en contactarnos
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Individual Contacts */}
                  {(contactPreferences.showGroomContact || contactPreferences.showBrideContact) && (
                    <div className={`grid ${contactPreferences.showGroomContact && contactPreferences.showBrideContact ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
                      {contactPreferences.showGroomContact && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            {data.couple_groom_name || 'Novio'}
                          </h4>
                          <div className="space-y-2 text-sm">
                            {data.contact_groom_email && (
                              <div className="flex items-center text-gray-600">
                                <Mail className="w-4 h-4 mr-2" />
                                <span>{data.contact_groom_email}</span>
                              </div>
                            )}
                            {data.contact_groom_phone && (
                              <div className="flex items-center text-gray-600">
                                <Phone className="w-4 h-4 mr-2" />
                                <span>{data.contact_groom_phone}</span>
                              </div>
                            )}
                            {data.contact_groom_whatsapp && (
                              <div className="flex items-center text-gray-600">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                <span>{data.contact_groom_whatsapp}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {contactPreferences.showBrideContact && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            {data.couple_bride_name || 'Novia'}
                          </h4>
                          <div className="space-y-2 text-sm">
                            {data.contact_bride_email && (
                              <div className="flex items-center text-gray-600">
                                <Mail className="w-4 h-4 mr-2" />
                                <span>{data.contact_bride_email}</span>
                              </div>
                            )}
                            {data.contact_bride_phone && (
                              <div className="flex items-center text-gray-600">
                                <Phone className="w-4 h-4 mr-2" />
                                <span>{data.contact_bride_phone}</span>
                              </div>
                            )}
                            {data.contact_bride_whatsapp && (
                              <div className="flex items-center text-gray-600">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                <span>{data.contact_bride_whatsapp}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Joint Contact */}
                  {contactPreferences.showJointContact && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Contacto Conjunto
                      </h4>
                      <div className="space-y-2 text-sm">
                        {data.contact_joint_email && (
                          <div className="flex items-center text-gray-600">
                            <Mail className="w-4 h-4 mr-2" />
                            <span>{data.contact_joint_email}</span>
                          </div>
                        )}
                        {data.contact_joint_phone && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{data.contact_joint_phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Social Media & Links */}
                  {contactPreferences.showSocialMedia && (data.social_instagram || data.social_facebook || data.wedding_website) && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Síguenos</h4>
                      <div className="flex flex-wrap gap-4">
                        {data.social_instagram && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Instagram className="w-4 h-4 mr-2" />
                            <span>{data.social_instagram}</span>
                          </div>
                        )}
                        {data.social_facebook && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Facebook className="w-4 h-4 mr-2" />
                            <span>Facebook</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </div>
                        )}
                        {data.wedding_website && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Globe className="w-4 h-4 mr-2" />
                            <span>Nuestro Sitio Web</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Registry */}
                  {contactPreferences.showRegistry && (data.registry_url || data.registry_message) && (
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <Gift className="w-4 h-4 mr-2" />
                        Mesa de Regalos
                      </h4>
                      {data.registry_message && (
                        <p className="text-sm text-gray-600">{data.registry_message}</p>
                      )}
                      {data.registry_url && (
                        <div className="flex items-center text-sm text-purple-600">
                          <Gift className="w-4 h-4 mr-2" />
                          <span>Ver Lista de Regalos</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </div>
                      )}
                      {data.bank_account && (
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          <Shield className="w-3 h-3 inline mr-1" />
                          {data.bank_account}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </StepSection>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Configuración RSVP
          </button>
          
          <button
            onClick={handleContinue}
            className="px-8 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
          >
            Continuar →
          </button>
        </div>
      </div>
    </WizardStep>
  );
};

export default ContactInformationStep;