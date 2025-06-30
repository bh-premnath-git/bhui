import { UseFormReturn } from 'react-hook-form';
import { ComputeClusterFormValues } from '../computeClusterFormSchema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  RefreshCw, 
  Eye,
  Settings,
  Cloud,
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ReviewAndTestStepProps {
  form: UseFormReturn<ComputeClusterFormValues>;
  onTest: () => void;
  isTesting: boolean;
  testResult: { success: boolean; message: string } | null;
  mode: 'edit' | 'new';
  environmentsData?: Array<{ bh_env_id: number; bh_env_name: string }>;
}

export function ReviewAndTestStep({
  form,
  onTest,
  isTesting,
  testResult,
  mode,
  environmentsData
}: ReviewAndTestStepProps) {
  const formValues = form.getValues();
  
  const getEnvironmentName = (envId: string) => {
    if (!Array.isArray(environmentsData)) {
      console.warn('environmentsData is not an array:', environmentsData);
      return envId;
    }
    const env = environmentsData.find(e => e.bh_env_id.toString() === envId);
    return env ? `${env.bh_env_name} (AWS)` : envId;
  };

  return (
    <Card className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Eye className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-gray-900 dark:text-gray-100">Review & Test Configuration</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Review your configuration and test the connection before creating the compute config
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Configuration Summary */}
        <div className="space-y-6 mb-2">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 m-2 dark:from-gray-800 dark:to-gray-700 rounded-xl p-2 border border-gray-300 dark:border-gray-600 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Database className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100">Compute Configuration</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-2">Compute Name</label>
                <p className="text-lg text-gray-900 dark:text-gray-100 font-semibold break-words">{formValues.compute_config_name}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-2">Compute Type</label>
                <Badge variant="secondary" className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 border-gray-800 dark:border-gray-200 text-sm px-3 py-1">
                  {formValues.compute_type}
                </Badge>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-2">Environment</label>
                <p className="text-lg text-gray-900 dark:text-gray-100 font-semibold break-words">
                  {getEnvironmentName(formValues.bh_env_id?.toString() || '')}
                </p>
              </div>
            </div>
          </div>
          
          {/* Advanced Compute Configuration */}
          {Object.keys(formValues.compute_config || {}).length > 0 && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-2 border border-gray-300 dark:border-gray-600">
              <div className="flex items-center space-x-2 mb-4">
                <Cloud className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100">Advanced Parameters</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(formValues.compute_config || {}).map(([key, value]) => {
                  if (value !== null && value !== undefined && value !== '') {
                    return (
                      <div key={key} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-2">
                          {key.replace(/_/g, ' ')}
                        </label>
                        <div className="mt-1">
                          {Array.isArray(value) ? (
                            <span className="text-sm text-gray-900 dark:text-gray-100 font-medium bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                              {value.length} items
                            </span>
                          ) : typeof value === 'object' ? (
                            <span className="text-sm text-gray-900 dark:text-gray-100 font-medium bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                              Object
                            </span>
                          ) : (
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium break-words">
                              {value.toString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>

        
      </CardContent>
    </Card>
  );
}