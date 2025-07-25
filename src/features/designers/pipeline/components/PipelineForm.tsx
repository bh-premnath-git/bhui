import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { usePipelineModules } from '@/hooks/usePipelineModules';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { pipelineSchema } from "@bh-ai/schemas";
import { ConditionalSchemaRenderer } from './ConditionalSchemaRenderer';
import { generateInitialValues } from './schemaUtils';
import { generateDynamicZodSchema, generateStaticZodSchema } from './dynamicZodSchema';
import { getColumnSuggestions } from '@/lib/pipelineAutoSuggestion';
import { generatePipelineAgent } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { generateJoinPayload } from '@/lib/pipelineJoinPayload';
import { AppDispatch, RootState } from '@/store';

interface PipelineFormProps {
  isOpen: boolean;
  onClose: () => void;
}

// Generate form schema based on transformation schema (legacy - kept for compatibility)
const generateTransformationFormSchema = (transformationSchema: any) => {
  if (!transformationSchema) {
    return z.object({});
  }

  // Use the new dynamic schema generator
  try {
    return generateStaticZodSchema(transformationSchema);
  } catch (error) {
    console.error('Error generating schema:', error);
    return z.object({});
  }
};

// Initial form schema for transformation and engine selection
const initialFormSchema = z.object({
  transformationName: z.string().min(1, 'Transformation name is required'),
  engineType: z.enum(['pyspark', 'pyflink'], {
    required_error: 'Engine type is required',
  }),
  useCustomSchema: z.boolean().default(false),
  customSchema: z.string().optional(),
}).refine((data) => {
  // If useCustomSchema is true, customSchema must be provided and valid JSON
  if (data.useCustomSchema) {
    if (!data.customSchema || data.customSchema.trim() === '') {
      return false;
    }
    try {
      JSON.parse(data.customSchema);
      return true;
    } catch {
      return false;
    }
  }
  return true;
}, {
  message: 'Custom schema must be valid JSON when enabled',
  path: ['customSchema'],
});

