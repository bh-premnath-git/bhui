import { UseFormReturn } from 'react-hook-form';
import { ComputeClusterFormValues } from '../computeClusterFormSchema';
import { ComputeClusterFormFields } from '../ComputeClusterFormFields';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Cloud, Cpu, Settings2, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { convertApiSchemaToFormSchema } from '../../utils/schemaConverter';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface ComputeConfigurationStepProps {
  form: UseFormReturn<ComputeClusterFormValues>;
  computeConfigSchema?: any;
  isLoadingConfigSchema: boolean;
  mode: 'edit' | 'new';
  computeClusterSchema: any;
}

export function ComputeConfigurationStep({
  form,
  computeConfigSchema,
  isLoadingConfigSchema,
  mode,
  computeClusterSchema
}: ComputeConfigurationStepProps) {
  const computeType = form.watch('compute_type');

  const getComputeTypeInfo = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'emr':
        return {
          icon: '⚡',
          color: 'from-orange-500 to-red-500',
          description: 'Amazon EMR for big data processing',
          features: ['Hadoop & Spark', 'Auto-scaling', 'Cost-optimized']
        };
      case 'databricks':
        return {
          icon: '🚀',
          color: 'from-blue-500 to-indigo-500',
          description: 'Databricks unified analytics platform',
          features: ['Delta Lake', 'MLflow', 'Collaborative notebooks']
        };
      case 'kubernetes':
        return {
          icon: '☸️',
          color: 'from-purple-500 to-pink-500',
          description: 'Kubernetes for containerized workloads',
          features: ['Container orchestration', 'High availability', 'Resource management']
        };
      default:
        return {
          icon: '🔧',
          color: 'from-gray-500 to-gray-600',
          description: 'Custom compute configuration',
          features: ['Flexible setup', 'Custom parameters', 'Advanced configuration']
        };
    }
  };

  const typeInfo = getComputeTypeInfo(computeType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
     

      {/* Configuration Form */}
      <Card className="border border-gray-300 dark:border-gray-600 shadow-lg bg-white dark:bg-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 border border-gray-300 dark:border-gray-600">
                <Settings2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Advanced Parameters</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Customize resource allocation and performance settings
                </CardDescription>
              </div>
            </div>
            {isLoadingConfigSchema && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 dark:border-gray-400"></div>
                <span>Loading schema...</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            {isLoadingConfigSchema ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {computeConfigSchema ? (
                  <ComputeClusterFormFields
                    schema={convertApiSchemaToFormSchema(computeConfigSchema)}
                    form={form}
                    parentKey="compute_config"
                    mode={mode}
                  />
                ) : (
                  <ComputeClusterFormFields
                    schema={computeClusterSchema.properties.compute_config}
                    form={form}
                    parentKey="compute_config"
                    mode={mode}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Configuration Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border border-gray-300 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                <Cpu className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Performance Tips</h4>
                <ul className="mt-1 text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Adjust instance sizes based on your data volume and processing requirements</li>
                  <li>• You can set the compute timeout in seconds to save resources</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}