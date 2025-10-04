'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

interface FlowStep {
  step: number;
  name: string;
  location: string;
  data: any;
  timestamp: string;
}

export default function DataFlowDebugger() {
  const [invitationId, setInvitationId] = useState('a4947661');
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para rastrear todo el flujo de datos
  const traceDataFlow = async () => {
    setLoading(true);
    setError(null);
    const steps: FlowStep[] = [];

    try {
      // PASO 1: Llamar al backend y obtener respuesta RAW
      console.log('📡 PASO 1: Fetching from backend...');
      const response = await apiClient.get(`/invitations/by-url/${invitationId}`);
      const backendData = response.data;

      steps.push({
        step: 1,
        name: '📡 Backend Response (RAW)',
        location: 'GET /api/invitations/by-url/{id}',
        data: {
          success: backendData.success,
          invitation: {
            id: backendData.invitation?.id,
            title: backendData.invitation?.title,
            bride_name: backendData.invitation?.bride_name,
            groom_name: backendData.invitation?.groom_name,
            wedding_date: backendData.invitation?.wedding_date,
          },
          sections_data: backendData.sections_data,
          template_id: backendData.template_id
        },
        timestamp: new Date().toISOString()
      });

      // PASO 2: Extraer sección HERO específicamente
      console.log('🎯 PASO 2: Extracting HERO section...');
      const heroSection = backendData.sections_data?.hero;

      steps.push({
        step: 2,
        name: '🎯 Hero Section (from Backend)',
        location: 'sections_data.hero',
        data: {
          variant: heroSection?.variant,
          category: heroSection?.category,
          variables: heroSection?.variables,
          variables_keys: heroSection?.variables ? Object.keys(heroSection.variables) : [],
          // Campos específicos de nombres y fecha
          FOCUS: {
            bride_name: heroSection?.variables?.bride_name,
            groom_name: heroSection?.variables?.groom_name,
            date: heroSection?.variables?.date,
            weddingDate: heroSection?.variables?.weddingDate,
            location: heroSection?.variables?.location,
            eventLocation: heroSection?.variables?.eventLocation,
          }
        },
        timestamp: new Date().toISOString()
      });

      // PASO 3: Simular transformación del frontend (transformBackendInvitationData)
      console.log('🔄 PASO 3: Frontend transformation...');
      const transformedData: any = {};

      if (backendData.sections_data) {
        Object.entries(backendData.sections_data).forEach(([sectionType, sectionInfo]: [string, any]) => {
          if (sectionInfo.variables) {
            // Almacenar variables directamente bajo el nombre de sección (SIN PREFIJOS)
            transformedData[sectionType] = sectionInfo.variables;
          }
        });
      }

      steps.push({
        step: 3,
        name: '🔄 Frontend Transformation',
        location: 'transformBackendInvitationData() function',
        data: {
          structure: 'Nested by section (NO prefixes)',
          hero_section: transformedData.hero,
          hero_keys: transformedData.hero ? Object.keys(transformedData.hero) : [],
          FOCUS: {
            'hero.bride_name': transformedData.hero?.bride_name,
            'hero.groom_name': transformedData.hero?.groom_name,
            'hero.date': transformedData.hero?.date,
            'hero.weddingDate': transformedData.hero?.weddingDate,
            'hero.location': transformedData.hero?.location,
          }
        },
        timestamp: new Date().toISOString()
      });

      // PASO 4: TemplateBuilder recibe los datos
      console.log('🏗️ PASO 4: TemplateBuilder receives data...');
      const modularData = transformedData;
      const heroProps = modularData?.hero || {};

      steps.push({
        step: 4,
        name: '🏗️ TemplateBuilder (modularData)',
        location: 'TemplateBuilder component',
        data: {
          modularData_keys: Object.keys(modularData),
          modularData_hero: modularData.hero,
          hero_props_to_component: heroProps,
          FOCUS: {
            'props.bride_name': heroProps.bride_name,
            'props.groom_name': heroProps.groom_name,
            'props.date': heroProps.date,
            'props.weddingDate': heroProps.weddingDate,
            'props.location': heroProps.location,
          }
        },
        timestamp: new Date().toISOString()
      });

      // PASO 5: Hero componente recibe props
      console.log('🎨 PASO 5: Hero component receives props...');
      const coupleNames = heroProps.groom_name && heroProps.bride_name
        ? `${heroProps.groom_name} & ${heroProps.bride_name}`
        : 'NO DATA';

      steps.push({
        step: 5,
        name: '🎨 Hero Component (final render)',
        location: 'Hero1.tsx or Hero2.tsx',
        data: {
          received_props: heroProps,
          COMPUTED_VALUES: {
            coupleNames: coupleNames,
            formula: '`${groom_name} & ${bride_name}`',
            explanation: 'Hero component composes this from individual names'
          },
          FOCUS: {
            'INPUT: bride_name': heroProps.bride_name,
            'INPUT: groom_name': heroProps.groom_name,
            'INPUT: date': heroProps.date,
            'INPUT: weddingDate': heroProps.weddingDate,
            'OUTPUT: coupleNames': coupleNames,
          }
        },
        timestamp: new Date().toISOString()
      });

      // PASO 6: Verificar si hay general section (para Footer)
      console.log('📊 PASO 6: Checking general section...');
      const generalSection = backendData.sections_data?.general;

      steps.push({
        step: 6,
        name: '📊 General Section (for Footer/shared data)',
        location: 'sections_data.general',
        data: {
          exists: !!generalSection,
          variables: generalSection?.variables || null,
          FOCUS: {
            'general.bride_name': generalSection?.variables?.bride_name,
            'general.groom_name': generalSection?.variables?.groom_name,
            'general.weddingDate': generalSection?.variables?.weddingDate,
            'general.eventLocation': generalSection?.variables?.eventLocation,
          }
        },
        timestamp: new Date().toISOString()
      });

      // PASO 7: CONFIRMACIÓN - Este es el flujo exacto de la página real
      console.log('✅ PASO 7: Confirmation...');
      const realPageUrl = `http://localhost:3000/invitacion/${invitationId}`;

      steps.push({
        step: 7,
        name: '✅ CONFIRMACIÓN FINAL',
        location: `http://localhost:3000/invitacion/${invitationId}`,
        data: {
          confirmation: '🎯 Este debugger simula EXACTAMENTE el flujo de la página real',
          real_page_url: realPageUrl,
          page_file: 'frontend/src/app/invitacion/[id]/page.tsx',
          flow_summary: {
            '1. Backend call': 'apiClient.get(`/invitations/by-url/${invitationId}`)',
            '2. Transform data': 'transformBackendInvitationData(backendData, templateData)',
            '3. Pass to renderer': 'TemplateRenderer with customPreviewData={transformedData}',
            '4. TemplateBuilder': 'Receives data as modularData',
            '5. Section components': 'Hero receives props WITHOUT prefixes',
            '6. Final render': 'Hero composes coupleNames = `${groom_name} & ${bride_name}`'
          },
          validation: {
            backend_endpoint: '✅ /api/invitations/by-url/{id}',
            frontend_transformation: '✅ transformBackendInvitationData() - NO PREFIXES',
            component_props: '✅ Hero receives {bride_name, groom_name, date, location}',
            final_display: heroProps.groom_name && heroProps.bride_name
              ? `✅ Shows: "${heroProps.groom_name} & ${heroProps.bride_name}"`
              : '❌ Missing names - check data flow above'
          },
          FOCUS: {
            '🌐 Real Page URL': realPageUrl,
            '📄 Page Component': '/app/invitacion/[id]/page.tsx',
            '🎨 Template Used': `Template ${backendData.template_id}`,
            '✨ Final Result': heroProps.groom_name && heroProps.bride_name
              ? `"${heroProps.groom_name} & ${heroProps.bride_name}"`
              : 'NO DATA - Check previous steps',
          }
        },
        timestamp: new Date().toISOString()
      });

      setFlowSteps(steps);

    } catch (err: any) {
      console.error('❌ Error tracing data flow:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔬 Data Flow Debugger
          </h1>
          <p className="text-gray-600 text-sm mb-4">
            Rastrea el flujo completo de datos desde la BD → Backend → Frontend → Componente
          </p>

          {/* Controls */}
          <div className="space-y-3">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invitation ID (unique_url):
                </label>
                <input
                  type="text"
                  value={invitationId}
                  onChange={(e) => setInvitationId(e.target.value)}
                  placeholder="a4947661"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={traceDataFlow}
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? '🔄 Tracing...' : '🚀 Trace Data Flow'}
              </button>
            </div>

            {/* Link to real page */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Comparar con página real:</span>
              <a
                href={`/invitacion/${invitationId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                🔗 Abrir /invitacion/{invitationId}
              </a>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 font-medium">❌ Error:</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}
        </div>

        {/* Flow Steps */}
        {flowSteps.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                📋 Flow Summary
              </h2>
              <p className="text-sm text-gray-600">
                Tracked {flowSteps.length} steps in the data transformation pipeline
              </p>
            </div>

            {flowSteps.map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                {/* Step Header */}
                <div className={`px-6 py-4 ${
                  step.name.includes('FOCUS') || step.name.includes('Hero')
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                } text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">
                        Step {step.step}: {step.name}
                      </h3>
                      <p className="text-sm opacity-90">{step.location}</p>
                    </div>
                    <div className="text-xs opacity-75">
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Step Data */}
                <div className="p-6">
                  {/* Highlight FOCUS section */}
                  {step.data.FOCUS && (
                    <div className="mb-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                      <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                        <span className="text-2xl">🎯</span>
                        FOCUS: Nombres y Fecha
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(step.data.FOCUS).map(([key, value]) => (
                          <div key={key} className="bg-white rounded p-3 border border-yellow-200">
                            <div className="text-xs font-mono text-gray-500 mb-1">{key}</div>
                            <div className={`font-bold ${
                              value ? 'text-green-600' : 'text-red-500'
                            }`}>
                              {value !== undefined && value !== null
                                ? JSON.stringify(value)
                                : '❌ undefined'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Computed Values (for Hero component) */}
                  {step.data.COMPUTED_VALUES && (
                    <div className="mb-4 bg-green-50 border-2 border-green-300 rounded-lg p-4">
                      <h4 className="font-bold text-green-800 mb-3">
                        ✨ Computed Values
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(step.data.COMPUTED_VALUES).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-mono text-gray-600">{key}:</span>{' '}
                            <span className="font-semibold text-green-700">
                              {typeof value === 'string' ? value : JSON.stringify(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Full Data */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 select-none">
                      📦 View Full Data (click to expand)
                    </summary>
                    <pre className="mt-3 bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-xs max-h-96">
                      {JSON.stringify(step.data, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        {flowSteps.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Ready to Debug
            </h3>
            <p className="text-gray-600 mb-6">
              Ingresa un invitation ID y haz click en "Trace Data Flow" para comenzar el análisis
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-2xl mx-auto">
              <h4 className="font-bold text-blue-900 mb-2">📝 Qué hace este debugger:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Paso 1: Obtiene datos RAW del backend</li>
                <li>Paso 2: Extrae la sección Hero con todos sus campos</li>
                <li>Paso 3: Simula la transformación del frontend (sin prefijos)</li>
                <li>Paso 4: Muestra qué recibe TemplateBuilder</li>
                <li>Paso 5: Muestra qué recibe el componente Hero y cómo arma coupleNames</li>
                <li>Paso 6: Verifica datos en la sección General (Footer)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
