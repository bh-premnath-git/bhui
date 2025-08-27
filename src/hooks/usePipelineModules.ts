import { useMemo } from 'react';
import { pipelineSchema } from "@bh-ai/schemas";

export function usePipelineModules(selectedEngineType: 'pyspark' | 'pyflink' = 'pyspark') {
  return useMemo(() => {
    try {
      
      let transformations;
      
      // Check if pipelineSchema is already an array of transformations (direct format)
      if (Array.isArray(pipelineSchema)) {
        transformations = pipelineSchema;
      } else {
        // Find the engine-specific schema in allOf (nested format)
        const schema = pipelineSchema as any; // Type assertion to access allOf property
        const engineSchema = schema.allOf?.find((schema: any) => 
          schema.if?.properties?.engine_type?.const == selectedEngineType
        );

        if (!engineSchema?.then?.properties?.transformations?.items?.allOf) {
          console.warn(`No transformations found for engine type: ${selectedEngineType}`);
          return [];
        }

        transformations = engineSchema.then.properties.transformations.items?.allOf;
      }

      if (!transformations || !Array.isArray(transformations)) {
        console.warn('No valid transformations array found');
        return [];
      }
      
      const normalizedModules = transformations.map((transformation: any, index: number) => {
        // Extract transformation type and properties
        const transformationType = transformation?.if.properties?.transformation?.const;
        const uiProperties = transformation.then?.ui_properties;
        const description = transformation.then?.description || '';
        if (!transformationType || !uiProperties) { 
          console.warn(`Missing type or ui_properties for transformation at index ${index}`);
          return null;
        }

        // Extract required fields (excluding type and task_id)
        const requiredFields = (transformation.then?.required || []).filter(
          (field: string) => !["type", "task_id"].includes(field)
        );

        // Build properties object
        const transformationProperties = transformation.then?.properties || {};
        const properties = {
          type: transformationType,
          task_id: "",
          ...Object.keys(transformationProperties).reduce((acc: any, key: string) => {
            if (key !== "type") {
              acc[key] = transformationProperties[key] || null;
            }
            return acc;
          }, {}),
        };

        return {
          module_name: uiProperties.module_name,
          operator: {
            type: transformationType,
            description: description,
            requiredFields,
            properties,
          },
          module_meta: { 
            color: uiProperties.color, 
            icon: uiProperties.icon,
            ports: uiProperties.ports || {
              inputs: 1,
              outputs: 1,
              maxInputs: 1
            }
          },
        };
      }).filter(Boolean); // Remove null entries

      // Create modules map to group by module name
      const modulesMap = new Map<string, any>();

      normalizedModules.forEach((item: any, index: number) => {
        const { module_name, module_meta, operator } = item;

        if (!modulesMap.has(module_name)) {
          modulesMap.set(module_name, {
            id: index + 1,
            label: module_name,
            color: module_meta.color,
            icon: module_meta.icon,
            ports: module_meta.ports,
            operators: [],
          });
        }

        const moduleData = modulesMap.get(module_name);
        moduleData.operators.push(operator);
      });

      return Array.from(modulesMap.values());
    } catch (error) {
      console.error('Error processing pipeline schema:', error);
      return [];
    }
  }, [selectedEngineType]);
}