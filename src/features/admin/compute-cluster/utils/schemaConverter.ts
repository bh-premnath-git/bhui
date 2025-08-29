interface ApiSchemaProperty {
  type?: string;
  title?: string;
  description?: string;
  default?: any;
  enum?: string[];
  anyOf?: Array<{ type?: string; enum?: string[]; $ref?: string; items?: { type?: string; enum?: string[]; $ref?: string } }>;
  items?: { type?: string; enum?: string[]; $ref?: string };
  $ref?: string;
  properties?: Record<string, any>;
  required?: string[];
}

interface ApiSchema {
  $defs?: Record<string, any>;
  properties: Record<string, ApiSchemaProperty>;
  required: string[];
  title: string;
  type: string;
}

interface FormSchemaProperty {
  type: string;
  title: string;
  description?: string;
  default?: any;
  enum?: string[];
  items?: { type?: string; enum?: string[]; properties?: Record<string, FormSchemaProperty>; required?: string[] };
  properties?: Record<string, FormSchemaProperty>;
  required?: string[];
  minItems?: number;
  minimum?: number;
  minLength?: number;
}

interface FormSchema {
  properties: Record<string, FormSchemaProperty>;
  required: string[];
}

export function convertApiSchemaToFormSchema(apiSchema: ApiSchema): FormSchema {
  console.log('Converting API schema to form schema:', apiSchema);
  
  const convertProperty = (prop: ApiSchemaProperty, defs?: Record<string, any>): FormSchemaProperty => {
    // Handle $ref references
    if (prop.$ref && defs) {
      const refKey = prop.$ref.replace('#/$defs/', '');
      const refProp = defs[refKey];
      if (refProp) {
        return convertProperty({ ...refProp, title: prop.title, description: prop.description }, defs);
      }
    }

    // Handle anyOf (union types)
    if (prop.anyOf) {
      // Find the main type (non-null)
      const mainType = prop.anyOf.find(t => t.type !== 'null');
      if (mainType) {
        // If mainType has a $ref, resolve it first
        if (mainType.$ref && defs) {
          const refKey = mainType.$ref.replace('#/$defs/', '');
          const refProp = defs[refKey];
          console.log(`Resolving $ref: ${refKey}`, refProp);
          if (refProp) {
            const converted: FormSchemaProperty = {
              type: refProp.type || 'string',
              title: prop.title || refProp.title || '',
              description: prop.description || refProp.description,
              default: prop.default !== undefined ? prop.default : refProp.default
            };

            if (refProp.enum) {
              converted.enum = refProp.enum;
              console.log(`Found enum in $ref ${refKey}:`, refProp.enum);
            }

            return converted;
          }
        }

        // Handle array type in anyOf (like applications field)
        if (mainType.type === 'array') {
          const converted: FormSchemaProperty = {
            type: 'array',
            title: prop.title || '',
            description: prop.description,
            default: prop.default
          };

          // Handle array items
          if (mainType.items) {
            if (mainType.items.$ref && defs) {
              // Resolve $ref in array items
              const refKey = mainType.items.$ref.replace('#/$defs/', '');
              const refProp = defs[refKey];
              console.log(`Resolving array items $ref: ${refKey}`, refProp);
              if (refProp) {
                converted.items = {
                  type: refProp.type || 'string'
                };
                
                // If it's an enum reference, add the enum values
                if (refProp.enum) {
                  converted.items.enum = refProp.enum;
                  console.log(`Found enum in array items $ref ${refKey}:`, refProp.enum);
                }
                
                // If it has properties, it's an object (like Tag objects)
                if (refProp.properties) {
                  converted.items.type = 'object';
                  converted.items.properties = {};
                  Object.entries(refProp.properties).forEach(([subKey, subProp]: [string, any]) => {
                    converted.items!.properties![subKey] = convertProperty(subProp, defs);
                  });
                  converted.items.required = refProp.required || [];
                  console.log(`Found object properties in array items $ref ${refKey}:`, converted.items.properties);
                }
              }
            } else {
              converted.items = {
                type: mainType.items.type,
                enum: mainType.items.enum
              };
            }
          }

          return converted;
        }

        // Handle regular anyOf without $ref
        const converted: FormSchemaProperty = {
          type: mainType.type,
          title: prop.title || '',
          description: prop.description,
          default: prop.default
        };

        if (mainType.enum) {
          converted.enum = mainType.enum;
        }

        return converted;
      }
    }

    // Handle regular properties
    const converted: FormSchemaProperty = {
      type: prop.type || 'string',
      title: prop.title || '',
      description: prop.description,
      default: prop.default
    };

    // Handle enums
    if (prop.enum) {
      converted.enum = prop.enum;
    }

    // Handle arrays
    if (prop.type === 'array' && prop.items) {
      if (prop.items.$ref && defs) {
        // Handle array of objects with $ref
        const refKey = prop.items.$ref.replace('#/$defs/', '');
        const refProp = defs[refKey];
        if (refProp) {
          converted.items = {
            type: refProp.type || 'object'
          };
          
          // If it's an enum reference, add the enum values
          if (refProp.enum) {
            converted.items.enum = refProp.enum;
          }
          
          // If it has properties, it's an object
          if (refProp.properties) {
            converted.items.type = 'object';
            converted.items.properties = {};
            Object.entries(refProp.properties).forEach(([subKey, subProp]: [string, any]) => {
              converted.items!.properties![subKey] = convertProperty(subProp, defs);
            });
            converted.items.required = refProp.required || [];
          }
        }
      } else {
        converted.items = {
          type: prop.items.type,
          enum: prop.items.enum
        };
      }
      if (converted.default && Array.isArray(converted.default)) {
        converted.minItems = converted.default.length > 0 ? 1 : 0;
      }
    }

    // Handle objects
    if (prop.type === 'object' && prop.properties) {
      converted.properties = {};
      Object.entries(prop.properties).forEach(([key, subProp]) => {
        converted.properties![key] = convertProperty(subProp, defs);
      });
      converted.required = prop.required || [];
    }

    // Handle numbers
    if (prop.type === 'number' || prop.type === 'integer') {
      if (typeof prop.default === 'number' && prop.default >= 0) {
        converted.minimum = 0;
      }
    }

    // Handle strings
    if (prop.type === 'string' && prop.title) {
      converted.minLength = 1;
    }

    return converted;
  };

  const formSchema: FormSchema = {
    properties: {},
    required: apiSchema.required || []
  };

  // Convert all properties
  Object.entries(apiSchema.properties).forEach(([key, prop]) => {
    formSchema.properties[key] = convertProperty(prop, apiSchema.$defs);
    
    // Special logging for applications field to verify multi-select handling
    if (key === 'applications') {
      console.log('Applications field conversion:', {
        original: prop,
        converted: formSchema.properties[key]
      });
    }
    
    // Special logging for bh_tags field to verify array of objects handling
    if (key === 'bh_tags') {
      console.log('Tags field conversion:', {
        original: prop,
        converted: formSchema.properties[key]
      });
    }
    
    // Special logging for security_group_ids field to verify array of strings handling
    if (key === 'security_group_ids') {
      console.log('Security Group IDs field conversion:', {
        original: prop,
        converted: formSchema.properties[key]
      });
    }
  });

  console.log('Converted form schema:', formSchema);
  return formSchema;
}

export function generateDefaultValues(schema: FormSchema): Record<string, any> {
  const defaults: Record<string, any> = {};

  Object.entries(schema.properties).forEach(([key, prop]) => {
    if (prop.default !== undefined) {
      defaults[key] = prop.default;
    } else if (prop.type === 'array') {
      defaults[key] = [];
    } else if (prop.type === 'object' && prop.properties) {
      defaults[key] = generateDefaultValues({ properties: prop.properties, required: prop.required || [] });
    } else if (prop.type === 'number' || prop.type === 'integer') {
      defaults[key] = 0;
    } else if (prop.type === 'boolean') {
      defaults[key] = false;
    } else {
      defaults[key] = '';
    }
  });

  return defaults;
}