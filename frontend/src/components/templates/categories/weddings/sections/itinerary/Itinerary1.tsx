/**
 * Itinerary Section 1 - Editable Timeline with States
 *
 * WHY: Section that allows couples to configure their wedding itinerary.
 * The client can enable/disable events and assign times for each one.
 *
 * FEATURES:
 * - Title ("Tu Itinerario")
 * - List of possible events (Ceremonia, Recepción, Entrada, Comida, Fiesta)
 * - Checkbox to activate an event
 * - Time input visible only if the event is active
 * - Responsive and clean design
 */

'use client';

import { useState, useEffect } from 'react';
import { PiChurchDuotone } from "react-icons/pi";
import { GiDiamondRing } from "react-icons/gi";
import { FaUsersLine } from "react-icons/fa6";
import { FaUtensils } from "react-icons/fa";
import { BiParty } from "react-icons/bi";

interface ItineraryState {
  id: string;
  label: string;
  enabled: boolean;
  time?: string;
}

interface Itinerary1Props {
  title?: string;
  // Individual event props for customizer integration
  event_ceremonia_enabled?: boolean;
  event_ceremonia_time?: string;
  event_recepcion_enabled?: boolean;
  event_recepcion_time?: string;
  event_entrada_enabled?: boolean;
  event_entrada_time?: string;
  event_comida_enabled?: boolean;
  event_comida_time?: string;
  event_fiesta_enabled?: boolean;
  event_fiesta_time?: string;
}

