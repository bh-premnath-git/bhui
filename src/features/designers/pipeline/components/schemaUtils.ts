// Utility functions for handling complex JSON schemas

export interface SchemaProperty {
  type: string;
  title?: string;
  description?: string;
  default?: any;
  enum?: string[];
  format?: string;
  properties?: Record<string, SchemaProperty>;
  items?: SchemaProperty;
  required?: string[];
  anyOf?: SchemaProperty[];
  allOf?: SchemaProperty[];
  oneOf?: SchemaProperty[];
  if?: SchemaProperty;
  then?: SchemaProperty;
  const?: any;
}

export interface ExtractedProperties {
  properties: Record<string, SchemaProperty>;
  required: string[];
}

/**
 * Extract properties from a complex schema that might have anyOf, allOf, oneOf patterns
 */
export function extractPropertiesFromSchema(schema: SchemaProperty): ExtractedProperties {
  let properties: Record<string, SchemaProperty> = {};
  let required: string[] = [];

  // Direct properties
  if (schema.properties) {
    properties = { ...properties, ...schema.properties };
  }

  // Required fields
  if (schema.required) {
    required = [...required, ...schema.required];
  }

  // Handle anyOf - merge all possible properties
  if (schema.anyOf) {
    schema.anyOf.forEach((subSchema) => {
      const extracted = extractPropertiesFromSchema(subSchema);
      properties = { ...properties, ...extracted.properties };
      required = [...required, ...extracted.required];
    });
  }

  // Handle allOf - merge all properties (all must be satisfied)
  if (schema.allOf) {
    schema.allOf.forEach((subSchema) => {
      const extracted = extractPropertiesFromSchema(subSchema);
      properties = { ...properties, ...extracted.properties };
      required = [...required, ...extracted.required];
    });
  }

  // Handle oneOf - for now, just take the first one (in a full implementation, you'd let user choose)
  if (schema.oneOf && schema.oneOf.length > 0) {
    const extracted = extractPropertiesFromSchema(schema.oneOf[0]);
    properties = { ...properties, ...extracted.properties };
    required = [...required, ...extracted.required];
  }

  // Remove duplicates from required array
  required = [...new Set(required)];

  return { properties, required };
}

/**
 * Get default value for a field based on its type
 */
export function getDefaultValueForField(field: SchemaProperty): any {
  if (field.default !== undefined) {
    return field.default;
  }

  switch (field.type) {
    case 'string':
      return '';
    case 'number':
    case 'integer':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object':
      // For objects with additionalProperties (key-value objects), return empty object
      // For structured objects, could initialize with default properties
      return {};
    default:
      return '';
  }
}

/**
 * Generate initial values for a schema, handling conditional fields properly
 */
export function generateInitialValues(schema: SchemaProperty): Record<string, any> {
  const initialValues: Record<string, any> = {};

  // First, set values for base properties
  if (schema.properties) {
    Object.entries(schema.properties).forEach(([key, field]) => {
      initialValues[key] = getDefaultValueForField(field);
    });
  }

  // For conditional schemas, we need to ensure trigger fields have proper defaults
  // so that conditional fields can be shown
  if (schema.allOf) {
    schema.allOf.forEach((subSchema) => {
      if (subSchema.if && subSchema.then) {
        // Extract the condition field and its expected value
        const condition = extractConditionFromIf(subSchema.if);
        if (condition) {
          // If the condition field doesn't have a value yet, and the condition value
          // matches a default or enum value, set it
          if (initialValues[condition.field] === undefined || initialValues[condition.field] === '') {
            // Check if the condition value is a valid enum option for this field
            const conditionField = schema.properties?.[condition.field];
            if (conditionField?.enum?.includes(condition.value)) {
              // Only set if it's the first enum value or matches the default
              if (conditionField.default === condition.value || 
                  (conditionField.default === undefined && conditionField.enum[0] === condition.value)) {
                initialValues[condition.field] = condition.value;
              }
            }
          }
        }
      }
    });
  }

  return initialValues;
}

/**
 * Extract conditional fields from allOf patterns
 */
export function extractConditionalFields(schema: SchemaProperty): {
  baseFields: Record<string, SchemaProperty>;
  conditionalFields: Array<{
    condition: { field: string; value: any };
    schema: SchemaProperty;
  }>;
  baseRequired: string[];
} {
  const baseFields: Record<string, SchemaProperty> = {};
  const conditionalFields: Array<{
    condition: { field: string; value: any };
    schema: SchemaProperty;
  }> = [];
  let baseRequired: string[] = [];

  // Add direct properties as base fields
  if (schema.properties) {
    Object.assign(baseFields, schema.properties);
  }

  // Add direct required fields
  if (schema.required) {
    baseRequired = [...baseRequired, ...schema.required];
  }

  // Process allOf patterns
  if (schema.allOf) {
    schema.allOf.forEach((subSchema) => {
      if (subSchema.if && subSchema.then) {
        // This is a conditional schema
        const condition = extractConditionFromIf(subSchema.if);
        if (condition) {
          conditionalFields.push({
            condition,
            schema: subSchema.then,
          });
        }
      } else {
        // This is a base schema to be merged
        const extracted = extractPropertiesFromSchema(subSchema);
        Object.assign(baseFields, extracted.properties);
        baseRequired = [...baseRequired, ...extracted.required];
      }
    });
  }

  // Remove duplicates from required array
  baseRequired = [...new Set(baseRequired)];

  return { baseFields, conditionalFields, baseRequired };
}

/**
 * Extracts condition from an 'if' schema
 */
export function extractConditionFromIf(ifSchema: SchemaProperty): { field: string; value: any } | null {
  if (ifSchema.properties) {
    // Find the first property with a const value
    for (const [fieldName, fieldSchema] of Object.entries(ifSchema.properties)) {
      if (typeof fieldSchema === 'object' && 'const' in fieldSchema) {
        return {
          field: fieldName,
          value: fieldSchema.const,
        };
      }
    }
  }
  return null;
}

/**
 * Get active fields based on current form values and conditional logic
 */
export function getActiveFields(
  schema: SchemaProperty,
  formValues: Record<string, any>
): {
  fields: Record<string, SchemaProperty>;
  required: string[];
} {
  const { baseFields, conditionalFields, baseRequired } = extractConditionalFields(schema);

  // Determine which conditional fields should be active
  const activeConditionalFields = conditionalFields.filter((conditionalField) => {
    const fieldValue = formValues[conditionalField.condition.field];
    return fieldValue === conditionalField.condition.value;
  });

  // Merge active conditional fields with base fields
  let mergedFields = { ...baseFields };
  let mergedRequired = [...baseRequired];

  activeConditionalFields.forEach((conditionalField) => {
    const extracted = extractPropertiesFromSchema(conditionalField.schema);
    mergedFields = { ...mergedFields, ...extracted.properties };
    mergedRequired = [...mergedRequired, ...extracted.required];
  });

  // Remove duplicates from required array
  mergedRequired = [...new Set(mergedRequired)];

  return { fields: mergedFields, required: mergedRequired };
}