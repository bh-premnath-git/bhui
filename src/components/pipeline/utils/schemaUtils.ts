import { usePipelineModules } from '@/hooks/usePipelineModules';

/**
 * Utility function to get transformation schema from pipeline modules
 */
export const getTransformationSchema = (
  transformationType: string,
  pipelineModules: any[]
): any | null => {
  if (!pipelineModules || pipelineModules.length === 0) {
    return null;
  }

  // Find the module that contains this transformation type
  for (const module of pipelineModules) {
    if (module.operators) {
      const operator = module.operators.find((op: any) => 
        op.type === transformationType || 
        op.type.toLowerCase() === transformationType.toLowerCase()
      );
      
      if (operator) {
        // Convert the operator properties to a schema format
        const schema = {
          title: module.label || transformationType,
          type: 'object',
          properties: operator.properties || {},
          required: operator.requiredFields || [],
          description: operator.description || `Configure ${module.label || transformationType} transformation`,
          ui_properties: {
            module_name: module.label,
            color: module.color,
            icon: module.icon,
            ports: module.ports
          }
        };
        
        return schema;
      }
    }
  }

  return null;
};

/**
 * Utility function to extract transformation info from node data
 */
export const getTransformationInfoFromNode = (node: any) => {
  if (!node || !node.data) {
    return null;
  }

  const { ui_properties } = node.data;
  
  return {
    type: ui_properties?.meta?.type || 'unknown',
    displayName: ui_properties?.module_name || 'Unknown',
    color: ui_properties?.color,
    icon: ui_properties?.icon,
    ports: ui_properties?.ports,
    description: ui_properties?.meta?.description
  };
};

/**
 * Utility function to validate if a transformation type is supported
 */
export const isTransformationSupported = (
  transformationType: string,
  pipelineModules: any[]
): boolean => {
  return getTransformationSchema(transformationType, pipelineModules) !== null;
};

/**
 * Utility function to get all available transformation types
 */
export const getAvailableTransformationTypes = (pipelineModules: any[]): string[] => {
  const types: string[] = [];
  
  if (!pipelineModules || pipelineModules.length === 0) {
    return types;
  }

  pipelineModules.forEach(module => {
    if (module.operators) {
      module.operators.forEach((operator: any) => {
        if (operator.type) {
          types.push(operator.type);
        }
      });
    }
  });

  return types;
};

/**
 * Debug utility to log schema information
 */
export const debugTransformationSchema = (
  transformationType: string,
  pipelineModules: any[]
) => {
  console.group(`🔍 Debug: ${transformationType} Schema`);
  
  const schema = getTransformationSchema(transformationType, pipelineModules);
  
  if (schema) {
    console.log('✅ Schema found:', schema);
    console.log('📋 Properties:', Object.keys(schema.properties || {}));
    console.log('🔒 Required fields:', schema.required || []);
  } else {
    console.log('❌ Schema not found');
    console.log('📦 Available modules:', pipelineModules.map(m => m.label));
    console.log('🔧 Available types:', getAvailableTransformationTypes(pipelineModules));
  }
  
  console.groupEnd();
  
  return schema;
};