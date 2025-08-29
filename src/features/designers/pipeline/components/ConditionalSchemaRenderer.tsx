import React, { useMemo, useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FieldRenderer } from './FieldRenderer';
import { ArrayField } from './ArrayField';
import { TableArrayField } from './TableArrayField';
import { NestedObjectRenderer } from './NestedObjectRenderer';
import { FormFields } from '@/features/admin/connection/components/FormFields';
import { 
  SchemaProperty, 
  extractConditionalFields, 
  isConditionMet, 
  areAllConditionsMet,
  getActiveFields,
  extractPropertiesFromSchema,
  formatFieldTitle
} from './schemaUtils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { apiService } from '@/lib/api/api-service';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';

// Component to handle endpoint fields
const EndpointField: React.FC<{
  field: any;
  fieldKey: string;
  fieldTitle: string;
  form: any;
}> = ({ field, fieldKey, fieldTitle, form }) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentValue = form.watch(fieldKey);



  useEffect(() => {
    const fetchOptions = async () => {
      if (!field.endpoint) return;

      setLoading(true);
      setError(null);

      try {
        // Make API call to the endpoint
        const response:any = await apiService.get({
          method: 'GET',
          url: field.endpoint,
          baseUrl: CATALOG_REMOTE_API_URL,
          usePrefix:true
        });
        if (!response.data) {
          throw new Error(`HTTP error! status: ${response.data}`);
        }

        const data = await response.data;

        // Handle different response formats
        let optionsArray = [];
        if (Array.isArray(data)) {
          optionsArray = data;
        } else if (data.results && Array.isArray(data.results)) {
          optionsArray = data.results;
        } else if (data.data && Array.isArray(data.data)) {
          optionsArray = data.data;
        } else {
          console.warn(`Unexpected API response format for ${fieldKey}:`, data);
          optionsArray = [];
        }

        // Transform the options to have consistent structure for display
        const transformedOptions = optionsArray.map((option, index) => {
          // Handle connection objects specifically
          if (option.connection_config_name && option.custom_metadata) {
            return {
              id: option.id || option.connection_config_id || index,
              name: option.connection_config_name,
              label: option.custom_metadata.name || option.connection_config_name,
              value: (option.connection_config_id || option.id || option.connection_config_name).toString(),
              originalData: option // Keep the full object for form submission
            };
          }
          
          // Handle generic connection objects (like the initial value format)
          if (typeof option === 'object' && option !== null && (option.connection_config_id || option.connection_type)) {
            return {
              id: option.connection_config_id || option.id || index,
              name: option.name || option.connection_config_name || `Connection ${index + 1}`,
              label: option.name || option.connection_config_name || `Connection ${index + 1}`,
              value: (option.connection_config_id || option.id || option.name).toString(),
              originalData: option
            };
          }
          
          // Handle generic objects
          if (typeof option === 'object' && option !== null) {
            return {
              id: option.id || option.name || option.value || index,
              name: option.name || option.id || option.value || `Option ${index + 1}`,
              label: option.label || option.name || option.title || option.id || option.value || `Option ${index + 1}`,
              value: (option.value || option.name || option.id || `option_${index}`).toString(),
              originalData: option
            };
          }
          
          // Handle primitive values
          return {
            id: index,
            name: String(option),
            label: String(option),
            value: String(option),
            originalData: option
          };
        });

        setOptions(transformedOptions);
      } catch (err) {
        console.error(`Error fetching options for ${fieldKey}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to fetch options');
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [field.endpoint, fieldKey]);

  // Calculate the select value consistently to avoid controlled/uncontrolled switching
  // This must be called before any early returns to follow Rules of Hooks
  const selectValue = useMemo(() => {
    // Handle null or undefined values (no selection)
    if (currentValue === null || currentValue === undefined) {
      return '';
    }
    
    // Handle different connection object formats
    if (currentValue && typeof currentValue === 'object') {
      // Try different possible ID fields
      const calculatedValue = currentValue.connection_config_id?.toString() || 
                            currentValue.id?.toString() || 
                            currentValue.connection_config_name || 
                            currentValue.name || 
                            '';
      

      
      return calculatedValue;
    }
    // Handle primitive values - ensure we always return a string (never undefined)
    return currentValue?.toString() || '';
  }, [currentValue, options, fieldKey]);

  const handleValueChange = (value: string) => {
    // Find the selected option object
    const selectedOption = options.find(option => 
      option.value === value || option.name === value || option.id === value
    );

    if (selectedOption) {
      // Set the original data as the form value (for complex objects like connections)
      // or just the transformed option for simple cases
      const formValue = selectedOption.originalData || selectedOption;
      form.setValue(fieldKey, formValue);

    } else {
      // Fallback to just the value
      form.setValue(fieldKey, value);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldKey}>{fieldTitle}</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Loading..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldKey}>{fieldTitle}</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder={`Error: ${error}`} />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldKey}>{fieldTitle}</Label>
      <Select
        value={selectValue}
        onValueChange={handleValueChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={`Select ${fieldTitle.toLowerCase()}...`} />
        </SelectTrigger>
        <SelectContent style={{zIndex:99999}}>
          {options.map((option, index) => (
            <SelectItem key={option.id || index} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

interface ConditionalSchemaRendererProps {
  schema: SchemaProperty;
  parentKey?: string;
  twoColumnLayout?: boolean;
  useTabs?: boolean;
  sourceColumns?: Array<{ name: string; dataType: string }>;
  onExpressionGenerate?: (fieldName: string) => Promise<void>;
  isFieldGenerating?: (fieldName: string) => boolean;
  useTableView?: boolean; // New prop to control table vs card view for arrays
  scopedFormValues?: any; // Optional scoped form values for nested objects
}

export const ConditionalSchemaRenderer: React.FC<ConditionalSchemaRendererProps> = ({
  schema,
  parentKey = '',
  twoColumnLayout = false,
  useTabs = true,
  sourceColumns = [],
  onExpressionGenerate,
  isFieldGenerating,
  useTableView = true, // Default to table view
  scopedFormValues, // Optional scoped form values for nested objects
}) => {
  const form = useFormContext();
  
  // Watch all form values to trigger re-renders when values change
  const formValues = form.watch();
  
  // Use scoped form values if provided (for nested objects), otherwise use full form values
  const effectiveFormValues = scopedFormValues || formValues;
  
  // Debug form values being passed to ConditionalSchemaRenderer
  if (parentKey === 'source' || schema?.title === 'Source' || effectiveFormValues?.source?.source_type) {
    console.log('🔧 ConditionalSchemaRenderer: Form values received:', {
      parentKey,
      schemaTitle: schema?.title,
      scopedFormValues,
      formValues: formValues ? {
        sourceType: formValues.source?.source_type,
        hasSource: !!formValues.source,
        sourceKeys: formValues.source ? Object.keys(formValues.source) : []
      } : null,
      effectiveFormValues: effectiveFormValues ? {
        sourceType: effectiveFormValues.source?.source_type,
        rootSourceType: effectiveFormValues.source_type,
        hasSource: !!effectiveFormValues.source
      } : null
    });
  }
  
  // Also specifically watch source_type fields to ensure we catch changes
  const sourceType = form.watch('source_type');
  const nestedSourceType = form.watch('source.source_type');
  
  // Watch the entire source object to catch all nested changes
  const sourceObject = form.watch('source');
  
  // Also watch file_type to ensure we catch changes that should trigger re-renders
  const fileType = form.watch('file_type');
  const nestedFileType = form.watch('source.file_type');
  
  // Force re-render when any source-related field changes
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  
  React.useEffect(() => {
    // Force update when source object changes
    if (sourceObject) {
      forceUpdate();
    }
  }, [sourceObject, sourceType, nestedSourceType, fileType, nestedFileType]);

  // Create an enhanced form values object with the latest watched values
  const enhancedFormValues = useMemo(() => {
    // Ensure we have a proper source object structure
    const sourceData = {
      ...effectiveFormValues?.source,
      ...sourceObject, // Use the entire watched source object
      source_type: sourceObject?.source_type || nestedSourceType || effectiveFormValues?.source?.source_type || sourceType
    };
    
    const finalEnhancedValues = {
      ...effectiveFormValues,
      // Ensure source_type is available at both root and nested levels for backward compatibility
      source_type: sourceData.source_type || effectiveFormValues?.source_type,
      // Ensure file_type is available at root level for conditions that expect it there
      file_type: fileType || nestedFileType || effectiveFormValues?.file_type,
      source: sourceData
    };
    
    return finalEnhancedValues;
  }, [effectiveFormValues, sourceType, sourceObject, nestedSourceType, fileType, nestedFileType]);

  // Get active fields based on current form values
  const activeFieldsData = useMemo(() => {
    const result = getActiveFields(schema, enhancedFormValues);
    return result;
  }, [schema, enhancedFormValues, sourceType, nestedSourceType, sourceObject, fileType, nestedFileType, scopedFormValues]);

  const { fields: activeFields, required: activeRequired } = activeFieldsData;

  // Filter out internal fields
  const renderableFields = Object.entries(activeFields).filter(
    ([key]) => key !== 'type' && key !== 'task_id'
  );

  if (renderableFields.length === 0) {
    return null;
  }

  // Categorize fields for tab organization
  const basicFields = renderableFields.filter(([, field]: [string, any]) => {
    // Include non-array, non-object fields
    if (field.type !== 'array' && field.type !== 'object') {
      return true;
    }
    // Also include object fields with ui-hint (like endpoint fields) as basic fields
    if (field.type === 'object' && field['ui-hint']) {
      return true;
    }
    return false;
  });
  
  const arrayFields = renderableFields.filter(([, field]: [string, any]) => 
    field.type === 'array'
  );
  
  const objectFields = renderableFields.filter(([, field]: [string, any]) => 
    field.type === 'object' && 
    (field.properties || field.additionalProperties || field.allOf || field.items) &&
    !field['ui-hint'] // Exclude object fields with ui-hint as they're handled as basic fields
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
  
  // Add Object Fields as separate tabs (with better labeling)
  objectFields.forEach(([key, field]) => {
    // Check if this object should be rendered as a tab
    const shouldRenderAsTab = field['ui-type'] === 'tab-container' || 
                             field['ui-hint'] === 'tab' || 
                             (field.properties && Object.keys(field.properties).length > 3);
    
    // If it's a complex object or explicitly marked for tabs, add as separate tab
    if (shouldRenderAsTab || field.allOf || (field.properties && Object.keys(field.properties).length > 2)) {
      tabs.push({
        id: key,
        label: field.title || formatFieldTitle(key),
        fields: [[key, field]]
      });
    } else {
      // For simple objects, add to basic tab if it exists, otherwise create a new tab
      if (basicFields.length > 0 && tabs.length > 0 && tabs[0].id === 'basic') {
        tabs[0].fields.push([key, field]);
      } else {
        tabs.push({
          id: key,
          label: field.title || formatFieldTitle(key),
          fields: [[key, field]]
        });
      }
    }
  });

  const renderField = (key: string, field: any) => {
    const fieldKey = parentKey ? `${parentKey}.${key}` : key;
    const isRequired = activeRequired.includes(key);
    const fieldTitle = field.title || formatFieldTitle(key);
    
    // Only log source_type field to track initial value issues
    if (key === 'source_type') {
      const currentValue = form.getValues(fieldKey);
      const watchedValue = form.watch(fieldKey);
      console.log(`🔧 ConditionalSchemaRenderer: Rendering source_type field`, {
        fieldKey,
        parentKey,
        fieldType: field.type,
        fieldEnum: field.enum,
        hasEnum: !!field.enum,
        currentValue,
        watchedValue,
        formValues: form.getValues(),
        sourceObject: form.getValues('source')
      });
    }

    // Handle endpoint fields (ui-hint: "endpoint")
    if (field['ui-hint'] === 'endpoint' && field.endpoint) {
      return (
        <div key={key} className="space-y-2">
          <EndpointField
            field={field}
            fieldKey={fieldKey}
            fieldTitle={fieldTitle}
            form={form}
          />
        </div>
      );
    }

    // Handle array fields
    if (field.type === 'array') {
      // Use TableArrayField for ALL array fields by default, with fallback to ArrayField for very complex cases
      // Complex cases include: arrays of arrays of objects, or when explicitly disabled via schema property
      // Simple nested arrays (like array of strings within objects) are supported in table view
      const hasDeeplyNestedArrays = field.items?.type === 'array' ||
                                    (field.items?.properties && Object.values(field.items.properties).some((prop: any) => 
                                      prop.type === 'array' && prop.items?.type === 'object'
                                    ));
      
      // Check if schema explicitly requests card view
      const forceCardView = field['ui-hint'] === 'card' || field.items?.['ui-hint'] === 'card';
      
      // Use table view by default, unless it's too complex or explicitly disabled
      const shouldUseTableView = useTableView && !hasDeeplyNestedArrays && !forceCardView;

      if (process.env.NODE_ENV === 'development') {
        console.log(`🎯 ConditionalSchemaRenderer: Array field decision for (${fieldKey})`, {
          fieldKey,
          fieldTitle,
          key,
          useTableView,
          hasDeeplyNestedArrays,
          forceCardView,
          shouldUseTableView,
          willUse: shouldUseTableView ? 'TableArrayField' : 'ArrayField',
          hasConditionalLogic: !!field.items?.allOf,
          hasProperties: !!field.items?.properties,
          // Debug the new decision logic
          decisionFactors: {
            itemsType: field.items?.type,
            hasSimpleArraysInProperties: field.items?.properties && Object.values(field.items.properties).some((prop: any) => prop.type === 'array' && prop.items?.type === 'string'),
            hasComplexArraysInProperties: field.items?.properties && Object.values(field.items.properties).some((prop: any) => prop.type === 'array' && prop.items?.type === 'object'),
            fieldUiHint: field['ui-hint'],
            itemsUiHint: field.items?.['ui-hint'],
            useTableViewEnabled: useTableView
          }
        });
      }

      return (
        <div key={key} className={shouldUseTableView ? "space-y-2" : "p-2 bg-muted/20 rounded-md"}>
          {shouldUseTableView ? (
            <TableArrayField
              field={field}
              fieldKey={fieldKey}
              form={form}
              isRequired={isRequired}
              title={fieldTitle}
              parentPath={parentKey}
              sourceColumns={sourceColumns}
              onExpressionGenerate={onExpressionGenerate}
              isFieldGenerating={isFieldGenerating}
            />
          ) : (
            <ArrayField
              field={field}
              fieldKey={fieldKey}
              form={form}
              isRequired={isRequired}
              title={fieldTitle}
              parentPath={parentKey}
              sourceColumns={sourceColumns}
              onExpressionGenerate={onExpressionGenerate}
              isFieldGenerating={isFieldGenerating}
            />
          )}
        </div>
      );
    }

    // Handle object fields
    if (field.type === 'object') {
      // Check if this object should be rendered as a tab (based on ui-type or ui-hint)
      const effectiveSchemaForTabCheck = field.items && field.items.properties ? field.items : field;
      const shouldRenderAsTab = field['ui-type'] === 'tab-container' || 
                               field['ui-hint'] === 'tab' || 
                               effectiveSchemaForTabCheck['ui-type'] === 'tab-container' ||
                               effectiveSchemaForTabCheck['ui-hint'] === 'tab' ||
                               (effectiveSchemaForTabCheck.properties && Object.keys(effectiveSchemaForTabCheck.properties).length > 3); // Auto-tab for complex objects
      
      // Object with conditional logic (allOf)
      if (field.allOf) {
        // Debug nested allOf rendering
        if (process.env.NODE_ENV === 'development' && key === 'source') {
          console.log(`🔧 ConditionalSchemaRenderer: Rendering nested allOf for ${key}`, {
            fieldKey,
            parentKey,
            fieldTitle,
            allOfLength: field.allOf.length,
            hasProperties: !!field.properties,
            propertiesKeys: field.properties ? Object.keys(field.properties) : [],
            shouldRenderAsTab,
            scopedFormValues: enhancedFormValues[key],
            scopedFormValuesKeys: enhancedFormValues[key] ? Object.keys(enhancedFormValues[key]) : [],
            scopedSourceType: enhancedFormValues[key]?.source_type,
            fullFormValues: enhancedFormValues,
            // Additional debugging
            enhancedFormValuesKeys: Object.keys(enhancedFormValues),
            sourceObjectFromEnhanced: enhancedFormValues.source,
            sourceTypeFromEnhanced: enhancedFormValues.source?.source_type
          });
        }
        
        return (
          <div key={key} className="space-y-2">
            <div className="p-3 border rounded-md bg-muted/10">
              <h4 className="font-medium text-sm mb-2">{fieldTitle}</h4>
              <ConditionalSchemaRenderer
                schema={field}
                parentKey={fieldKey}
                twoColumnLayout={!shouldRenderAsTab}
                useTabs={shouldRenderAsTab}
                sourceColumns={sourceColumns}
                onExpressionGenerate={onExpressionGenerate}
                isFieldGenerating={isFieldGenerating}
                useTableView={useTableView}
                scopedFormValues={enhancedFormValues[key]} // Use enhanced form values for better synchronization
              />
            </div>
          </div>
        );
      }
      
      // Object with structured properties (either direct properties or items.properties)
      if (field.properties || (field.items && field.items.properties)) {
        // For fields with items.properties (like read_options), use the items schema
        const effectiveSchema = field.items && field.items.properties ? field.items : field;
        // Debug read_options field handling

        
        // If it should render as tab, use ConditionalSchemaRenderer with tabs enabled
        if (shouldRenderAsTab) {
          return (
            <div key={key} className="space-y-2">
              <div className="p-2">
                <h4 className="font-medium text-sm mb-2">{effectiveSchema.title || fieldTitle}</h4>
                <ConditionalSchemaRenderer
                  schema={effectiveSchema}
                  parentKey={fieldKey}
                  twoColumnLayout={false}
                  useTabs={true}
                  sourceColumns={sourceColumns}
                  onExpressionGenerate={onExpressionGenerate}
                  isFieldGenerating={isFieldGenerating}
                  useTableView={useTableView}
                  scopedFormValues={enhancedFormValues[key]} // Use enhanced form values for better synchronization
                />
              </div>
            </div>
          );
        }
        
        // Otherwise use FormFields for simple layout
        return (
          <div key={key} className="space-y-2">
            <div className="p-2">
              <h4 className="font-medium text-sm mb-2">{effectiveSchema.title || fieldTitle}</h4>
              <FormFields 
                schema={effectiveSchema} 
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
        isFieldGenerating={isFieldGenerating}
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
            {cf.conditions.map((c:any) => {
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