import { useMemo } from 'react';
import { usePipelineModules } from './usePipelineModules';

export function useTransformationSchema(selectedEngineType: 'pyspark' | 'flink' = 'pyspark') {
  const modules = usePipelineModules(selectedEngineType);

  return useMemo(() => {
    // Create a map of transformation type to schema
    const schemaMap = new Map<string, any>();
    
    modules.forEach(module => {
      module.operators.forEach((operator: any) => {
        const transformationType = operator.type;
        const schema = {
          type: 'object',
          title: `${transformationType} Configuration`,
          description: operator.description,
          properties: operator.properties,
          required: operator.requiredFields || [],
        };
        
        schemaMap.set(transformationType, schema);
      });
    });

    return {
      modules,
      schemaMap,
      getSchema: (transformationType: string) => schemaMap.get(transformationType),
      getOperator: (transformationType: string) => {
        for (const module of modules) {
          const operator = module.operators.find((op: any) => op.type === transformationType);
          if (operator) return operator;
        }
        return null;
      },
      getModuleByType: (transformationType: string) => {
        return modules.find(module => 
          module.operators.some((op: any) => op.type === transformationType)
        );
      }
    };
  }, [modules]);
}

// Helper hook to get a specific transformation's configuration
export function useTransformationConfig(transformationType: string, selectedEngineType: 'pyspark' | 'flink' = 'pyspark') {
  const { getSchema, getOperator, getModuleByType } = useTransformationSchema(selectedEngineType);
  
  return useMemo(() => {
    const schema = getSchema(transformationType);
    const operator = getOperator(transformationType);
    const module = getModuleByType(transformationType);
    
    return {
      schema,
      operator,
      module,
      isValid: !!schema && !!operator,
      displayName: operator?.type || transformationType,
      description: operator?.description || '',
      requiredFields: operator?.requiredFields || [],
      properties: operator?.properties || {},
      moduleInfo: module ? {
        name: module.label,
        color: module.color,
        icon: module.icon,
        ports: module.ports
      } : null
    };
  }, [transformationType, getSchema, getOperator, getModuleByType]);
}