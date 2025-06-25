import { UseFormReturn } from 'react-hook-form';
import { ComputeClusterFormValues } from '../computeClusterFormSchema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings,
  Cloud,
  Database,
  CheckCircle2,
  XCircle,
  Sparkles,
  Shield,
  Zap,
  Activity,
  Globe,
  Server,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ComputeClusterSummaryProps {
  form: UseFormReturn<ComputeClusterFormValues>;
  environmentsData?: Array<{ bh_env_id: number; bh_env_name: string }>;
  testResult?: { success: boolean; message: string } | null;
}

export function ComputeClusterSummary({
  form,
  environmentsData,
  testResult
}: ComputeClusterSummaryProps) {
  const formValues = form.getValues();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    compute: true,
    validation: true
  });
  
  const getEnvironmentName = (envId: string) => {
    if (!Array.isArray(environmentsData)) {
      console.warn('environmentsData is not an array:', environmentsData);
      return envId;
    }
    const env = environmentsData.find(e => e.bh_env_id.toString() === envId);
    return env ? `${env.bh_env_name} (AWS)` : envId;
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getConfigCount = () => {
    return Object.entries(formValues.compute_config || {}).filter(([_, value]) => 
      value !== null && value !== undefined && value !== ''
    ).length;
  };

  const getComputeTypeColor = (type: string) => {
    // Always return black and white gradient for consistent theme
    return 'from-gray-800 to-gray-900';
  };

  const formatConfigValue = (value: any) => {
    if (Array.isArray(value)) return `${value.length} items`;
    if (typeof value === 'object') return 'Configuration Object';
    if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled';
    return value.toString();
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <Card className="border border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg border border-gray-300">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">
                  Configuration Overview
                </CardTitle>
                <p className="text-xs text-gray-600 mt-1">
                  Live preview of your cluster setup
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Basic Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 bg-white">
          <CardHeader 
            className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-t-lg"
            onClick={() => toggleSection('basic')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300">
                  <Settings className="h-4 w-4 text-gray-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Basic Configuration</h4>
                  <p className="text-xs text-gray-500">Core cluster settings</p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: expandedSections.basic ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Info className="h-4 w-4 text-gray-400" />
              </motion.div>
            </div>
          </CardHeader>
          
          <AnimatePresence>
            {expandedSections.basic && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent className="pt-0 space-y-3">
                  {/* Cluster Name */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-300">
                    <div className="flex items-center space-x-3">
                      <Server className="h-4 w-4 text-gray-700" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Cluster Name</span>
                        <p className="text-xs text-gray-500">Unique identifier</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 bg-gray-200 px-3 py-1 rounded-full max-w-[120px] truncate">
                      {formValues.compute_config_name || 'Not specified'}
                    </span>
                  </div>

                  {/* Compute Type */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-300">
                    <div className="flex items-center space-x-3">
                      <Zap className="h-4 w-4 text-gray-700" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Compute Type</span>
                        <p className="text-xs text-gray-500">Processing engine</p>
                      </div>
                    </div>
                    <Badge 
                      className={`bg-gradient-to-r ${getComputeTypeColor(formValues.compute_type)} text-white border-0 shadow-md px-3 py-1`}
                    >
                      {formValues.compute_type || 'Not selected'}
                    </Badge>
                  </div>

                  {/* Environment */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-300">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-4 w-4 text-gray-700" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Environment</span>
                        <p className="text-xs text-gray-500">Cloud provider & target</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 bg-gray-200 px-3 py-1 rounded-full max-w-[140px] truncate">
                      {getEnvironmentName(formValues.bh_env_id?.toString() || '')}
                    </span>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Compute Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 bg-white">
          <CardHeader 
            className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-t-lg"
            onClick={() => toggleSection('compute')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300">
                  <Cloud className="h-4 w-4 text-gray-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Compute Configuration</h4>
                  <p className="text-xs text-gray-500">{getConfigCount()} parameters configured</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-800 border-gray-300">
                  {getConfigCount()} configs
                </Badge>
                <motion.div
                  animate={{ rotate: expandedSections.compute ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Info className="h-4 w-4 text-gray-400" />
                </motion.div>
              </div>
            </div>
          </CardHeader>
          
          <AnimatePresence>
            {expandedSections.compute && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent className="pt-0">
                  {getConfigCount() > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {Object.entries(formValues.compute_config || {}).map(([key, value], index) => {
                        if (value !== null && value !== undefined && value !== '') {
                          return (
                            <motion.div
                              key={key}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <span className="text-xs font-medium text-gray-600 capitalize">
                                {key.replace(/_/g, ' ')}
                              </span>
                              <span className="text-xs font-semibold text-gray-800 bg-white px-2 py-1 rounded-md shadow-sm max-w-[120px] truncate">
                                {formatConfigValue(value)}
                              </span>
                            </motion.div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Cloud className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No configuration parameters set</p>
                    </div>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

     
      {/* Floating Action Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 right-6 z-50 lg:hidden"
      >
        <button className="p-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 border border-gray-600">
          <Shield className="h-5 w-5" />
        </button>
      </motion.div>

      <style >{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}