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
 * Generate initial values for a schema
 */
export function generateInitialValues(schema: SchemaProperty): Record<string, any> {
  const { properties } = extractPropertiesFromSchema(schema);
  const initialValues: Record<string, any> = {};

  Object.entries(properties).forEach(([key, field]) => {
    initialValues[key] = getDefaultValueForField(field);
  });

  return initialValues;
}