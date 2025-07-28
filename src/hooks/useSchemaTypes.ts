import { useMemo } from 'react';
import { pipelineSchema } from '@bh-ai/schemas';
import { Zap, Activity, Database } from 'lucide-react';

export interface EngineTypeConfig {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  description: string;
  color: string;
  gradient: string;
  border: string;
  iconBg: string;
}

export function useEngineTypes(): EngineTypeConfig[] {
  return useMemo(() => {
    try {
      // Extract engine types from the schema
      const engineTypes = pipelineSchema?.properties?.engine_type?.enum || [];
      
      // Define UI configurations for each engine type
      const engineTypeConfigs: Record<string, Omit<EngineTypeConfig, 'id'>> = {
        pyspark: {
          icon: Zap,
          label: 'PySpark',
          description: 'Apache Spark with Python',
          color: 'text-orange-600',
          gradient: 'from-orange-50 to-orange-100',
          border: 'border-orange-500',
          iconBg: 'bg-orange-100',
        },
        pyflink: {
          icon: Activity,
          label: 'Apache Flink',
          description: 'Stream processing engine',
          color: 'text-purple-600',
          gradient: 'from-purple-50 to-purple-100',
          border: 'border-purple-500',
          iconBg: 'bg-purple-100',
        },
        pandas: {
          icon: Database,
          label: 'Pandas',
          description: 'Data analysis library',
          color: 'text-blue-600',
          gradient: 'from-blue-50 to-blue-100',
          border: 'border-blue-500',
          iconBg: 'bg-blue-100',
        },
      };

      // Map schema engine types to UI configurations
      return engineTypes.map((engineType: string) => ({
        id: engineType,
        ...engineTypeConfigs[engineType] || {
          icon: Database,
          label: engineType.charAt(0).toUpperCase() + engineType.slice(1),
          description: `${engineType} processing engine`,
          color: 'text-gray-600',
          gradient: 'from-gray-50 to-gray-100',
          border: 'border-gray-500',
          iconBg: 'bg-gray-100',
        },
      }));
    } catch (error) {
      console.error('Error extracting engine types from schema:', error);
      // Fallback to hardcoded values if schema is not available
      return [
        {
          id: 'pyspark',
          icon: Zap,
          label: 'PySpark',
          description: 'Apache Spark with Python',
          color: 'text-orange-600',
          gradient: 'from-orange-50 to-orange-100',
          border: 'border-orange-500',
          iconBg: 'bg-orange-100',
        },
        {
          id: 'pyflink',
          icon: Activity,
          label: 'Apache Flink',
          description: 'Stream processing engine',
          color: 'text-purple-600',
          gradient: 'from-purple-50 to-purple-100',
          border: 'border-purple-500',
          iconBg: 'bg-purple-100',
        },
      ];
    }
  }, []);
}

export function useAvailableEngineTypes(): string[] {
  return useMemo(() => {
    try {
      return pipelineSchema?.properties?.engine_type?.enum || ['pyspark', 'pyflink'];
    } catch (error) {
      console.error('Error extracting engine types from schema:', error);
      return ['pyspark', 'pyflink'];
    }
  }, []);
}