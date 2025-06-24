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
  ShieldCheck
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
  const { handleCreateComputeCluster, handleUpdateComputeCluster, handleTestComputeCluster } = useComputeCluster();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean, message: string } | null>(null);
  const navigate = useNavigate();

  // Generate initial values based on schema defaults
  const generateInitialValues = (): ComputeClusterFormValues => {
    const initialValues: any = {
      compute_config_name: mode === 'edit' ? (formData?.compute_config_name || '') : 'aws_emr_test',
      compute_type: mode === 'edit' ? (formData?.compute_type || 'EMR') : 'EMR',
      bh_env_id: mode === 'edit' ? (formData?.bh_env_id || 1) : 1,
      tenant_key: mode === 'edit' ? (formData?.tenant_key || 'test') : 'test',
      compute_config: {}
    };

    // Initialize compute_config with defaults from schema
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

    return initialValues;
  };

  const form = useForm<ComputeClusterFormValues>({
    resolver: zodResolver(computeClusterFormSchema),
    defaultValues: generateInitialValues(),
    mode: 'onChange'
  });

  // Update form when formData changes (for edit mode)
  useEffect(() => {
    if (isEdit && formData) {
      const initialValues = generateInitialValues();
      form.reset(initialValues);
    }
  }, [isEdit, formData]);

  const handleTestConfiguration = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);

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

      console.log('Submitting compute cluster data:', data);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            {getComputeTypeIcon(form.watch('compute_type'))}
            <div>
              <CardTitle className="text-2xl">
                {isEdit ? 'Edit Compute Cluster' : 'Add Compute Cluster'}
              </CardTitle>
              <CardDescription>
                {isEdit 
                  ? 'Update your compute cluster configuration'
                  : 'Configure a new compute cluster for your data processing workloads'
                }
              </CardDescription>
            </div>
          </div>
          
          {/* Status badges */}
          <div className="flex items-center space-x-2 pt-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <ShieldCheck className="h-3 w-3" />
              <span>Secure Configuration</span>
            </Badge>
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
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <Accordion type="single" defaultValue="basic-config" className="w-full">
                <AccordionItem value="basic-config">
                  <AccordionTrigger className="text-lg font-semibold">
                    Basic Configuration
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <ComputeClusterFormFields
                        schema={{
                          properties: {
                            compute_config_name: computeClusterSchema.properties.compute_config_name,
                            compute_type: computeClusterSchema.properties.compute_type,
                            bh_env_id: computeClusterSchema.properties.bh_env_id,
                            tenant_key: computeClusterSchema.properties.tenant_key,
                          },
                          required: ['compute_config_name', 'compute_type', 'bh_env_id', 'tenant_key']
                        }}
                        form={form}
                        mode={mode}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="compute-config">
                  <AccordionTrigger className="text-lg font-semibold">
                    Compute Configuration
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <ComputeClusterFormFields
                      schema={computeClusterSchema.properties.compute_config}
                      form={form}
                      parentKey="compute_config"
                      mode={mode}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Test Result Display */}
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "p-4 rounded-lg border",
                    testResult.success 
                      ? "bg-green-50 border-green-200 text-green-800" 
                      : "bg-red-50 border-red-200 text-red-800"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    {testResult.success ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                    <span className="font-medium">
                      {testResult.success ? 'Configuration Valid' : 'Configuration Invalid'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{testResult.message}</p>
                </motion.div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting || isTesting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleTestConfiguration}
                  disabled={isSubmitting || isTesting}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Test Configuration
                    </>
                  )}
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting || isTesting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {isEdit ? 'Update Cluster' : 'Create Cluster'}
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </motion.div>
  );
}