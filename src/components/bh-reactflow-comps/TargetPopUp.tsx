
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, Info, Database } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { getConnectionConfigList } from "@/store/slices/dataCatalog/datasourceSlice";
import { usePipelineContext } from "@/context/designers/DataPipelineContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { generateFormSchema } from "@/features/admin/connection/components/connectionFormSchema";
import * as z from 'zod';
import { ArrayField } from "@/features/designers/pipeline/components/ArrayField";
import { NestedArrayField } from "@/features/designers/pipeline/components/NestedArrayField";
import { KeyValueEditor } from "@/features/designers/pipeline/components/KeyValueEditor";
import { FieldRenderer } from "@/features/designers/pipeline/components/FieldRenderer";
import { generateInitialValues as generateTransformationInitialValues } from "@/features/designers/pipeline/components/form-sections/get-initial-form";
import { pipelineSchema } from "@bh-ai/schemas";
import { extractConnectionConfigId } from "@/lib/connectionUtils";

interface FormData {
    [key: string]: any;
}

// Create target form schema function
const createTargetFormSchema = () => {
    // Create a flexible schema that allows any properties
    // This is a basic schema that will be enhanced by the resolved schema
    return z.object({
        transformation: z.string().optional(),
        task_id: z.string().optional(),
        name: z.string().optional(),
        target: z.object({
            target_type: z.string().optional(),
            target_name: z.string().optional(),
            table_name: z.string().optional(),
            file_name: z.string().optional(),
            load_mode: z.string().optional(),
            connection: z.object({
                connection_config_id: z.string().optional()
            }).passthrough().optional() // Allow additional connection properties
        }).passthrough().optional(), // Allow additional target properties
        file_type: z.string().optional(),
        write_options: z.record(z.any()).optional()
    }).passthrough(); // Allow additional properties
};

interface TargetPopUpProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: FormData;
    onSourceUpdate?: (updatedSource: any) => void;
    onSubmit?: (updatedSource: any) => void;
    nodeId?: string;
    source?: any;
    sourceColumns?: any;
    onFormDataChange?: (formData: FormData) => void;
}

// Extract writer schema from pipeline schema based on engine type
const extractWriterSchema = (engineType: 'pyspark' | 'pyflink' = 'pyspark') => {
    try {
        let transformations;
        
        // Check if pipelineSchema is already an array of transformations (direct format)
        if (Array.isArray(pipelineSchema)) {
            transformations = pipelineSchema;
        } else {
            // Find the engine-specific schema in allOf (nested format)
            const schema = pipelineSchema as any;
            const engineSchema = schema.allOf?.find((schema: any) => 
                schema.if?.properties?.engine_type?.const === engineType
            );
            
            if (!engineSchema?.then?.properties?.transformations?.items?.allOf) {
                console.warn(`No transformations found for engine type: ${engineType}`);
                return null;
            }

            transformations = engineSchema.then.properties.transformations.items?.allOf;
        }

        if (!transformations || !Array.isArray(transformations)) {
            console.warn('No valid transformations array found');
            return null;
        }

        // Find the writer transformation
        const writerTransformation = transformations.find((transformation: any) => 
            transformation?.if?.properties?.transformation?.const?.toLowerCase() === 'writer'
        );

        if (!writerTransformation) {
            console.warn('Writer transformation not found in pipeline schema');
            return null;
        }

        // Extract the writer schema from the transformation
        let writerSchema = { ...writerTransformation.then };
        
        // Enhance the writer schema with endpoint configuration for connection field
        writerSchema = enhanceWriterSchemaWithEndpoints(writerSchema);
        console.log('🔧 Extracted writer schema from pipeline schema:', writerSchema);
        return writerSchema;
    } catch (error) {
        console.error('Error extracting writer schema:', error);
        return null;
    }
};

// Enhance writer schema with endpoint configuration for connection fields
const enhanceWriterSchemaWithEndpoints = (baseWriterSchema: any) => {
    const enhancedSchema = { ...baseWriterSchema };

    // Recursively add endpoint configuration to connection fields
    const addEndpointToConnectionFields = (obj: any) => {
        if (obj && typeof obj === 'object') {
            // Check if this is a connection field
            if (obj.type === 'object' && obj.properties?.connection_config_id) {
                obj["ui-hint"] = "endpoint";
                obj["endpoint"] = "connection_registry/connection_config/list/";
            }
            
            // Check for nested connection fields
            if (obj.properties?.connection) {
                obj.properties.connection = {
                    ...obj.properties.connection,
                    "ui-hint": "endpoint",
                    "endpoint": "connection_registry/connection_config/list/"
                };
            }

            // Recursively process all properties
            if (obj.properties) {
                Object.keys(obj.properties).forEach(key => {
                    addEndpointToConnectionFields(obj.properties[key]);
                });
            }

            // Recursively process allOf conditions
            if (obj.allOf && Array.isArray(obj.allOf)) {
                obj.allOf.forEach((condition: any) => {
                    addEndpointToConnectionFields(condition);
                });
            }

            // Recursively process then/else conditions
            if (obj.then) {
                addEndpointToConnectionFields(obj.then);
            }
            if (obj.else) {
                addEndpointToConnectionFields(obj.else);
            }
        }
    };

    addEndpointToConnectionFields(enhancedSchema);
    return enhancedSchema;
};

// Helper function to set nested values in an object
const setNestedValue = (obj: any, path: string, value: any): void => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
        if (!current[key]) current[key] = {};
        return current[key];
    }, obj);
    target[lastKey] = value;
};

// Helper function to get nested values from form data
const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
};



