import { pipelineSchema } from '@bh-ai/schemas';
import { ValidEngineTypes } from '@/types/pipeline';

export function extractReaderSchema(engineType: ValidEngineTypes): any {
  try {
    // Find the engine-specific condition in the pipeline schema
    const engineCondition = pipelineSchema.allOf?.find(
      (condition: any) => 
        condition.if?.properties?.engine_type?.const === engineType
    );

    if (!engineCondition) {
      console.warn(`No schema found for engine type: ${engineType}`);
      return null;
    }

    // Get the transformations schema from the engine condition
    const transformationsSchema = engineCondition.then?.properties?.transformations?.items;

    if (!transformationsSchema?.allOf) {
      console.warn(`No transformations allOf found for engine type: ${engineType}`);
      return null;
    }

    // Find the Reader transformation condition
    const readerCondition = transformationsSchema.allOf.find(
      (condition: any) =>
        condition.if?.properties?.transformation?.const === 'Reader'
    );

    if (!readerCondition) {
      console.warn(`No Reader transformation found for engine type: ${engineType}`);
      return null;
    }

    // Return the Reader schema
    return readerCondition.then || null;
  } catch (error) {
    console.error('Error extracting Reader schema:', error);
    return null;
  }
}

/**
 * Extracts connection schema from the pipeline schema based on engine type
 */
export function extractConnectionSchema(engineType: ValidEngineTypes): any {
  try {
    const engineCondition = pipelineSchema.allOf?.find(
      (condition: any) => 
        condition.if?.properties?.engine_type?.const === engineType
    );

    if (!engineCondition) {
      return null;
    }

    return engineCondition.then?.properties?.connections?.patternProperties?.["^[a-zA-Z0-9_]+$"] || null;
  } catch (error) {
    console.error('Error extracting connection schema:', error);
    return null;
  }
}

/**
 * Extracts source schema from the pipeline schema based on engine type
 */
export function extractSourceSchema(engineType: ValidEngineTypes): any {
  try {
    const engineCondition = pipelineSchema.allOf?.find(
      (condition: any) => 
        condition.if?.properties?.engine_type?.const === engineType
    );

    if (!engineCondition) {
      return null;
    }

    return engineCondition.then?.properties?.sources?.patternProperties?.["^[a-zA-Z0-9_]+$"] || null;
  } catch (error) {
    console.error('Error extracting source schema:', error);
    return null;
  }
}

/**
 * Resolves conditional schema based on form data
 * Handles nested allOf conditions dynamically
 */
export function resolveConditionalSchema(schema: any, formData: any): any {
  if (!schema) {
    return schema;
  }

  let resolvedSchema = { ...schema };

  // Process allOf conditions if they exist
  if (schema.allOf && Array.isArray(schema.allOf)) {
    schema.allOf.forEach((condition: any) => {
      if (condition.if && condition.then) {
        // Check if the condition matches the current form data
        if (matchesCondition(condition.if, formData)) {
          // Merge the 'then' properties into the resolved schema
          resolvedSchema = mergeSchemas(resolvedSchema, condition.then);
          console.log('🔧 Condition matched and merged:', {
            condition: condition.if,
            formData,
            mergedProperties: Object.keys(condition.then.properties || {}),
            resultingProperties: Object.keys(resolvedSchema.properties || {})
          });
        } else {
          console.log('🔧 Condition did not match:', {
            condition: condition.if,
            formData
          });
        }
      }
    });
  }

  // Recursively resolve nested schemas in properties
  if (resolvedSchema.properties) {
    Object.keys(resolvedSchema.properties).forEach(key => {
      const propertySchema = resolvedSchema.properties[key];
      if (propertySchema && (propertySchema.allOf || propertySchema.properties)) {
        // Get the nested form data for this property
        const nestedFormData = formData[key] || {};
        resolvedSchema.properties[key] = resolveConditionalSchema(propertySchema, nestedFormData);
      }
    });
  }

  // Handle nested allOf conditions that may have been merged
  // This is crucial for file type conditions nested within source type conditions
  if (resolvedSchema.allOf) {
    let hasChanges = true;
    let iterations = 0;
    const maxIterations = 5; // Prevent infinite loops
    
    while (hasChanges && iterations < maxIterations) {
      hasChanges = false;
      iterations++;
      
      const currentAllOf = [...resolvedSchema.allOf];
      currentAllOf.forEach((condition: any) => {
        if (condition.if && condition.then) {
          if (matchesCondition(condition.if, formData)) {
            const beforeMerge = JSON.stringify(resolvedSchema.properties);
            resolvedSchema = mergeSchemas(resolvedSchema, condition.then);
            const afterMerge = JSON.stringify(resolvedSchema.properties);
            
            if (beforeMerge !== afterMerge) {
              hasChanges = true;
              console.log('🔧 Nested condition matched in iteration', iterations, ':', {
                condition: condition.if,
                formData,
                addedProperties: Object.keys(condition.then.properties || {})
              });
            }
          }
        }
      });
    }
    
    if (iterations >= maxIterations) {
      console.warn('🔧 Maximum iterations reached in schema resolution');
    }
  }

  return resolvedSchema;
}

