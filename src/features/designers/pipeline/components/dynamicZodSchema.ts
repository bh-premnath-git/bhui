import * as z from 'zod';
import { SchemaProperty, getActiveFields, getNestedValue, formatFieldTitle } from './schemaUtils';

/**
 * Generate a Zod schema from a JSON schema property
 */
function generateZodSchemaFromProperty(field: SchemaProperty, isRequired: boolean = false): z.ZodTypeAny {
  let zodSchema: z.ZodTypeAny;

  switch (field.type) {
    case 'string':
      zodSchema = z.string({
        required_error: `${field.title || 'Field'} is required`,
        invalid_type_error: `${field.title || 'Field'} must be a string`,
      });
      
      if (field.enum) {
        zodSchema = z.enum(field.enum as [string, ...string[]], {
          required_error: `${field.title || 'Field'} is required`,
        });
      }
      break;

    case 'number':
    case 'integer':
      zodSchema = z.number({
        required_error: `${field.title || 'Field'} is required`,
        invalid_type_error: `${field.title || 'Field'} must be a number`,
      });
      break;

    case 'boolean':
      zodSchema = z.boolean({
        required_error: `${field.title || 'Field'} is required`,
        invalid_type_error: `${field.title || 'Field'} must be a boolean`,
      });
      break;

    case 'array':
      if (field.items) {
        const itemSchema = generateZodSchemaFromProperty(field.items, false);
        zodSchema = z.array(itemSchema);
      } else {
        zodSchema = z.array(z.any());
      }
      break;

    case 'object':
      if (field.properties) {
        const objectSchema: Record<string, z.ZodTypeAny> = {};
        Object.entries(field.properties).forEach(([key, prop]) => {
          const isFieldRequired = field.required?.includes(key) || false;
          objectSchema[key] = generateZodSchemaFromProperty(prop, isFieldRequired);
        });
        zodSchema = z.object(objectSchema);
      } else {
        zodSchema = z.record(z.any());
      }
      break;

    default:
      zodSchema = z.any();
  }

  // Apply default value if provided
  if (field.default !== undefined) {
    zodSchema = zodSchema.default(field.default);
  }

  // Make optional if not required
  if (!isRequired) {
    zodSchema = zodSchema.optional();
  }

  return zodSchema;
}

/**
 * Generate a dynamic Zod schema factory that can be called with current form values
 */
export function createDynamicZodSchemaFactory(schema: SchemaProperty) {
  return (currentFormValues: any) => {
    return z.object({}).superRefine((data, ctx) => {
      // Get active fields based on current form values
      const { fields, required } = getActiveFields(schema, currentFormValues);

      console.log('🔍 Dynamic validation - Active fields:', Object.keys(fields));
      console.log('🔍 Dynamic validation - Required fields:', required);
      console.log('🔍 Dynamic validation - Form data:', data);
      console.log('🔍 Dynamic validation - Current form values:', currentFormValues);

      // Validate each active field
      Object.entries(fields).forEach(([fieldKey, field]) => {
        // Skip internal fields
        if (fieldKey === 'type' || fieldKey === 'task_id') {
          return;
        }

        const isRequired = required.includes(fieldKey);
        const fieldValue = getNestedValue(data, fieldKey);

        // Check if required field is missing
        if (isRequired && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: fieldKey.includes('.') ? fieldKey.split('.') : [fieldKey],
            message: `${field.title || formatFieldTitle(fieldKey)} is required`,
          });
          return;
        }

        // Skip validation if field is not provided and not required
        if (!isRequired && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
          return;
        }

        // Validate field type
        try {
          const fieldSchema = generateZodSchemaFromProperty(field, isRequired);
          fieldSchema.parse(fieldValue);
        } catch (error) {
          if (error instanceof z.ZodError) {
            error.issues.forEach((issue) => {
              ctx.addIssue({
                ...issue,
                path: fieldKey.includes('.') ? [...fieldKey.split('.'), ...issue.path] : [fieldKey, ...issue.path],
              });
            });
          }
        }
      });
    });
  };
}

/**
 * Generate a dynamic Zod schema that validates based on current form values
 * @deprecated Use createDynamicZodSchemaFactory instead for better form value handling
 */
export function generateDynamicZodSchema(schema: SchemaProperty) {
  return z.object({}).superRefine((data, ctx) => {
    // Get active fields based on current form values
    const { fields, required } = getActiveFields(schema, data);

    console.log('🔍 Dynamic validation - Active fields:', Object.keys(fields));
    console.log('🔍 Dynamic validation - Required fields:', required);
    console.log('🔍 Dynamic validation - Form data:', data);

    // Validate each active field
    Object.entries(fields).forEach(([fieldKey, field]) => {
      // Skip internal fields
      if (fieldKey === 'type' || fieldKey === 'task_id') {
        return;
      }

      const isRequired = required.includes(fieldKey);
      const fieldValue = getNestedValue(data, fieldKey);

      // Check if required field is missing
      if (isRequired && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: fieldKey.includes('.') ? fieldKey.split('.') : [fieldKey],
          message: `${field.title || formatFieldTitle(fieldKey)} is required`,
        });
        return;
      }

      // Skip validation if field is not provided and not required
      if (!isRequired && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
        return;
      }

      // Validate field type
      try {
        const fieldSchema = generateZodSchemaFromProperty(field, isRequired);
        fieldSchema.parse(fieldValue);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.issues.forEach((issue) => {
            ctx.addIssue({
              ...issue,
              path: fieldKey.includes('.') ? [...fieldKey.split('.'), ...issue.path] : [fieldKey, ...issue.path],
            });
          });
        }
      }
    });
  });
}

/**
 * Generate a static Zod schema for initial form setup (includes all possible fields)
 */
export function generateStaticZodSchema(schema: SchemaProperty): z.ZodObject<any> {
  const schemaMap: Record<string, z.ZodTypeAny> = {};

  // Extract all possible properties from the schema
  function extractAllProperties(currentSchema: SchemaProperty): Record<string, SchemaProperty> {
    let allProperties: Record<string, SchemaProperty> = {};

    // Add direct properties
    if (currentSchema.properties) {
      Object.assign(allProperties, currentSchema.properties);
    }

    // Process allOf patterns
    if (currentSchema.allOf) {
      currentSchema.allOf.forEach((subSchema) => {
        if (subSchema.then) {
          // Extract properties from conditional 'then' schemas
          const thenProperties = extractAllProperties(subSchema.then);
          Object.assign(allProperties, thenProperties);
        } else {
          // Extract properties from base schemas
          const baseProperties = extractAllProperties(subSchema);
          Object.assign(allProperties, baseProperties);
        }
      });
    }

    return allProperties;
  }

  const allProperties = extractAllProperties(schema);

  // Generate Zod schema for each property (all optional for static schema)
  Object.entries(allProperties).forEach(([key, field]) => {
    // Skip internal fields
    if (key === 'type' || key === 'task_id') {
      return;
    }

    schemaMap[key] = generateZodSchemaFromProperty(field, false); // All optional in static schema
  });

  return z.object(schemaMap);
}