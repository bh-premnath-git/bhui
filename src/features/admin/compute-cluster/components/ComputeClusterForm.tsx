import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useComputeCluster } from '../hooks/useComputeCluster';
import { 
  computeClusterFormSchema, 
  computeClusterSchema, 
  ComputeClusterFormValues 
} from './computeClusterFormSchema';
import { ComputeClusterFormFields } from './ComputeClusterFormFields';
import { convertApiSchemaToFormSchema, generateDefaultValues } from '../utils/schemaConverter';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  ArrowLeft,
  Server,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Cloud,
  Settings,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';

interface ComputeClusterFormProps {
  computeClusterId?: string;
  onBack: () => void;
  isEdit?: boolean;
  formData?: ComputeClusterFormValues;
  mode?: 'edit' | 'new';
}

export function ComputeClusterForm({
  computeClusterId,
  onBack,
  isEdit = false,
  formData,
  mode = 'new'
}: ComputeClusterFormProps) {
  const { handleCreateComputeCluster, handleUpdateComputeCluster, handleTestComputeCluster, useComputeTypes, useComputeConfigSchema, useEnvironmentsList } = useComputeCluster();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean, message: string } | null>(null);
  const [cloudProvider, setCloudProvider] = useState('AWS');
  const [selectedComputeType, setSelectedComputeType] = useState<string>('');
  const navigate = useNavigate();

  // Fetch compute types based on cloud provider
  const { data: computeTypesData, isLoading: isLoadingComputeTypes, error: computeTypesError } = useComputeTypes(cloudProvider);

  // Fetch compute config schema based on selected compute type
  const { data: computeConfigSchema, isLoading: isLoadingConfigSchema, error: configSchemaError, refetch: refetchConfigSchema } = useComputeConfigSchema(selectedComputeType);

  // Fetch environments list
  const { data: environmentsData, isLoading: isLoadingEnvironments, error: environmentsError } = useEnvironmentsList();
