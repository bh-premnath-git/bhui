import * as z from 'zod';

export const generateTransformationFormSchema = (schema: any) => {
  const schemaMap: { [key: string]: any } = {};

  // Always include type and task_id
  schemaMap.type = z.string().min(1, "Type is required");
  schemaMap.task_id = z.string().min(1, "Task ID is required");

  if (schema?.properties) {
    Object.entries(schema.properties).forEach(([key, field]: [string, any]) => {
      // Skip type and task_id as they're handled above
      if (key === 'type' || key === 'task_id') {
        return;
      }

      let fieldSchema: any;

      switch (field.type) {
        case 'string':
          fieldSchema = z.string();
          
          // Handle enums
          if (field.enum && Array.isArray(field.enum)) {
            fieldSchema = z.enum(field.enum as [string, ...string[]]);
          }
          
          // Handle string constraints
          if (field.minLength) {
            fieldSchema = fieldSchema.min(field.minLength, `${field.title || key} must be at least ${field.minLength} characters`);
          }
          if (field.maxLength) {
            fieldSchema = fieldSchema.max(field.maxLength, `${field.title || key} must be at most ${field.maxLength} characters`);
          }
          if (field.pattern) {
            fieldSchema = fieldSchema.regex(new RegExp(field.pattern), `${field.title || key} format is invalid`);
          }
          
          break;

        case 'number':
        case 'integer':
          fieldSchema = field.type === 'integer' ? z.number().int() : z.number();
          
          // Handle number constraints
          if (field.minimum !== undefined) {
            fieldSchema = fieldSchema.min(field.minimum, `${field.title || key} must be at least ${field.minimum}`);
          }
          if (field.maximum !== undefined) {
            fieldSchema = fieldSchema.max(field.maximum, `${field.title || key} must be at most ${field.maximum}`);
          }
          
          break;

        case 'boolean':
          fieldSchema = z.boolean();
          break;

        case 'array':
          if (field.items) {
            let itemSchema: any;
            
            switch (field.items.type) {
              case 'string':
                itemSchema = z.string();
                if (field.items.minLength) {
                  itemSchema = itemSchema.min(field.items.minLength);
                }
                break;
              case 'number':
              case 'integer':
                itemSchema = field.items.type === 'integer' ? z.number().int() : z.number();
                break;
              case 'object':
                // For complex objects in arrays, create a basic object schema
                itemSchema = z.object({}).passthrough();
                break;
              default:
                itemSchema = z.any();
            }
            
            fieldSchema = z.array(itemSchema);
            
            // Handle array constraints
            if (field.minItems !== undefined) {
              fieldSchema = fieldSchema.min(field.minItems, `${field.title || key} must have at least ${field.minItems} items`);
            }
            if (field.maxItems !== undefined) {
              fieldSchema = fieldSchema.max(field.maxItems, `${field.title || key} must have at most ${field.maxItems} items`);
            }
            if (field.uniqueItems) {
              fieldSchema = fieldSchema.refine(
                (items: any[]) => new Set(items).size === items.length,
                { message: `${field.title || key} must contain unique items` }
              );
            }
          } else {
            fieldSchema = z.array(z.any());
          }
          break;

        case 'object':
          if (field.properties) {
            // Recursively handle nested objects
            const nestedSchemaMap: { [key: string]: any } = {};
            Object.entries(field.properties).forEach(([nestedKey, nestedField]: [string, any]) => {
              // Simplified nested field handling
              switch (nestedField.type) {
                case 'string':
                  nestedSchemaMap[nestedKey] = z.string();
                  break;
                case 'number':
                case 'integer':
                  nestedSchemaMap[nestedKey] = nestedField.type === 'integer' ? z.number().int() : z.number();
                  break;
                case 'boolean':
                  nestedSchemaMap[nestedKey] = z.boolean();
                  break;
                default:
                  nestedSchemaMap[nestedKey] = z.any();
              }
            });
            fieldSchema = z.object(nestedSchemaMap);
          } else if (field.additionalProperties) {
            // Handle objects with dynamic properties (like rename_columns)
            fieldSchema = z.record(z.string());
          } else {
            fieldSchema = z.object({}).passthrough();
          }
          break;

        default:
          fieldSchema = z.any();
      }

      // Handle default values
      if (field.default !== undefined) {
        fieldSchema = fieldSchema.default(field.default);
      }

      // Handle required fields
      const isRequired = schema.required?.includes(key);
      if (!isRequired) {
        fieldSchema = fieldSchema.optional();
      } else {
        // Add custom error message for required fields
        fieldSchema = fieldSchema.refine(
          (val: any) => {
            if (field.type === 'string') return val !== '' && val !== undefined && val !== null;
            if (field.type === 'array') return Array.isArray(val) && val.length > 0;
            return val !== undefined && val !== null;
          },
          { message: `${field.title || key} is required` }
        );
      }

      schemaMap[key] = fieldSchema;
    });
  }

  return z.object(schemaMap);
};

// Helper function to validate transformation data against schema
export const validateTransformationData = (data: any, schema: any) => {
  try {
    const zodSchema = generateTransformationFormSchema(schema);
    return zodSchema.parse(data);
  } catch (error) {
    console.error('Validation error:', error);
    throw error;
  }
};

// Helper function to get field type for UI rendering
export const getFieldType = (field: any): string => {
  if (field.enum) return 'select';
  if (field.type === 'boolean') return 'boolean';
  if (field.type === 'number' || field.type === 'integer') return 'number';
  if (field.type === 'array') return 'array';
  if (field.type === 'object') return 'object';
  if (field.format === 'textarea') return 'textarea';
  if (field.format === 'password') return 'password';
  return 'text';
};