/**
 * Checks if form data matches a condition
 */
function matchesCondition(condition: any, formData: any): boolean {
  if (!condition.properties) {
    return false;
  }

  return checkPropertiesMatch(condition.properties, formData);
}

/**
 * Recursively check if properties match form data
 */
function checkPropertiesMatch(properties: any, formData: any): boolean {
  for (const [key, value] of Object.entries(properties)) {
    if ((value as any)?.const !== undefined) {
      // Direct property with const value
      const formValue = formData[key];
      console.log('🔧 Checking condition:', {
        key,
        expectedValue: (value as any).const,
        actualValue: formValue,
        matches: formValue === (value as any).const
      });
      if (formValue !== (value as any).const) {
        return false;
      }
    } else if ((value as any)?.enum !== undefined) {
      // Property with enum values
      const formValue = formData[key];
      if (!(value as any).enum.includes(formValue)) {
        return false;
      }
    } else if ((value as any)?.properties) {
      // Nested properties
      const nestedFormData = formData[key];
      if (!nestedFormData || !checkPropertiesMatch((value as any).properties, nestedFormData)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Gets nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Merges two schemas together
 */
function mergeSchemas(baseSchema: any, additionalSchema: any): any {
  const merged = { ...baseSchema };

  if (additionalSchema.properties) {
    merged.properties = {
      ...merged.properties,
      ...additionalSchema.properties
    };
  }

  if (additionalSchema.required) {
    merged.required = [
      ...(merged.required || []),
      ...additionalSchema.required
    ];
  }

  if (additionalSchema.allOf) {
    merged.allOf = [
      ...(merged.allOf || []),
      ...additionalSchema.allOf
    ];
  }

  // Merge other properties
  Object.keys(additionalSchema).forEach(key => {
    if (!['properties', 'required', 'allOf'].includes(key)) {
      merged[key] = additionalSchema[key];
    }
  });

  return merged;
}

/**
 * Extracts all possible field types from a schema with allOf conditions
 */
export function extractAllFieldTypes(schema: any): Record<string, any> {
  const fields: Record<string, any> = {};

  // Add base properties
  if (schema.properties) {
    Object.assign(fields, schema.properties);
  }

  // Process allOf conditions to get all possible fields
  if (schema.allOf) {
    schema.allOf.forEach((condition: any) => {
      if (condition.then?.properties) {
        Object.assign(fields, condition.then.properties);
      }
      if (condition.properties) {
        Object.assign(fields, condition.properties);
      }
    });
  }

  return fields;
}

/**
 * Get source type specific fields based on source_type
 * This handles the conditional rendering of file_name vs table_name
 */
export function getSourceTypeFields(readerSchema: any, sourceType: string): any {
  if (!readerSchema?.properties?.source?.allOf) return null;

  try {
    // Find the condition that matches the source_type
    const sourceCondition = readerSchema.properties.source.allOf.find((condition: any) => 
      condition.if?.properties?.source_type?.const === sourceType
    );

    console.log('🔧 Looking for source type condition:', {
      sourceType,
      allOfConditions: readerSchema.properties.source.allOf,
      foundCondition: sourceCondition
    });

    return sourceCondition?.then || null;
  } catch (error) {
    console.error('Error getting source type fields:', error);
    return null;
  }
}

/**
 * Get file type specific schema (read_options) based on selected file type
 * This handles the nested allOf conditions within the Reader schema
 */
export function getFileTypeSchema(readerSchema: any, fileType: string): any {
  if (!fileType || !readerSchema?.allOf) return null;

  try {
    console.log('🔧 Looking for file type schema:', {
      fileType,
      readerSchemaAllOf: readerSchema.allOf?.length
    });

    // Strategy 1: Look for direct file_type conditions in main allOf
    const directFileTypeCondition = readerSchema.allOf.find((condition: any) => 
      condition.if?.properties?.file_type?.const === fileType
    );

    if (directFileTypeCondition?.then) {
      console.log('🔧 Found direct file type condition:', {
        fileType,
        hasReadOptions: !!directFileTypeCondition.then.properties?.read_options
      });
      return directFileTypeCondition.then;
    }

    // Strategy 2: Look within File source type conditions for nested file type conditions
    const fileSourceCondition = readerSchema.allOf?.find((condition: any) => 
      condition.if?.properties?.source?.properties?.source_type?.const === 'File'
    );

    if (fileSourceCondition?.then?.allOf) {
      console.log('🔧 Looking in nested allOf for file type:', {
        nestedConditions: fileSourceCondition.then.allOf.map((cond: any) => ({
          ifCondition: cond.if?.properties?.file_type?.const,
          hasReadOptions: !!cond.then?.properties?.read_options
        }))
      });
      
      const nestedFileTypeCondition = fileSourceCondition.then.allOf.find((condition: any) => 
        condition.if?.properties?.file_type?.const === fileType
      );
      
      if (nestedFileTypeCondition?.then) {
        console.log('🔧 Found nested file type condition:', {
          fileType,
          hasReadOptions: !!nestedFileTypeCondition.then.properties?.read_options
        });
        return nestedFileTypeCondition.then;
      }
    }

    // Strategy 3: Look for alternative source condition patterns
    const altFileSourceCondition = readerSchema.allOf?.find((condition: any) => 
      condition.if?.properties?.source?.properties?.type?.const === 'File'
    );

    if (altFileSourceCondition?.then?.allOf) {
      console.log('🔧 Looking in alternative nested allOf for file type');
      
      const altNestedFileTypeCondition = altFileSourceCondition.then.allOf.find((condition: any) => 
        condition.if?.properties?.file_type?.const === fileType
      );
      
      if (altNestedFileTypeCondition?.then) {
        console.log('🔧 Found alternative nested file type condition:', {
          fileType,
          hasReadOptions: !!altNestedFileTypeCondition.then.properties?.read_options
        });
        return altNestedFileTypeCondition.then;
      }
    }

    // Strategy 4: Deep search through all nested allOf conditions
    for (const condition of readerSchema.allOf) {
      if (condition.then?.allOf) {
        const deepFileTypeCondition = condition.then.allOf.find((nested: any) => 
          nested.if?.properties?.file_type?.const === fileType
        );
        
        if (deepFileTypeCondition?.then) {
          console.log('🔧 Found file type condition in deep search:', {
            fileType,
            hasReadOptions: !!deepFileTypeCondition.then.properties?.read_options
          });
          return deepFileTypeCondition.then;
        }
      }
    }

    console.log('🔧 No file type condition found for:', fileType);
    return null;
  } catch (error) {
    console.error('Error getting file type schema:', error);
    return null;
  }
}

// Import local schema files as fallback
// import CSVOptionsSchema from '@/components/bh-reactflow-comps/builddata/json/CSVOptions.json';
// import JSONOptionsSchema from '@/components/bh-reactflow-comps/builddata/json/JSONOptions.json';
// import ParquetOptionsSchema from '@/components/bh-reactflow-comps/builddata/json/ParquetOptions.json';

/**
 * Get fallback read options schema for file types not defined in pipeline schema
 */
// function getFallbackReadOptionsSchema(fileType: string): any {
//   const fallbackSchemas: Record<string, any> = {
//     'CSV': CSVOptionsSchema,
//     'JSON': JSONOptionsSchema,
//     'Parquet': ParquetOptionsSchema,
//   };

//   return fallbackSchemas[fileType] || null;
// }

/**
 * Extract read_options schema from file type schema
 * This handles the items property that contains the actual read_options fields
 * Uses pipeline schema first, falls back to local JSON files if needed
 */
export function getReadOptionsSchema(fileTypeSchema: any, fileType?: string): any {
  // First, try to get from the pipeline schema
  if (fileTypeSchema?.properties?.read_options) {
    try {
      const readOptionsProperty = fileTypeSchema.properties.read_options;
      
      console.log('🔧 Found read_options in pipeline schema:', {
        type: readOptionsProperty.type,
        hasItems: !!readOptionsProperty.items,
        hasProperties: !!readOptionsProperty.properties
      });
      
      // The actual schema is in the items property
      if (readOptionsProperty.items) {
        console.log('🔧 Extracting read_options schema from pipeline schema items');
        return readOptionsProperty.items;
      }
      
      // Fallback: return the read_options property itself
      return readOptionsProperty;
    } catch (error) {
      console.error('Error extracting read_options from pipeline schema:', error);
    }
  }

  // If not found in pipeline schema, try fallback local schemas
  // if (fileType) {
  //   console.log('🔧 No read_options in pipeline schema, trying fallback for:', fileType);
  //   const fallbackSchema = getFallbackReadOptionsSchema(fileType);
    
  //   if (fallbackSchema) {
  //     console.log('🔧 Using fallback schema for:', fileType);
  //     return fallbackSchema;
  //   }
  // }

  console.log('🔧 No read_options schema found for file type:', fileType);
  return null;
}