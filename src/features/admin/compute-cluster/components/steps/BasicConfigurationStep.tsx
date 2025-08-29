import { UseFormReturn } from 'react-hook-form';
import { ComputeClusterFormValues } from '../computeClusterFormSchema';
import { ComputeClusterFormFields } from '../ComputeClusterFormFields';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Sparkles, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface BasicConfigurationStepProps {
  form: UseFormReturn<ComputeClusterFormValues>;
  computeTypesData?: any;
  environmentsData?: Array<{ bh_env_id: number; bh_env_name: string }>;
  isLoadingComputeTypes: boolean;
  isLoadingEnvironments: boolean;
  onComputeTypeChange: (computeType: string) => void;
  mode: 'edit' | 'new';
  computeClusterSchema: any;
}

export function BasicConfigurationStep({
  form,
  computeTypesData,
  environmentsData,
  isLoadingComputeTypes,
  isLoadingEnvironments,
  onComputeTypeChange,
  mode,
  computeClusterSchema
}: BasicConfigurationStepProps) {
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
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 border border-gray-300 dark:border-gray-600">
              <Sparkles className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Compute Details</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Configure your compute's identity and environment settings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ComputeClusterFormFields
              schema={{
                properties: {
                  compute_config_name: computeClusterSchema.properties.compute_config_name,
                  compute_type: {
                    ...computeClusterSchema.properties.compute_type,
                    enum: computeTypesData?.compute_types || ['EMR']
                  },
                  bh_env_id: {
                    ...computeClusterSchema.properties.bh_env_id,
                    enum: Array.isArray(environmentsData) ? environmentsData.map(env => env.bh_env_id.toString()) : [],
                    enumNames: Array.isArray(environmentsData) ? environmentsData.map(env => `${env.bh_env_name} (AWS)`) : []
                  }
                },
                required: ['compute_config_name', 'compute_type', 'bh_env_id']
              }}
              form={form}
              mode={mode}
              isLoading={isLoadingComputeTypes || isLoadingEnvironments}
              onComputeTypeChange={onComputeTypeChange}
            />
          </motion.div>
        </CardContent>
      </Card>

      {/* Pro Tips Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border border-gray-300 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                <Zap className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Pro Tips</h4>
                <ul className="mt-1 text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Choose a descriptive name for easy identification like "small", "medium", "large" compute config</li>
                  <li>• Select the compute type that matches your workload requirements</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}