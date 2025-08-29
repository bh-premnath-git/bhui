// Utility functions for handling complex JSON schemas

// Debug control functions
declare global {
  interface Window {
    enableVerboseSchemaDebug?: boolean;
    lastLoggedSourceType?: string;
    lastActiveFields?: string[];
  }
}

// Helper function to enable verbose schema debugging
export function enableVerboseSchemaDebug() {
  if (typeof window !== 'undefined') {
    window.enableVerboseSchemaDebug = true;
  }
}

// Helper function to disable verbose schema debugging
export function disableVerboseSchemaDebug() {
  if (typeof window !== 'undefined') {
    window.enableVerboseSchemaDebug = false;
  }
}

/**
 * Convert underscore-separated field names to proper display names
 * e.g., "field_name" -> "Field Name", "some_long_field_name" -> "Some Long Field Name"
 * Also handles nested field paths like "source.source_type" -> "Source Type"
 */
export function formatFieldTitle(fieldKey: string): string {
  // Handle nested field paths by taking only the last part
  const actualFieldName = fieldKey.includes('.') ? fieldKey.split('.').pop() || fieldKey : fieldKey;
  
  return actualFieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

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
  else?: SchemaProperty;
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
  required = Array.from(new Set(required));

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
      // For enum fields, use the first enum value as default
      if (field.enum && field.enum.length > 0) {
        return field.enum[0];
      }
      return '';
    case 'number':
    case 'integer':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object':
      // For objects with properties, initialize with default values for each property
      if (field.properties) {
        const obj: any = {};
        Object.entries(field.properties).forEach(([key, propField]: [string, any]) => {
          if (propField.type === 'array' && field.required?.includes(key)) {
            // For required arrays within objects, initialize with at least one default item
            const arrayValue = getDefaultValueForField(propField);
            if (Array.isArray(arrayValue) && arrayValue.length === 0) {
              // Create a default item for the array
              if (propField.items?.type === 'object' && propField.items.properties) {
                const defaultItem: any = {};
                Object.entries(propField.items.properties).forEach(([itemPropKey, itemPropField]: [string, any]) => {
                  defaultItem[itemPropKey] = getDefaultValueForField(itemPropField);
                });
                // Add unique key for React reconciliation
                defaultItem._key = `item_${Date.now()}_${Math.random()}`;
                arrayValue.push(defaultItem);
              }
            }
            obj[key] = arrayValue;
          } else if (key === 'hints' && propField.type === 'array') {
            // Special handling for hints array - always initialize with one hint object
            const hintsArray = getDefaultValueForField(propField);
            if (Array.isArray(hintsArray) && hintsArray.length === 0) {
              const defaultHint = {
                join_input: '',
                hint_type: 'broadcast',
                propagate_all_columns: false,
                _key: `item_${Date.now()}_${Math.random()}`
              };
              hintsArray.push(defaultHint);
            }
            obj[key] = hintsArray;
          } else {
            obj[key] = getDefaultValueForField(propField);
          }
        });
        return obj;
      }
      // For endpoint fields (ui-hint: endpoint), return null to indicate no selection
      if (field['ui-hint'] === 'endpoint') {
        return null;
      }
      // For objects with additionalProperties (key-value objects), return empty object
      return {};
    default:
      return '';
  }
}

/**
 * Transform array values to the format expected by ArrayField component
 * For primitive arrays, ArrayField expects objects with 'value' property
 */
