import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FieldRenderer } from './FieldRenderer';
import { ArrayField } from './ArrayField';
import { NestedObjectRenderer } from './NestedObjectRenderer';
import { FormFields } from '@/features/admin/connection/components/FormFields';
import { getCustomComponent } from './custom-components/componentRegistry';
import { 
  SchemaProperty, 
  extractConditionalFields, 
  isConditionMet, 
  areAllConditionsMet,
  getActiveFields,
  extractPropertiesFromSchema,
  formatFieldTitle
} from './schemaUtils';

interface ConditionalSchemaRendererProps {
  schema: SchemaProperty;
  parentKey?: string;
  twoColumnLayout?: boolean;
  useTabs?: boolean;
  sourceColumns?: Array<{ name: string; dataType: string }>;
  onExpressionGenerate?: (fieldName: string) => Promise<void>;
  isGenerating?: boolean;
  onClosePipelineForm?: () => void; // Function to close the parent pipeline form
}

// Global state to manage custom component dialogs
interface CustomComponentState {
  isOpen: boolean;
  component: React.ComponentType<any> | null;
  props: any;
  id: string;
}

let customComponentState: CustomComponentState = {
  isOpen: false,
  component: null,
  props: {},
  id: ''
};

let customComponentStateListeners: (() => void)[] = [];

const setCustomComponentState = (newState: Partial<CustomComponentState>) => {
  customComponentState = { ...customComponentState, ...newState };
  customComponentStateListeners.forEach(listener => listener());
};

const useCustomComponentState = () => {
  const [state, setState] = useState(customComponentState);
  
  useEffect(() => {
    const listener = () => setState({ ...customComponentState });
    customComponentStateListeners.push(listener);
    return () => {
      customComponentStateListeners = customComponentStateListeners.filter(l => l !== listener);
    };
  }, []);
  
  return state;
};

// Global Custom Component Renderer - renders custom components outside the main component tree
export const GlobalCustomComponentRenderer: React.FC = () => {
  const { isOpen, component: CustomComponent, props, id } = useCustomComponentState();
  
  if (!isOpen || !CustomComponent) {
    return null;
  }
  
  console.log('🔧 GlobalCustomComponentRenderer: Rendering component:', id);
  
  return (
    <CustomComponent
      isOpen={isOpen}
      onClose={() => {
        console.log('🔧 GlobalCustomComponentRenderer: Closing component:', id);
        setCustomComponentState({
          isOpen: false,
          component: null,
          props: {},
          id: ''
        });
      }}
      {...props}
    />
  );
};