export const Itinerary1: React.FC<Itinerary1Props> = ({
  title = 'Tu Itinerario',
  event_ceremonia_enabled = true,
  event_ceremonia_time = '13:00',
  event_recepcion_enabled = true,
  event_recepcion_time = '15:30',
  event_entrada_enabled = true,
  event_entrada_time = '16:30',
  event_comida_enabled = true,
  event_comida_time = '17:00',
  event_fiesta_enabled = true,
  event_fiesta_time = '18:00'
}) => {
  // Helper function to convert 24h time to 12h format
  const formatTime = (time24: string): string => {
    if (!time24) return '';

    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const minute = minutes;

    if (hour === 0) return `12:${minute} am`;
    if (hour < 12) return `${hour}:${minute} am`;
    if (hour === 12) return `12:${minute} pm`;
    return `${hour - 12}:${minute} pm`;
  };

  // Initialize state from props
  const [states, setStates] = useState<ItineraryState[]>([
    {
      id: 'ceremonia',
      label: 'Ceremonia',
      enabled: event_ceremonia_enabled,
      time: event_ceremonia_time
    },
    {
      id: 'recepcion',
      label: 'Recepción',
      enabled: event_recepcion_enabled,
      time: event_recepcion_time
    },
    {
      id: 'entrada',
      label: 'Entrada',
      enabled: event_entrada_enabled,
      time: event_entrada_time
    },
    {
      id: 'comida',
      label: 'Comida',
      enabled: event_comida_enabled,
      time: event_comida_time
    },
    {
      id: 'fiesta',
      label: 'Fiesta',
      enabled: event_fiesta_enabled,
      time: event_fiesta_time
    }
  ]);

  // Update states when props change (for customizer integration)
  useEffect(() => {
    setStates([
      {
        id: 'ceremonia',
        label: 'Ceremonia',
        enabled: event_ceremonia_enabled,
        time: event_ceremonia_time
      },
      {
        id: 'recepcion',
        label: 'Recepción',
        enabled: event_recepcion_enabled,
        time: event_recepcion_time
      },
      {
        id: 'entrada',
        label: 'Entrada',
        enabled: event_entrada_enabled,
        time: event_entrada_time
      },
      {
        id: 'comida',
        label: 'Comida',
        enabled: event_comida_enabled,
        time: event_comida_time
      },
      {
        id: 'fiesta',
        label: 'Fiesta',
        enabled: event_fiesta_enabled,
        time: event_fiesta_time
      }
    ]);
  }, [
    event_ceremonia_enabled, event_ceremonia_time,
    event_recepcion_enabled, event_recepcion_time,
    event_entrada_enabled, event_entrada_time,
    event_comida_enabled, event_comida_time,
    event_fiesta_enabled, event_fiesta_time
  ]);

  const toggleEvent = (id: string) => {
    setStates(prev =>
      prev.map(e =>
        e.id === id ? { ...e, enabled: !e.enabled, time: "" } : e
      )
    );
  };

  const setTime = (id: string, time: string) => {
    setStates(prev =>
      prev.map(e =>
        e.id === id ? { ...e, time } : e
      )
    );
  };

  // Filter only enabled events for display
  const enabledEvents = states.filter(event => event.enabled);

  // Don't render if no events are enabled
  if (enabledEvents.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#fdfaf6] py-16" id="itinerary">
      <div className="max-w-3xl mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-great-vibes text-[#C9A646] mb-4">
            {title}
          </h2>
          <div className="w-24 h-0.5 bg-[#C9A646] mx-auto"></div>
        </div>

        {/* Events Timeline - Zigzag Design */}
        <div className="flex items-start justify-center">
          <div className="relative w-full max-w-md">
            {/* LÍNEA VERTICAL CENTRAL */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-[#C9A646]/90"></div>

            {enabledEvents.map((item, index) => {
              const isLeft = index % 2 === 0; // Alternar: izquierda-derecha-izquierda-derecha-izquierda
              const isLast = index === enabledEvents.length - 1;

              return (
                <div key={item.id} className={`relative flex items-center${!isLast ? ' -mb-6' : ''}`}>
                  {/* Tick hacia IZQUIERDA o DERECHA */}
                  <div className={`absolute ${isLeft ? 'right-1/2' : 'left-1/2'} w-12 h-[2px] bg-[#C9A646]/90`}></div>

                  {/* Punto de conexión relleno */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#C9A646]"></div>

                  {/* Contenido del evento */}
                  {isLeft ? (
                    <>
                      {/* LADO IZQUIERDO */}
                      <div className="w-1/2 pr-1">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-4xl leading-none text-[#C9A646]">
                            {item.id === 'ceremonia' && <PiChurchDuotone />}
                            {item.id === 'recepcion' && <GiDiamondRing />}
                            {item.id === 'entrada' && <FaUsersLine />}
                            {item.id === 'comida' && <FaUtensils />}
                            {item.id === 'fiesta' && <BiParty />}
                          </span>
                          <div className="text-center">
                            <h3 className="font-montserrat font-light text-slate-800 uppercase text-xs">
                              {item.label}
                            </h3>
                            {item.time && (
                              <p className="text-sm text-slate-500 font-montserrat font-light">
                                {formatTime(item.time)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-1/2"></div>
                    </>
                  ) : (
                    <>
                      {/* LADO DERECHO */}
                      <div className="w-1/2"></div>
                      <div className="w-1/2 pl-1">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-4xl leading-none text-[#C9A646]">
                            {item.id === 'ceremonia' && <PiChurchDuotone />}
                            {item.id === 'recepcion' && <GiDiamondRing />}
                            {item.id === 'entrada' && <FaUsersLine />}
                            {item.id === 'comida' && <FaUtensils />}
                            {item.id === 'fiesta' && <BiParty />}
                          </span>
                          <div className="text-center">
                            <h3 className="font-montserrat font-light text-slate-800 uppercase text-xs">
                              {item.label}
                            </h3>
                            {item.time && (
                              <p className="text-sm text-slate-500 font-montserrat font-light">
                                {formatTime(item.time)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Mode (only shown in customizer/edit mode) */}
        <div className="mt-12 space-y-5" style={{ display: 'none' }}>
          <h3 className="text-2xl font-semibold text-[#C9A646] text-center font-montserrat mb-6">
            Configurar Eventos
          </h3>

          {states.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border shadow-sm"
            >
              {/* Checkbox + Label */}
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={() => toggleEvent(item.id)}
                  className="h-5 w-5 text-[#C9A646] rounded focus:ring-[#C9A646]"
                />
                <span className="text-gray-700 font-medium font-montserrat">
                  {item.label}
                </span>
              </label>

              {/* Time Picker */}
              {item.enabled && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600 font-montserrat">
                    Hora:
                  </label>
                  <input
                    type="time"
                    value={item.time || ''}
                    onChange={(e) => setTime(item.id, e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-[#C9A646] focus:border-[#C9A646]"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Export default props for centralized access
export const Itinerary1DefaultProps = {
  title: 'Tu Itinerario',
  event_ceremonia_enabled: true,
  event_ceremonia_time: '13:00',
  event_recepcion_enabled: true,
  event_recepcion_time: '15:30',
  event_entrada_enabled: true,
  event_entrada_time: '16:30',
  event_comida_enabled: true,
  event_comida_time: '17:00',
  event_fiesta_enabled: true,
  event_fiesta_time: '18:00'
};