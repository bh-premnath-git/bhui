import React, { useEffect, useState, Suspense } from 'react';

// Lazy load ReaderOptionsForm to avoid circular dependency
const ReaderOptionsForm = React.lazy(() => 
  import('@/components/bh-reactflow-comps/builddata/ReaderOptionsForm').then(module => ({
    default: module.ReaderOptionsForm
  }))
);

interface ReaderWrapperProps {
  schema: any;
  form: any;
  sourceColumns?: Array<{ name: string; dataType: string }>;
  onExpressionGenerate?: (fieldName: string) => Promise<void>;
  isGenerating?: boolean;
  parentKey?: string;
  [key: string]: any;
}

export const ReaderWrapper: React.FC<ReaderWrapperProps> = ({
  schema,
  form,
  sourceColumns,
  onExpressionGenerate,
  isGenerating,
  parentKey,
  ...props
}) => {
  const { setValue, watch } = form;
  const formValues = watch();
  
  // Get initial values from schema (this comes from the pipeline JSON)
  const initialValues = schema?.initialValues;
  
  // Handle form submission from ReaderOptionsForm
  const handleSubmit = (data: any) => {
    // Update form values using react-hook-form setValue
    Object.keys(data).forEach(key => {
      setValue(key, data[key], { shouldValidate: true, shouldDirty: true });
    });
  };

  // Handle close (if needed)
  const handleClose = () => {
    // Could emit an event or call a callback if needed
  };

  // Handle source updates
  const handleSourceUpdate = (updatedSource: any) => {
    console.log('🔧 ReaderWrapper: Source updated:', updatedSource);
    setValue('source', updatedSource, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-4">
      {/* Success indicator */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-green-800 font-semibold mb-2">✅ Custom Reader Component Active!</h3>
        <p className="text-green-700 text-sm">
          Using the existing ReaderOptionsForm component with custom ui-hint support.
        </p>
      </div>
      
      {/* Render the existing ReaderOptionsForm */}
      <Suspense fallback={<div className="flex items-center justify-center h-64">Loading Reader Form...</div>}>
        <ReaderOptionsForm
          onSubmit={handleSubmit}
          onClose={handleClose}
          initialData={initialValues || formValues}
          onSourceUpdate={handleSourceUpdate}
          nodeId={parentKey}
        />
      </Suspense>
      
      {/* Debug Information */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">🔍 Debug Information</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>Schema Title:</strong> {schema?.title || 'N/A'}</p>
          <p><strong>UI Hint:</strong> {schema?.properties?.['ui-hint'] || 'N/A'}</p>
          <p><strong>Component:</strong> {schema?.properties?.component || 'N/A'}</p>
          <p><strong>Source Columns:</strong> {sourceColumns?.length || 0}</p>
          <p><strong>Current Form Values:</strong></p>
          <pre className="bg-white p-2 rounded border text-xs overflow-auto max-h-32">
            {JSON.stringify(formValues, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};