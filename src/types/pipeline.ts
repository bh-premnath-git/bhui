import { pipelineSchema } from '@bh-ai/schemas';

// Extract engine types from the schema
export type EngineType = typeof pipelineSchema.properties.engine_type.enum[number];

// Define valid engine types based on schema, with fallback
export type ValidEngineTypes = EngineType extends string ? EngineType : 'pyspark' | 'pyflink';

// Type guard to check if a string is a valid engine type
export function isValidEngineType(value: string): value is ValidEngineTypes {
  try {
    const validTypes = pipelineSchema?.properties?.engine_type?.enum || ['pyspark', 'pyflink'];
    return validTypes.includes(value);
  } catch (error) {
    // Fallback if schema is not available
    return ['pyspark', 'pyflink', 'pandas'].includes(value);
  }
}

// Get all available engine types from schema
export function getAvailableEngineTypes(): ValidEngineTypes[] {
  try {
    return pipelineSchema?.properties?.engine_type?.enum || ['pyspark', 'pyflink'] as ValidEngineTypes[];
  } catch (error) {
    return ['pyspark', 'pyflink'] as ValidEngineTypes[];
  }
}