// Resolve conditional schema based on form data
const resolveConditionalSchema = (baseSchema: any, formData: FormData) => {
    if (!baseSchema?.allOf) return baseSchema;

    let resolvedSchema = { ...baseSchema };

    const resolveConditionsRecursively = (conditions: any[], currentFormData: FormData, currentSchema: any, depth: number = 0) => {
        conditions.forEach((condition: any) => {
            if (condition.if && condition.then) {
                const conditionMet = checkCondition(condition.if, currentFormData);
                
                if (process.env.NODE_ENV === 'development') {
                    const conditionType = condition.if.properties ? Object.keys(condition.if.properties)[0] : 'unknown';
                    const isFileTypeCondition = conditionType === 'file_type' || 
                        (condition.if.properties && Object.values(condition.if.properties).some((prop: any) => prop.const === 'CSV'));
                    
                }
                
                if (conditionMet) {
                    // Merge the conditional properties
                    if (condition.then.properties) {
                        currentSchema = {
                            ...currentSchema,
                            properties: {
                                ...currentSchema.properties,
                                ...condition.then.properties
                            }
                        };
                    }

                    // Merge required fields
                    if (condition.then.required) {
                        currentSchema.required = [
                            ...(currentSchema.required || []),
                            ...condition.then.required
                        ];
                    }

                    if (process.env.NODE_ENV === 'development') {
                        const addedProperties = Object.keys(condition.then.properties || {});
                        const hasWriteOptions = addedProperties.includes('write_options');
                        
                        if (hasWriteOptions) {
                            console.log(`${'  '.repeat(depth)}✅ WRITE_OPTIONS ADDED! Properties:`, addedProperties);
                            console.log(`${'  '.repeat(depth)}✅ write_options schema:`, condition.then.properties.write_options);
                        } else {
                            console.log(`${'  '.repeat(depth)}✅ Applied condition, added properties:`, addedProperties);
                        }
                        
                        if (condition.then.allOf) {
                            console.log(`${'  '.repeat(depth)}✅ Found nested allOf conditions:`, condition.then.allOf.length);
                        }
                    }

                    // If the condition has nested allOf, resolve those immediately
                    if (condition.then.allOf) {
                        if (process.env.NODE_ENV === 'development') {
                            console.log(`${'  '.repeat(depth)}🔧 Resolving nested allOf conditions immediately with form data:`, currentFormData);
                        }
                        // For nested allOf conditions that might reference root-level properties,
                        // we need to pass the appropriate form data context
                        const contextFormData = depth === 0 ? currentFormData : currentFormData;
                        currentSchema = resolveConditionsRecursively(condition.then.allOf, contextFormData, currentSchema, depth + 1);
                    }
                }
            }
        });
        return currentSchema;
    };

    // First resolve the main schema conditions
    if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Starting schema resolution with form data:', formData);
        console.log('🔧 Base schema allOf conditions:', baseSchema.allOf?.length || 0);
    }
    resolvedSchema = resolveConditionsRecursively(baseSchema.allOf, formData, resolvedSchema, 0);
    
    if (process.env.NODE_ENV === 'development') {
        console.log('🔧 After initial resolution, properties:', Object.keys(resolvedSchema.properties || {}));
        console.log('🔧 After initial resolution, allOf:', resolvedSchema.allOf?.length || 0);
    }

    // Then resolve nested object conditions (like target.allOf)
    if (resolvedSchema.properties) {
        Object.keys(resolvedSchema.properties).forEach(key => {
            const property = resolvedSchema.properties[key];
            if (property.allOf) {
                // Get the nested form data for this property
                const nestedFormData = formData[key] || {};
                
                if (process.env.NODE_ENV === 'development') {
                    console.log(`🔧 Resolving nested conditions for ${key}:`, {
                        nestedFormData,
                        hasAllOf: !!property.allOf
                    });
                }
                
                // Resolve the nested conditions
                const resolvedNestedProperty = resolveConditionsRecursively(
                    property.allOf, 
                    nestedFormData, 
                    property, 
                    1
                );
                
                // Update the property in the resolved schema
                resolvedSchema.properties[key] = resolvedNestedProperty;
            }
        });
    }

    // Additional pass: resolve any allOf conditions that were added during the first pass
    // This handles cases where conditions add new allOf structures
    let hasMoreConditions = true;
    let maxIterations = 5; // Prevent infinite loops
    let iteration = 0;
    
    while (hasMoreConditions && iteration < maxIterations) {
        hasMoreConditions = false;
        iteration++;
        
        if (resolvedSchema.allOf) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔧 Processing additional allOf conditions in iteration ${iteration}:`, {
                    allOfCount: resolvedSchema.allOf.length,
                    currentProperties: Object.keys(resolvedSchema.properties || {})
                });
            }
            const newResolvedSchema = resolveConditionsRecursively(resolvedSchema.allOf, formData, resolvedSchema, 0);
            if (JSON.stringify(newResolvedSchema) !== JSON.stringify(resolvedSchema)) {
                resolvedSchema = newResolvedSchema;
                hasMoreConditions = true;
                if (process.env.NODE_ENV === 'development') {
                    console.log(`🔧 Schema changed in iteration ${iteration}, new properties:`, Object.keys(resolvedSchema.properties || {}));
                }
            }
        }
        
        // Check for nested allOf in properties
        if (resolvedSchema.properties) {
            Object.keys(resolvedSchema.properties).forEach(key => {
                const property = resolvedSchema.properties[key];
                if (property.allOf) {
                    const nestedFormData = formData[key] || {};
                    const newResolvedProperty = resolveConditionsRecursively(
                        property.allOf, 
                        nestedFormData, 
                        property, 
                        1
                    );
                    
                    if (JSON.stringify(newResolvedProperty) !== JSON.stringify(property)) {
                        resolvedSchema.properties[key] = newResolvedProperty;
                        hasMoreConditions = true;
                    }
                }
            });
        }
        

        
        if (process.env.NODE_ENV === 'development' && hasMoreConditions) {
            console.log(`🔧 Additional schema resolution pass ${iteration}:`, {
                hasMoreConditions,
                currentProperties: Object.keys(resolvedSchema.properties || {})
            });
        }
    }

    return resolvedSchema;
};

// Check if a condition is met (handles nested properties)
const checkCondition = (condition: any, formData: FormData): boolean => {
    if (!condition.properties) return false;

    return Object.entries(condition.properties).every(([key, value]: [string, any]) => {
        if (value.const !== undefined) {
            // Handle nested properties like "target.target_type"
            const fieldValue = getNestedValue(formData, key);
            const result = fieldValue === value.const;
            
            if (process.env.NODE_ENV === 'development') {
                // Special debugging for file_type conditions
                if (key === 'file_type') {
                    console.log(`🔧 FILE_TYPE CONDITION CHECK ${key} === ${value.const}:`, {
                        fieldValue,
                        expected: value.const,
                        result,
                        formData,
                        keyPath: key,
                        fullFormDataStructure: JSON.stringify(formData, null, 2)
                    });
                } else {
                    console.log(`🔧 Checking condition ${key} === ${value.const}:`, {
                        fieldValue,
                        expected: value.const,
                        result,
                        formData,
                        keyPath: key
                    });
                }
            }
            
            return result;
        }
        if (value.properties) {
            // Handle nested object conditions like { target: { properties: { target_type: { const: "File" } } } }
            const nestedData = formData[key] || {};
            const result = checkCondition(value, nestedData);
            
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔧 Checking nested condition for ${key}:`, {
                    nestedData,
                    condition: value,
                    result,
                    fullFormData: formData
                });
            }
            
            return result;
        }
        return true;
    });
};

// Generate initial values based on schema (recursive for nested objects)
const generateInitialValues = (schema: any, initialData?: FormData, parentKey?: string): FormData => {
    const initialValues: FormData = {};

    if (schema?.properties) {
        Object.entries(schema.properties).forEach(([key, property]: [string, any]) => {
            const fullKey = parentKey ? `${parentKey}.${key}` : key;
            
            if (initialData && getNestedValue(initialData, fullKey) !== undefined) {
                // Use existing data if available
                setNestedValue(initialValues, fullKey, getNestedValue(initialData, fullKey));
            } else if (property?.default !== undefined) {
                // Use schema default value
                setNestedValue(initialValues, fullKey, property.default);
            } else if (property?.type === 'object' && property?.properties) {
                // Recursively handle nested objects
                const nestedDefaults = generateInitialValues(property, initialData, fullKey);
                Object.assign(initialValues, nestedDefaults);
            } else if (property?.type === 'array') {
                // Initialize arrays as empty
                setNestedValue(initialValues, fullKey, property?.default || []);
            } else if (property?.type === 'boolean') {
                // Initialize booleans with their default or false
                setNestedValue(initialValues, fullKey, property?.default ?? false);
            } else {
                // Initialize other types as empty string
                setNestedValue(initialValues, fullKey, '');
            }
        });
    }

    return initialValues;
};

/**
 * TargetPopUp Component - Optimized to prevent excessive rerenders
 * 
 * Key optimizations implemented:
 * 1. Memoized watched form values to prevent unnecessary recalculations
 * 2. Debounced form data updates (100ms) to reduce update frequency
 * 3. Debounced auto-sync operations (150ms) to prevent cascading updates
 * 4. Reference-based comparison for schema resolution to avoid unnecessary updates
 * 5. Memoized callback functions to prevent child component rerenders
 * 6. Optimized useEffect dependencies to minimize effect executions
 * 7. Removed excessive debug logging in production
 * 8. Added ref-based tracking to prevent duplicate operations
 */
