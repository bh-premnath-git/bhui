import React, { useMemo, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { ConditionalFieldRenderer } from './ConditionalFieldRenderer';
import { extractPropertiesFromSchema, SchemaProperty, extractConditionalFields, extractConditionFromIf } from './schemaUtils';

interface ConditionalSchemaRendererProps {
  schema: SchemaProperty;
  parentPath?: string;
}



/**
 * Checks if a condition is met based on current form values
 */
function isConditionMet(condition: { field: string; value: any }, formValues: any): boolean {
  const fieldValue = formValues[condition.field];
  return fieldValue === condition.value;
}

export const ConditionalSchemaRenderer: React.FC<ConditionalSchemaRendererProps> = ({
  schema,
  parentPath = '',
}) => {
  const form = useFormContext();
  const watchedValues = useWatch({ control: form.control });

  const { baseFields, conditionalFields, baseRequired } = useMemo(() => {
    const result = extractConditionalFields(schema);
    // Debug logging - can be removed in production
    console.log('ConditionalSchemaRenderer - Schema:', schema);
    console.log('ConditionalSchemaRenderer - Base fields:', result.baseFields);
    console.log('ConditionalSchemaRenderer - Conditional fields:', result.conditionalFields);
    console.log('ConditionalSchemaRenderer - Base required:', result.baseRequired);
    return result;
  }, [schema]);

  // Determine which conditional fields should be shown
  const activeConditionalFields = useMemo(() => {
    const active = conditionalFields.filter((conditionalField) =>
      isConditionMet(conditionalField.condition, watchedValues)
    );
    // Debug logging - can be removed in production
    console.log('ConditionalSchemaRenderer - Watched values:', watchedValues);
    console.log('ConditionalSchemaRenderer - Active conditional fields:', active);
    return active;
  }, [conditionalFields, watchedValues]);

  // Merge active conditional fields with base fields
  const allActiveFields = useMemo(() => {
    let mergedFields = { ...baseFields };
    let mergedRequired = [...baseRequired];

    activeConditionalFields.forEach((conditionalField) => {
      const extracted = extractPropertiesFromSchema(conditionalField.schema);
      mergedFields = { ...mergedFields, ...extracted.properties };
      mergedRequired = [...mergedRequired, ...extracted.required];
    });

    // Remove duplicates from required array
    mergedRequired = [...new Set(mergedRequired)];

    // Debug logging
    console.log('ConditionalSchemaRenderer - All active fields:', {
      fields: Object.keys(mergedFields),
      required: mergedRequired,
      activeConditionalCount: activeConditionalFields.length
    });

    return { fields: mergedFields, required: mergedRequired };
  }, [baseFields, baseRequired, activeConditionalFields]);

  // Clear form values for fields that are no longer active
  useEffect(() => {
    const currentFieldKeys = Object.keys(allActiveFields.fields);
    const formValues = form.getValues();
    
    // Find fields that were previously set but are no longer active
    Object.keys(formValues).forEach((fieldKey) => {
      if (!currentFieldKeys.includes(fieldKey) && fieldKey !== 'type' && fieldKey !== 'task_id') {
        // This field is no longer active, clear it
        form.setValue(fieldKey, undefined);
      }
    });
  }, [allActiveFields.fields, form]);

  return (
    <div className="space-y-4">
      {Object.entries(allActiveFields.fields).map(([fieldKey, field], index) => {
        // Skip internal fields
        if (fieldKey === 'type' || fieldKey === 'task_id') {
          return null;
        }

        const isRequired = allActiveFields.required.includes(fieldKey);
        
        return (
          <ConditionalFieldRenderer
            key={`${parentPath ? `${parentPath}.` : ''}${fieldKey}_${index}`}
            fieldKey={fieldKey}
            field={field}
            form={form}
            isRequired={isRequired}
            parentPath={parentPath}
          />
        );
      })}
    </div>
  );
};