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
import { convertApiSchemaToFormSchema, generateDefaultValues } from '../utils/schemaConverter';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ArrowLeft,
  ArrowRight,
  Server,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

// Step Components
import { BasicConfigurationStep } from './steps/BasicConfigurationStep';
import { ComputeConfigurationStep } from './steps/ComputeConfigurationStep';
import { ReviewAndTestStep } from './steps/ReviewAndTestStep';

interface ComputeClusterFormStepperProps {
  computeClusterId?: string;
  onBack: () => void;
  isEdit?: boolean;
  formData?: any;
  mode?: 'edit' | 'new';
}

export function ComputeClusterFormStepper({
  computeClusterId,
  onBack,
  isEdit = false,
  formData,
  mode = 'new'
}: ComputeClusterFormStepperProps) {
  const { handleCreateComputeCluster, handleUpdateComputeCluster, handleTestComputeCluster, useComputeTypes, useComputeConfigSchema, useEnvironmentsList } = useComputeCluster();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean, message: string } | null>(null);
  const [cloudProvider, setCloudProvider] = useState('AWS');
  const [selectedComputeType, setSelectedComputeType] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const intentionalSubmitRef = useRef(false);

  // Fetch compute types based on cloud provider
  const { data: computeTypesData, isLoading: isLoadingComputeTypes, error: computeTypesError }:any = useComputeTypes(cloudProvider);

  // Fetch compute config schema based on selected compute type
  const { data: computeConfigSchema, isLoading: isLoadingConfigSchema, error: configSchemaError}:any = useComputeConfigSchema(selectedComputeType);

  // Fetch environments list
  const { data: environmentsData, isLoading: isLoadingEnvironments, error: environmentsError } = useEnvironmentsList();

  // Show error toasts
  useEffect(() => {
    if (computeTypesError) {
      toast.error('Failed to load compute types. Using default options.');
    }
  }, [computeTypesError]);

  useEffect(() => {
    if (configSchemaError) {
      toast.error('Failed to load compute configuration schema. Using default options.');
    }
  }, [configSchemaError]);

  useEffect(() => {
    if (environmentsError) {
      toast.error('Failed to load environments. Please try again.');
    }
  }, [environmentsError]);
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
    if (computeConfigSchema) {
      const formSchema = convertApiSchemaToFormSchema(computeConfigSchema);
      const configDefaults = generateDefaultValues(formSchema);
      
      if (mode === 'edit' && formData?.compute_config) {
        initialValues.compute_config = { ...configDefaults, ...formData.compute_config };
      } else {
        initialValues.compute_config = configDefaults;
      }
    } else {
      // Fallback to static schema if dynamic schema is not available
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

    return initialValues;
  };

  const form = useForm<ComputeClusterFormValues>({
    resolver: zodResolver(computeClusterFormSchema),
    defaultValues: generateInitialValues(),
    mode: 'onChange'
  });

  // Debug: Monitor form state changes
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // if (type === 'submit') {
      //   console.log('Form submit event detected via watch:', { currentStep, intentional: intentionalSubmitRef.current });
      // }
    });

    return () => subscription.unsubscribe();
  }, [form, currentStep]);

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
 
  // Update form when formData changes or when schemas are loaded
  useEffect(() => {
    // Add a small delay to prevent any potential submission triggers
    const timeoutId = setTimeout(() => {
      if (isEdit && formData) {
        const initialValues = generateInitialValues();
        form.reset(initialValues, { keepSubmitCount: true });
      } else if (!isLoadingComputeTypes && computeTypesData && !isLoadingConfigSchema && computeConfigSchema && !isLoadingEnvironments && environmentsData && mode === 'new') {
        const initialValues = generateInitialValues();
        form.reset(initialValues, { keepSubmitCount: true });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isEdit, formData, isLoadingComputeTypes, computeTypesData, isLoadingConfigSchema, computeConfigSchema, isLoadingEnvironments, environmentsData, mode]);

  // Handle compute type change
  const handleComputeTypeChange = (newComputeType: string) => {
    setSelectedComputeType(newComputeType);
    form.setValue('compute_type', newComputeType);
  };

  const handleTestConfiguration = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);

      const currentValues = form.getValues();
      
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
    console.log('onSubmit called - Current step:', currentStep, 'Steps length:', steps.length, 'Intentional:', intentionalSubmitRef.current);
    
    // Only allow submission if we're on the final step AND it was intentional
    if (currentStep < steps.length - 1) {
      console.log('Form submission prevented - not on final step');
      return;
    }

    if (!intentionalSubmitRef.current) {
      console.log('Form submission prevented - not intentional');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Automatically set tenant_key to "test" before submission
      const submissionData = {
        ...data,
        tenant_key: "test"
      };
      
      console.log('Submitting compute cluster data:', JSON.stringify(submissionData, null, 2));

      if (isEdit && computeClusterId) {
        await handleUpdateComputeCluster(computeClusterId, submissionData);
      } else {
        await handleCreateComputeCluster(submissionData);
      }

      navigate(ROUTES.ADMIN.COMPUTE_CLUSTER.INDEX);
    } catch (error) {
      console.error('Failed to submit compute cluster:', error);
    } finally {
      setIsSubmitting(false);
      intentionalSubmitRef.current = false; // Reset the flag
    }
  };

  const nextStep = async () => {
    // Validate current step before proceeding
    let fieldsToValidate: (keyof ComputeClusterFormValues)[] = [];
    
    switch (currentStep) {
      case 0: // Basic Configuration
        fieldsToValidate = ['compute_config_name', 'compute_type', 'bh_env_id'];
        break;
      case 1: // Compute Configuration
        // Validate compute_config fields
        const isValid = await form.trigger('compute_config');
        if (!isValid) {
          toast.error('Please fix configuration errors before proceeding');
          return;
        }
        break;
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) {
        toast.error('Please fix the errors before proceeding');
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, 2));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const getComputeTypeIcon = (type: string) => {
    return <Server className="h-5 w-5" />;
  };

  const steps = [
    { title: 'Basic Configuration', description: '' },
    { title: 'Compute Configuration', description: '' },
    { title: 'Review & Test', description: '' }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicConfigurationStep
            form={form}
            computeTypesData={computeTypesData}
            environmentsData={environmentsData}
            isLoadingComputeTypes={isLoadingComputeTypes}
            isLoadingEnvironments={isLoadingEnvironments}
            onComputeTypeChange={handleComputeTypeChange}
            mode={mode}
            computeClusterSchema={computeClusterSchema}
          />
        );
      case 1:
        return (
          <ComputeConfigurationStep
            form={form}
            computeConfigSchema={computeConfigSchema}
            isLoadingConfigSchema={isLoadingConfigSchema}
            mode={mode}
            computeClusterSchema={computeClusterSchema}
          />
        );
      case 2:
        return (
          <ReviewAndTestStep
            form={form}
            onTest={handleTestConfiguration}
            isTesting={isTesting}
            testResult={testResult}
            mode={mode}
            environmentsData={environmentsData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background w-[100%]">
      <div className="w-full mx-auto px-4 py-8 relative">
        <div className="bg-card dark:bg-gray-800 rounded-lg shadow-lg p-8 relative border border-gray-200 dark:border-gray-700">
          <X
            className="absolute top-4 right-4 w-6 h-6 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            onClick={onBack}
          />
          
          <div className="max-w-6xl mx-auto">

            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={index} className="flex-1">
                  <div className="flex items-center">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2
                        ${index <= currentStep 
                          ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100' 
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                        }
                      `}
                    >
                      {index + 1}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className={`text-sm font-medium ${index <= currentStep ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{step.description}</div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 ${index < currentStep ? 'bg-gray-900 dark:bg-gray-100' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    )}
                  </div>
                </div>
              ))}
            </div>

              {/* Main Content */}
                <Form {...form}>
                  <form onSubmit={(e) => {
                    console.log('Form submit event triggered');
                    e.preventDefault(); // Always prevent default first
                    
                    // Only proceed with React Hook Form submission if conditions are met
                    if (currentStep === steps.length - 1 && intentionalSubmitRef.current) {
                      console.log('Proceeding with form submission');
                      form.handleSubmit(onSubmit)(e);
                    } else {
                      console.log('Form submission blocked:', { currentStep, stepsLength: steps.length, intentional: intentionalSubmitRef.current });
                    }
                  }} onKeyDown={(e) => {
                    // Prevent form submission on Enter key unless we're on the final step
                    if (e.key === 'Enter') {
                      // Check if we're focusing on a textarea or other elements that should allow Enter
                      const target = e.target as HTMLElement;
                      if (target.tagName === 'TEXTAREA') {
                        return; // Allow normal Enter behavior in textarea
                      }
                      
                      e.preventDefault();
                      
                      if (currentStep < steps.length - 1) {
                        nextStep();
                      }
                      // On final step, only submit if explicitly clicking the submit button
                    }
                  }}>
                    {renderStepContent()}
                    
                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={currentStep === 0 ? onBack : prevStep}
                        disabled={isSubmitting || isTesting}
                        className="flex items-center space-x-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>{currentStep === 0 ? 'Cancel' : 'Previous'}</span>
                      </Button>

                      <div className="flex items-center space-x-3">
                        {currentStep < steps.length - 1 ? (
                          <Button
                            type="button"
                            onClick={nextStep}
                            disabled={isSubmitting || isTesting || (currentStep === 1 && !form.formState.isValid)}
                            className="flex items-center space-x-2"
                          >
                            <span>Next</span>
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            disabled={isSubmitting || isTesting}
                            onClick={() => {
                              intentionalSubmitRef.current = true;
                            }}
                            className="flex items-center space-x-2 min-w-[120px]"
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            <span>{isEdit ? 'Update' : 'Create'} Config</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </form>
                </Form>

              {/* Summary Sidebar */}
              {/* <div className="col-span-1">
                <ComputeClusterSummary
                  form={form}
                  environmentsData={environmentsData}
                  testResult={testResult}
                />
              </div> */}
          </div>
        </div>
      </div>
      
      {/* Global Styles for Animations */}
      <style >{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .backdrop-blur-xl {
          backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
}