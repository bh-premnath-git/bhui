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
      if (field.type === 'object' && field.properties) {
        // Recursively handle nested objects
        initialValues[key] = generateInitialValues(field);
      } else {
        initialValues[key] = getDefaultValueForField(field);
      }
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
          // Handle nested condition fields (e.g., "source.type")
          const currentValue = getNestedValue(initialValues, condition.field);
          
          if (currentValue === undefined || currentValue === '') {
            // Find the condition field in the schema
            let conditionField: SchemaProperty | undefined;
            
            if (condition.field.includes('.')) {
              // Handle nested field paths
              const parts = condition.field.split('.');
              let currentSchema = schema;
              
              for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (currentSchema.properties?.[part]) {
                  currentSchema = currentSchema.properties[part];
                }
              }
              
              const lastPart = parts[parts.length - 1];
              conditionField = currentSchema.properties?.[lastPart];
            } else {
              conditionField = schema.properties?.[condition.field];
            }
            
            if (conditionField?.enum?.includes(condition.value)) {
              // Only set if it's the first enum value or matches the default
              if (conditionField.default === condition.value || 
                  (conditionField.default === undefined && conditionField.enum[0] === condition.value)) {
                setNestedValue(initialValues, condition.field, condition.value);
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
 * Extract conditional fields from allOf patterns and if-then-else structures
 */
export function extractConditionalFields(schema: SchemaProperty): {
  baseFields: Record<string, SchemaProperty>;
  conditionalFields: Array<{
    conditions: Array<{ field: string; value: any; operator?: string }>;
    schema: SchemaProperty;
    type: 'then' | 'else';
  }>;
  baseRequired: string[];
} {
  const baseFields: Record<string, SchemaProperty> = {};
  const conditionalFields: Array<{
    conditions: Array<{ field: string; value: any; operator?: string }>;
    schema: SchemaProperty;
    type: 'then' | 'else';
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

  // Process if-then-else at root level
  if (schema.if && schema.then) {
    const conditions = extractAllConditionsFromIf(schema.if);
    if (conditions.length > 0) {
      conditionalFields.push({
        conditions,
        schema: schema.then,
        type: 'then'
      });
    }
    
    // Handle else clause
    if (schema.else) {
      // For else, we need to negate the conditions
      conditionalFields.push({
        conditions: conditions.map(c => ({ ...c, negate: true })),
        schema: schema.else,
        type: 'else'
      });
    }
  }

  // Process allOf patterns
  if (schema.allOf) {
    schema.allOf.forEach((subSchema) => {
      if (subSchema.if && subSchema.then) {
        // This is a conditional schema
        const conditions = extractAllConditionsFromIf(subSchema.if);
        if (conditions.length > 0) {
          conditionalFields.push({
            conditions,
            schema: subSchema.then,
            type: 'then'
          });
        }
        
        // Handle else clause in allOf
        if (subSchema.else) {
          conditionalFields.push({
            conditions: conditions.map(c => ({ ...c, negate: true })),
            schema: subSchema.else,
            type: 'else'
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
 * Extracts condition from an 'if' schema, supporting nested paths and multiple conditions
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
      
      // Handle nested properties (e.g., source.type)
      if (typeof fieldSchema === 'object' && fieldSchema.properties) {
        const nestedCondition = extractConditionFromIf(fieldSchema);
        if (nestedCondition) {
          return {
            field: `${fieldName}.${nestedCondition.field}`,
            value: nestedCondition.value,
          };
        }
      }
    }
  }
  return null;
}

/**
 * Extract all conditions from an 'if' schema, supporting multiple conditions and enum arrays
 */
export function extractAllConditionsFromIf(ifSchema: SchemaProperty, parentPath: string = ''): Array<{ field: string; value: any; operator?: string }> {
  const conditions: Array<{ field: string; value: any; operator?: string }> = [];
  
  if (ifSchema.properties) {
    for (const [fieldName, fieldSchema] of Object.entries(ifSchema.properties)) {
      const fullFieldName = parentPath ? `${parentPath}.${fieldName}` : fieldName;
      
      if (typeof fieldSchema === 'object') {
        // Handle const values
        if ('const' in fieldSchema) {
          conditions.push({
            field: fullFieldName,
            value: fieldSchema.const,
            operator: 'equals'
          });
        }
        
        // Handle enum arrays (for conditions like "enum": ["value1", "value2"])
        if ('enum' in fieldSchema && Array.isArray(fieldSchema.enum)) {
          conditions.push({
            field: fullFieldName,
            value: fieldSchema.enum,
            operator: 'in'
          });
        }
        
        // Handle nested properties recursively
        if (fieldSchema.properties) {
          const nestedConditions = extractAllConditionsFromIf(fieldSchema, fullFieldName);
          conditions.push(...nestedConditions);
        }
      }
    }
  }
  
  return conditions;
}

/**
 * Get nested value from object using dot notation (e.g., "source.type")
 */
export function getNestedValue(obj: any, path: string): any {
  if (!path.includes('.')) {
    return obj[path];
  }
  
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
}

/**
 * Set nested value in object using dot notation (e.g., "source.type")
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  if (!path.includes('.')) {
    obj[path] = value;
    return;
  }
  
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === null || current[part] === undefined || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  
  current[parts[parts.length - 1]] = value;
}

/**
 * Check if a condition is met based on current form values, supporting nested paths and operators
 */
export function isConditionMet(condition: { field: string; value: any; operator?: string; negate?: boolean }, formValues: any): boolean {
  const fieldValue = getNestedValue(formValues, condition.field);
  const operator = condition.operator || 'equals';
  
  let result = false;
  switch (operator) {
    case 'equals':
      result = fieldValue === condition.value;
      break;
    case 'in':
      result = Array.isArray(condition.value) && condition.value.includes(fieldValue);
      break;
    default:
      result = fieldValue === condition.value;
  }
  
  // Apply negation if specified
  if (condition.negate) {
    result = !result;
  }
  
  // Debug logging for individual condition evaluation
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 Condition check:`, {
      field: condition.field,
      operator,
      expectedValue: condition.value,
      actualValue: fieldValue,
      result,
      negate: condition.negate,
      isArray: Array.isArray(condition.value),
      includes: Array.isArray(condition.value) ? condition.value.includes(fieldValue) : 'N/A'
    });
  }
  
  return result;
}

/**
 * Check if all conditions are met (AND logic)
 */
export function areAllConditionsMet(conditions: Array<{ field: string; value: any; operator?: string; negate?: boolean }>, formValues: any): boolean {
  return conditions.every(condition => isConditionMet(condition, formValues));
}

/**
 * Recursively process allOf conditions, handling nested allOf structures
 */
function processAllOfRecursively(
  allOfArray: SchemaProperty[],
  formValues: Record<string, any>,
  depth: number = 0
): {
  fields: Record<string, SchemaProperty>;
  required: string[];
} {
  let resultFields: Record<string, SchemaProperty> = {};
  let resultRequired: string[] = [];

  const indent = '  '.repeat(depth);
  
  allOfArray.forEach((subSchema, index) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${indent}🔄 Processing allOf[${index}] at depth ${depth}`);
    }

    if (subSchema.if && subSchema.then) {
      // This is a conditional schema - evaluate the condition
      const conditions = extractAllConditionsFromIf(subSchema.if);
      const isConditionMet = areAllConditionsMet(conditions, formValues);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${indent}🔄 allOf[${index}] condition evaluation:`, {
          conditions,
          formValues,
          isConditionMet,
          thenProperties: subSchema.then?.properties ? Object.keys(subSchema.then.properties) : 'none',
          hasNestedAllOf: !!(subSchema.then?.allOf),
          conditionDetails: conditions.map(c => ({
            field: c.field,
            operator: c.operator,
            expectedValue: c.value,
            actualValue: getNestedValue(formValues, c.field),
            matches: isConditionMet
          }))
        });
      }
      
      if (isConditionMet) {
        // Process the 'then' schema
        const thenResult = processSchemaRecursively(subSchema.then, formValues, depth + 1);
        resultFields = { ...resultFields, ...thenResult.fields };
        resultRequired = [...resultRequired, ...thenResult.required];
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`${indent}✅ Added conditional fields:`, Object.keys(thenResult.fields));
        }
      } else if (subSchema.else) {
        // Process the 'else' schema
        const elseResult = processSchemaRecursively(subSchema.else, formValues, depth + 1);
        resultFields = { ...resultFields, ...elseResult.fields };
        resultRequired = [...resultRequired, ...elseResult.required];
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`${indent}❌ Added else fields:`, Object.keys(elseResult.fields));
        }
      }
    } else {
      // This is a base schema to be merged unconditionally
      const baseResult = processSchemaRecursively(subSchema, formValues, depth + 1);
      resultFields = { ...resultFields, ...baseResult.fields };
      resultRequired = [...resultRequired, ...baseResult.required];
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${indent}📦 Added base fields:`, Object.keys(baseResult.fields));
      }
    }
  });

  return {
    fields: resultFields,
    required: [...new Set(resultRequired)]
  };
}

/**
 * Process a schema recursively, handling nested allOf, properties, and other structures
 */
function processSchemaRecursively(
  schema: SchemaProperty,
  formValues: Record<string, any>,
  depth: number = 0
): {
  fields: Record<string, SchemaProperty>;
  required: string[];
} {
  let schemaFields: Record<string, SchemaProperty> = {};
  let schemaRequired: string[] = [];

  const indent = '  '.repeat(depth);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`${indent}📋 Processing schema recursively at depth ${depth}:`, {
      hasProperties: !!schema.properties,
      hasRequired: !!schema.required,
      hasAllOf: !!schema.allOf,
      propertiesKeys: schema.properties ? Object.keys(schema.properties) : [],
      requiredFields: schema.required || []
    });
  }

  // Extract direct properties
  if (schema.properties) {
    schemaFields = { ...schema.properties };
  }

  // Extract direct required fields
  if (schema.required) {
    schemaRequired = [...schema.required];
  }

  // Process nested allOf if it exists
  if (schema.allOf && Array.isArray(schema.allOf)) {
    const nestedAllOf = processAllOfRecursively(schema.allOf, formValues, depth);
    schemaFields = { ...schemaFields, ...nestedAllOf.fields };
    schemaRequired = [...schemaRequired, ...nestedAllOf.required];
  }

  const result = {
    fields: schemaFields,
    required: [...new Set(schemaRequired)]
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(`${indent}✅ Schema processing result:`, {
      fieldsCount: Object.keys(result.fields).length,
      fieldNames: Object.keys(result.fields),
      requiredCount: result.required.length,
      requiredFields: result.required
    });
  }

  return result;
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
  // Start with ONLY base properties from the schema (not allOf)
  let activeFields: Record<string, SchemaProperty> = {};
  let activeRequired: string[] = [];

  // Step 1: Extract base properties (these are always shown)
  if (schema.properties) {
    activeFields = { ...schema.properties };
  }

  // Step 2: Extract base required fields (these are always required)
  if (schema.required) {
    activeRequired = [...schema.required];
  }

  // Step 3: Process allOf conditions recursively
  if (schema.allOf && Array.isArray(schema.allOf)) {
    const processedAllOf = processAllOfRecursively(schema.allOf, formValues, 0);
    activeFields = { ...activeFields, ...processedAllOf.fields };
    activeRequired = [...activeRequired, ...processedAllOf.required];
  }

  // Step 4: Process nested objects with their own conditional logic
  Object.entries(activeFields).forEach(([fieldKey, field]) => {
    if (field && typeof field === 'object') {
      if (field.allOf || (field.type === 'object' && field.properties)) {
        // Get the nested form values for this object
        const nestedFormValues = formValues[fieldKey] || {};
        
        // Recursively get active fields for the nested object
        const nestedActiveFields = getActiveFields(field, nestedFormValues);
        
        // Update the field with the active nested fields
        activeFields[fieldKey] = {
          ...field,
          properties: nestedActiveFields.fields,
          required: nestedActiveFields.required,
        };
      }
      
      // Handle array items with conditional logic
      if (field.type === 'array' && field.items && typeof field.items === 'object') {
        if (field.items.allOf || field.items.properties) {
          // For array items, we need to evaluate with empty values initially
          // The actual values will be evaluated when array items are created
          const itemsActiveFields = getActiveFields(field.items, {});
          activeFields[fieldKey] = {
            ...field,
            items: {
              ...field.items,
              properties: itemsActiveFields.fields,
              required: itemsActiveFields.required,
            }
          };
        }
      }
    }
  });

  // Remove duplicates from required array
  activeRequired = [...new Set(activeRequired)];

  // Debug final result
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎯 Final active fields:`, {
      fields: Object.keys(activeFields),
      required: activeRequired,
      formValues
    });
  }

  return {
    fields: activeFields,
    required: activeRequired,
  };
}