export const TargetPopUp: React.FC<TargetPopUpProps> = ({
    onSubmit,
    onClose,
    initialData,
    onSourceUpdate,
    nodeId,
    isOpen,
    source,
    sourceColumns,
    onFormDataChange
}) => {
    const dispatch = useAppDispatch();
    const [baseSchema, setBaseSchema] = useState<any>(null);
    const [resolvedSchema, setResolvedSchema] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAdvanced, setIsAdvanced] = useState<boolean>(false);
    const [isAdvancedExpanded, setIsAdvancedExpanded] = useState<boolean>(false);
    const { connectionConfigList } = useAppSelector((state) => state.datasource);
    const { isRightPanelOpen, selectedEngineType } = useAppSelector((state) => state.buildPipeline);
    const hasGeneratedDataSrcId = useRef<boolean>(false);
    const [isInlineMode, setIsInlineMode] = useState<boolean>(false);
    const { pipelineJson } = usePipelineContext();

    // Extract writer schema from pipeline schema based on engine type
    useEffect(() => {
        const loadSchema = () => {
            setIsLoading(true);
            try {
                const writerSchema = extractWriterSchema(selectedEngineType);
                if (writerSchema) {
                    setBaseSchema(writerSchema);
                    console.log('🔧 Extracted writer schema for engine:', selectedEngineType, writerSchema);
                    
                    // Debug the allOf conditions in the writer schema
                    if (writerSchema.allOf) {
                        console.log('🔧 Writer schema has allOf conditions:', writerSchema.allOf.length);
                        writerSchema.allOf.forEach((condition: any, index: number) => {
                            if (condition.if?.properties?.file_type) {
                                console.log(`🔧 Found file_type condition at index ${index}:`, condition);
                            }
                            if (condition.then?.allOf) {
                                console.log(`🔧 Condition ${index} has nested allOf:`, condition.then.allOf.length);
                                condition.then.allOf.forEach((nestedCondition: any, nestedIndex: number) => {
                                    if (nestedCondition.if?.properties?.file_type) {
                                        console.log(`🔧 Found nested file_type condition at ${index}.${nestedIndex}:`, nestedCondition);
                                    }
                                });
                            }
                        });
                    } else {
                        console.log('🔧 Writer schema has NO allOf conditions');
                    }
                } else {
                    toast.error(`Failed to extract writer schema for engine: ${selectedEngineType}`);
                }
            } catch (error) {
                console.error('Failed to extract writer schema:', error);
                toast.error('Failed to extract writer schema');
            } finally {
                setIsLoading(false);
            }
        };

        loadSchema();
    }, [selectedEngineType]); // Re-extract when engine type changes

    // Fetch connection list on component mount
    useEffect(() => {
        dispatch(getConnectionConfigList());
    }, [dispatch]);

    // Determine if we're in inline mode (used in chat panel) or modal mode (used in canvas)
    useEffect(() => {
        // When isOpen is false but we still want to render the component,
        // we're in inline mode (used in the chat panel)
        const inlineMode = isOpen === false;
        setIsInlineMode(inlineMode);
        // console.log('TargetPopUp mode:', inlineMode ? 'inline (chat panel)' : 'modal (canvas)');
    }, [isOpen]);

    // Watch form data changes and resolve conditional schema
    const [formData, setFormData] = useState<FormData>({});

    // Memoize initial values to prevent form re-initialization
    const memoizedInitialValues = useMemo(() => {
        console.log('🔧 TargetPopUp - Generating memoized initial values:', {
            initialData,
            hasInitialData: initialData && Object.keys(initialData).length > 0,
            nodeId,
            baseSchema: !!baseSchema
        });
        
        let values: FormData;
        
        // Use transformation-specific initial values generation for Target/Writer
        if (initialData && Object.keys(initialData).length > 0) {
            // Check if initialData is already properly structured (from DataPipelineCanvasNew)
            const isAlreadyProcessed = initialData.target && 
                                     initialData.target.target_type && 
                                     initialData.file_type &&
                                     initialData.transformation;
            
            if (isAlreadyProcessed) {
                console.log('🔧 TargetPopUp - Using already processed initial data:', {
                    initialData,
                    targetType: initialData.target?.target_type,
                    fileType: initialData.file_type,
                    connectionConfigId: initialData.target?.connection?.connection_config_id,
                    transformation: initialData.transformation,
                    taskId: initialData.task_id,
                    fullTargetObject: initialData.target,
                    fullConnectionObject: initialData.target?.connection
                });
                values = initialData;
            } else {
                // Process raw data using transformation initial values generation
                const generated = generateTransformationInitialValues({ title: 'Target' }, initialData, nodeId || '');
                values = generated;
            }
        } else {
            // Fallback to schema-based generation if no initial data
            const fallback = generateInitialValues(baseSchema, initialData);
            console.log('🔧 TargetPopUp - Generated fallback initial values:', fallback);
            values = fallback;
        }
        
        
        // Also set target_name to match name if not already set
        if (!values.target?.target_name && values.name) {
            if (!values.target) values.target = {};
            values.target.target_name = values.name;
            console.log('🔧 TargetPopUp - Set default target_name to match name:', values.name);
        }
        
        return values;
    }, [baseSchema, initialData, nodeId]);

    // Initialize form with react-hook-form (start with base schema)
    const form = useForm({
        resolver: zodResolver(createTargetFormSchema()),
        defaultValues: memoizedInitialValues,
        mode: 'onChange',
        // Ensure values are preserved during validation
        shouldUnregister: false
    });

    // Watch specific form values that affect schema resolution (memoized to prevent unnecessary rerenders)
    const targetType = form.watch('target.target_type');
    const loadMode = form.watch('target.load_mode');
    const fileType = form.watch('file_type');
    
    // Memoize watched values to prevent unnecessary recalculations
    const watchedValues = useMemo(() => ({
        targetType,
        loadMode,
        fileType
    }), [targetType, loadMode, fileType]);
    
    // Reset form when initial values change (optimized to prevent unnecessary rerenders)
    const hasInitializedForm = useRef(false);
    useEffect(() => {
        if (memoizedInitialValues && Object.keys(memoizedInitialValues).length > 0 && !hasInitializedForm.current) {
            console.log('🔧 Resetting form with initial values:', memoizedInitialValues);
            console.log('🔧 Form reset - Initial value checks:', {
                hasTargetConnection: !!memoizedInitialValues?.target?.connection,
                connectionConfigId: memoizedInitialValues?.target?.connection?.connection_config_id,
                fullConnectionObject: memoizedInitialValues?.target?.connection,
                targetType: memoizedInitialValues?.target?.target_type,
                fileType: memoizedInitialValues?.file_type,
                transformation: memoizedInitialValues?.transformation,
                taskId: memoizedInitialValues?.task_id,
                hasTarget: !!memoizedInitialValues?.target,
                targetKeys: memoizedInitialValues?.target ? Object.keys(memoizedInitialValues.target) : []
            });
            
            form.reset(memoizedInitialValues, {
                keepDefaultValues: false,
                keepValues: false,
                keepDirty: false,
                keepTouched: false,
                keepIsSubmitted: false,
                keepErrors: false,
                keepIsValid: false,
                keepSubmitCount: false
            });
            
            // Ensure critical values are set after reset
            setTimeout(() => {
                const currentValues = form.getValues();
                console.log('🔧 Values after form reset:', {
                    targetType: currentValues?.target?.target_type,
                    connectionConfigId: currentValues?.target?.connection?.connection_config_id,
                    fileType: currentValues?.file_type,
                    fullTarget: currentValues?.target,
                    fullConnection: currentValues?.target?.connection
                });
                
                // If critical values are missing, set them explicitly
                if (!currentValues?.target?.target_type && memoizedInitialValues?.target?.target_type) {
                    console.log('🔧 Setting missing target_type:', memoizedInitialValues.target.target_type);
                    form.setValue('target.target_type', memoizedInitialValues.target.target_type);
                }
                
                if (!currentValues?.target?.connection?.connection_config_id && memoizedInitialValues?.target?.connection?.connection_config_id) {
                    console.log('🔧 Setting missing connection_config_id:', memoizedInitialValues.target.connection.connection_config_id);
                    form.setValue('target.connection.connection_config_id', memoizedInitialValues.target.connection.connection_config_id);
                }
                
                if (!currentValues?.file_type && memoizedInitialValues?.file_type) {
                    console.log('🔧 Setting missing file_type:', memoizedInitialValues.file_type);
                    form.setValue('file_type', memoizedInitialValues.file_type);
                }
            }, 50);
            hasInitializedForm.current = true;
            
            // Force a re-render after form reset to ensure connection field gets the value
            setTimeout(() => {
                const currentConnectionValue = form.getValues('target.connection');
                console.log('🔧 Connection value after form reset:', currentConnectionValue);
            }, 100);
        }
    }, [memoizedInitialValues, form]);
    
    // Memoize the resolved schema based on watched form values
    const memoizedResolvedSchema = useMemo(() => {
        if (!baseSchema) return null;
        
        // Use watched form values for schema resolution
        // The form data structure should match what the conditions expect
        const schemaFormData = {
            target: {
                target_type: watchedValues.targetType,
                load_mode: watchedValues.loadMode
            },
            file_type: watchedValues.fileType
        };
        
        console.log('🔧 BEFORE SCHEMA RESOLUTION:', {
            baseSchema: baseSchema,
            schemaFormData,
            watchedValues,
            baseSchemaAllOf: baseSchema?.allOf?.length || 0
        });
        
        const resolved = resolveConditionalSchema(baseSchema, schemaFormData);
        
        console.log('🔧 AFTER SCHEMA RESOLUTION:', {
            resolvedSchema: resolved,
            hasWriteOptions: !!resolved?.properties?.write_options,
            resolvedProperties: Object.keys(resolved?.properties || {}),
            resolvedAllOf: resolved?.allOf?.length || 0
        });
        
        if (process.env.NODE_ENV === 'development') {
            console.log('🔧 Schema resolution details:', {
                baseSchema: baseSchema,
                schemaFormData,
                resolvedSchema: resolved,
                targetType,
                loadMode,
                fileType,
                hasWriteOptions: !!resolved?.properties?.write_options,
                writeOptionsProperties: resolved?.properties?.write_options?.properties ? Object.keys(resolved.properties.write_options.properties) : [],
                baseSchemaAllOf: baseSchema?.allOf?.length || 0,
                resolvedAllOf: resolved?.allOf?.length || 0,
                baseSchemaHasFileTypeConditions: baseSchema?.allOf?.some((condition: any) => 
                    condition?.if?.properties?.file_type || 
                    condition?.then?.allOf?.some((subCondition: any) => subCondition?.if?.properties?.file_type)
                )
            });
        }
        
        // Ensure essential properties are always available
        if (resolved && resolved.properties) {
            // Make sure target properties are always available
            if (!resolved.properties.target) {
                resolved.properties.target = baseSchema.properties?.target || {
                    type: 'object',
                    properties: {
                        target_name: { type: 'string', title: 'Target Name' },
                        target_type: { type: 'string', enum: ['File', 'Relational'], title: 'Target Type' },
                        connection: { type: 'object', properties: { connection_config_id: { type: 'string', title: 'Connection' } } },
                        load_mode: { type: 'string', enum: ['append', 'merge', 'overwrite', 'ignore', 'error'], title: 'Load Mode' }
                    }
                };
            }
            
            // Make sure file_type is available when target_type is File
            if (watchedValues.targetType === 'File' && !resolved.properties.file_type) {
                resolved.properties.file_type = baseSchema.properties?.file_type || {
                    type: 'string',
                    enum: ['CSV', 'JSON', 'Parquet', 'ORC', 'Avro', 'Excel', 'XML', 'FixedWidth'],
                    title: 'File Type'
                };
            }
        }
        
        return resolved;
    }, [baseSchema, watchedValues]);
    
    // Optimized schema resolution effect - only update when schema actually changes
    const lastResolvedSchemaRef = useRef<any>(null);
    useEffect(() => {
        if (memoizedResolvedSchema && memoizedResolvedSchema !== lastResolvedSchemaRef.current) {
            setResolvedSchema(memoizedResolvedSchema);
            lastResolvedSchemaRef.current = memoizedResolvedSchema;
            
            // Debug: Log available properties after schema resolution
            if (process.env.NODE_ENV === 'development') {
                console.log('🔧 Schema resolved with properties:', {
                    resolvedProperties: Object.keys(memoizedResolvedSchema?.properties || {}),
                    hasWriteOptions: !!memoizedResolvedSchema?.properties?.write_options,
                    currentValues: watchedValues
                });
            }
        }
    }, [memoizedResolvedSchema, watchedValues]);
    
    // Optimized formData update - use debounced approach to prevent excessive updates
    const formDataUpdateTimeoutRef = useRef<NodeJS.Timeout>();
    useEffect(() => {
        // Clear previous timeout
        if (formDataUpdateTimeoutRef.current) {
            clearTimeout(formDataUpdateTimeoutRef.current);
        }
        
        // Debounce the form data update
        formDataUpdateTimeoutRef.current = setTimeout(() => {
            const currentFormData = form.getValues();
            setFormData(currentFormData);
            
            // Debug file_type selection specifically (only in development)
            if (process.env.NODE_ENV === 'development' && watchedValues.fileType) {
                console.log('🔧 FILE_TYPE SELECTED:', {
                    watchedValues,
                    hasWriteOptions: !!memoizedResolvedSchema?.properties?.write_options
                });
            }
            
            if (onFormDataChange) {
                onFormDataChange(currentFormData);
            }
        }, 100); // 100ms debounce
        
        return () => {
            if (formDataUpdateTimeoutRef.current) {
                clearTimeout(formDataUpdateTimeoutRef.current);
            }
        };
    }, [watchedValues, form, onFormDataChange, memoizedResolvedSchema]);

    // Optimized auto-sync with debouncing to prevent excessive rerenders
    const syncTimeoutRef = useRef<NodeJS.Timeout>();
    const lastSyncedValuesRef = useRef<{name?: string, targetName?: string, targetType?: string}>({});
    
    useEffect(() => {
        const subscription = form.watch((value, { name: fieldName }) => {
            // React Hook Form sometimes emits with undefined fieldName. Handle that too.
            if (!fieldName || fieldName === 'name' || fieldName === 'target.target_name') {
                // Prefer the field that actually changed when available
                const computedName = fieldName === 'name' 
                    ? value?.name 
                    : fieldName === 'target.target_name'
                    ? value?.target?.target_name 
                    : (value?.name ?? value?.target?.target_name);

                const nameValue = computedName ?? '';
                
                // Clear previous timeout
                if (syncTimeoutRef.current) {
                    clearTimeout(syncTimeoutRef.current);
                }
                
                // Debounce the sync operation
                syncTimeoutRef.current = setTimeout(() => {
                    if (nameValue && (
                        lastSyncedValuesRef.current.name !== nameValue ||
                        lastSyncedValuesRef.current.targetName !== nameValue ||
                        lastSyncedValuesRef.current.targetType !== watchedValues.targetType
                    )) {
                        // Keep name and target.target_name in sync (bidirectional)
                        if ((fieldName === 'name' || !fieldName) && value?.target?.target_name !== nameValue) {
                            form.setValue('target.target_name', nameValue, { shouldValidate: false, shouldDirty: true });
                        }
                        if ((fieldName === 'target.target_name' || !fieldName) && value?.name !== nameValue) {
                            form.setValue('name', nameValue, { shouldValidate: false, shouldDirty: true });
                        }
                        
                        // Sync file/table names based on target type
                        if (watchedValues.targetType === 'File') {
                            if (form.getValues('target.file_name') !== nameValue) {
                                form.setValue('target.file_name', nameValue, { shouldValidate: false, shouldDirty: true });
                            }
                        } else if (watchedValues.targetType === 'Relational') {
                            if (form.getValues('target.table_name') !== nameValue) {
                                form.setValue('target.table_name', nameValue, { shouldValidate: false, shouldDirty: true });
                            }
                        }
                        
                        // Update last synced values
                        lastSyncedValuesRef.current = {
                            name: nameValue,
                            targetName: nameValue,
                            targetType: watchedValues.targetType
                        };
                    }
                }, 120); // slight debounce to avoid excessive rerenders
            }
        });

        return () => {
            subscription.unsubscribe();
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [form, watchedValues.targetType]);

    // Optimized form reset when initialData changes - prevent unnecessary resets
    const lastInitialDataRef = useRef<string>('');
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0 && baseSchema) {
            const initialDataString = JSON.stringify(initialData);
            
            // Only process if initialData actually changed
            if (initialDataString !== lastInitialDataRef.current) {
                const newInitialValues = generateTransformationInitialValues({ title: 'Target' }, initialData, nodeId || '');
                
                // Only reset if the new values are different from current values
                const currentValues = form.getValues();
                const isDifferent = JSON.stringify(currentValues) !== JSON.stringify(newInitialValues);
                
                if (isDifferent) {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('🔧 TargetPopUp - Resetting form with new initial data');
                        console.log('🔧 New initial values connection check:', {
                            hasTargetConnection: !!newInitialValues?.target?.connection,
                            connectionConfigId: newInitialValues?.target?.connection?.connection_config_id,
                            fullConnectionObject: newInitialValues?.target?.connection
                        });
                    }
                    
                    form.reset(newInitialValues, {
                        keepDefaultValues: false,
                        keepValues: false,
                        keepErrors: false,
                        keepDirty: false,
                        keepIsSubmitted: false,
                        keepTouched: false,
                        keepIsValid: false,
                        keepSubmitCount: false
                    });
                    
                    // Ensure critical values are set after reset
                    setTimeout(() => {
                        const currentValues = form.getValues();
                        console.log('🔧 Values after data change reset:', {
                            targetType: currentValues?.target?.target_type,
                            connectionConfigId: currentValues?.target?.connection?.connection_config_id,
                            fileType: currentValues?.file_type,
                            fullTarget: currentValues?.target,
                            fullConnection: currentValues?.target?.connection
                        });
                        
                        // If critical values are missing, set them explicitly
                        if (!currentValues?.target?.target_type && newInitialValues?.target?.target_type) {
                            console.log('🔧 Setting missing target_type after data change:', newInitialValues.target.target_type);
                            form.setValue('target.target_type', newInitialValues.target.target_type);
                        }
                        
                        if (!currentValues?.target?.connection?.connection_config_id && newInitialValues?.target?.connection?.connection_config_id) {
                            console.log('🔧 Setting missing connection_config_id after data change:', newInitialValues.target.connection.connection_config_id);
                            form.setValue('target.connection.connection_config_id', newInitialValues.target.connection.connection_config_id);
                        }
                        
                        if (!currentValues?.file_type && newInitialValues?.file_type) {
                            console.log('🔧 Setting missing file_type after data change:', newInitialValues.file_type);
                            form.setValue('file_type', newInitialValues.file_type);
                        }
                    }, 50);
                    
                    // Reset the initialization flag to allow the first useEffect to run again if needed
                    hasInitializedForm.current = true;
                    
                    // Verify connection value after reset
                    setTimeout(() => {
                        const connectionValue = form.getValues('target.connection');
                        console.log('🔧 Connection value after data change reset:', connectionValue);
                    }, 100);
                }
                
                lastInitialDataRef.current = initialDataString;
            }
        }
    }, [initialData, nodeId, form, baseSchema]);

    // Add a function to filter connections based on target type (memoized)
    const getFilteredConnections = useCallback(() => {
        if (!watchedValues.targetType) {
            console.log('🔧 TargetPopUp - No target type selected, showing all connections');
            return Array.isArray(connectionConfigList) ? connectionConfigList : [];
        }

        const filteredConnections = Array.isArray(connectionConfigList) ? connectionConfigList.filter(conn => {
            if (watchedValues.targetType === 'File') {
                // For File type, show only S3 and Local connections
                // Check connection_type field and also connection names for S3/local keywords
                const isFileConnection = conn.connection_type === 's3' || 
                                        conn.connection_type === 'local' ||
                                        conn.connection_type === 'S3' ||
                                        conn.connection_type === 'Local' ||
                                        (conn.connection_config_name && 
                                         (conn.connection_config_name.toLowerCase().includes('s3') || 
                                          conn.connection_config_name.toLowerCase().includes('local'))) ||
                                        (conn.connection_name && 
                                         (conn.connection_name.toLowerCase().includes('s3') || 
                                          conn.connection_name.toLowerCase().includes('local')));
                
                console.log('🔧 TargetPopUp - File connection check:', {
                    connectionName: conn.connection_config_name || conn.connection_name,
                    connectionType: conn.connection_type,
                    isFileConnection,
                    connectionId: conn.id
                });
                return isFileConnection;
            } else if (watchedValues.targetType === 'Relational') {
                // For Relational type, show all except S3 and Local
                const isNotFileConnection = conn.connection_type !== 's3' && 
                                          conn.connection_type !== 'local' &&
                                          conn.connection_type !== 'S3' &&
                                          conn.connection_type !== 'Local' &&
                                          !(conn.connection_config_name && 
                                            (conn.connection_config_name.toLowerCase().includes('s3') || 
                                             conn.connection_config_name.toLowerCase().includes('local'))) &&
                                          !(conn.connection_name && 
                                            (conn.connection_name.toLowerCase().includes('s3') || 
                                             conn.connection_name.toLowerCase().includes('local')));
                
                console.log('🔧 TargetPopUp - Relational connection check:', {
                    connectionName: conn.connection_config_name || conn.connection_name,
                    connectionType: conn.connection_type,
                    isNotFileConnection,
                    connectionId: conn.id
                });
                return isNotFileConnection;
            }
            return false;
        }) : [];

        console.log('🔧 TargetPopUp - Filtered connections:', {
            targetType: watchedValues.targetType,
            totalConnections: connectionConfigList?.length || 0,
            filteredCount: filteredConnections.length,
            filteredConnections: filteredConnections.map(c => ({
                name: c.connection_config_name || c.connection_name,
                type: c.connection_type || c.type,
                id: c.id
            }))
        });

        return filteredConnections;
    }, [watchedValues.targetType, connectionConfigList]);

    // Ensure connection field gets proper initial value after schema resolution
    useEffect(() => {
        if (resolvedSchema && memoizedInitialValues?.target?.connection?.connection_config_id) {
            const currentConnectionValue = form.getValues('target.connection');
            const expectedConnectionId = memoizedInitialValues.target.connection.connection_config_id;
            
            // If the connection field is empty but we have an expected value, set it
            if (!currentConnectionValue?.connection_config_id && expectedConnectionId) {
                console.log('🔧 Setting missing connection value:', {
                    expectedConnectionId,
                    currentConnectionValue,
                    fullExpectedConnection: memoizedInitialValues.target.connection
                });
                
                form.setValue('target.connection', memoizedInitialValues.target.connection, {
                    shouldValidate: true,
                    shouldDirty: false,
                    shouldTouch: false
                });
            }
        }
    }, [resolvedSchema, memoizedInitialValues, form]);

    // Note: renderFormField function removed - now using FieldRenderer component instead

    // Handle form submission (memoized to prevent unnecessary rerenders)
    const handleSubmit = useCallback(async (data: FormData) => {
        setIsSubmitting(true);
        console.log('🔧 TargetPopUp - Form submitted with data:', data);
        
        // Use form.getValues() as fallback if data is empty or incomplete
        const formValues = form.getValues();
        const formData = (data && Object.keys(data).length > 0) ? data : formValues;
        
        // Validate required fields
        const errors: Record<string, string> = {};
        if (!formData.name) errors.name = "Name is required";
        if (!formData.target?.target_type) errors["target.target_type"] = "Target type is required";
        if (!formData.target?.load_mode) errors["target.load_mode"] = "Load mode is required";
        
        if (Object.keys(errors).length > 0) {
            console.error('Form validation errors:', errors);
            toast.error("Please fill all required fields");
            setIsSubmitting(false);
            return;
        }

        try {
            console.log('Finding connection data for ID:', formData.target?.connection?.connection_config_id);
            const connectionData = Array.isArray(connectionConfigList) ? 
                connectionConfigList.find(conn => {
                    const connId = String(conn.id);
                    const formId = String(formData.target?.connection?.connection_config_id);
                    console.log('🔧 TARGET CONNECTION DEBUG - Comparing IDs:', { connId, formId, match: connId === formId });
                    return connId === formId;
                }) : null;
            // Create connection object directly from custom_metadata and add connection_config_id
            let connection = {};
            
            if (connectionData?.custom_metadata) {
                // Use custom_metadata as the base connection object
                connection = {
                    ...connectionData.custom_metadata,
                    // Add the connection_config_id
                    connection_config_id: formData.target?.connection?.connection_config_id
                };
                console.log('🔧 TARGET CONNECTION DEBUG - Using custom_metadata as connection base');
            } else {
                // Fallback if no custom_metadata
                connection = {
                    name: connectionData?.connection_config_name || connectionData?.name || 'Unknown',
                    connection_type: connectionData?.connection_type || 'Local',
                    connection_config_id: formData.target?.connection?.connection_config_id,
                    // Preserve any existing connection data from form
                    ...formData.target?.connection
                };
                console.log('🔧 TARGET CONNECTION DEBUG - Using fallback connection structure');
            }
            
            // Ensure we have a connection_type (required for optimization function)
            if (!connection.connection_type) {
                // Try to get connection_type from the connectionData itself
                connection.connection_type = connectionData?.connection_type || 
                                           connectionData?.custom_metadata?.connection_type ||
                                           connectionData?.type ||
                                           // Fallback based on target type
                                           (formData.target?.target_type === 'Relational' ? 'PostgreSQL' : 'Local');
            }
            
            // Clean up the connection object - remove undefined values
            Object.keys(connection).forEach(key => {
                if (connection[key] === undefined || connection[key] === null) {
                    delete connection[key];
                }
            });
            // Create a properly structured source data object that matches the expected initialization format
            const targetTitle = formData.target?.target_name || formData.name || 'Unnamed Target';
            
            const sourceData: any = {
                nodeId,
                // Structure data to match what initialization expects
                label: targetTitle,
                title: targetTitle,
                name: formData.name || 'Target', // Keep the transformation name
                target: {
                    target_type: formData.target?.target_type || 'File',
                    target_name: formData.target?.target_name || '',
                    table_name: formData.target?.table_name || '',
                    file_name: formData.target?.file_name || '',
                    load_mode: formData.target?.load_mode || 'append',
                    connection: connection || {}
                },
                source: {
                    name: targetTitle,
                    target_type: formData.target?.target_type || 'File',
                    target_name: formData.target?.target_name || '',
                    connection: connection || {},
                    load_mode: formData.target?.load_mode || 'append'
                },
                transformationData: {
                    write_options: formData.write_options || {
                        header: true,
                        sep: ","
                    }
                }
            };
            
            // Add target-type specific fields to both target and source objects
            if (formData.target?.target_type === 'Relational') {
                sourceData.target.table_name = formData.target?.table_name || '';
                sourceData.source.table_name = formData.target?.table_name || '';
            } else if (formData.target?.target_type === 'File') {
                sourceData.target.file_name = formData.target?.file_name || '';
                sourceData.source.file_name = formData.target?.file_name || '';
                sourceData.target.file_type = formData.file_type || 'CSV';
                sourceData.source.file_type = formData.file_type || 'CSV';
            }
            
            console.log('🔧 TargetPopUp - Sending source data to parent component:', JSON.stringify(sourceData, null, 2));
            console.log('🔧 TargetPopUp - Submit function exists:', !!(onSubmit || onSourceUpdate));
            console.log('🔧 TargetPopUp - Connection data details:', {
                hasConnection: !!connection,
                connectionConfigId: connection?.connection_config_id,
                connectionType: connection?.connection_type,
                connectionName: connection?.connection_config_name
            });
            
            try {
                // Use onSubmit if available (for canvas mode), otherwise use onSourceUpdate (for chat panel mode)
                const submitFunction = onSubmit || onSourceUpdate;
                if (submitFunction) {
                    console.log('🔧 TargetPopUp - Calling submit function with data');
                    console.log('🔧 TargetPopUp - Form data being saved:', formData);
                    console.log('🔧 TargetPopUp - Source data structure:', sourceData);
                    submitFunction(sourceData);
                    console.log('🔧 TargetPopUp - Submit function called successfully');
                } else {
                    console.error('No submit function is defined (onSubmit or onSourceUpdate)');
                }
                onClose();
                toast.success("Target configuration saved successfully");
            } catch (error) {
                console.error('Error calling onSourceUpdate:', error);
                // Still try to close the form to avoid blocking the user
                onClose();
                toast.error("Error saving configuration, but form closed");
            }
        } catch (error) {
            console.error('Error during form submission:', error);
            toast.error('Failed to save configuration');
        } finally {
            setIsSubmitting(false);
        }
    }, [form, connectionConfigList, onSubmit, onSourceUpdate, onClose, nodeId]);

    // Show loading state while schema is loading
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-sm text-gray-500">Loading schema...</div>
            </div>
        );
    }

    // If schema failed to load, show error but still allow the dialog to open
    if (!baseSchema) {
        console.error('🔧 Base schema is null, cannot render form properly');
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <h2 className="text-lg font-semibold">Target Configuration</h2>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-8">
                        <div className="text-center">
                            <div className="text-sm text-red-500 mb-2">Failed to load schema</div>
                            <div className="text-xs text-gray-500">Please check the console for more details</div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    // If resolved schema is not available, use base schema as fallback
    const schemaToUse = resolvedSchema || baseSchema;

    // Additional safety check - if schemaToUse is still null or doesn't have properties, return error
    if (!schemaToUse || !schemaToUse.properties) {
        console.error('🔧 Schema is null or missing properties:', { schemaToUse, hasProperties: !!schemaToUse?.properties });
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <h2 className="text-lg font-semibold">Target Configuration</h2>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-8">
                        <div className="text-center">
                            <div className="text-sm text-red-500 mb-2">Schema not available</div>
                            <div className="text-xs text-gray-500">
                                {!schemaToUse ? 'Schema is null' : 'Schema missing properties'}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    // Get required fields from schema
    const requiredFields = schemaToUse?.required || [];

    /**
     * This is the main rendering logic for the component.
     * 
     * We have three rendering modes:
     * 1. Card mode (when isOpen is false) - used in the chat panel
     * 2. Inline mode (when isInlineMode is true) - alternative for chat panel
     * 3. Dialog mode (default) - used in the canvas
     */
    
    /**
     * Inline mode rendering (used in chat panel)
     * 
     * When isOpen is false but we still want to show the form,
     * we render it directly in the parent component without the dialog wrapper.
     * This is used in the chat panel where the form is embedded in the message.
     */
    if (isInlineMode) {
        return (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full">
                    {/* Content */}
                    <div className="flex-1 overflow-auto px-2 py-1 space-y-3">
                        {/* Basic Info Section */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <div className="h-3 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                                <h3 className="text-xs font-medium text-gray-700">Basic Information</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg">
                                {schemaToUse?.properties?.name && (
                                    <FieldRenderer
                                        fieldKey="name"
                                        field={schemaToUse.properties.name}
                                        form={form}
                                        isRequired={requiredFields.includes('name')}
                                        sourceColumns={sourceColumns}
                                    />
                                )}
                                {schemaToUse?.properties?.target?.properties?.target_name && (
                                    <FieldRenderer
                                        fieldKey="target_name"
                                        field={schemaToUse.properties.target.properties.target_name}
                                        form={form}
                                        parentKey="target"
                                        isRequired={requiredFields.includes('target_name')}
                                        sourceColumns={sourceColumns}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Target Config Section */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <div className="h-3 w-1 bg-gradient-to-b from-green-500 to-green-600 rounded-full" />
                                <h3 className="text-xs font-medium text-gray-700">Target Configuration</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg">
                                    {schemaToUse?.properties?.target?.properties?.target_type && (
                                        <FieldRenderer
                                            fieldKey="target_type"
                                            field={schemaToUse.properties.target.properties.target_type}
                                            form={form}
                                            parentKey="target"
                                            isRequired={requiredFields.includes('target_type')}
                                            sourceColumns={sourceColumns}
                                        />
                                    )}
                                    {schemaToUse?.properties?.target?.properties?.load_mode && (
                                        <FieldRenderer
                                            fieldKey="load_mode"
                                            field={schemaToUse.properties.target.properties.load_mode}
                                            form={form}
                                            parentKey="target"
                                            isRequired={requiredFields.includes('load_mode')}
                                            sourceColumns={sourceColumns}
                                        />
                                    )}
                                </div>

                                <div className="p-2 bg-gray-50 rounded-lg">
                                    {schemaToUse?.properties?.target?.properties?.connection && (
                                        <FieldRenderer
                                            key={`connection-inline-${memoizedInitialValues?.target?.connection?.connection_config_id || 'empty'}`}
                                            fieldKey="connection"
                                            field={schemaToUse.properties.target.properties.connection}
                                            form={form}
                                            parentKey="target"
                                            isRequired={requiredFields.includes('connection')}
                                            sourceColumns={sourceColumns}
                                            customEndpointOptions={getFilteredConnections()}
                                        />
                                    )}
                                </div>

                                {loadMode === 'merge' && resolvedSchema?.properties?.target?.properties?.merge_keys && (
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <ArrayField
                                            field={resolvedSchema.properties.target.properties.merge_keys}
                                            fieldKey="merge_keys"
                                            form={form}
                                            parentPath="target"
                                            isRequired={requiredFields.includes('merge_keys')}
                                            title="Merge Keys"
                                            sourceColumns={sourceColumns}
                                        />
                                    </div>
                                )}

                                {targetType === 'File' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg">
                                            {resolvedSchema?.properties?.target?.properties?.file_name && (
                                                <FieldRenderer
                                                    fieldKey="file_name"
                                                    field={resolvedSchema.properties.target.properties.file_name}
                                                    form={form}
                                                    parentKey="target"
                                                    isRequired={requiredFields.includes('file_name')}
                                                    sourceColumns={sourceColumns}
                                                />
                                            )}
                                            {resolvedSchema?.properties?.file_type && (
                                                <FieldRenderer
                                                    fieldKey="file_type"
                                                    field={resolvedSchema.properties.file_type}
                                                    form={form}
                                                    isRequired={requiredFields.includes('file_type')}
                                                    sourceColumns={sourceColumns}
                                                />
                                            )}
                                        </div>


                                    </>
                                )}

                                {targetType === 'Relational' && (
                                    <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg">
                                        {(() => {
                                            console.log('🔧 TargetPopUp - Relational section debug:', {
                                                targetType,
                                                hasResolvedSchema: !!resolvedSchema,
                                                hasTargetProperties: !!resolvedSchema?.properties?.target?.properties,
                                                hasTableName: !!resolvedSchema?.properties?.target?.properties?.table_name,
                                                tableNameField: resolvedSchema?.properties?.target?.properties?.table_name,
                                                currentTableNameValue: form.getValues('target.table_name')
                                            });
                                            return null;
                                        })()}
                                        {resolvedSchema?.properties?.target?.properties?.table_name ? (
                                            <FieldRenderer
                                                fieldKey="table_name"
                                                field={resolvedSchema.properties.target.properties.table_name}
                                                form={form}
                                                parentKey="target"
                                                isRequired={requiredFields.includes('table_name')}
                                                sourceColumns={sourceColumns}
                                            />
                                        ) : (
                                            // Fallback table_name field if not in schema
                                            <FieldRenderer
                                                fieldKey="table_name"
                                                field={{
                                                    type: 'string',
                                                    title: 'Table Name',
                                                    description: 'Name of the target table'
                                                }}
                                                form={form}
                                                parentKey="target"
                                                isRequired={true}
                                                sourceColumns={sourceColumns}
                                            />
                                        )}
                                        {resolvedSchema?.properties?.target?.properties?.schema_name && (
                                            <FieldRenderer
                                                fieldKey="schema_name"
                                                field={resolvedSchema.properties.target.properties.schema_name}
                                                form={form}
                                                parentKey="target"
                                                isRequired={requiredFields.includes('schema_name')}
                                                sourceColumns={sourceColumns}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Advanced Section for inline mode */}
                            {resolvedSchema?.properties?.write_options && (
                                <div className="space-y-2">
                                    <Collapsible open={isAdvancedExpanded} onOpenChange={setIsAdvancedExpanded}>
                                        <CollapsibleTrigger asChild>
                                            <div className="text-blue-600 flex items-center gap-2 cursor-pointer">
                                                <span className="text-xs font-medium">Advanced Options</span>
                                                <span>{isAdvancedExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}</span>
                                            </div>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="mt-2">
                                            <div className="p-2 bg-gray-50 rounded-lg">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                                    {fileType} Write Options
                                                </h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {(() => {
                                                        // Handle both direct properties and items.properties structure
                                                        const writeOptionsSchema = resolvedSchema.properties.write_options;
                                                        const properties = writeOptionsSchema.properties || writeOptionsSchema.items?.properties || {};
                                                        const required = writeOptionsSchema.required || writeOptionsSchema.items?.required || [];
                                                        
                                                        console.log('🔧 Rendering write_options in Advanced section (inline mode):', {
                                                            writeOptionsSchema,
                                                            properties: Object.keys(properties),
                                                            required,
                                                            hasDirectProperties: !!writeOptionsSchema.properties,
                                                            hasItemsProperties: !!writeOptionsSchema.items?.properties
                                                        });
                                                        
                                                        return Object.entries(properties).map(([key, field]: [string, any]) => (
                                                            <FieldRenderer
                                                                key={key}
                                                                fieldKey={key}
                                                                field={field}
                                                                form={form}
                                                                parentKey="write_options"
                                                                isRequired={required.includes(key)}
                                                                sourceColumns={sourceColumns}
                                                            />
                                                        ));
                                                    })()}
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-1 px-2 py-2 border-t border-gray-100 bg-white">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="px-3 py-1 text-xs font-medium border-gray-200 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                      
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-3 py-1 text-xs font-medium bg-black text-white"
                        >
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </Form>
        );
    }
    
    /**
     * Dialog mode rendering (used in canvas)
     * 
     * When isOpen is true, we render the form inside a dialog.
     * This is used in the canvas where the form is shown as a modal dialog.
     */
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[1000px] h-[750px] p-0 overflow-hidden flex flex-col">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
                                    <Database className="h-4 w-4 text-white" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Target Configuration
                                </h2>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
                            {/* Basic Info Section */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                                    <h3 className="text-sm font-medium text-gray-700">Basic Information</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                                    {resolvedSchema?.properties?.name && (
                                        <FieldRenderer
                                            fieldKey="name"
                                            field={resolvedSchema.properties.name}
                                            form={form}
                                            isRequired={requiredFields.includes('name')}
                                            sourceColumns={sourceColumns}
                                        />
                                    )}
                                    {resolvedSchema?.properties?.target?.properties?.target_name && (
                                        <FieldRenderer
                                            fieldKey="target_name"
                                            field={resolvedSchema.properties.target.properties.target_name}
                                            form={form}
                                            parentKey="target"
                                            isRequired={requiredFields.includes('target_name')}
                                            sourceColumns={sourceColumns}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Target Config Section */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-1 bg-gradient-to-b from-green-500 to-green-600 rounded-full" />
                                    <h3 className="text-sm font-medium text-gray-700">Target Configuration</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                                        {resolvedSchema?.properties?.target?.properties?.target_type && (
                                            <FieldRenderer
                                                fieldKey="target_type"
                                                field={resolvedSchema.properties.target.properties.target_type}
                                                form={form}
                                                parentKey="target"
                                                isRequired={requiredFields.includes('target_type')}
                                                sourceColumns={sourceColumns}
                                            />
                                        )}
                                        {resolvedSchema?.properties?.target?.properties?.load_mode && (
                                            <FieldRenderer
                                                fieldKey="load_mode"
                                                field={resolvedSchema.properties.target.properties.load_mode}
                                                form={form}
                                                parentKey="target"
                                                isRequired={requiredFields.includes('load_mode')}
                                                sourceColumns={sourceColumns}
                                            />
                                        )}
                                    </div>

                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        {resolvedSchema?.properties?.target?.properties?.connection && (
                                            <FieldRenderer
                                                key={`connection-${memoizedInitialValues?.target?.connection?.connection_config_id || 'empty'}`}
                                                fieldKey="connection"
                                                field={resolvedSchema.properties.target.properties.connection}
                                                form={form}
                                                parentKey="target"
                                                isRequired={requiredFields.includes('connection')}
                                                sourceColumns={sourceColumns}
                                                customEndpointOptions={getFilteredConnections()}
                                            />
                                        )}
                                    </div>

                                    {loadMode === 'merge' && resolvedSchema?.properties?.target?.properties?.merge_keys && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <ArrayField
                                                field={resolvedSchema.properties.target.properties.merge_keys}
                                                fieldKey="merge_keys"
                                                form={form}
                                                parentPath="target"
                                                isRequired={requiredFields.includes('merge_keys')}
                                                title="Merge Keys"
                                                sourceColumns={sourceColumns}
                                            />
                                        </div>
                                    )}

                                    {targetType === 'File' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded-lg shadow-sm">
                                                {resolvedSchema?.properties?.target?.properties?.file_name && (
                                                    <FieldRenderer
                                                        fieldKey="file_name"
                                                        field={resolvedSchema.properties.target.properties.file_name}
                                                        form={form}
                                                        parentKey="target"
                                                        isRequired={requiredFields.includes('file_name')}
                                                        sourceColumns={sourceColumns}
                                                    />
                                                )}
                                                {resolvedSchema?.properties?.file_type && (
                                                    <FieldRenderer
                                                        fieldKey="file_type"
                                                        field={resolvedSchema.properties.file_type}
                                                        form={form}
                                                        isRequired={requiredFields.includes('file_type')}
                                                        sourceColumns={sourceColumns}
                                                    />
                                                )}
                                            </div>
                                            
                                            <Collapsible open={isAdvancedExpanded} onOpenChange={setIsAdvancedExpanded}>
                                                <CollapsibleTrigger asChild>
                                                    <div className="text-blue-600 flex items-center gap-2 cursor-pointer mt-2">
                                                        <span className="font-medium">Advanced Options</span>
                                                        <span>{isAdvancedExpanded ? <ChevronUp /> : <ChevronDown />}</span>
                                                    </div>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="mt-3">
                                                    {resolvedSchema?.properties?.write_options && (
                                                        <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
                                                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                                                {fileType} Write Options
                                                            </h3>
                                                            <div className="grid grid-cols-3 gap-3">
                                                                {(() => {
                                                                    // Handle both direct properties and items.properties structure
                                                                    const writeOptionsSchema = resolvedSchema.properties.write_options;
                                                                    const properties = writeOptionsSchema.properties || writeOptionsSchema.items?.properties || {};
                                                                    const required = writeOptionsSchema.required || writeOptionsSchema.items?.required || [];
                                                                    
                                                                    console.log('🔧 Rendering write_options in Advanced section (dialog mode):', {
                                                                        writeOptionsSchema,
                                                                        properties: Object.keys(properties),
                                                                        required,
                                                                        hasDirectProperties: !!writeOptionsSchema.properties,
                                                                        hasItemsProperties: !!writeOptionsSchema.items?.properties
                                                                    });
                                                                    
                                                                    return Object.entries(properties).map(([key, field]: [string, any]) => (
                                                                        <FieldRenderer
                                                                            key={key}
                                                                            fieldKey={key}
                                                                            field={field}
                                                                            form={form}
                                                                            parentKey="write_options"
                                                                            isRequired={required.includes(key)}
                                                                            sourceColumns={sourceColumns}
                                                                        />
                                                                    ));
                                                                })()}
                                                            </div>
                                                        </div>
                                                    )}
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </>
                                    )}

                                    {targetType === 'Relational' && (
                                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded-lg shadow-sm">
                                            {(() => {
                                                console.log('🔧 TargetPopUp - Dialog Relational section debug:', {
                                                    targetType,
                                                    hasResolvedSchema: !!resolvedSchema,
                                                    hasTargetProperties: !!resolvedSchema?.properties?.target?.properties,
                                                    hasTableName: !!resolvedSchema?.properties?.target?.properties?.table_name,
                                                    tableNameField: resolvedSchema?.properties?.target?.properties?.table_name,
                                                    currentTableNameValue: form.getValues('target.table_name')
                                                });
                                                return null;
                                            })()}
                                            {resolvedSchema?.properties?.target?.properties?.table_name ? (
                                                <FieldRenderer
                                                    fieldKey="table_name"
                                                    field={resolvedSchema.properties.target.properties.table_name}
                                                    form={form}
                                                    parentKey="target"
                                                    isRequired={requiredFields.includes('table_name')}
                                                    sourceColumns={sourceColumns}
                                                />
                                            ) : (
                                                // Fallback table_name field if not in schema
                                                <FieldRenderer
                                                    fieldKey="table_name"
                                                    field={{
                                                        type: 'string',
                                                        title: 'Table Name',
                                                        description: 'Name of the target table'
                                                    }}
                                                    form={form}
                                                    parentKey="target"
                                                    isRequired={true}
                                                    sourceColumns={sourceColumns}
                                                />
                                            )}
                                            {resolvedSchema?.properties?.target?.properties?.schema_name && (
                                                <FieldRenderer
                                                    fieldKey="schema_name"
                                                    field={resolvedSchema.properties.target.properties.schema_name}
                                                    form={form}
                                                    parentKey="target"
                                                    isRequired={requiredFields.includes('schema_name')}
                                                    sourceColumns={sourceColumns}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-white">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="px-4 py-1.5 text-sm font-medium border-gray-200 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                           
                         
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-black to-black hover:from-black hover:to-black text-white"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Configuration'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default TargetPopUp;
