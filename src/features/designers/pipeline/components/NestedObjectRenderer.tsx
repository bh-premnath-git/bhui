import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConditionalSchemaRenderer } from './ConditionalSchemaRenderer';
import { FieldRenderer } from './FieldRenderer';
import { SchemaProperty, extractPropertiesFromSchema, formatFieldTitle } from './schemaUtils';

interface NestedObjectRendererProps {
  fieldKey: string;
  field: SchemaProperty;
  form: any;
  parentKey?: string;
  isRequired?: boolean;
  title?: string;
}

export const NestedObjectRenderer: React.FC<NestedObjectRendererProps> = ({
  fieldKey,
  field,
  form,
  parentKey = '',
  isRequired = false,
  title,
}) => {
  const fullFieldKey = parentKey ? `${parentKey}.${fieldKey}` : fieldKey;
  const displayTitle = title || field.title || formatFieldTitle(fieldKey);
  
  // Watch the nested form values to make them reactive
  const nestedFormValues = form.watch(fullFieldKey);
  
  // Debug nested object rendering
  if (process.env.NODE_ENV === 'development' && fieldKey === 'source') {
    console.log('🔧 NestedObjectRenderer: Rendering source object', {
      fieldKey,
      fullFieldKey,
      parentKey,
      nestedFormValues,
      hasAllOf: !!field.allOf,
      allOfLength: field.allOf?.length || 0,
      hasProperties: !!field.properties,
      propertiesKeys: field.properties ? Object.keys(field.properties) : []
    });
  }

  // If the object has conditional logic (allOf), use ConditionalSchemaRenderer
  if (field.allOf) {
    return (
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {displayTitle}
            {isRequired && <span className="text-destructive">*</span>}
          </CardTitle>
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <ConditionalSchemaRenderer
            schema={field}
            parentKey={fullFieldKey}
            scopedFormValues={nestedFormValues}
          />
        </CardContent>
      </Card>
    );
  }

  // If the object has properties, render them as nested fields
  if (field.properties) {
    const { properties, required } = extractPropertiesFromSchema(field);
    
    return (
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {displayTitle}
            {isRequired && <span className="text-destructive">*</span>}
          </CardTitle>
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {Object.entries(properties).map(([nestedFieldKey, nestedField]) => {
            const isNestedRequired = required.includes(nestedFieldKey);
            
            // If the nested field is also an object with complex structure, render it recursively
            if (nestedField.type === 'object' && (nestedField.properties || nestedField.allOf)) {
              return (
                <NestedObjectRenderer
                  key={nestedFieldKey}
                  fieldKey={nestedFieldKey}
                  field={nestedField}
                  form={form}
                  parentKey={fullFieldKey}
                  isRequired={isNestedRequired}
                />
              );
            }
            
            // Otherwise, render as a regular field
            return (
              <FieldRenderer
                key={nestedFieldKey}
                fieldKey={nestedFieldKey}
                field={nestedField}
                form={form}
                isRequired={isNestedRequired}
                parentKey={fullFieldKey}
              />
            );
          })}
        </CardContent>
      </Card>
    );
  }

  // Fallback to regular field renderer for simple objects
  return (
    <FieldRenderer
      fieldKey={fieldKey}
      field={field}
      form={form}
      isRequired={isRequired}
      parentKey={parentKey}
    />
  );
};