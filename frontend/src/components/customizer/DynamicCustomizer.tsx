/**
 * Dynamic Customizer Component
 *
 * WHY: Main wrapper component that orchestrates the progressive override
 * customizer system. Preserves beautiful template examples until users
 * explicitly modify fields, then provides smart merging and visual indicators.
 */

'use client';

import React, { useCallback } from 'react';
import { useDynamicCustomizer } from '@/lib/hooks/useDynamicCustomizer';
import { useCustomizerSync } from '@/lib/hooks/useCustomizerSync';
import { CustomizerButton } from './CustomizerButton';
import { CustomizerPanel } from './CustomizerPanel';

interface DynamicCustomizerProps {
  children: React.ReactNode;
  templateData?: any;
  sectionsConfig?: any;
  className?: string;
  templateId?: number;
  onSaveStateReady?: (saveStateFn: () => void) => void;
}

export const DynamicCustomizer: React.FC<DynamicCustomizerProps> = ({
  children,
  templateData = {},
  sectionsConfig = {},
  className = '',
  templateId,
  onSaveStateReady
}) => {

  const {
    isOpen,
    fieldsByCategory,
    hasFields,
    hasChanges,
    sectionsCount,
    fieldsCount,
    touchedFieldsCount,
    fieldStates,
    getFieldValue,
    updateField,
    resetFields,
    resetField,
    toggleCustomizer,
    closeCustomizer,
    getProgressiveMergedData,
    getSectionConfig,
    selectedMode,
    switchMode,
    basicFields,
    customizerData,
    touchedFields,
    restoreState
  } = useDynamicCustomizer({
    templateData,
    sectionsConfig
  });

  // Sync customizer state with localStorage if templateId is provided
  // CAPTURE saveState for immediate save on close
  const { saveState: syncSaveState } = useCustomizerSync({
    templateId: templateId || 0,
    customizerData,
    touchedFields,
    selectedMode,
    onStateRestore: templateId ? restoreState : undefined,
    onSaveStateReady
  });

  // Override closeCustomizer to force immediate save before closing
  // WHY: Prevents race condition where debounced save (500ms) is cancelled
  // when user closes panel quickly and navigates to checkout
  const closeCustomizerWithSave = useCallback(() => {
    // Force immediate save to localStorage (bypasses 500ms debounce)
    if (syncSaveState && templateId) {
      console.log('🔒 [DynamicCustomizer] Forcing immediate save before close');
      syncSaveState();
    }
    // Then close the panel
    closeCustomizer();
  }, [syncSaveState, closeCustomizer, templateId]);

  // Get progressive transformed data for template sections
  const transformedData = getProgressiveMergedData();

  // Clone children and inject merged data
  const enhancedChildren = React.cloneElement(children as React.ReactElement, {
    data: transformedData,
    customPreviewData: transformedData
  });

  return (
    <div className={`relative ${className}`}>
      {/* Enhanced template with custom data */}
      {enhancedChildren}

      {/* Customizer Button */}
      <CustomizerButton
        onClick={toggleCustomizer}
        isOpen={isOpen}
        hasFields={hasFields}
      />

      {/* Customizer Panel with Progressive Override Support */}
      <CustomizerPanel
        isOpen={isOpen}
        onClose={closeCustomizerWithSave}
        fieldsByCategory={fieldsByCategory}
        getFieldValue={getFieldValue}
        updateField={updateField}
        onReset={resetFields}
        onResetField={resetField}
        hasChanges={hasChanges}
        sectionsCount={sectionsCount}
        fieldsCount={fieldsCount}
        touchedFieldsCount={touchedFieldsCount}
        fieldStates={fieldStates}
        getSectionConfig={getSectionConfig}
        selectedMode={selectedMode}
        onModeChange={switchMode}
        basicFields={basicFields}
      />

      {/* 🚨 DEBUG: Log fieldsByCategory being passed to CustomizerPanel */}
    </div>
  );
};