export const PipelineForm: React.FC<PipelineFormProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<'initial' | 'configuration'>('initial');
  const [selectedTransformation, setSelectedTransformation] = useState<any>(null);
  const [selectedEngineType, setSelectedEngineType]:any = useState<'pyspark' | 'pyflink'>('pyspark');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transformationSchema, setTransformationSchema] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAttempted, setAiAttempted] = useState<Set<string>>(new Set());
  const [columnSuggestions, setColumnSuggestions] = useState<Array<{ name: string; dataType: string }>>([]);

  const { nodes, setNodes, setFormStates, nodeCounters, setNodeCounters, edges } = usePipelineContext();
  const pipelineModules = usePipelineModules(selectedEngineType);
  const dispatch = useDispatch<AppDispatch>();
  const { pipelineDtl } = useSelector((state: RootState) => state.buildPipeline);

  // Get available transformations from pipeline schema
  const availableTransformations = useMemo(() => {
    try {
      if (!pipelineSchema?.allOf) return [];
console.log(selectedEngineType)
      const engineSchema = pipelineSchema.allOf.find((schema: any) => 
        schema.if?.properties?.engine_type?.const === selectedEngineType
      );
      console.log(engineSchema)

      if (!engineSchema?.then?.properties?.transformations?.items?.items?.allOf) {
        return [];
      }

      const transformations = engineSchema.then.properties.transformations.items.items.allOf.map((transformation: any) => ({
        name: transformation?.if?.properties?.transformation?.const,
        description: transformation?.then?.description || '',
        schema: transformation?.then,
      })).filter((t: any) => t.name);
      
      console.log('Available transformations:', transformations);
      return transformations;
    } catch (error) {
      console.error('Error parsing transformations:', error);
      return [];
    }
  }, [selectedEngineType]);

  // Initial form for transformation and engine selection
  const initialForm = useForm({
    resolver: zodResolver(initialFormSchema),
    defaultValues: {
      transformationName: '',
      engineType: selectedEngineType,
      useCustomSchema: false,
      customSchema: '',
    },
  });

  // Dynamic form for transformation configuration
  const configurationForm = useForm({
    resolver: transformationSchema ? zodResolver(generateDynamicZodSchema(transformationSchema)) : undefined,
    defaultValues: {},
  });

  // Reset forms when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('initial');
      setSelectedTransformation(null);
      setTransformationSchema(null);
      initialForm.reset();
      configurationForm.reset();
    }
  }, [isOpen]);

  // Update engine type when form changes
  useEffect(() => {
    const subscription = initialForm.watch((value) => {
      if (value.engineType && value.engineType !== selectedEngineType) {
        setSelectedEngineType(value.engineType as 'pyspark' | 'pyflink');
      }
    });
    return () => subscription.unsubscribe();
  }, [initialForm, selectedEngineType]);

  // Load column suggestions when transformation is selected
  useEffect(() => {
    const loadColumnSuggestions = async () => {
      if (selectedTransformation && step === 'configuration') {
        try {
          // Create a temporary node ID for column suggestions
          const tempNodeId = `temp_${selectedTransformation.name}_${Date.now()}`;
          const suggestions = await getColumnSuggestions(tempNodeId, nodes, edges, pipelineDtl);
          setColumnSuggestions(suggestions.map(col => ({ name: col, dataType: 'string' })));
        } catch (error) {
          console.error('Error loading column suggestions:', error);
          setColumnSuggestions([]);
        }
      }
    };

    loadColumnSuggestions();
  }, [selectedTransformation, step, nodes, edges, pipelineDtl]);

  // Handle expression generation for AI-powered fields
  const handleExpressionGenerate = useCallback(async (fieldName: string) => {
    if (!selectedTransformation || isGenerating) {
      return;
    }

    // If AI has already been attempted for this field, allow typing
    if (aiAttempted.has(fieldName)) {
      return;
    }

    setIsGenerating(true);
    try {
      // Create a temporary node ID for expression generation
      const tempNodeId = `temp_${selectedTransformation.name}_${Date.now()}`;
      const suggestions = await getColumnSuggestions(tempNodeId, nodes, edges, pipelineDtl);
      const schemaString = suggestions.map(col => `${col}:string`).join(', ');

      // Handle different transformation types
      if (['SchemaTransformation', 'Aggregator'].includes(selectedTransformation.name)) {
        // Extract target column from field name patterns
        let targetColumn = '';
        const derivedFieldMatch = fieldName.match(/derived_fields\.(\d+)\.expression/);
        const aggregationMatch = fieldName.match(/aggregations\.(\d+)\.expression/);
        
        if (derivedFieldMatch) {
          const index = parseInt(derivedFieldMatch[1]);
          const derivedFields = configurationForm.watch('derived_fields');
          targetColumn = derivedFields?.[index]?.name || '';
        } else if (aggregationMatch) {
          const index = parseInt(aggregationMatch[1]);
          const aggregations = configurationForm.watch('aggregations');
          targetColumn = aggregations?.[index]?.target_column || '';
        }

        if (!targetColumn) {
          console.warn('No target column specified for expression generation');
          return;
        }

        const response: any = await dispatch(generatePipelineAgent({ 
          params: {
            schema: schemaString,
            target_column: targetColumn
          },
          operation_type: "spark_expression",
          thread_id: 'spark_123'
        })).unwrap();

        if (response?.result) {
          try {
            const parsedResult = JSON.parse(response.result);
            const expressionValue = parsedResult === "" ? '' : 
              parsedResult.expression === "UNABLE_TO_GENERATE" ? '' : parsedResult.expression;
            
            // Update the form field
            configurationForm.setValue(fieldName, expressionValue, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true
            });

            // Mark this field as having attempted AI generation
            setAiAttempted(prev => new Set(prev).add(fieldName));
          } catch (error) {
            console.error('Error parsing AI response:', error);
          }
        }
      } else if (selectedTransformation.name === 'Joiner') {
        // Handle join condition generation
        const joinPayload: any = await generateJoinPayload(tempNodeId, nodes, edges);
        
        const response: any = await dispatch(generatePipelineAgent({ 
          params: joinPayload.params,
          operation_type: "dataset_join",
          thread_id: 'join_123'
        })).unwrap();

        if (response?.result) {
          try {
            const parsedResult = JSON.parse(response.result);
            const expressionValue = parsedResult === "" ? '' : 
              parsedResult.expression === "UNABLE_TO_GENERATE" ? '' : parsedResult.expression;
            
            configurationForm.setValue(fieldName, expressionValue, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true
            });

            setAiAttempted(prev => new Set(prev).add(fieldName));
          } catch (error) {
            console.error('Error parsing AI response:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error generating expression:', error);
      toast.error('Failed to generate expression');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTransformation, isGenerating, aiAttempted, nodes, edges, pipelineDtl, configurationForm, dispatch]);

  // Handle initial form submission (transformation selection)
  const handleInitialSubmit = (data: any) => {
    const transformation = availableTransformations.find(t => t.name === data.transformationName);
    if (!transformation) {
      toast.error('Selected transformation not found');
      return;
    }

    setSelectedTransformation(transformation);
    setTransformationSchema(transformation.schema);
    
    console.log('Selected transformation:', transformation);
    console.log('Transformation schema:', transformation.schema);
    
    // Generate initial values for the configuration form using schema utilities
    const initialValues = generateInitialValues(transformation.schema);
    
    // Remove internal fields
    delete initialValues.type;
    delete initialValues.task_id;
    
    configurationForm.reset(initialValues);
    setStep('configuration');
  };

  // Handle configuration form submission (add node to canvas)
  const handleConfigurationSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      if (!selectedTransformation) {
        toast.error('No transformation selected');
        return;
      }

      // Find the corresponding UI properties from pipeline modules
      const moduleData = pipelineModules.find(module => 
        module.operators.some(op => op.type === selectedTransformation.name)
      );

      if (!moduleData) {
        toast.error('Module configuration not found');
        return;
      }

      const operator = moduleData.operators.find(op => op.type === selectedTransformation.name);

      // Generate unique node ID and task ID
      const transformationName = selectedTransformation.name;
      const currentCounter = nodeCounters[transformationName] || 0;
      const newCounter = currentCounter + 1;
      const nodeId = `${transformationName}_${newCounter}`;
      const taskId = `${transformationName.toLowerCase()}_${newCounter}`;

      // Create the new node
      const newNode = {
        id: nodeId,
        type: 'custom',
        position: {
          x: Math.random() * 400 + 100, // Random position with some offset
          y: Math.random() * 300 + 100,
        },
        data: {
          title: `${moduleData.label} ${newCounter}`,
          label: `${moduleData.label} ${newCounter}`,
          module_name: moduleData.label,
          formData: {
            type: selectedTransformation.name,
            task_id: taskId,
            ...data,
          },
          ui_properties: {
            module_name: moduleData.label,
            color: moduleData.color,
            icon: moduleData.icon,
            ports: moduleData.ports,
          },
        },
      };

      // Add node to canvas
      setNodes((prevNodes: any[]) => [...prevNodes, newNode]);

      // Update form states
      setFormStates((prevStates: any) => ({
        ...prevStates,
        [nodeId]: {
          type: selectedTransformation.name,
          task_id: taskId,
          ...data,
        },
      }));

      // Update node counter
      setNodeCounters((prevCounters: any) => ({
        ...prevCounters,
        [transformationName]: newCounter,
      }));

      toast.success(`${moduleData.label} node added successfully`);
      onClose();
    } catch (error) {
      console.error('Error adding node:', error);
      toast.error('Failed to add node to canvas');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep('initial');
    setSelectedTransformation(null);
    setTransformationSchema(null);
  };

  const handleClose = () => {
    setStep('initial');
    setSelectedTransformation(null);
    setTransformationSchema(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-4">
        

        {step === 'initial' && (
          <div className="space-y-4">
            
            <Form {...initialForm}>
              <form onSubmit={initialForm.handleSubmit(handleInitialSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={initialForm.control}
                    name="engineType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Engine Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Select engine type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent style={{zIndex: 99999}}>
                            <SelectItem value="pyspark">PySpark</SelectItem>
                            <SelectItem value="pyflink">PyFlink</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={initialForm.control}
                    name="transformationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Transformation</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Select transformation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent style={{zIndex: 99999}}>
                            {availableTransformations.map((transformation) => (
                              <SelectItem key={transformation.name} value={transformation.name}>
                                {transformation.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>


                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={handleClose} size="sm">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!initialForm.watch('transformationName')} size="sm" className="min-w-[80px]">
                    Next
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {step === 'configuration' && selectedTransformation && transformationSchema && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm mb-1">Configure {selectedTransformation.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">
                {selectedTransformation.description || 'Configure the transformation parameters.'}
              </p>
            </div>
            <Form {...configurationForm}>
              <form onSubmit={configurationForm.handleSubmit(handleConfigurationSubmit)} className="space-y-4">
                <ConditionalSchemaRenderer 
                  schema={transformationSchema}
                  twoColumnLayout={true}
                  useTabs={true}
                  sourceColumns={columnSuggestions}
                  onExpressionGenerate={handleExpressionGenerate}
                  isGenerating={isGenerating}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={handleBack} size="sm">
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting} size="sm" className="min-w-[120px] relative">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add to Canvas'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};