export const ConditionalSchemaRenderer: React.FC<ConditionalSchemaRendererProps> = ({
  schema,
  parentKey = '',
  twoColumnLayout = false,
  useTabs = true,
  sourceColumns = [],
  onExpressionGenerate,
  isGenerating = false,
  onClosePipelineForm,
}) => {
  const form = useFormContext();
  
  // Debug: Log schema structure to understand the format
  console.log('🔍 ConditionalSchemaRenderer received schema:', {
    title: schema?.title,
    hasProperties: !!schema?.properties,
    uiHint: schema?.properties?.['ui-hint'],
    component: schema?.properties?.component,
    properties: schema?.properties ? Object.keys(schema.properties) : [],
    fullSchema: schema
  });
  
  // Check if the schema properties have custom UI hint
  const hasCustomUIHint = schema?.properties?.['ui-hint'] === 'custom' && schema?.properties?.component;
  
  // If this schema has a custom component, render it instead of the dynamic form
  if (hasCustomUIHint) {
    const CustomComponent = getCustomComponent(schema.properties.component);
    
    if (!CustomComponent) {
      console.error(`Custom component not found: ${schema.properties.component}`);
      return (
        <div className="text-red-500 text-sm p-4 border border-red-200 rounded-md">
          <strong>Error:</strong> Custom component "{schema.properties.component}" not found
        </div>
      );
    }

    console.log('🔧 Rendering custom schema component:', schema.properties.component);
    console.log('🔧 Schema with custom ui-hint:', {
      uiHint: schema.properties['ui-hint'],
      component: schema.properties.component,
      schemaTitle: schema.title,
      properties: Object.keys(schema.properties || {})
    });
    
    // Special handling for OrderPopUp component which expects different props
    if (schema.properties.component === 'ReaderOptionsForm.tsx' || schema.properties.component === 'ReaderOptionsForm') {
      const dialogId = useRef(`reader_${parentKey}_${Date.now()}`).current; // Unique ID for this dialog
      const formValues = form.watch();

      // Effect to handle opening the custom component globally
      useEffect(() => {
        const CustomComponent = getCustomComponent(schema.properties.component);
        if (CustomComponent) {
          // Capture current form values at the time of opening
          const currentFormValues = form.getValues();
          console.log('🔧 Current form values:', currentFormValues);
          console.log('🔧 Schema:', schema);
          console.log('🔧 Parent key:', parentKey);
          
          // Prepare source data with proper initial values
          const isEmpty = !currentFormValues || Object.keys(currentFormValues).length === 0;
          const defaultName = schema?.title || parentKey || 'New Reader';
          
          // Create comprehensive source data
          const sourceData = {
            // Basic info - These are the key fields OrderPopUp looks for
            data_src_name: currentFormValues?.name || currentFormValues?.reader_name || defaultName,
            name: currentFormValues?.name || currentFormValues?.reader_name || defaultName,
            reader_name: currentFormValues?.reader_name || currentFormValues?.name || defaultName,
            
            // File info
            file_type: currentFormValues?.file_type || currentFormValues?.source?.file_type || 'CSV',
            file_name: currentFormValues?.file_name || currentFormValues?.source?.file_name || '',
            table_name: currentFormValues?.table_name || currentFormValues?.source?.table_name || '',
            
            // CRITICAL: Connection info - OrderPopUp uses this to find connection in connectionConfigList
            connection_config_id: currentFormValues?.connection_config_id || 
                                 currentFormValues?.source?.connection_config_id || 
                                 currentFormValues?.connection?.connection_config_id ||
                                 currentFormValues?.connection?.id || '',
            
            file_path_prefix: currentFormValues?.file_path_prefix || 
                             currentFormValues?.source?.connection?.file_path_prefix || 
                             currentFormValues?.connection?.file_path_prefix || '',
            
            // Project info
            bh_project_id: currentFormValues?.bh_project_id || currentFormValues?.source?.bh_project_id || '',
            data_src_id: currentFormValues?.data_src_id || currentFormValues?.source?.data_src_id || '',
            
            // Connection object - OrderPopUp uses this for fallback connection lookup
            connection: {
              // CRITICAL: name should match connection_config_name in connectionConfigList
              name: currentFormValues?.connection?.connection_config_name || 
                   currentFormValues?.source?.connection?.connection_config_name ||
                   currentFormValues?.connection?.name || 
                   currentFormValues?.source?.connection?.name || 
                   currentFormValues?.connection?.connection_name || '',
              connection_config_id: currentFormValues?.connection?.connection_config_id || 
                                   currentFormValues?.connection?.id ||
                                   currentFormValues?.source?.connection?.connection_config_id || '',
              file_path_prefix: currentFormValues?.connection?.file_path_prefix || 
                               currentFormValues?.source?.connection?.file_path_prefix || 
                               currentFormValues?.file_path_prefix || '',
              file_type: currentFormValues?.connection?.file_type || 
                        currentFormValues?.source?.connection?.file_type || 
                        currentFormValues?.file_type || 'CSV',
              table_name: currentFormValues?.connection?.table_name || 
                         currentFormValues?.source?.connection?.table_name || 
                         currentFormValues?.table_name || '',
              ...currentFormValues?.connection
            },
            
            // Source object (for OrderPopUp compatibility)
            source: {
              type: currentFormValues?.source?.type || 'File',
              source_name: currentFormValues?.source?.source_name || currentFormValues?.name || defaultName,
              file_name: currentFormValues?.source?.file_name || currentFormValues?.file_name || '',
              table_name: currentFormValues?.source?.table_name || currentFormValues?.table_name || '',
              file_type: currentFormValues?.source?.file_type || currentFormValues?.file_type || 'CSV',
              bh_project_id: currentFormValues?.source?.bh_project_id || currentFormValues?.bh_project_id || '',
              data_src_id: currentFormValues?.source?.data_src_id || currentFormValues?.data_src_id || '',
              connection_config_id: currentFormValues?.source?.connection_config_id || 
                                   currentFormValues?.connection_config_id || 
                                   currentFormValues?.connection?.connection_config_id ||
                                   currentFormValues?.connection?.id || '',
              connection: {
                // CRITICAL: name should match connection_config_name in connectionConfigList
                name: currentFormValues?.source?.connection?.connection_config_name ||
                     currentFormValues?.connection?.connection_config_name ||
                     currentFormValues?.source?.connection?.name || 
                     currentFormValues?.connection?.name || 
                     currentFormValues?.connection?.connection_name || '',
                connection_config_id: currentFormValues?.source?.connection?.connection_config_id || 
                                     currentFormValues?.connection?.connection_config_id || 
                                     currentFormValues?.connection?.id || '',
                file_path_prefix: currentFormValues?.source?.connection?.file_path_prefix || 
                                 currentFormValues?.connection?.file_path_prefix || 
                                 currentFormValues?.file_path_prefix || '',
                file_type: currentFormValues?.source?.connection?.file_type || 
                          currentFormValues?.connection?.file_type || 
                          currentFormValues?.file_type || 'CSV',
                ...currentFormValues?.source?.connection,
                ...currentFormValues?.connection
              }
            },
            
            // Read options
            read_options: currentFormValues?.read_options || {},
            
            // Any other form values
            ...currentFormValues
          };

          console.log('🔧 === CONNECTION DEBUGGING ===');
          console.log('🔧 Original formValues:', currentFormValues);
          console.log('🔧 Available formValues keys:', Object.keys(currentFormValues || {}));
          console.log('🔧 FormValues nested structure check:');
          console.log('   - currentFormValues.connection_config_id:', currentFormValues?.connection_config_id);
          console.log('   - currentFormValues.connection:', currentFormValues?.connection);
          console.log('   - currentFormValues.source:', currentFormValues?.source);
          console.log('   - currentFormValues.source?.connection:', currentFormValues?.source?.connection);
          console.log('   - currentFormValues.source?.connection_config_id:', currentFormValues?.source?.connection_config_id);
          console.log('🔧 Extracted connection_config_id:', sourceData.connection_config_id);
          console.log('🔧 Extracted connection object:', sourceData.connection);
          console.log('🔧 Source connection_config_id:', sourceData.source?.connection_config_id);
          console.log('🔧 Source connection object:', sourceData.source?.connection);
          console.log('🔧 Full prepared sourceData:', sourceData);
          console.log('🔧 === END CONNECTION DEBUGGING ===');

          const handleSourceUpdate = (updatedSource: any) => {
            console.log('🔧 Source updated from OrderPopUp:', updatedSource);
            
            // Update form values even if pipeline form is closed
            try {
              Object.keys(updatedSource).forEach(key => {
                if (form.setValue) {
                  form.setValue(key, updatedSource[key], { shouldValidate: true });
                }
              });
              console.log('🔧 Form values updated successfully');
            } catch (error) {
              console.error('🔧 Error updating form values:', error);
            }
          };
          
          // Close the pipeline form first
          if (onClosePipelineForm) {
            console.log('🔧 Closing pipeline form to open custom component');
            onClosePipelineForm();
          }
          
          // Set the global custom component state
          setCustomComponentState({
            isOpen: true,
            component: CustomComponent,
            props: {
              source: sourceData,
              nodeId: parentKey,
              onSourceUpdate: handleSourceUpdate
            },
            id: dialogId
          });
          
          // If no connection_config_id is found, try to use a default or first available connection
          if (!sourceData.connection_config_id && !sourceData.source?.connection_config_id) {
            console.log('🔧 No connection_config_id found, will rely on OrderPopUp fallback logic');
            
            // Ensure we have some connection name for fallback lookup
            if (!sourceData.connection?.name && !sourceData.source?.connection?.name) {
              console.log('🔧 No connection name found either, setting default values');
              sourceData.connection.name = 'local_one'; // Common default connection name
              sourceData.source.connection.name = 'local_one';
            }
          }
          
          // Additional check: if we have connection name but it's not connection_config_name format
          // Try to find the matching connection_config_name from the connection data
          if (sourceData.connection?.name && !currentFormValues?.connection?.connection_config_name) {
            console.log('🔧 Connection name exists but may not match connection_config_name format');
            console.log('🔧 Current connection name:', sourceData.connection.name);
            // The connection name should already be set to connection_config_name from our mapping above
          }
          
          console.log('🔧 Opened global custom component with data:', dialogId);
        }
      }, [schema.properties.component, parentKey, onClosePipelineForm]);

      // Return a placeholder since the component is rendered globally
      return (
        <div className="text-center py-4 text-gray-500">
          Custom component will open in a separate dialog...
        </div>
      );
    }
    
    // Default rendering for other custom components
    return (
      <CustomComponent
        schema={schema}
        form={form}
        sourceColumns={sourceColumns}
        onExpressionGenerate={onExpressionGenerate}
        isGenerating={isGenerating}
        parentKey={parentKey}
      />
    );
  }
  
  // Watch all form values to trigger re-renders when values change
  const formValues = form.watch();

  // Get active fields based on current form values
  const activeFieldsData = useMemo(() => {
    const result = getActiveFields(schema, formValues);
    
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 ConditionalSchemaRenderer - Form values changed:', {
        schemaTitle: schema?.title,
        formValues,
        activeFields: Object.keys(result.fields),
        requiredFields: result.required,
        hasAllOf: !!schema?.allOf,
        timestamp: new Date().toISOString()
      });
    }
    
    return result;
  }, [schema, formValues]);

  const { fields: activeFields, required: activeRequired } = activeFieldsData;

  // Filter out internal fields
  const renderableFields = Object.entries(activeFields).filter(
    ([key]) => key !== 'type' && key !== 'task_id'
  );

  if (renderableFields.length === 0) {
    return null;
  }

  // Categorize fields for tab organization
  const basicFields = renderableFields.filter(([, field]: [string, any]) => 
    field.type !== 'array' && field.type !== 'object'
  );
  
  const arrayFields = renderableFields.filter(([, field]: [string, any]) => 
    field.type === 'array'
  );
  
  const objectFields = renderableFields.filter(([, field]: [string, any]) => 
    field.type === 'object' && (field.properties || field.additionalProperties || field.allOf)
  );

  // Create tabs structure
  const tabs = [];
  
  // Add Basic Properties tab if there are basic fields
  if (basicFields.length > 0) {
    tabs.push({
      id: 'basic',
      label: 'Basic',
      fields: basicFields
    });
  }
  
  // Add Array Fields as separate tabs
  arrayFields.forEach(([key, field]) => {
    tabs.push({
      id: key,
      label: field.title || formatFieldTitle(key),
      fields: [[key, field]]
    });
  });
  
  // Add Object Fields as separate tabs
  objectFields.forEach(([key, field]) => {
    tabs.push({
      id: key,
      label: field.title || formatFieldTitle(key),
      fields: [[key, field]]
    });
  });

  const renderField = (key: string, field: SchemaProperty) => {
    const fieldKey = parentKey ? `${parentKey}.${key}` : key;
    const isRequired = activeRequired.includes(key);
    const fieldTitle = field.title || formatFieldTitle(key);
    
    // Debug logging for fields with ui-hint
    if (field['ui-hint']) {
      console.log('🔍 Field with ui-hint found:', {
        key,
        fieldKey,
        uiHint: field['ui-hint'],
        fieldType: field.type,
        sourceColumnsCount: sourceColumns?.length || 0,
        field
      });
    }

    // Handle array fields
    if (field.type === 'array') {
      return (
        <div key={key} className="p-2 bg-muted/20 rounded-md">
          <ArrayField
            field={field}
            fieldKey={fieldKey}
            form={form}
            isRequired={isRequired}
            title={fieldTitle}
            parentPath={parentKey}
            sourceColumns={sourceColumns}
            onExpressionGenerate={onExpressionGenerate}
            isGenerating={isGenerating}
          />
        </div>
      );
    }

    // Handle object fields
    if (field.type === 'object') {
      // Object with conditional logic (allOf)
      if (field.allOf) {
        return (
          <div key={key} className="space-y-2">
            <div className="p-3 border rounded-md bg-muted/10">
              <h4 className="font-medium text-sm mb-2">{fieldTitle}</h4>
              <ConditionalSchemaRenderer
                schema={field}
                parentKey={fieldKey}
                twoColumnLayout={true}
                useTabs={false}
                sourceColumns={sourceColumns}
                onExpressionGenerate={onExpressionGenerate}
                isGenerating={isGenerating}
              />
            </div>
          </div>
        );
      }
      
      // Object with structured properties
      if (field.properties) {
        return (
          <div key={key} className="space-y-2">
            <div className="p-2">
              <h4 className="font-medium text-sm mb-2">{fieldTitle}</h4>
              <FormFields 
                schema={field} 
                form={form}
                parentKey={fieldKey}
                twoColumnLayout={true}
                mode="new"
              />
            </div>
          </div>
        );
      }
      
      // Key-value object (additionalProperties)
      if (field.additionalProperties) {
        return (
          <FieldRenderer
            key={key}
            fieldKey={fieldKey}
            field={field}
            form={form}
            isRequired={isRequired}
          />
        );
      }

      // Use NestedObjectRenderer for complex objects
      return (
        <NestedObjectRenderer
          key={key}
          fieldKey={fieldKey}
          field={field}
          form={form}
          isRequired={isRequired}
          title={fieldTitle}
        />
      );
    }

    // For other field types, use the FieldRenderer component
    return (
      <FieldRenderer
        key={key}
        fieldKey={fieldKey}
        field={field}
        form={form}
        isRequired={isRequired}
        parentKey={parentKey}
        sourceColumns={sourceColumns}
        onExpressionGenerate={onExpressionGenerate}
        isGenerating={isGenerating}
      />
    );
  };

  // If not using tabs or only one tab, render without tabs UI
  if (!useTabs || tabs.length <= 1) {
    if (tabs.length === 1) {
      const tab = tabs[0];
      return (
        <div className="w-full mt-3">
          <div className="space-y-3">
            {tab.fields.map(([key, field]: [string, any]) => renderField(key, field))}
          </div>
        </div>
      );
    }
    
    // Render all fields directly
    return (
      <div className="space-y-3">
        {renderableFields.map(([key, field]) => renderField(key, field))}
      </div>
    );
  }

  // Render with tabs UI
  return (
    <Tabs defaultValue={tabs[0].id} className="w-full">
      <TabsList className="grid gap-0.5 h-7 p-0.5 w-fit" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, max-content))` }}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="text-[12px] px-2 py-1 h-6">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-3">
          <div className="space-y-3">
            {tab.fields.map(([key, field]: [string, any]) => renderField(key, field))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

// Helper component for debugging conditional logic
export const ConditionalSchemaDebugger: React.FC<{ schema: SchemaProperty }> = ({ schema }) => {
  const form = useFormContext();
  const formValues = form.watch();
  
  const { baseFields, conditionalFields } = extractConditionalFields(schema);
  
  return (
    <div className="p-4 bg-gray-100 rounded-md text-xs">
      <h4 className="font-bold mb-2">Conditional Schema Debug</h4>
      <div className="mb-2">
        <strong>Form Values:</strong> {JSON.stringify(formValues, null, 2)}
      </div>
      <div className="mb-2">
        <strong>Base Fields:</strong> {Object.keys(baseFields).join(', ')}
      </div>
      <div>
        <strong>Conditional Fields:</strong>
        {conditionalFields.map((cf, index) => (
          <div key={index} className="ml-2">
            {cf.conditions.map(c => {
              const operator = c.operator === 'in' ? 'in' : '===';
              const value = Array.isArray(c.value) ? `[${c.value.join(', ')}]` : c.value;
              const negate = c.negate ? 'NOT ' : '';
              return `${negate}${c.field} ${operator} ${value}`;
            }).join(' AND ')} ({cf.type}) → 
            {areAllConditionsMet(cf.conditions, formValues) ? ' ✅ Active' : ' ❌ Inactive'}
          </div>
        ))}
      </div>
    </div>
  );
};