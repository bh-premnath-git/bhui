import React, { useState, useEffect, useMemo } from 'react';
import { TransformationForm } from './TransformationForm';
import { useTransformationConfig } from '@/hooks/useTransformationSchema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, Settings, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Node, Edge } from 'reactflow';

interface PipelineTransformationFormProps {
  schema: any; // The selectedSchema from pipeline context
  sourceColumns: Array<{ name: string; dataType: string }>;
  onClose: () => void;
  currentNodeId: string;
  initialValues?: any;
  nodes: Node[];
  edges: Edge[];
  pipelineDtl?: any;
  onSubmit: (values: any) => void;
  selectedEngineType?: 'pyspark' | 'flink';
}

export function PipelineTransformationForm({
  schema,
  sourceColumns,
  onClose,
  currentNodeId,
  initialValues,
  nodes,
  edges,
  pipelineDtl,
  onSubmit,
  selectedEngineType = 'pyspark'
}: PipelineTransformationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [transformationType, setTransformationType] = useState<string>('');

  // Extract transformation type from schema
  useEffect(() => {
    if (schema) {
      // The schema.title contains the transformation type (e.g., "Filter", "Reader", "Writer")
      const type = schema.title?.toLowerCase() || '';
      setTransformationType(type);
    }
  }, [schema]);

  // Get transformation configuration
  const {
    schema: transformationSchema,
    operator,
    isValid,
    displayName,
    moduleInfo
  } = useTransformationConfig(transformationType, selectedEngineType);

  // Convert legacy schema to new format if needed
  const convertedSchema = useMemo(() => {
    if (!schema || !isValid) return null;

    // If we already have a proper transformation schema, use it
    if (transformationSchema) {
      return transformationSchema;
    }

    // Otherwise, try to convert the legacy schema format
    return {
      type: 'object',
      title: schema.title || transformationType,
      description: schema.description || `Configure ${transformationType} transformation`,
      properties: {
        type: {
          type: 'string',
          const: transformationType,
          title: 'Type'
        },
        task_id: {
          type: 'string',
          title: 'Task ID',
          minLength: 1
        },
        // Add other properties from the legacy schema
        ...Object.keys(schema.properties || {}).reduce((acc, key) => {
          if (key !== 'type' && key !== 'task_id') {
            acc[key] = schema.properties[key];
          }
          return acc;
        }, {} as any)
      },
      required: schema.required || ['type', 'task_id']
    };
  }, [schema, transformationSchema, transformationType, isValid]);

  // Prepare initial form data
  const formData = useMemo(() => {
    const baseData = {
      type: transformationType,
      task_id: currentNodeId || `${transformationType}_${Date.now()}`,
      ...initialValues,
      ...schema?.initialValues
    };

    // Clean up any undefined values
    Object.keys(baseData).forEach(key => {
      if (baseData[key] === undefined) {
        delete baseData[key];
      }
    });

    return baseData;
  }, [transformationType, currentNodeId, initialValues, schema]);

  const handleSave = async (data: any) => {
    try {
      setIsLoading(true);

      // Prepare the data in the format expected by the pipeline system
      const formattedData = {
        ...data,
        nodeId: currentNodeId,
        // Add any additional metadata needed by the pipeline system
        sourceColumns,
        nodes,
        edges,
        pipelineDtl
      };

      console.log('Submitting transformation data:', formattedData);

      // Call the original onSubmit handler
      await onSubmit(formattedData);

      toast.success(`${displayName || transformationType} configuration saved successfully!`);
      
      // Close the form after successful submission
      onClose();

    } catch (error) {
      console.error('Error saving transformation:', error);
      toast.error('Failed to save transformation configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    onClose();
  };

  // Show loading state while determining transformation type
  if (!transformationType) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading transformation configuration...</span>
        </div>
      </div>
    );
  }

  // Show error state if transformation type is not supported
  if (!isValid || !convertedSchema) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Transformation Not Supported</h1>
            <p className="text-muted-foreground">
              The transformation type "{transformationType}" is not yet supported by the new form system.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Fallback to Legacy Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                This transformation will continue to use the legacy form system until it's migrated to the new dynamic form generator.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Transformation Type:</span>
                <Badge variant="outline">{transformationType}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Engine Type:</span>
                <Badge variant="outline">{selectedEngineType}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Schema Available:</span>
                <Badge variant={schema ? "default" : "destructive"}>
                  {schema ? "Yes" : "No"}
                </Badge>
              </div>
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the new transformation form
  return (
    <div className="h-full">
      <TransformationForm
        transformationType={transformationType}
        transformationDisplayName={displayName || transformationType}
        transformationSchema={convertedSchema}
        onBack={handleBack}
        onSave={handleSave}
        isEdit={!!initialValues || !!schema?.initialValues}
        formData={formData}
        mode={initialValues || schema?.initialValues ? 'edit' : 'new'}
      />
    </div>
  );
}

// Wrapper component that decides whether to use new or legacy form
export function PipelineFormWrapper(props: PipelineTransformationFormProps) {
  const { schema } = props;
  
  // List of transformation types that are supported by the new form system
  const supportedTransformations = [
    'filter',
    'reader', 
    'writer',
    'join',
    'aggregator',
    'deduplicator',
    'repartition',
    'custom'
  ];

  const transformationType = schema?.title?.toLowerCase() || '';
  const isSupported = supportedTransformations.includes(transformationType);

  // For now, let's use the new form for supported transformations
  // and fall back to legacy for others
  if (isSupported) {
    return <PipelineTransformationForm {...props} />;
  }

  // Import and use the legacy form for unsupported transformations
  const CreateFormFormik = React.lazy(() => 
    import('@/features/designers/pipeline/components/form-sections/CreateForm')
  );

  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading form...</span>
        </div>
      </div>
    }>
      <CreateFormFormik {...props} />
    </React.Suspense>
  );
}