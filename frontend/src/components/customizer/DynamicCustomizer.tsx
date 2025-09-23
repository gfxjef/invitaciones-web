/**
 * Dynamic Customizer Component
 *
 * WHY: Main wrapper component that orchestrates the progressive override
 * customizer system. Preserves beautiful template examples until users
 * explicitly modify fields, then provides smart merging and visual indicators.
 */

'use client';

import React from 'react';
import { useDynamicCustomizer } from '@/lib/hooks/useDynamicCustomizer';
import { CustomizerButton } from './CustomizerButton';
import { CustomizerPanel } from './CustomizerPanel';

interface DynamicCustomizerProps {
  children: React.ReactNode;
  templateData?: any;
  sectionsConfig?: any;
  className?: string;
}

export const DynamicCustomizer: React.FC<DynamicCustomizerProps> = ({
  children,
  templateData = {},
  sectionsConfig = {},
  className = ''
}) => {

  // 🚨 DEBUG: Log when DynamicCustomizer mounts
  console.log('🚨 DynamicCustomizer mounted with:', {
    templateData: templateData?.id || 'no-id',
    sectionsConfig,
    hasSectionsConfig: !!sectionsConfig
  });

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
    basicFields
  } = useDynamicCustomizer({
    templateData,
    sectionsConfig
  });

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
        onClose={closeCustomizer}
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
      {(() => {
        console.log('🚨 DynamicCustomizer passing to CustomizerPanel:', {
          fieldsByCategory,
          sectionsCount,
          fieldsCount,
          gallerySection: fieldsByCategory?.gallery || 'NO GALLERY',
          galleryFields: fieldsByCategory?.gallery?.length || 0,
          selectedMode,
          basicFields: basicFields?.slice(0, 5) || []
        });
        return null;
      })()}
    </div>
  );
};