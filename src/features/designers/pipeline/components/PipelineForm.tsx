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
import { cn } from '@/lib/utils';

interface PipelineFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSchema?: any; // Schema of the selected node (for editing existing nodes)
  initialValues?: any; // Initial form values (for editing existing nodes)
  onSubmit?: (values: any) => void; // Submit handler (for editing existing nodes)
  currentNodeId?: string; // Current node ID (for editing existing nodes)
  inline?: boolean; // Whether to render inline (without dialog wrapper)
}

// Function to enhance schema with missing UI hints for expression fields
const enhanceSchemaWithUIHints = (schema: any, transformationName: string): any => {
  if (!schema) return schema;
  
  // Deep clone the schema to avoid mutating the original
  const enhancedSchema = JSON.parse(JSON.stringify(schema));
  
  try {
    if (transformationName === 'Aggregator') {
      // Add ui-hint to aggregations.items.properties.expression
      if (enhancedSchema.properties?.aggregations?.items?.properties?.expression) {
        enhancedSchema.properties.aggregations.items.properties.expression['ui-hint'] = 'expression';
        console.log('✅ Added ui-hint to Aggregator expression field');
      }
    } else if (transformationName === 'SchemaTransformation') {
      // Add ui-hint to derived_fields.items.properties.expression
      if (enhancedSchema.properties?.derived_fields?.items?.properties?.expression) {
        enhancedSchema.properties.derived_fields.items.properties.expression['ui-hint'] = 'expression';
        console.log('✅ Added ui-hint to SchemaTransformation expression field');
      }
    } else if (transformationName === 'Mapper') {
      // Add ui-hint to derived_fields.items.properties.expression
      if (enhancedSchema.properties?.derived_fields?.items?.properties?.expression) {
        enhancedSchema.properties.derived_fields.items.properties.expression['ui-hint'] = 'expression';
        console.log('✅ Added ui-hint to Mapper derived_fields expression field');
      }
      // Add ui-hint to column_list.items.properties.expression
      if (enhancedSchema.properties?.column_list?.items?.properties?.expression) {
        enhancedSchema.properties.column_list.items.properties.expression['ui-hint'] = 'expression';
        console.log('✅ Added ui-hint to Mapper column_list expression field');
      }
    } else if (transformationName === 'Joiner') {
      // Add ui-hint to expressions.items.properties.expression
      if (enhancedSchema.properties?.expressions?.items?.properties?.expression) {
        enhancedSchema.properties.expressions.items.properties.expression['ui-hint'] = 'expression';
        console.log('✅ Added ui-hint to Joiner expressions field');
      }
      // Add ui-hint to conditions.items.properties.join_condition
      if (enhancedSchema.properties?.conditions?.items?.properties?.join_condition) {
        enhancedSchema.properties.conditions.items.properties.join_condition['ui-hint'] = 'expression';
        console.log('✅ Added ui-hint to Joiner join_condition field');
      }
    }
  } catch (error) {
    console.error('Error enhancing schema with UI hints:', error);
    return schema; // Return original schema if enhancement fails
  }
  
  return enhancedSchema;
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
  selectedSchema,
  initialValues,
  onSubmit,
  currentNodeId,
  inline = false,
}) => {
  const [step, setStep] = useState<'initial' | 'configuration'>('initial');
  const [selectedTransformation, setSelectedTransformation] = useState<any>(null);
  const [selectedEngineType, setSelectedEngineType]:any = useState<'pyspark' | 'pyflink'>('pyspark');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transformationSchema, setTransformationSchema] = useState<any>(null);
  const [generatingFields, setGeneratingFields] = useState<Set<string>>(new Set());
  const [aiAttempted, setAiAttempted] = useState<Set<string>>(new Set());
  const [columnSuggestions, setColumnSuggestions] = useState<Array<{ name: string; dataType: string }>>([]);
  const [rightAsideWidth, setRightAsideWidth] = useState<number>(25);

  // Debug: Log when column suggestions change
  useEffect(() => {
    console.log('🔄 Column suggestions changed:', columnSuggestions);
  }, [columnSuggestions]);

  // Listen for right aside resize events to make form responsive
  useEffect(() => {
    const handleRightAsideResize = (event: CustomEvent) => {
      setRightAsideWidth(event.detail.width);
    };

    document.addEventListener('rightAsideResize', handleRightAsideResize as EventListener);
    
    return () => {
      document.removeEventListener('rightAsideResize', handleRightAsideResize as EventListener);
    };
  }, []);

  const { nodes, setNodes, setFormStates, nodeCounters, setNodeCounters, edges } = usePipelineContext();
  const pipelineModules = usePipelineModules(selectedEngineType);
  const dispatch = useDispatch<AppDispatch>();
  const { pipelineDtl } = useSelector((state: RootState) => state.buildPipeline);

  // Determine if we're editing an existing node or configuring a specific transformation
  const isEditingExistingNode = Boolean(selectedSchema && currentNodeId && initialValues);
  const isConfiguringSpecificTransformation = Boolean(selectedSchema && selectedSchema.title && !isEditingExistingNode);
  
  // For inline forms, we should always show configuration if we have a schema
  const shouldShowConfiguration = inline ? Boolean(selectedSchema && selectedSchema.title) : (isEditingExistingNode || isConfiguringSpecificTransformation);
  
  
  // Get engine type from pipeline details or default to pyspark
  const pipelineEngineType = pipelineDtl?.engine_type || 'pyspark';

  // Get available transformations from pipeline schema
  const availableTransformations = useMemo(() => {
    try {
      if (!pipelineSchema?.allOf) return [];
      
      // Use pipeline engine type for editing existing nodes or configuring specific transformations
      const engineType = shouldShowConfiguration ? pipelineEngineType : selectedEngineType;
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
  }, [selectedEngineType, pipelineEngineType, shouldShowConfiguration]);

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

  // Add state to track if form has been initialized to prevent unwanted resets
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Reset forms when dialog opens/closes or when inline form is mounted
  useEffect(() => {
    console.log('🔧 Form initialization effect triggered:', {
      isOpen,
      inline,
      isEditingExistingNode,
      isConfiguringSpecificTransformation,
      isFormInitialized,
      hasUserInteracted,
      selectedTransformation: selectedTransformation?.name
    });

    // For inline forms, we always want to initialize, for dialog forms we check isOpen
    if (isOpen || inline) {
      if (shouldShowConfiguration) {
        // Skip initial step for editing existing nodes or configuring specific transformations
        setStep('configuration');
        setSelectedEngineType(pipelineEngineType);
        
        // Set up the transformation based on selectedSchema
        const transformationName = selectedSchema?.title || initialValues?.type;
        console.log('🔧 Looking for transformation:', transformationName);
        console.log('🔧 Available transformations:', availableTransformations.map(t => t.name));
        const transformation = availableTransformations.find(t => t.name === transformationName);
        console.log('🔧 Found transformation:', transformation ? transformation.name : 'NOT FOUND');
        
        // Only initialize if form hasn't been initialized yet AND user hasn't interacted
        if (!isFormInitialized && !hasUserInteracted) {
          if (transformation) {
            console.log('🔧 Initializing form for', isEditingExistingNode ? 'editing existing node' : 'configuring specific transformation');
            
            // Enhance schema with missing UI hints for expression fields
            const enhancedSchema = enhanceSchemaWithUIHints(transformation.schema, transformation.name);
            
            setSelectedTransformation(transformation);
            setTransformationSchema(enhancedSchema);
            
            // Initialize configuration form with existing values or default values
            const formInitialValues = initialValues || {};
            console.log('🔧 Resetting form with initialValues:', formInitialValues);
            configurationForm.reset(formInitialValues);
            setIsFormInitialized(true);
            setHasUserInteracted(false);
            
            // Debug: Check form values after reset
            setTimeout(() => {
              const currentFormValues = configurationForm.getValues();
              console.log('🔧 Form values after reset:', currentFormValues);
            }, 100);
          } else {
            console.warn('🔧 Transformation not found, but setting up basic form state');
            // Even if transformation is not found, set up basic state so debug info shows
            setStep('configuration');
            setIsFormInitialized(true);
            setHasUserInteracted(false);
          }
        } else if (hasUserInteracted) {
          console.log('🔧 Skipping form reset - user has interacted with form');
        }
      } else {
        // Normal flow for creating new nodes
        if (!isFormInitialized && !hasUserInteracted) {
          console.log('🔧 Initializing form for new node');
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
          setIsFormInitialized(true);
          setHasUserInteracted(false);
        } else if (hasUserInteracted) {
          console.log('🔧 Skipping form reset - user has interacted with form');
        }
      }
    } else if (!inline) {
      // Reset initialization state when dialog closes (but not for inline forms)
      console.log('🔧 Dialog closed - resetting initialization state');
      setIsFormInitialized(false);
      setHasUserInteracted(false);
    }
  }, [isOpen, inline, shouldShowConfiguration, selectedSchema?.title, initialValues?.type, pipelineEngineType, availableTransformations.length]);

  // Handle changes in available transformations (when engine type changes)
  useEffect(() => {
    if ((isOpen || inline) && shouldShowConfiguration && !hasUserInteracted) {
      const transformationName = selectedSchema?.title || initialValues?.type;
      const transformation = availableTransformations.find(t => t.name === transformationName);
      
      if (transformation && !selectedTransformation) {
        console.log('🔧 Setting up transformation from availableTransformations change');
        
        // Enhance schema with missing UI hints for expression fields
        const enhancedSchema = enhanceSchemaWithUIHints(transformation.schema, transformation.name);
        
        setSelectedTransformation(transformation);
        setTransformationSchema(enhancedSchema);
      }
    }
  }, [availableTransformations, isOpen, inline, shouldShowConfiguration, hasUserInteracted, selectedSchema, initialValues, selectedTransformation]);

  // Update engine type when form changes
  useEffect(() => {
    const subscription = initialForm.watch((value) => {
      if (value.engineType && value.engineType !== selectedEngineType) {
        setSelectedEngineType(value.engineType as 'pyspark' | 'pyflink');
      }
    });
    return () => subscription.unsubscribe();
  }, [initialForm, selectedEngineType]);

  // Track user interaction with configuration form to prevent unwanted resets
  useEffect(() => {
    if (step === 'configuration') {
      let timeoutId: NodeJS.Timeout;
      const subscription = configurationForm.watch(() => {
        // Use a small delay to avoid marking as user interaction during initial form setup
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (!hasUserInteracted) {
            console.log('🔧 User started interacting with form');
            setHasUserInteracted(true);
          }
        }, 100);
      });
      
      return () => {
        subscription.unsubscribe();
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [configurationForm, step, hasUserInteracted]);

  // Load column suggestions when step changes to configuration
  useEffect(() => {
    const loadColumnSuggestions = async () => {
      if (step === 'configuration') {
        // Always provide some initial columns immediately
        const initialSuggestions = [
         
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
    console.log('🤖 AI Expression generation requested for:', {
      fieldName,
      transformationName: selectedTransformation?.name,
      isGeneratingForField: generatingFields.has(fieldName),
      aiAttempted: aiAttempted.has(fieldName),
      transformationSchema: transformationSchema?.title
    });

    if (!selectedTransformation || generatingFields.has(fieldName)) {
      console.log('🤖 Skipping AI generation - no transformation or already generating for this field');
      return;
    }

    // Allow AI generation every time the hammer is clicked
    console.log('🤖 Proceeding with AI generation for field:', fieldName);
    console.log('🤖 Field name analysis:', {
      fieldName,
      isAggregatorPattern: /aggregations\.(\d+)\.expression/.test(fieldName),
      isMapperDerivedPattern: /derived_fields\.(\d+)\.expression/.test(fieldName),
      isMapperColumnPattern: /column_list\.(\d+)\.expression/.test(fieldName),
      isSchemaTransformationPattern: /derived_fields\.(\d+)\.expression/.test(fieldName)
    });

    setGeneratingFields(prev => new Set(prev).add(fieldName));
    try {
      // Create a temporary node ID for expression generation
      const nodeIdForSuggestions = isEditingExistingNode && currentNodeId 
        ? currentNodeId 
        : `temp_${selectedTransformation.name}_${Date.now()}`;
      
      console.log('🤖 Loading column suggestions for AI generation:', nodeIdForSuggestions);
      const suggestions = await getColumnSuggestions(nodeIdForSuggestions, nodes, edges, pipelineDtl);
      const schemaString = suggestions.map(col => `${col}:string`).join(', ');
      console.log('🤖 Schema string for AI:', schemaString);

      // Handle different transformation types
      if (selectedTransformation.name === 'Aggregator') {
        console.log('🤖 Processing Aggregator AI generation');
        console.log('🤖 Field name received:', fieldName);
        console.log('🤖 Field name type:', typeof fieldName);
        console.log('🤖 Field name length:', fieldName.length);
        console.log('🤖 Field name characters:', fieldName.split('').map((c, i) => `${i}: '${c}' (${c.charCodeAt(0)})`));
        console.log('🤖 Testing regex pattern /aggregations\\.(\d+)\\.expression/');
        
        // Handle Aggregator transformation - try multiple patterns
        let match = fieldName.match(/aggregations\.(\d+)\.expression/);
        console.log('🤖 Aggregator regex match result (pattern 1):', match);
        
        // Try alternative patterns if the first one doesn't match
        if (!match) {
          match = fieldName.match(/aggregations\[(\d+)\]\.expression/);
          console.log('🤖 Aggregator regex match result (pattern 2 - brackets):', match);
        }
        
        if (!match) {
          // Try to extract index from any aggregation-related field
          const aggregationMatch = fieldName.match(/aggregation.*?(\d+).*?expression/);
          console.log('🤖 Aggregator regex match result (pattern 3 - flexible):', aggregationMatch);
          if (aggregationMatch) {
            match = [fieldName, aggregationMatch[1]]; // Create a match-like array
          }
        }
        
        console.log('🤖 Manual test - does field contain "aggregations"?', fieldName.includes('aggregations'));
        console.log('🤖 Manual test - does field contain "expression"?', fieldName.includes('expression'));
        console.log('🤖 Final match result:', match);
        
        if (match) {
          const index = parseInt(match[1]);
          const aggregations = configurationForm.watch('aggregations');
          const actualTargetColumn = aggregations?.[index]?.target_column || '';

          console.log('🤖 Aggregator details:', { index, aggregations, actualTargetColumn });

          if (!actualTargetColumn) {
            console.warn('🤖 No target column specified for Aggregator');
            toast.warning('Please specify a target column first before generating expression');
            return;
          }

          const response: any = await dispatch(generatePipelineAgent({ 
            params: {
              schema: schemaString,
              target_column: actualTargetColumn
            },
            operation_type: "spark_expression",
            thread_id: 'spark_123'
          })).unwrap();

          if (response?.result) {
            try {
              console.log('🤖 Raw AI response:', response);
              console.log('🤖 Response result:', response.result);
              const parsedResult = JSON.parse(response.result);
              console.log('🤖 Parsed result:', parsedResult);
              console.log('🤖 Expression value:', parsedResult.expression);
              
              // Mark this field as having attempted AI generation
              setAiAttempted(prev => new Set(prev).add(fieldName));

              // Update the aggregations array properly
              const expressionValue = parsedResult.expression === "UNABLE_TO_GENERATE" ? '' : 
                (parsedResult === "" ? '' : parsedResult.expression);
              
              const currentAggregations = [...(configurationForm.watch('aggregations') || [])];
              console.log('🤖 Current aggregations before update:', currentAggregations);
              console.log('🤖 Updating index:', index, 'with expression:', expressionValue);
              
              currentAggregations[index] = {
                ...currentAggregations[index],
                expression: expressionValue
              };
              
              console.log('🤖 Updated aggregations:', currentAggregations);
              
              configurationForm.setValue('aggregations', currentAggregations, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              });
              
              console.log('🤖 Form value after setValue:', configurationForm.watch('aggregations'));
              
              // Show success message
              if (expressionValue) {
                toast.success('AI expression generated successfully!');
              } else {
                toast.info('AI could not generate expression. You can type manually.');
              }
            } catch (error) {
              console.error('Error parsing AI response for Aggregator:', error);
            }
          }
        } else {
          console.warn('🤖 Aggregator field name does not match any expected pattern:', fieldName);
          console.warn('🤖 Expected patterns:');
          console.warn('🤖   1. aggregations.{index}.expression');
          console.warn('🤖   2. aggregations[{index}].expression');
          console.warn('🤖   3. Any field containing aggregation + number + expression');
          console.warn('🤖 Received field name:', `"${fieldName}"`);
          
          // Try a last resort - if it's an expression field in aggregator, try to use it anyway
          if (fieldName.includes('expression') && selectedTransformation.name === 'Aggregator') {
            console.log('🤖 Attempting fallback processing for Aggregator expression field');
            
            // Try multiple ways to get aggregations data
            const aggregationsWatch = configurationForm.watch('aggregations');
            const aggregationsGetValues = configurationForm.getValues().aggregations;
            const allFormValues = configurationForm.getValues();
            
            console.log('🤖 Fallback - aggregations via watch():', aggregationsWatch);
            console.log('🤖 Fallback - aggregations via getValues():', aggregationsGetValues);
            console.log('🤖 Fallback - all form values:', allFormValues);
            console.log('🤖 Fallback - form values keys:', Object.keys(allFormValues));
            
            // Try both methods to get aggregations
            const aggregations = aggregationsWatch || aggregationsGetValues;
            
            if (aggregations && aggregations.length > 0) {
              // Try to extract index from field name
              let targetIndex = 0;
              const indexMatch = fieldName.match(/(\d+)/);
              if (indexMatch) {
                targetIndex = parseInt(indexMatch[1]);
                console.log('🤖 Extracted index from field name:', targetIndex);
              }
              
              // Use the specific aggregation or fall back to first one
              const targetAggregation = aggregations[targetIndex] || aggregations[0];
              const actualTargetColumn = targetAggregation?.target_column || '';
              
              console.log('🤖 Using aggregation at index:', targetIndex);
              console.log('🤖 Target aggregation:', targetAggregation);
              console.log('🤖 Target column:', actualTargetColumn);
              
              if (actualTargetColumn) {
                console.log('🤖 Using fallback with target_column:', actualTargetColumn);
                
                const response: any = await dispatch(generatePipelineAgent({ 
                  params: {
                    schema: schemaString,
                    target_column: actualTargetColumn
                  },
                  operation_type: "spark_expression",
                  thread_id: 'spark_123'
                })).unwrap();

                if (response?.result) {
                  try {
                    const parsedResult = JSON.parse(response.result);
                    const expressionValue = parsedResult.expression === "UNABLE_TO_GENERATE" ? '' : 
                      (parsedResult === "" ? '' : parsedResult.expression);
                    
                    // Set the value directly on the field that was clicked
                    configurationForm.setValue(fieldName, expressionValue, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true
                    });
                    
                    setAiAttempted(prev => new Set(prev).add(fieldName));
                    
                    if (expressionValue) {
                      toast.success('AI expression generated successfully (fallback method)!');
                    } else {
                      toast.info('AI could not generate expression. You can type manually.');
                    }
                  } catch (error) {
                    console.error('Error parsing AI response for Aggregator fallback:', error);
                    toast.error('Error processing AI response. You can type manually.');
                  }
                } else {
                  toast.info('No AI response received. You can type manually.');
                }
              } else {
                toast.warning('Please specify a target column first before generating expression');
              }
            } else {
              console.log('🤖 No aggregations array found, trying to extract target column directly from field path');
              
              // Try to extract target column from the field path directly
              // If fieldName is something like "aggregations.0.expression", try to get "aggregations.0.target_column"
              let targetColumnFieldName = '';
              if (fieldName.includes('expression')) {
                targetColumnFieldName = fieldName.replace('expression', 'target_column');
                console.log('🤖 Trying to get target column from field:', targetColumnFieldName);
                
                // Try multiple ways to access the target column value
                const targetColumnValue = configurationForm.watch(targetColumnFieldName) || 
                                         configurationForm.getValues()[targetColumnFieldName] ||
                                         (() => {
                                           // Try to access nested value manually
                                           const allValues = configurationForm.getValues();
                                           const pathParts = targetColumnFieldName.split('.');
                                           let value = allValues;
                                           for (const part of pathParts) {
                                             if (value && typeof value === 'object') {
                                               value = value[part];
                                             } else {
                                               return null;
                                             }
                                           }
                                           return value;
                                         })();
                console.log('🤖 Target column value from direct field access:', targetColumnValue);
                
                if (targetColumnValue) {
                  console.log('🤖 Found target column via direct field access:', targetColumnValue);
                  
                  const response: any = await dispatch(generatePipelineAgent({ 
                    params: {
                      schema: schemaString,
                      target_column: targetColumnValue
                    },
                    operation_type: "spark_expression",
                    thread_id: 'spark_123'
                  })).unwrap();

                  if (response?.result) {
                    try {
                      const parsedResult = JSON.parse(response.result);
                      const expressionValue = parsedResult.expression === "UNABLE_TO_GENERATE" ? '' : 
                        (parsedResult === "" ? '' : parsedResult.expression);
                      
                      // Set the value directly on the field that was clicked
                      configurationForm.setValue(fieldName, expressionValue, {
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true
                      });
                      
                      setAiAttempted(prev => new Set(prev).add(fieldName));
                      
                      if (expressionValue) {
                        toast.success('AI expression generated successfully (direct field access)!');
                      } else {
                        toast.info('AI could not generate expression. You can type manually.');
                      }
                    } catch (error) {
                      console.error('Error parsing AI response for Aggregator direct access:', error);
                      toast.error('Error processing AI response. You can type manually.');
                    }
                  } else {
                    toast.info('No AI response received. You can type manually.');
                  }
                } else {
                  toast.warning('No target column found. Please fill the target column field first.');
                }
              } else {
                toast.warning('No aggregation data found. Please add aggregation fields first.');
              }
            }
          } else {
            toast.warning('Unable to process this field for AI generation. Please check the field structure.');
          }
        }
      } else if (selectedTransformation.name === 'SchemaTransformation') {
        console.log('🤖 Processing SchemaTransformation AI generation');
        // Handle SchemaTransformation (derived_fields)
        const match = fieldName.match(/derived_fields\.(\d+)\.expression/);
        if (match) {
          const index = parseInt(match[1]);
          const derivedFields = configurationForm.watch('derived_fields');
          const actualTargetColumn = derivedFields?.[index]?.name || '';

          console.log('🤖 SchemaTransformation details:', { index, derivedFields, actualTargetColumn });

          if (!actualTargetColumn) {
            console.warn('🤖 No target column specified for SchemaTransformation');
            return;
          }

          const response: any = await dispatch(generatePipelineAgent({ 
            params: {
              schema: schemaString,
              target_column: actualTargetColumn
            },
            operation_type: "spark_expression",
            thread_id: 'spark_123'
          })).unwrap();

          if (response?.result) {
            try {
              const parsedResult = JSON.parse(response.result);
              console.log('SchemaTransformation AI response:', parsedResult);
              
              // Mark this field as having attempted AI generation
              setAiAttempted(prev => new Set(prev).add(fieldName));
              
              const expressionValue = parsedResult === "" ? '' : 
                parsedResult.expression === "UNABLE_TO_GENERATE" ? '' : parsedResult.expression;
              
              // Update the derived_fields array properly
              const currentDerivedFields = [...(configurationForm.watch('derived_fields') || [])];
              currentDerivedFields[index] = {
                ...currentDerivedFields[index],
                expression: expressionValue
              };
              
              configurationForm.setValue('derived_fields', currentDerivedFields, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              });
            } catch (error) {
              console.error('Error parsing AI response for SchemaTransformation:', error);
            }
          }
        }
      } else if (selectedTransformation.name === 'Mapper') {
        console.log('🤖 Processing Mapper AI generation');
        // Handle Mapper transformation - similar to SchemaTransformation
        const derivedFieldMatch = fieldName.match(/derived_fields\.(\d+)\.expression/);
        const columnListMatch = fieldName.match(/column_list\.(\d+)\.expression/);
        
        let targetColumn = '';
        let index = -1;
        
        if (derivedFieldMatch) {
          index = parseInt(derivedFieldMatch[1]);
          const derivedFields = configurationForm.watch('derived_fields');
          targetColumn = derivedFields?.[index]?.name || '';
          console.log('🤖 Mapper derived_fields details:', { index, derivedFields, targetColumn });
        } else if (columnListMatch) {
          index = parseInt(columnListMatch[1]);
          const columnList = configurationForm.watch('column_list');
          targetColumn = columnList?.[index]?.name || '';
          console.log('🤖 Mapper column_list details:', { index, columnList, targetColumn });
        }

        if (!targetColumn) {
          console.warn('🤖 No target column specified for Mapper');
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
            console.log('🤖 Mapper Raw AI response:', response);
            console.log('🤖 Mapper Response result:', response.result);
            const parsedResult = JSON.parse(response.result);
            console.log('🤖 Mapper Parsed result:', parsedResult);
            console.log('🤖 Mapper Expression value:', parsedResult.expression);
            
            // Mark this field as having attempted AI generation
            setAiAttempted(prev => new Set(prev).add(fieldName));
            
            const expressionValue = parsedResult === "" ? '' : 
              parsedResult.expression === "UNABLE_TO_GENERATE" ? '' : parsedResult.expression;
            
            // Update the appropriate array based on field type
            if (derivedFieldMatch) {
              const currentDerivedFields = [...(configurationForm.watch('derived_fields') || [])];
              console.log('🤖 Mapper derived_fields before update:', currentDerivedFields);
              console.log('🤖 Mapper updating index:', index, 'with expression:', expressionValue);
              
              currentDerivedFields[index] = {
                ...currentDerivedFields[index],
                expression: expressionValue
              };
              
              console.log('🤖 Mapper updated derived_fields:', currentDerivedFields);
              
              configurationForm.setValue('derived_fields', currentDerivedFields, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              });
              
              console.log('🤖 Mapper form value after setValue:', configurationForm.watch('derived_fields'));
              
              // Show success message
              if (expressionValue) {
                toast.success('AI expression generated successfully!');
              } else {
                toast.info('AI could not generate expression. You can type manually.');
              }
            } else if (columnListMatch) {
              const currentColumnList = [...(configurationForm.watch('column_list') || [])];
              console.log('🤖 Mapper column_list before update:', currentColumnList);
              console.log('🤖 Mapper updating column_list index:', index, 'with expression:', expressionValue);
              
              currentColumnList[index] = {
                ...currentColumnList[index],
                expression: expressionValue
              };
              
              console.log('🤖 Mapper updated column_list:', currentColumnList);
              
              configurationForm.setValue('column_list', currentColumnList, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              });
              
              console.log('🤖 Mapper column_list form value after setValue:', configurationForm.watch('column_list'));
              
              // Show success message
              if (expressionValue) {
                toast.success('AI expression generated successfully!');
              } else {
                toast.info('AI could not generate expression. You can type manually.');
              }
            }
          } catch (error) {
            console.error('Error parsing AI response for Mapper:', error);
          }
        }
      } else if (selectedTransformation.name === 'Joiner') {
        // Handle different types of Joiner fields
        if (fieldName.includes('expressions')) {
          // Handle expressions tab - use spark_expression operation
          const match = fieldName.match(/expressions\.(\d+)\.expression/);
          if (match) {
            const index = parseInt(match[1]);
            const expressions = configurationForm.watch('expressions');
            const targetColumn = expressions?.[index]?.name || '';

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
                
                // Update the expressions array properly
                const currentExpressions = [...(configurationForm.watch('expressions') || [])];
                currentExpressions[index] = {
                  ...currentExpressions[index],
                  expression: expressionValue
                };
                
                configurationForm.setValue('expressions', currentExpressions, {
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
        } else if (fieldName.includes('join_condition')) {
          // Handle join condition generation - only for existing nodes with proper connections
          if (isEditingExistingNode && currentNodeId) {
            try {
              const joinPayload: any = await generateJoinPayload(currentNodeId, nodes, edges);
              
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
                  const joinType = parsedResult.join_type?.split(' ')[0]?.toLowerCase() || 'inner';
                  
                  // Update the join condition field
                  configurationForm.setValue(fieldName, expressionValue, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  });

                  // Also update join_type if it's available
                  const joinTypeFieldName = fieldName.replace('join_condition', 'join_type');
                  configurationForm.setValue(joinTypeFieldName, joinType, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  });

                  // Update join_input if available
                  const joinInputFieldName = fieldName.replace('join_condition', 'join_input');
                  configurationForm.setValue(joinInputFieldName, joinPayload.params.dataset1_name, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  });

                  setAiAttempted(prev => new Set(prev).add(fieldName));
                } catch (error) {
                  console.error('Error parsing AI response:', error);
                }
              }
            } catch (error) {
              console.error('Error generating join payload:', error);
              // For new nodes or nodes without proper connections, just mark as attempted
              // so user can type manually
              setAiAttempted(prev => new Set(prev).add(fieldName));
              configurationForm.setValue(fieldName, '', {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              });
            }
          } else {
            // For new nodes, just enable manual typing
            console.log('Join condition generation not available for new nodes - enabling manual input');
            setAiAttempted(prev => new Set(prev).add(fieldName));
            configurationForm.setValue(fieldName, '', {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true
            });
          }
        }
      } else {
        // Unsupported transformation type
        console.warn('🤖 AI generation not supported for transformation:', selectedTransformation.name);
        toast.info(`AI generation not available for ${selectedTransformation.name}. You can type manually.`);
        setAiAttempted(prev => new Set(prev).add(fieldName));
        configurationForm.setValue(fieldName, '', {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        });
      }
    } catch (error) {
      console.error('🤖 Error generating expression:', error);
      toast.error('Failed to generate expression. You can type manually.');
      // Mark field as attempted so user can type manually
      setAiAttempted(prev => new Set(prev).add(fieldName));
      // Clear the field to allow manual input
      configurationForm.setValue(fieldName, '', {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    } finally {
      setGeneratingFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    }
  }, [selectedTransformation, generatingFields, aiAttempted, nodes, edges, pipelineDtl, configurationForm, dispatch, isEditingExistingNode, currentNodeId]);

  // Handle initial form submission (transformation selection)
  const handleInitialSubmit = (data: any) => {
    const transformation = availableTransformations.find(t => t.name === data.transformationName);
    if (!transformation) {
      toast.error('Selected transformation not found');
      return;
    }

    // Enhance schema with missing UI hints for expression fields
    const enhancedSchema = enhanceSchemaWithUIHints(transformation.schema, transformation.name);
    
    setSelectedTransformation(transformation);
    setTransformationSchema(enhancedSchema);
    
    console.log('Selected transformation:', transformation);
    console.log('Original transformation schema:', transformation.schema);
    console.log('Enhanced transformation schema:', enhancedSchema);
    
    // Debug: Check if expression fields have ui-hint
    if (transformation.name === 'Aggregator' && enhancedSchema?.properties?.aggregations?.items?.properties?.expression) {
      console.log('🔍 Aggregator expression field schema:', enhancedSchema.properties.aggregations.items.properties.expression);
    }
    if (transformation.name === 'Mapper' && enhancedSchema?.properties) {
      console.log('🔍 Mapper schema properties:', enhancedSchema.properties);
    }
    
    // Generate initial values for the configuration form using schema utilities
    const initialValues = generateInitialValues(transformation.schema);
    
    // Remove internal fields
    delete initialValues.type;
    delete initialValues.task_id;
    
    configurationForm.reset(initialValues);
    setStep('configuration');
    setHasUserInteracted(false); // Reset user interaction state for new form
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

  // Render the form content
  const formContent = (
    <div className={cn(
      inline ? "space-y-4" : "space-y-4",
      // Make form more compact when right aside is wider
      rightAsideWidth > 40 ? "space-y-2" : "space-y-4"
    )}>
      
      
      {step === 'initial' && (
        <div className="space-y-4">
          <Form {...initialForm}>
            <form onSubmit={initialForm.handleSubmit(handleInitialSubmit)} className="space-y-4">
              <div className={cn(
                "grid gap-4",
                // Responsive grid based on right aside width
                rightAsideWidth > 50 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
              )}>
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

        {step === 'configuration' && (
          <div className="space-y-4">
            {selectedTransformation && transformationSchema ? (
              <>
              
                <Form {...configurationForm}>
                  <form 
                    onSubmit={configurationForm.handleSubmit(handleConfigurationSubmit)} 
                    className="space-y-4"
                    onInput={() => {
                      if (!hasUserInteracted) {
                        console.log('🔧 User started interacting with form');
                        setHasUserInteracted(true);
                      }
                    }}
                    onChange={() => {
                      if (!hasUserInteracted) {
                        console.log('🔧 User started interacting with form (onChange)');
                        setHasUserInteracted(true);
                      }
                    }}
                  >
                    <ConditionalSchemaRenderer 
                      schema={transformationSchema}
                      twoColumnLayout={rightAsideWidth <= 50} // Disable two-column layout when right aside is wide
                      useTabs={true}
                      sourceColumns={columnSuggestions}
                      onExpressionGenerate={handleExpressionGenerate}
                      isFieldGenerating={(fieldName: string) => generatingFields.has(fieldName)}
                      onClosePipelineForm={handleClose}
                    />
                    
                    

                    <div className="flex justify-end gap-2 pt-2">
                      {!isEditingExistingNode && !isConfiguringSpecificTransformation && (
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
              </>
            ) : (
              <div className="p-4 border border-red-200 bg-red-50 rounded">
                <h3 className="font-medium text-sm mb-2 text-red-800">Configuration Error</h3>
                <p className="text-xs text-red-600 mb-2">
                  Unable to load transformation configuration. This might be due to:
                </p>
                <ul className="text-xs text-red-600 list-disc list-inside space-y-1">
                  <li>Transformation schema not found</li>
                  <li>Pipeline schema not loaded</li>
                  <li>Engine type mismatch</li>
                </ul>
                <div className="mt-3 text-xs text-gray-600">
                  <div>Requested transformation: {selectedSchema?.title || 'Unknown'}</div>
                  <div>Available transformations: {availableTransformations.length}</div>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );

  // Return either dialog or inline version
  if (inline) {
    return formContent;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "max-h-[90vh] overflow-y-auto p-4",
        // Responsive max width based on right aside width
        rightAsideWidth > 40 ? "max-w-3xl" : "max-w-5xl"
      )}>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};