export function transformArrayForForm(value: any, field: SchemaProperty): any {
  if (!Array.isArray(value) || field.type !== 'array') {
    console.log(`🔧 transformArrayForForm: Skipping non-array value:`, { value, fieldType: field.type });
    return value;
  }

  // Check if this is a primitive array (string, number, boolean items)
  const itemType = field.items?.type;
  const isPrimitiveArray = itemType && ['string', 'number', 'integer', 'boolean'].includes(itemType);
  
  console.log(`🔧 transformArrayForForm: Processing array:`, {
    value,
    itemType,
    isPrimitiveArray,
    valueLength: value.length
  });
  
  if (isPrimitiveArray) {
    // Transform simple array values to objects with 'value' property
    const transformed = value.map((item: any, index: number) => {
      // If it's already in the correct format, keep it
      if (typeof item === 'object' && item !== null && 'value' in item) {
        console.log(`🔧 transformArrayForForm: Item ${index} already in correct format:`, item);
        return item;
      }
      // Transform primitive value to object format
      const transformedItem = {
        value: item,
        _key: `item_${index}_${Date.now()}`
      };
      console.log(`🔧 transformArrayForForm: Transformed item ${index}:`, { original: item, transformed: transformedItem });
      return transformedItem;
    });
    console.log(`🔧 transformArrayForForm: Final transformed array:`, transformed);
    return transformed;
  }

  // For object arrays, return as-is but ensure each item has a _key
  const objectArray = value.map((item: any, index: number) => ({
    ...item,
    _key: item._key || `item_${index}_${Date.now()}`
  }));
  console.log(`🔧 transformArrayForForm: Object array with keys:`, objectArray);
  return objectArray;
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
      } else if (field.type === 'array' && field.required && schema.required?.includes(key)) {
        // For required arrays, initialize with at least one default item
        const arrayValue = getDefaultValueForField(field);
        if (Array.isArray(arrayValue) && arrayValue.length === 0) {
          // Create a default item for the array
          if (field.items?.type === 'object' && field.items.properties) {
            const defaultItem: any = {};
            Object.entries(field.items.properties).forEach(([propKey, propField]: [string, any]) => {
              defaultItem[propKey] = getDefaultValueForField(propField);
            });
            // Add unique key for React reconciliation
            defaultItem._key = `item_${Date.now()}`;
            arrayValue.push(defaultItem);
          }
        }
        initialValues[key] = arrayValue;
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
              // Only set if there's an explicit default that matches the condition value
              // Don't automatically set to first enum value as this causes unwanted conditional fields to appear
              if (conditionField.default === condition.value) {
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
  baseRequired = Array.from(new Set(baseRequired));

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
 * Handles multiple form structure patterns for maximum compatibility
 */
export function getNestedValue(obj: any, path: string): any {
  if (!path.includes('.')) {
    // First try the direct path
    let value = obj[path];
    
    // If not found and this looks like a root-level field that might be nested under 'source'
    if (value === undefined && obj.source && typeof obj.source === 'object') {
      // Try looking under 'source' for common fields
      if (['source_type', 'file_name', 'table_name', 'file_type'].includes(path)) {
        value = obj.source[path];
        

      }
    }
    
    return value;
  }
  
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }
  
  // If we didn't find the nested path, try some common alternatives
  if (current === undefined && path.includes('source.')) {
    // Try alternative paths for common mismatches
    if (path === 'source.source_type' && obj.source_type !== undefined) {
      // Schema expects source.source_type but form has source_type at root
      return obj.source_type;
    }
    if (path === 'source.type' && obj.source && obj.source.source_type !== undefined) {
      // Schema expects source.type but form has source.source_type
      return obj.source.source_type;
    }
    
    // Handle double nesting: source.source.source_type
    if (path === 'source.source_type' && obj.source && obj.source.source && obj.source.source.source_type !== undefined) {
      return obj.source.source.source_type;
    }
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
      result = Array.isArray(condition.value) ? condition.value.includes(fieldValue) : fieldValue === condition.value;
      break;
    case 'not_equals':
      result = fieldValue !== condition.value;
      break;
    case 'not_in':
      result = Array.isArray(condition.value) ? !condition.value.includes(fieldValue) : fieldValue !== condition.value;
      break;
    default:
      result = fieldValue === condition.value;
  }
  
  // Apply negation if specified
  if (condition.negate) {
    result = !result;
  }
  
  return result;
}

/**
 * Check if all conditions in an array are met
 */
export function areAllConditionsMet(conditions: Array<{ field: string; value: any; operator?: string; negate?: boolean }>, formValues: any): boolean {
  return conditions.every(condition => isConditionMet(condition, formValues));
}

/**
 * Process allOf conditionals in a schema
 */
function processAllOfConditionals(
  allOfSchemas: SchemaProperty[],
  formValues: Record<string, any>,
  depth: number = 0
): { fields: Record<string, SchemaProperty>; required: string[] } {
  let resultFields: Record<string, SchemaProperty> = {};
  let resultRequired: string[] = [];

  allOfSchemas.forEach((subSchema, index) => {
    if (subSchema.if && subSchema.then) {
      // This is a conditional schema - evaluate the condition
      const conditions = extractAllConditionsFromIf(subSchema.if);
      const isConditionMet = areAllConditionsMet(conditions, formValues);
      
      if (isConditionMet) {
        // Process the 'then' schema
        const thenResult = processSchemaRecursively(subSchema.then, formValues, depth + 1);
        resultFields = { ...resultFields, ...thenResult.fields };
        resultRequired = [...resultRequired, ...thenResult.required];
      } else if (subSchema.else) {
        // Process the 'else' schema
        const elseResult = processSchemaRecursively(subSchema.else, formValues, depth + 1);
        resultFields = { ...resultFields, ...elseResult.fields };
        resultRequired = [...resultRequired, ...elseResult.required];
      }
    } else {
      // This is a base schema to be merged unconditionally
      const baseResult = processSchemaRecursively(subSchema, formValues, depth + 1);
      resultFields = { ...resultFields, ...baseResult.fields };
      resultRequired = [...resultRequired, ...baseResult.required];
    }
  });

  return { fields: resultFields, required: resultRequired };
}

/**
 * Process a schema recursively, handling nested allOf, properties, and other structures
 */
function processSchemaRecursively(
  schema: SchemaProperty,
  formValues: Record<string, any>,
  depth: number = 0
): { fields: Record<string, SchemaProperty>; required: string[] } {
  let schemaFields: Record<string, SchemaProperty> = {};
  let schemaRequired: string[] = [];

  // Extract direct properties
  if (schema.properties) {
    schemaFields = { ...schemaFields, ...schema.properties };
  }

  // Extract required fields
  if (schema.required) {
    schemaRequired = [...schemaRequired, ...schema.required];
  }

  // Process nested allOf if it exists
  if (schema.allOf && Array.isArray(schema.allOf)) {
    const nestedAllOf = processAllOfConditionals(schema.allOf, formValues, depth + 1);
    schemaFields = { ...schemaFields, ...nestedAllOf.fields };
    schemaRequired = [...schemaRequired, ...nestedAllOf.required];
  }

  return {
    fields: schemaFields,
    required: Array.from(new Set(schemaRequired))
  };
}

/**
 * Get active fields based on current form values and conditional logic
 */
export function getActiveFields(
  schema: SchemaProperty,
  formValues: Record<string, any>
): { fields: Record<string, SchemaProperty>; required: string[] } {
  // Only log if source_type is being processed to track initial value issues
  if (schema?.title === 'Source' || formValues?.source?.source_type || formValues?.source_type) {
    console.log('🔧 getActiveFields - Source processing:', {
      schemaTitle: schema?.title,
      sourceType: formValues?.source?.source_type,
      rootSourceType: formValues?.source_type,
      hasSourceObject: !!formValues?.source
    });
  }

  let activeFields: Record<string, SchemaProperty> = {};
  let activeRequired: string[] = [];

  // Process the schema recursively
  const result = processSchemaRecursively(schema, formValues, 0);
  activeFields = { ...activeFields, ...result.fields };
  activeRequired = [...activeRequired, ...result.required];

  // Handle nested object fields (like source)
  Object.entries(activeFields).forEach(([fieldKey, field]) => {
    if (field.allOf || (field.type === 'object' && field.properties)) {
      // Get the nested form values for this object
      const nestedFormValues = formValues[fieldKey] || {};
      
      // Debug nested processing
      if (fieldKey === 'source') {
        console.log('🔧 getActiveFields - Processing nested source:', {
          fieldKey,
          nestedFormValues,
          sourceType: nestedFormValues.source_type,
          hasSourceType: 'source_type' in nestedFormValues,
          nestedKeys: Object.keys(nestedFormValues)
        });
      }
      
      // Recursively get active fields for the nested object
      const nestedActiveFields = getActiveFields(field, nestedFormValues);
      
      // Update the field with the active nested fields
      activeFields[fieldKey] = {
        ...field,
        properties: nestedActiveFields.fields,
        required: nestedActiveFields.required
      };
    }
  });

  // Remove duplicates from required array
  activeRequired = Array.from(new Set(activeRequired));

  return {
    fields: activeFields,
    required: activeRequired
  };
}

/**
 * Extract all possible conditional values from a schema to discover all possible fields
 * This is particularly useful for complex conditional schemas like DataQuality rules
 */
export function extractPossibleConditionalValues(schema: SchemaProperty): Record<string, any>[] {
  const possibleValues: Record<string, any>[] = [];
  
  if (!schema.allOf || !Array.isArray(schema.allOf)) {
    return [{}];
  }
  
  // Extract all possible enum values from conditional schemas
  const extractEnumValues = (condition: SchemaProperty): Record<string, any[]> => {
    const enumValues: Record<string, any[]> = {};
    
    if (condition.if?.properties) {
      Object.entries(condition.if.properties).forEach(([key, prop]: [string, any]) => {
        if (prop.const !== undefined) {
          if (!enumValues[key]) enumValues[key] = [];
          enumValues[key].push(prop.const);
        } else if (prop.enum) {
          if (!enumValues[key]) enumValues[key] = [];
          enumValues[key].push(...prop.enum);
        }
      });
    }
    
    return enumValues;
  };
  
  // Collect all possible enum values from all conditions
  const allEnumValues: Record<string, Set<any>> = {};
  
  schema.allOf.forEach((condition: SchemaProperty) => {
    const enumValues = extractEnumValues(condition);
    Object.entries(enumValues).forEach(([key, values]) => {
      if (!allEnumValues[key]) allEnumValues[key] = new Set();
      values.forEach(value => allEnumValues[key].add(value));
    });
    
    // Also check nested allOf conditions
    if (condition.then?.allOf) {
      condition.then.allOf.forEach((nestedCondition: SchemaProperty) => {
        const nestedEnumValues = extractEnumValues(nestedCondition);
        Object.entries(nestedEnumValues).forEach(([key, values]) => {
          if (!allEnumValues[key]) allEnumValues[key] = new Set();
          values.forEach(value => allEnumValues[key].add(value));
        });
      });
    }
  });
  
  // Generate all possible combinations
  const keys = Object.keys(allEnumValues);
  if (keys.length === 0) {
    return [{}];
  }
  
  // For DataQuality specifically, we know the structure, so let's create targeted combinations
  if (keys.includes('column_type')) {
    const columnTypes = Array.from(allEnumValues.column_type);
    columnTypes.forEach(columnType => {
      // Base combination with just column_type
      possibleValues.push({ column_type: columnType });
      
      // If there are rule_type values, combine them
      if (allEnumValues.rule_type) {
        const ruleTypes = Array.from(allEnumValues.rule_type);
        ruleTypes.forEach(ruleType => {
          possibleValues.push({ 
            column_type: columnType, 
            rule_type: ruleType 
          });
        });
      }
    });
  } else {
    // Generic combination generation for other schemas
    const generateCombinations = (keyIndex: number, currentCombination: Record<string, any>): void => {
      if (keyIndex >= keys.length) {
        possibleValues.push({ ...currentCombination });
        return;
      }
      
      const key = keys[keyIndex];
      const values = Array.from(allEnumValues[key]);
      
      values.forEach(value => {
        generateCombinations(keyIndex + 1, { ...currentCombination, [key]: value });
      });
    };
    
    generateCombinations(0, {});
  }
  
  // Always include an empty combination
  possibleValues.push({});
  
  return possibleValues;
}