'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface StorageData {
  storageKey: string;
  totalFields: number;
  nonEmptyFields: number;
  customizerData: Record<string, any>;
  touchedFields: Record<string, boolean>;
  selectedMode: string;
}

interface SectionsData {
  [sectionType: string]: Record<string, any>;
}

export default function TestStoragePage() {
  const [storageData, setStorageData] = useState<StorageData | null>(null);
  const [sectionsData, setSectionsData] = useState<SectionsData | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Función para leer localStorage
  const readLocalStorage = () => {
    const storageKey = 'demo-customizer-9';
    const rawData = localStorage.getItem(storageKey);

    if (!rawData) {
      setError('No data found in localStorage');
      return;
    }

    try {
      const parsed = JSON.parse(rawData);
      const customizerData = parsed.customizerData || {};
      const touchedFields = parsed.touchedFields || {};

      const nonEmpty = Object.entries(customizerData).filter(([k, v]) =>
        v !== '' && v !== null && v !== undefined
      );

      setStorageData({
        storageKey,
        totalFields: Object.keys(customizerData).length,
        nonEmptyFields: nonEmpty.length,
        customizerData,
        touchedFields,
        selectedMode: parsed.selectedMode || 'basic'
      });

      setError(null);
    } catch (err) {
      setError(`Error parsing localStorage: ${err}`);
    }
  };

  // Función para transformar a sections_data (igual que en invitations.ts)
  const transformToSections = () => {
    if (!storageData) {
      setError('No storage data loaded');
      return;
    }

    const { customizerData } = storageData;
    const sectionTypes = [
      'hero', 'welcome', 'couple', 'countdown', 'gallery', 'story',
      'video', 'itinerary', 'familiares', 'place_religioso',
      'place_ceremonia', 'vestimenta', 'footer'
    ];

    const sectionsData: SectionsData = {};

    // Initialize section objects
    sectionTypes.forEach(section => {
      sectionsData[section] = {};
    });

    // Map generic field names to their proper section-prefixed equivalents
    const fieldMapping: Record<string, string> = {
      'groom_name': 'hero_groom_name',
      'bride_name': 'hero_bride_name',
      'eventLocation': 'hero_location',
      'weddingDate': 'hero_date',
      'heroImageUrl': 'hero_image',
    };

    // Group fields by section
    Object.entries(customizerData).forEach(([key, value]) => {
      // Skip null, undefined, or empty values
      if (value === null || value === undefined || value === '') {
        return;
      }

      // Apply field mapping if generic name exists
      let processedKey = key;
      if (fieldMapping[key]) {
        processedKey = fieldMapping[key];
        console.log(`🔄 Mapped generic field: ${key} → ${processedKey}`);
      }

      // Find which section this key belongs to
      const matchedSection = sectionTypes.find(section => processedKey.startsWith(`${section}_`));

      if (matchedSection) {
        // Remove section prefix to get variable name
        const variableName = processedKey.substring(matchedSection.length + 1);
        sectionsData[matchedSection][variableName] = value;
      } else {
        // Handle keys without section prefix (store in 'general' section)
        if (!sectionsData.general) {
          sectionsData.general = {};
        }
        sectionsData.general[processedKey] = value;
      }
    });

    // Remove sections with no data
    Object.keys(sectionsData).forEach(section => {
      if (Object.keys(sectionsData[section]).length === 0) {
        delete sectionsData[section];
      }
    });

    setSectionsData(sectionsData);
    setError(null);
  };

  // Función para simular el envío al backend
  const simulateBackendRequest = async () => {
    if (!sectionsData) {
      setError('No sections data to send');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      order_id: 999, // Test order ID
      template_id: 9,
      plan_id: 1,
      sections_data: sectionsData,
      groom_name: 'Carlos Méndez',
      bride_name: 'María González',
      event_date: '2024-12-15T17:00:00'
    };

    try {
      console.log('📤 Sending payload to backend:', payload);

      // Enviar al endpoint real (apiClient baseURL already includes /api)
      const response = await apiClient.post('/invitations/test-sections', payload);

      setApiResponse(response.data);
      setError(null);
    } catch (err: any) {
      console.error('❌ Backend error:', err);
      setError(`Backend error: ${err.response?.data?.error || err.message}`);
      setApiResponse(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on mount
  useEffect(() => {
    readLocalStorage();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔬 Storage & Sections Data Playground</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LocalStorage Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              📦 LocalStorage Data
              <button
                onClick={readLocalStorage}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Reload
              </button>
            </h2>

            {error && !storageData && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {storageData && (
              <div className="space-y-3">
                <div className="bg-blue-50 rounded p-3">
                  <p className="text-sm font-medium">Storage Key: <code className="bg-white px-2 py-1 rounded">{storageData.storageKey}</code></p>
                  <p className="text-sm">Total Fields: <strong>{storageData.totalFields}</strong></p>
                  <p className="text-sm">Non-Empty Fields: <strong className={storageData.nonEmptyFields > 0 ? 'text-green-600' : 'text-red-600'}>{storageData.nonEmptyFields}</strong></p>
                  <p className="text-sm">Selected Mode: <strong>{storageData.selectedMode}</strong></p>
                </div>

                <div>
                  <h3 className="font-medium text-sm mb-2">Customizer Data (First 10):</h3>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-auto max-h-64">
                    {JSON.stringify(
                      Object.fromEntries(
                        Object.entries(storageData.customizerData).slice(0, 10)
                      ),
                      null,
                      2
                    )}
                  </pre>
                </div>

                <button
                  onClick={transformToSections}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  ➡️ Transform to Sections
                </button>
              </div>
            )}
          </div>

          {/* Sections Data Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🗂️ Sections Data (Backend Format)</h2>

            {sectionsData ? (
              <div className="space-y-3">
                <div className="bg-green-50 rounded p-3">
                  <p className="text-sm">Total Sections: <strong>{Object.keys(sectionsData).length}</strong></p>
                  <p className="text-sm">Sections with Data: <strong className="text-green-600">
                    {Object.values(sectionsData).filter(s => Object.keys(s).length > 0).length}
                  </strong></p>
                </div>

                <div>
                  <h3 className="font-medium text-sm mb-2">Sections Breakdown:</h3>
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {Object.entries(sectionsData).map(([sectionType, variables]) => (
                      <div key={sectionType} className="bg-gray-50 p-2 rounded">
                        <p className="font-medium text-sm">{sectionType}</p>
                        <p className="text-xs text-gray-600">
                          {Object.keys(variables).length} variables
                        </p>
                        {Object.keys(variables).length > 0 && (
                          <pre className="text-xs mt-1 bg-white p-2 rounded">
                            {JSON.stringify(variables, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={simulateBackendRequest}
                  disabled={loading}
                  className={`w-full px-4 py-2 rounded text-white ${
                    loading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {loading ? '⏳ Sending...' : '📤 Send to Backend (Test)'}
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Transform localStorage data first</p>
            )}
          </div>
        </div>

        {/* API Response Panel */}
        {(apiResponse || (error && !storageData)) && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {apiResponse ? '✅ Backend Response' : '❌ Error'}
            </h2>

            {error && !storageData && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <pre className="text-red-700 text-sm whitespace-pre-wrap">{error}</pre>
              </div>
            )}

            {apiResponse && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <pre className="text-sm overflow-auto max-h-96">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">ℹ️ How to Use:</h3>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Go to <code className="bg-white px-2 py-1 rounded">/invitacion/demo/9</code> and customize fields</li>
            <li>Come back here and click "Reload" to see localStorage data</li>
            <li>Click "Transform to Sections" to see how data is grouped</li>
            <li>Click "Send to Backend" to test the API call</li>
            <li>Check if sections_data is correctly formatted and sent</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
