import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePipelineModules } from '@/hooks/usePipelineModules';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { pipelineSchema } from "@bh-ai/schemas";
import { FormFields } from '@/features/admin/connection/components/FormFields';
import { ArrayField } from './ArrayField';
import { FieldRenderer } from './FieldRenderer';
import { ConditionalSchemaRenderer } from './ConditionalSchemaRenderer';
import { generateInitialValues } from './schemaUtils';
import { generateDynamicZodSchema, generateStaticZodSchema } from './dynamicZodSchema';

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
});

export const PipelineForm: React.FC<PipelineFormProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<'initial' | 'configuration'>('initial');
  const [selectedTransformation, setSelectedTransformation] = useState<any>(null);
  const [selectedEngineType, setSelectedEngineType] = useState<'pyspark' | 'pyflink'>('pyspark');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transformationSchema, setTransformationSchema] = useState<any>(null);

  const { nodes, setNodes, setFormStates, nodeCounters, setNodeCounters } = usePipelineContext();
  const pipelineModules = usePipelineModules(selectedEngineType);

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
    },
  });

  // Dynamic form for transformation configuration
  const configurationForm = useForm({
    resolver: transformationSchema ? zodResolver(generateTransformationFormSchema(transformationSchema)) : undefined,
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
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Plus className="w-4 h-4" />
            Add Pipeline Transformation
          </DialogTitle>
        </DialogHeader>

        {step === 'initial' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm mb-1">Select Transformation</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Choose the transformation type and engine for your pipeline node.
              </p>
            </div>
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

                {initialForm.watch('transformationName') && (
                  <div className="p-2 bg-muted/30">
                    <h4 className="font-medium mb-1 text-sm">Description</h4>
                    <p className="text-xs text-muted-foreground">
                      {availableTransformations.find(t => t.name === initialForm.watch('transformationName'))?.description || 'No description available'}
                    </p>
                  </div>
                )}

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
                {transformationSchema.properties && (() => {
                  // Categorize fields into logical sections for tabs
                  const fields = Object.entries(transformationSchema.properties)
                    .filter(([key]) => key !== 'type' && key !== 'task_id');
                  
                  const basicFields = fields.filter(([, field]: [string, any]) => 
                    field.type !== 'array' && field.type !== 'object'
                  );
                  
                  const arrayFields = fields.filter(([, field]: [string, any]) => 
                    field.type === 'array'
                  );
                  
                  const objectFields = fields.filter(([, field]: [string, any]) => 
                    field.type === 'object' && (field.properties || field.additionalProperties)
                  );

                  const tabs = [];
                  
                  // Add Basic Properties tab if there are basic fields
                  if (basicFields.length > 0) {
                    tabs.push({
                      id: 'basic',
                      label: 'Basic',
                      fields: basicFields
                    });
                  }
                  
                  // Add Array Fields as separate tabs
                  arrayFields.forEach(([key, field]) => {
                    tabs.push({
                      id: key,
                      label: field.title || key,
                      fields: [[key, field]]
                    });
                  });
                  
                  // Add Object Fields as separate tabs
                  objectFields.forEach(([key, field]) => {
                    tabs.push({
                      id: key,
                      label: field.title || key,
                      fields: [[key, field]]
                    });
                  });

                  if (tabs.length === 0) return null;

                  // Render content for single tab without tabs UI
                  if (tabs.length === 1) {
                    const tab = tabs[0];
                    return (
                      <div className="w-full mt-3">
                        <div className="space-y-3">
                          {tab.fields.map(([key, field]: [string, any]) => {
                            const isRequired = transformationSchema.required?.includes(key);
                            const fieldTitle = field.title || key;

                            // Handle array fields
                            if (field.type === 'array') {
                              return (
                                <div key={key} className="p-2 bg-muted/20">
                                  <ArrayField
                                    field={field}
                                    fieldKey={key}
                                    form={configurationForm}
                                    isRequired={isRequired}
                                    title={fieldTitle}
                                  />
                                </div>
                              );
                            }

                            // Handle object fields
                            if (field.type === 'object') {
                              if (field.properties) {
                                // Object with structured properties
                                return (
                                  <div key={key} className="space-y-2">
                                    <div className="p-2">
                                      <FormFields 
                                        schema={field} 
                                        form={configurationForm}
                                        parentKey={key}
                                        twoColumnLayout={true}
                                        mode="new"
                                      />
                                    </div>
                                  </div>
                                );
                              } else if (field.additionalProperties) {
                                // Key-value object (like rename_columns)
                                return (
                                  <FieldRenderer
                                    key={key}
                                    fieldKey={key}
                                    field={field}
                                    form={configurationForm}
                                    isRequired={isRequired}
                                  />
                                );
                              }
                            }

                            // For other field types, use the FieldRenderer component
                            return (
                              <FieldRenderer
                                key={key}
                                fieldKey={key}
                                field={field}
                                form={configurationForm}
                                isRequired={isRequired}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  // Render tabs UI for multiple tabs
                  return (
                    <Tabs defaultValue={tabs[0].id} className="w-full">
                      <TabsList className="grid gap-0.5 h-7 p-0.5 w-fit" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, max-content))` }}>
                        {tabs.map((tab) => (
                          <TabsTrigger key={tab.id} value={tab.id} className="text-[12px] px-2 py-1 h-6">
                            {tab.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {tabs.map((tab) => (
                        <TabsContent key={tab.id} value={tab.id} className="mt-3">
                          <div className="space-y-3">
                            {tab.fields.map(([key, field]: [string, any]) => {
                              const isRequired = transformationSchema.required?.includes(key);
                              const fieldTitle = field.title || key;

                              // Handle array fields
                              if (field.type === 'array') {
                                return (
                                  <div key={key} className="p-2 bg-muted/20">
                                    <ArrayField
                                      field={field}
                                      fieldKey={key}
                                      form={configurationForm}
                                      isRequired={isRequired}
                                      title={fieldTitle}
                                    />
                                  </div>
                                );
                              }

                              // Handle object fields
                              if (field.type === 'object') {
                                if (field.properties) {
                                  // Object with structured properties
                                  return (
                                    <div key={key} className="space-y-2">
                                      <div className="p-2">
                                        <FormFields 
                                          schema={field} 
                                          form={configurationForm}
                                          parentKey={key}
                                          twoColumnLayout={true}
                                          mode="new"
                                        />
                                      </div>
                                    </div>
                                  );
                                } else if (field.additionalProperties) {
                                  // Key-value object (like rename_columns)
                                  return (
                                    <FieldRenderer
                                      key={key}
                                      fieldKey={key}
                                      field={field}
                                      form={configurationForm}
                                      isRequired={isRequired}
                                    />
                                  );
                                }
                              }

                              // For other field types, use the FieldRenderer component
                              return (
                                <FieldRenderer
                                  key={key}
                                  fieldKey={key}
                                  field={field}
                                  form={configurationForm}
                                  isRequired={isRequired}
                                />
                              );
                            })}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  );
                })()}

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