console.log(environmentsData)
  // Show error toast if compute types fail to load
  useEffect(() => {
    if (computeTypesError) {
      toast.error('Failed to load compute types. Using default options.');
    }
  }, [computeTypesError]);

  // Show error toast if config schema fails to load
  useEffect(() => {
    if (configSchemaError && selectedComputeType) {
      toast.info(`${selectedComputeType} configuration is coming soon! Please use EMR for now.`, {
        duration: 4000,
      });
    }
  }, [configSchemaError, selectedComputeType]);

  // Show error toast if environments fail to load
  useEffect(() => {
    if (environmentsError) {
      toast.error('Failed to load environments. Please try again.');
    }
  }, [environmentsError]);

  // Set initial compute type when compute types are loaded
  useEffect(() => {
    if (computeTypesData?.compute_types?.length && !selectedComputeType && mode === 'new') {
      const defaultType = computeTypesData.compute_types[0];
      setSelectedComputeType(defaultType);
    } else if (isEdit && formData?.compute_type) {
      setSelectedComputeType(formData.compute_type);
    }
  }, [computeTypesData, selectedComputeType, mode, isEdit, formData]);

  // Generate initial values based on schema defaults
  const generateInitialValues = (): ComputeClusterFormValues => {
    const defaultComputeType = selectedComputeType || computeTypesData?.compute_types?.[0] || 'EMR';
    const defaultEnvId = environmentsData?.[0]?.bh_env_id?.toString() || '1';
    const initialValues: any = {
      compute_config_name: mode === 'edit' ? (formData?.compute_config_name || '') : 'aws_emr_test',
      compute_type: mode === 'edit' ? (formData?.compute_type || defaultComputeType) : defaultComputeType,
      bh_env_id: mode === 'edit' ? (formData?.bh_env_id?.toString() || defaultEnvId) : defaultEnvId,
      tenant_key: mode === 'edit' ? (formData?.tenant_key || 'test') : 'test',
      compute_config: {}
    };

    // Initialize compute_config with defaults from dynamic schema
    if (computeConfigSchema && !configSchemaError) {
      const formSchema = convertApiSchemaToFormSchema(computeConfigSchema);
      const configDefaults = generateDefaultValues(formSchema);
      
      if (mode === 'edit' && formData?.compute_config) {
        // Merge existing data with defaults
        initialValues.compute_config = { ...configDefaults, ...formData.compute_config };
      } else {
        initialValues.compute_config = configDefaults;
      }
    } else if (!configSchemaError && !selectedComputeType) {
      // Only fallback to static schema if no compute type is selected and there's no error
      if (computeClusterSchema.properties.compute_config?.properties) {
        const configProps = computeClusterSchema.properties.compute_config.properties;
        Object.entries(configProps).forEach(([key, field]: [string, any]) => {
          if (mode === 'edit' && formData?.compute_config?.[key] !== undefined) {
            initialValues.compute_config[key] = formData.compute_config[key];
          } else if (field.default !== undefined) {
            initialValues.compute_config[key] = field.default;
          } else if (field.type === 'array') {
            initialValues.compute_config[key] = field.default || [];
          } else if (field.type === 'number') {
            initialValues.compute_config[key] = field.default || 0;
          } else {
            initialValues.compute_config[key] = '';
          }
        });
      }
    }
    // If there's a schema error, leave compute_config empty

    return initialValues;
  };

  const form = useForm<ComputeClusterFormValues>({
    resolver: zodResolver(computeClusterFormSchema),
    defaultValues: generateInitialValues(),
    mode: 'onChange'
  });

  // Update form when formData changes (for edit mode) or when schemas are loaded
  useEffect(() => {
    if (isEdit && formData) {
      const initialValues = generateInitialValues();
      form.reset(initialValues);
    } else if (!isLoadingComputeTypes && computeTypesData && !isLoadingConfigSchema && computeConfigSchema && !configSchemaError && !isLoadingEnvironments && environmentsData && mode === 'new') {
      // Reset form with new default values when all data is loaded for new forms (only if no schema error)
      const initialValues = generateInitialValues();
      form.reset(initialValues);
    }
  }, [isEdit, formData, isLoadingComputeTypes, computeTypesData, isLoadingConfigSchema, computeConfigSchema, configSchemaError, isLoadingEnvironments, environmentsData, mode]);

  // Handle compute type change
  const handleComputeTypeChange = (newComputeType: string) => {
    setSelectedComputeType(newComputeType);
    // Update the form's compute_type field
    form.setValue('compute_type', newComputeType);
    // Clear test result when compute type changes
    setTestResult(null);
  };

  const handleTestConfiguration = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);

      // Prevent testing if there's a schema error
      if (configSchemaError) {
        toast.info(`${selectedComputeType} is not ready yet. Please switch to EMR to test configurations.`);
        return;
      }

      // Get current form values
      const currentValues = form.getValues();
      
      // Validate form before testing
      const isValid = await form.trigger();
      if (!isValid) {
        toast.error('Please fix form errors before testing');
        return;
      }

      const result = await handleTestComputeCluster(currentValues);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: "Error testing configuration. Please try again."
      });
    } finally {
      setIsTesting(false);
    }
  };

  const onSubmit = async (data: ComputeClusterFormValues) => {
    try {
      setIsSubmitting(true);

      // Prevent submission if there's a schema error
      if (configSchemaError) {
        toast.info(`${selectedComputeType} configuration is coming soon! Please use EMR to create clusters.`);
        return;
      }

      console.log('Submitting compute cluster data:', JSON.stringify(data, null, 2));

      if (isEdit && computeClusterId) {
        await handleUpdateComputeCluster(computeClusterId, data);
      } else {
        await handleCreateComputeCluster(data);
      }

      // Navigate back to compute cluster list
      navigate(ROUTES.ADMIN.COMPUTE_CLUSTER.INDEX);
    } catch (error) {
      console.error('Failed to submit compute cluster:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getComputeTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'emr':
        return <Cloud className="h-5 w-5" />;
      case 'databricks':
        return <Server className="h-5 w-5" />;
      case 'kubernetes':
        return <Settings className="h-5 w-5" />;
      default:
        return <Server className="h-5 w-5" />;
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto h-[calc(100vh-2rem)]">
      <CardHeader className="relative pb-3">
        <div className="flex items-center space-x-3">
          {getComputeTypeIcon(form.watch('compute_type'))}
          <div>
            <CardTitle className="text-xl">
              {isEdit ? 'Edit Compute Config' : 'Add Compute Config'}
            </CardTitle>
            <CardDescription>
              {isEdit 
                ? 'Update your compute config configuration'
                : 'Configure a new compute config for your data processing workloads'
              }
            </CardDescription>
          </div>
        </div>
        
        {/* Status badges */}
        <div className="flex items-center space-x-2 pt-2">
         
          {testResult && (
            <Badge 
              variant={testResult.success ? "default" : "destructive"}
              className="flex items-center space-x-1"
            >
              {testResult.success ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              <span>{testResult.success ? 'Validated' : 'Validation Failed'}</span>
            </Badge>
          )}
        </div>

        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-muted-foreground hover:bg-accent hover:text-accent-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
          <CardContent className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col space-y-3">
              {/* Basic Configuration Section */}
              <div className="bg-card border border-border rounded-lg">
                <div className="px-4 py-2 border-b border-border bg-muted/50">
                  <h3 className="text-sm font-semibold text-foreground flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Basic Configuration
                  </h3>
                </div>
                <div className="p-3">
                  <div>
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
                            enumNames: Array.isArray(environmentsData) ? environmentsData.map(env => env.bh_env_name) : []
                          },
                          tenant_key: computeClusterSchema.properties.tenant_key,
                        },
                        required: ['compute_config_name', 'compute_type', 'bh_env_id', 'tenant_key']
                      }}
                      form={form}
                      mode={mode}
                      isLoading={isLoadingComputeTypes || isLoadingEnvironments}
                      onComputeTypeChange={handleComputeTypeChange}
                    />
                  </div>
                </div>
              </div>

              {/* Compute Configuration Section */}
              <div className="bg-card border border-border rounded-lg flex-1 flex flex-col min-h-0">
                <div className="px-4 py-2 border-b border-border bg-muted/50 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center">
                    <Cloud className="h-4 w-4 mr-2" />
                    Compute Configuration
                  </h3>
                  {isLoadingConfigSchema && (
                    <span className="text-xs text-muted-foreground">(Loading...)</span>
                  )}
                </div>
                <div className="p-3 flex-1 overflow-y-auto">
                  {isLoadingConfigSchema ? (
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ) : configSchemaError ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 rounded-lg border border-border">
                      <div className="relative mb-6">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                          <Settings className="h-8 w-8 text-primary" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-6 w-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-yellow-800">⚡</span>
                        </div>
                      </div>
                      
                      <h4 className="text-xl font-semibold text-foreground mb-3">
                        {selectedComputeType} Configuration Coming Soon!
                      </h4>
                      
                      <div className="max-w-md space-y-3 mb-6">
                        <p className="text-sm text-muted-foreground">
                          We're actively working on <strong className="text-primary">{selectedComputeType}</strong> compute type configuration.
                        </p>
                        
                        <div className="bg-card/60 rounded-lg p-4 border border-border">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-700 dark:text-green-400">Currently Available:</span>
                          </div>
                          <p className="text-sm text-green-600 dark:text-green-300 pl-7">
                            EMR compute type is fully supported and ready to use
                          </p>
                        </div>
                        
                        <div className="bg-card/60 rounded-lg p-4 border border-border">
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <span className="font-medium text-primary">In Development:</span>
                          </div>
                          <p className="text-sm text-primary/80 pl-7">
                            {selectedComputeType} configuration interface is being built
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Switch to EMR as it's working
                            setSelectedComputeType('EMR');
                            form.setValue('compute_type', 'EMR');
                            setTestResult(null);
                          }}
                          className="flex items-center space-x-2 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Switch to EMR
                        </Button>
                        
                        <Button
                          variant="outline" 
                          size="sm"
                          onClick={() => refetchConfigSchema()}
                          disabled={isLoadingConfigSchema}
                          className="flex items-center space-x-2"
                        >
                          <RefreshCw className={cn("h-4 w-4", isLoadingConfigSchema && "animate-spin")} />
                          {isLoadingConfigSchema ? 'Checking...' : 'Check Again'}
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-4">
                        💡 Tip: Use EMR for now, we'll notify you when {selectedComputeType} is ready!
                      </p>
                    </div>
                  ) : computeConfigSchema ? (
                    <ComputeClusterFormFields
                      schema={convertApiSchemaToFormSchema(computeConfigSchema)}
                      form={form}
                      parentKey="compute_config"
                      mode={mode}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Cloud className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Select a compute type to view configuration options
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Test Result Display */}
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "p-2 rounded-lg border",
                    testResult.success 
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300" 
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    {testResult.success ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <span className="font-medium text-sm">
                      {testResult.success ? 'Configuration Valid' : 'Configuration Invalid'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs">{testResult.message}</p>
                </motion.div>
              )}
            </div>
          </CardContent>

          <CardFooter className="border-t border-border bg-muted/50 mt-auto py-3">
            <div className="flex items-center justify-between w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onBack}
                disabled={isSubmitting || isTesting}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>

              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestConfiguration}
                  disabled={isSubmitting || isTesting || !!configSchemaError}
                  className="flex items-center space-x-2"
                >
                  {isTesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span>Test Configuration</span>
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || isTesting || !!configSchemaError}
                  className="flex items-center space-x-2 min-w-[120px] bg-gray-900 hover:bg-gray-800 text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <span>{isEdit ? 'Update' : 'Create'} Config</span>
                </Button>
              </div>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}