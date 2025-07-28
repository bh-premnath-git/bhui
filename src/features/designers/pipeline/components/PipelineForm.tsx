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
import { generateInitialValues, getActiveFields, formatFieldTitle } from './schemaUtils';
import { getColumnSuggestions } from '@/lib/pipelineAutoSuggestion';
import { generatePipelineAgent } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { generateJoinPayload } from '@/lib/pipelineJoinPayload';
import { AppDispatch, RootState } from '@/store';

interface PipelineFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSchema?: any; // Schema of the selected node (for editing existing nodes)
  initialValues?: any; // Initial form values (for editing existing nodes)
  onSubmit?: (values: any) => void; // Submit handler (for editing existing nodes)
  currentNodeId?: string; // Current node ID (for editing existing nodes)
}

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
  selectedSchema,
  initialValues,
  onSubmit,
  currentNodeId,
}) => {
  const [step, setStep] = useState<'initial' | 'configuration'>('initial');
  const [selectedTransformation, setSelectedTransformation] = useState<any>(null);
  const [selectedEngineType, setSelectedEngineType]:any = useState<'pyspark' | 'pyflink'>('pyspark');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transformationSchema, setTransformationSchema] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAttempted, setAiAttempted] = useState<Set<string>>(new Set());
  const [columnSuggestions, setColumnSuggestions] = useState<Array<{ name: string; dataType: string }>>([]);

  // Debug: Log when column suggestions change
  useEffect(() => {
    console.log('🔄 Column suggestions changed:', columnSuggestions);
  }, [columnSuggestions]);

  const { nodes, setNodes, setFormStates, nodeCounters, setNodeCounters, edges } = usePipelineContext();
  const pipelineModules = usePipelineModules(selectedEngineType);
  const dispatch = useDispatch<AppDispatch>();
  const { pipelineDtl } = useSelector((state: RootState) => state.buildPipeline);

  // Determine if we're editing an existing node
  const isEditingExistingNode = Boolean(selectedSchema && currentNodeId && initialValues);
  
  // Get engine type from pipeline details or default to pyspark
  const pipelineEngineType = pipelineDtl?.engine_type || 'pyspark';

  // Get available transformations from pipeline schema
  const availableTransformations = useMemo(() => {
    try {
      if (!pipelineSchema?.allOf) return [];
      
      // Use pipeline engine type or selected engine type
      const engineType = isEditingExistingNode ? pipelineEngineType : selectedEngineType;
      console.log('Using engine type:', engineType);
      
      const engineSchema = pipelineSchema.allOf.find((schema: any) => 
        schema.if?.properties?.engine_type?.const === engineType
      );
      console.log(engineSchema)

      if (!engineSchema?.then?.properties?.transformations?.items?.allOf) {
        return [];
      }

      const transformations = engineSchema.then.properties.transformations.items.allOf.map((transformation: any) => ({
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
  }, [selectedEngineType, pipelineEngineType, isEditingExistingNode]);

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
    // Disable Zod resolver for now to avoid validation issues
    // We'll handle validation manually in the submit handler
    defaultValues: {},
    mode: 'onSubmit', // Only validate on submit to avoid premature validation
  });

  // Reset forms when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (isEditingExistingNode) {
        // Skip initial step for editing existing nodes
        setStep('configuration');
        setSelectedEngineType(pipelineEngineType);
        
        // Set up the transformation based on selectedSchema
        const transformationName = selectedSchema?.title || initialValues?.type;
        const transformation = availableTransformations.find(t => t.name === transformationName);
        
        if (transformation) {
          setSelectedTransformation(transformation);
          setTransformationSchema(transformation.schema);
          
          // Initialize configuration form with existing values
          console.log('🔧 Resetting form with initialValues:', initialValues);
          configurationForm.reset(initialValues);
          
          // Debug: Check form values after reset
          setTimeout(() => {
            const currentFormValues = configurationForm.getValues();
            console.log('🔧 Form values after reset:', currentFormValues);
          }, 100);
        }
      } else {
        // Normal flow for creating new nodes
        setStep('initial');
        setSelectedTransformation(null);
        setTransformationSchema(null);
        setSelectedEngineType(pipelineEngineType);
        initialForm.reset({
          transformationName: '',
          engineType: pipelineEngineType,
          useCustomSchema: false,
          customSchema: '',
        });
        configurationForm.reset();
      }
    }
  }, [isOpen, isEditingExistingNode, selectedSchema, initialValues, pipelineEngineType, availableTransformations]);

  // Update engine type when form changes
  useEffect(() => {
    const subscription = initialForm.watch((value) => {
      if (value.engineType && value.engineType !== selectedEngineType) {
        setSelectedEngineType(value.engineType as 'pyspark' | 'pyflink');
      }
    });
    return () => subscription.unsubscribe();
  }, [initialForm, selectedEngineType]);

  // Load column suggestions when step changes to configuration
  useEffect(() => {
    const loadColumnSuggestions = async () => {
      if (step === 'configuration') {
        // Always provide some initial columns immediately
        const initialSuggestions = [
          { name: 'id', dataType: 'string' },
          { name: 'name', dataType: 'string' },
          { name: 'email', dataType: 'string' },
          { name: 'created_at', dataType: 'string' },
          { name: 'updated_at', dataType: 'string' },
          { name: 'status', dataType: 'string' }
        ];
        console.log('🔍 Setting initial column suggestions:', initialSuggestions);
        setColumnSuggestions(initialSuggestions);

        // Then try to load actual column suggestions if transformation is selected
        if (selectedTransformation) {
          try {
            // For editing existing nodes, use the current node ID if available
            const nodeIdForSuggestions = isEditingExistingNode && currentNodeId 
              ? currentNodeId 
              : `temp_${selectedTransformation.name}_${Date.now()}`;
              
            console.log('🔍 Loading column suggestions for:', {
              nodeIdForSuggestions,
              selectedTransformation: selectedTransformation.name,
              isEditingExistingNode,
              currentNodeId,
              nodesCount: nodes.length,
              edgesCount: edges.length,
              pipelineDtl: !!pipelineDtl
            });
            
            const suggestions = await getColumnSuggestions(nodeIdForSuggestions, nodes, edges, pipelineDtl);
            console.log('🔍 Column suggestions loaded:', suggestions);
            
            if (suggestions.length > 0) {
              const formattedSuggestions = suggestions.map(col => ({ name: col, dataType: 'string' }));
              console.log('🔍 Formatted column suggestions:', formattedSuggestions);
              setColumnSuggestions(formattedSuggestions);
            } else {
              console.log('🔍 No column suggestions found, keeping initial suggestions');
            }
          } catch (error) {
            console.error('Error loading column suggestions:', error);
            console.log('🔍 Keeping initial column suggestions due to error');
          }
        }
      }
    };

    loadColumnSuggestions();
  }, [step, selectedTransformation, nodes, edges, pipelineDtl, isEditingExistingNode, currentNodeId]);

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

  // Manual validation function
  const validateFormData = (data: any) => {
    if (!transformationSchema) return { isValid: true, errors: {} };

    try {
      // Get active fields based on current form values
      const { fields, required } = getActiveFields(transformationSchema, data);
      
      console.log('🔍 Manual validation - Active fields:', Object.keys(fields));
      console.log('🔍 Manual validation - Required fields:', required);
      console.log('🔍 Manual validation - Form data:', data);
      
      const errors: any = {};
      
      // Check required fields
      required.forEach((fieldKey: string) => {
        // Skip internal fields
        if (fieldKey === 'type' || fieldKey === 'task_id') {
          return;
        }
        
        const fieldValue = data[fieldKey];
        if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
          const field = fields[fieldKey];
          errors[fieldKey] = { 
            message: `${field?.title || formatFieldTitle(fieldKey)} is required` 
          };
        }
      });
      
      return { 
        isValid: Object.keys(errors).length === 0, 
        errors 
      };
    } catch (error) {
      console.error('Validation error:', error);
      return { isValid: false, errors: {} };
    }
  };

  // Helper function to clean up internal _key properties from form data
  const cleanupFormData = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map((item) => {
        const cleanedItem = cleanupFormData(item);
        // For primitive arrays, extract the value property
        if (cleanedItem && typeof cleanedItem === 'object' && 'value' in cleanedItem && Object.keys(cleanedItem).length === 1) {
          return cleanedItem.value;
        }
        return cleanedItem;
      });
    } else if (obj && typeof obj === 'object') {
      const cleaned = { ...obj };
      delete cleaned._key; // Remove the internal key used for React reconciliation
      
      // Recursively clean nested objects and arrays
      Object.keys(cleaned).forEach((key) => {
        cleaned[key] = cleanupFormData(cleaned[key]);
      });
      
      return cleaned;
    }
    return obj;
  };

  // Handle configuration form submission (add node to canvas or update existing node)
  const handleConfigurationSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Clean up internal React keys before processing
      const cleanedData = cleanupFormData(data);

      console.log('🚀 Form submission data (cleaned):', cleanedData);
      console.log('🔍 Form errors:', configurationForm.formState.errors);
      console.log('🔍 Form is valid:', configurationForm.formState.isValid);

      // Manual validation
      const validation = validateFormData(cleanedData);
      if (!validation.isValid) {
        console.log('🚫 Validation failed:', validation.errors);
        
        // Set form errors
        Object.entries(validation.errors).forEach(([path, error]: [string, any]) => {
          configurationForm.setError(path as any, error);
        });
        
        toast.error('Please fix the validation errors');
        return;
      }

      if (!selectedTransformation) {
        toast.error('No transformation selected');
        return;
      }

      if (isEditingExistingNode && onSubmit) {
        // Update existing node
        const updatedData = {
          type: selectedTransformation.name,
          ...cleanedData,
        };
        
        onSubmit(updatedData);
        toast.success('Node updated successfully');
        onClose();
        return;
      }

      // Create new node (original logic)
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
            ...cleanedData,
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
          ...cleanedData,
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
              <h3 className="font-medium text-sm mb-1">
                {isEditingExistingNode ? `Edit ${selectedTransformation.name}` : `Configure ${selectedTransformation.name}`}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {selectedTransformation.description || 
                 (isEditingExistingNode ? 'Update the transformation parameters.' : 'Configure the transformation parameters.')}
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
                  onClosePipelineForm={handleClose}
                />

                <div className="flex justify-end gap-2 pt-2">
                  {!isEditingExistingNode && (
                    <Button type="button" variant="outline" onClick={handleBack} size="sm">
                      Back
                    </Button>
                  )}
                  <Button type="submit" disabled={isSubmitting} size="sm" className="min-w-[120px] relative">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        {isEditingExistingNode ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      isEditingExistingNode ? 'Update Node' : 'Add to Canvas'
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