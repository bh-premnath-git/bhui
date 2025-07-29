import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FieldRenderer } from './FieldRenderer';
import { ArrayField } from './ArrayField';
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

interface ConditionalSchemaRendererProps {
  schema: SchemaProperty;
  parentKey?: string;
  twoColumnLayout?: boolean;
  useTabs?: boolean;
  sourceColumns?: Array<{ name: string; dataType: string }>;
  onExpressionGenerate?: (fieldName: string) => Promise<void>;
  isFieldGenerating?: (fieldName: string) => boolean;
}

export const ConditionalSchemaRenderer: React.FC<ConditionalSchemaRendererProps> = ({
  schema,
  parentKey = '',
  twoColumnLayout = false,
  useTabs = true,
  sourceColumns = [],
  onExpressionGenerate,
  isFieldGenerating,
}) => {
  const form = useFormContext();
  
  // Watch all form values to trigger re-renders when values change
  // Use a more optimized approach to prevent unnecessary re-renders
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
            isFieldGenerating={isFieldGenerating}
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
                isFieldGenerating={isFieldGenerating}
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