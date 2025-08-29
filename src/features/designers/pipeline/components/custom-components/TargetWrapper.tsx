import React, { useEffect } from 'react';
import { TargetPopUp } from '@/components/bh-reactflow-comps/TargetPopUp';

interface TargetWrapperProps {
  schema: any;
  form: any;
  sourceColumns?: Array<{ name: string; dataType: string }>;
  onExpressionGenerate?: (fieldName: string) => Promise<void>;
  isGenerating?: boolean;
  parentKey?: string;
  [key: string]: any;
}

export const TargetWrapper: React.FC<TargetWrapperProps> = ({
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
  
  useEffect(() => {
    console.log('🎯 TargetWrapper successfully rendered!');
    console.log('🎯 Schema title:', schema?.title);
    console.log('🎯 Form values:', formValues);
  }, [schema, formValues]);

  // Handle form submission
  const handleSubmit = (data: any) => {
    console.log('🎯 TargetWrapper: Form submitted with data:', data);
    
    // Update form values using react-hook-form setValue
    Object.keys(data).forEach(key => {
      setValue(key, data[key], { shouldValidate: true, shouldDirty: true });
    });
  };

  // Handle close
  const handleClose = () => {
    console.log('🎯 TargetWrapper: Form closed');
  };

  return (
    <div className="space-y-4">
      {/* Success indicator */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-green-800 font-semibold mb-2">✅ Custom Target Component Active!</h3>
        <p className="text-green-700 text-sm">
          Using the existing TargetPopUp component with custom ui-hint support.
        </p>
      </div>
      
      {/* Render the existing TargetPopUp */}
      <TargetPopUp
        onSubmit={handleSubmit}
        onClose={handleClose}
        initialData={formValues}
        nodeId={parentKey}
        sourceColumns={sourceColumns}
      />
      
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