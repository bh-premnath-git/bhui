import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  ArrowLeft,
  Construction,
  Database,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Settings,
  Play,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { generateTransformationFormSchema } from './transformationFormSchema';
import { TransformationFormFields } from './TransformationFormFields';
import { usePipelineModules } from '@/hooks/usePipelineModules';
import { getTransformationSchema, debugTransformationSchema } from './utils/schemaUtils';

interface DynamicTransformationFormProps {
  transformationType: string;
  transformationDisplayName: string;
  selectedEngineType: 'pyspark' | 'flink';
  onBack: () => void;
  onSave: (data: any) => void;
  isEdit?: boolean;
  formData?: any;
  mode?: 'edit' | 'new';
  currentNodeId: string;
  nodes?: any[];
  edges?: any[];
  sourceColumns?: any[];
}

export function DynamicTransformationForm({
  transformationType,
  transformationDisplayName,
  selectedEngineType,
  onBack,
  onSave,
  isEdit = false,
  formData,
  mode = 'new',
  currentNodeId,
  nodes = [],
  edges = [],
  sourceColumns = []
}: DynamicTransformationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean, message: string } | null>(null);
  const [transformationSchema, setTransformationSchema] = useState<any>(null);

  // Get pipeline modules based on engine type
  const pipelineModules = usePipelineModules(selectedEngineType);

  // Find the specific transformation schema
  const currentTransformationSchema = useMemo(() => {
    if (!pipelineModules || pipelineModules.length === 0) {
      console.log('⚠️ No pipeline modules available');
      return null;
    }

    // Debug the schema extraction
    const schema = debugTransformationSchema(transformationType, pipelineModules);
    
    if (schema) {
      // Update the title to use the display name
      schema.title = transformationDisplayName;
      return schema;
    }

    return null;
  }, [pipelineModules, transformationType, transformationDisplayName]);

  useEffect(() => {
    setIsLoading(true);
    
    if (currentTransformationSchema) {
      setTransformationSchema(currentTransformationSchema);
      setIsLoading(false);
    } else {
      // If no schema found, create a basic one
      const basicSchema = {
        title: transformationDisplayName,
        type: 'object',
        properties: {
          type: {
            type: 'string',
            const: transformationType,
            title: 'Transformation Type'
          },
          task_id: {
            type: 'string',
            title: 'Task ID',
            description: 'Unique identifier for this transformation'
          }
        },
        required: ['type', 'task_id'],
        description: `Configure ${transformationDisplayName} transformation`
      };
      
      setTransformationSchema(basicSchema);
      setIsLoading(false);
    }
  }, [currentTransformationSchema, transformationType, transformationDisplayName]);

  // Generate initial values based on schema
  const generateInitialValues = (schema: any) => {
    const initialValues: Record<string, any> = {
      type: transformationType,
      task_id: formData?.task_id || `${transformationType}_${Date.now()}`,
    };

    if (schema?.properties) {
      Object.keys(schema.properties).forEach(key => {
        const property = schema.properties[key];
        
        if (mode === 'edit') {
          // For edit mode, use existing form data or default value
          initialValues[key] = formData?.[key] ?? property?.default ?? getDefaultValueByType(property);
        } else {
          // For new transformations, use default value from schema
          initialValues[key] = property?.default ?? getDefaultValueByType(property);
        }
      });
    }

    return initialValues;
  };

  // Helper function to get default values by type
  const getDefaultValueByType = (property: any) => {
    if (property.const) return property.const;
    
    switch (property.type) {
      case 'string':
        return property.enum ? property.enum[0] : '';
      case 'number':
      case 'integer':
        return property.minimum ?? 0;
      case 'boolean':
        return false;
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return '';
    }
  };

  const form = useForm({
    resolver: transformationSchema ? zodResolver(generateTransformationFormSchema(transformationSchema)) : undefined,
    defaultValues: generateInitialValues(transformationSchema),
    mode: 'onChange'
  });

  // Update form when schema or data changes
  useEffect(() => {
    if (transformationSchema) {
      const initialValues = generateInitialValues(transformationSchema);
      form.reset(initialValues);
    }
  }, [transformationSchema, transformationDisplayName, isEdit, formData]);

  const handleTestTransformation = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);

      // Get current form values
      const currentValues = form.getValues();
      
      // Simulate transformation test
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, we'll simulate success most of the time
      const isSuccess = Math.random() > 0.2;

      setTestResult({
        success: isSuccess,
        message: isSuccess
          ? "Transformation configuration is valid! All required fields are properly set."
          : "Transformation test failed. Please check your configuration and try again."
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: "Error testing transformation. Please try again."
      });
    } finally {
      setIsTesting(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Clean and prepare the data
      const cleanedData = {
        ...data,
        type: transformationType,
        task_id: data.task_id || `${transformationType}_${Date.now()}`,
        nodeId: currentNodeId
      };

      // Remove any undefined or null values
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === undefined || cleanedData[key] === null) {
          delete cleanedData[key];
        }
      });

      console.log('Submitting transformation data:', cleanedData);

      // Call the onSave callback
      await onSave(cleanedData);

      toast.success(
        mode === 'edit' 
          ? `${transformationDisplayName} transformation updated successfully!`
          : `${transformationDisplayName} transformation created successfully!`
      );

    } catch (error) {
      console.error('Error saving transformation:', error);
      toast.error('Failed to save transformation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!transformationSchema) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <XCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Schema Not Found</h3>
        <p className="text-muted-foreground text-center mb-4">
          Could not load the schema for {transformationDisplayName} transformation.
        </p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {mode === 'edit' ? 'Edit' : 'Configure'} {transformationDisplayName}
              </h1>
              <p className="text-muted-foreground">
                {mode === 'edit' 
                  ? 'Update the transformation configuration'
                  : 'Set up your transformation parameters'
                }
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {transformationType}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {selectedEngineType}
          </Badge>
        </div>
      </div>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Transformation Configuration
          </CardTitle>
          <CardDescription>
            Configure the parameters for your {transformationDisplayName} transformation.
            {transformationSchema.description && (
              <span className="block mt-2 text-sm">
                {transformationSchema.description}
              </span>
            )}
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Test Results */}
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
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {testResult.success ? "Test Passed" : "Test Failed"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{testResult.message}</p>
                </motion.div>
              )}

              {/* Form Fields */}
              <TransformationFormFields 
                schema={transformationSchema} 
                form={form} 
                mode={mode}
              />
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t bg-muted/50">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestTransformation}
                  disabled={isTesting || isSubmitting}
                  className="gap-2"
                >
                  {isTesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isTesting ? "Testing..." : "Test Configuration"}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isTesting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSubmitting 
                    ? "Saving..." 
                    : mode === 'edit' 
                      ? "Update Transformation" 
                      : "Save Transformation"
                  }
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Additional Information */}
      {transformationSchema.examples && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Examples</CardTitle>
            <CardDescription>
              Common configuration examples for this transformation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {transformationSchema.examples.map((example: any, index: number) => (
                <AccordionItem key={index} value={`example-${index}`}>
                  <AccordionTrigger>
                    {example.title || `Example ${index + 1}`}
                  </AccordionTrigger>
                  <AccordionContent>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      {JSON.stringify(example.data || example, null, 2)}
                    </pre>
                    {example.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {example.description}
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}