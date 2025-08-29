import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { getConnectionConfigList } from "@/store/slices/dataCatalog/datasourceSlice";
import { extractReaderSchema, resolveConditionalSchema, getSourceTypeFields, getFileTypeSchema, getReadOptionsSchema, debugReaderSchema } from "@/utils/schemaExtractor";
import { DynamicFormField } from "./components/form/DynamicFormField";
import { Skeleton } from "@/components/ui/skeleton";
import { ValidEngineTypes } from "@/types/pipeline";
import { FileText, Database, Settings, Wrench } from "lucide-react";

interface FormSchema {
    type: string;
    properties: Record<string, any>;
    allOf?: any[];
    required?: string[];
}

interface FormData {
    [key: string]: any;
}

interface ReaderOptionsFormProps {
    onSubmit?: (data: FormData) => void;
    onClose?: () => void;
    initialData?: FormData;
    onSourceUpdate?: (updatedSource: any) => void;
    nodeId?: string;
    onFormDataChange?: (formData: FormData) => void;
}



// Utility function to debounce function calls
const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): T => {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    }) as T;
};

// Utility function to clean file names for data_src_id generation
const cleanFileNameForId = (fileName: string): string => {
    if (!fileName) return '';
    
    return fileName
        .trim()                     // Remove leading/trailing whitespace first
        .replace(/\./g, '_')        // Replace dots with underscores
        .replace(/\s+/g, '_')       // Replace spaces with underscores  
        .replace(/-/g, '_')         // Replace hyphens with underscores
        .replace(/[^a-zA-Z0-9_]/g, '_')  // Replace any other non-alphanumeric chars with underscores
        .replace(/_+/g, '_')        // Replace multiple consecutive underscores with single underscore
        .replace(/^_|_$/g, '');     // Remove leading/trailing underscores
};

const getSourceTypeFields = (sourceType: string, schema: any) => {
    if (!schema?.allOf) return { properties: {}, required: [] };
    
    const condition = schema.allOf.find(
        (condition: any) => condition.if?.properties?.source_type?.const === sourceType
    );

    const additionalProperties = condition?.then?.properties || {};
    return {
        properties: additionalProperties,
        required: [...(condition?.then?.required || [])]
    };
};

const validateFormData = (schema: FormSchema, formData: FormData): string[] => {
    const missingFields: string[] = [];

    const validateFields = (schema: any, path: string[] = []) => {
        Object.entries(schema.properties || {}).forEach(([key, fieldSchema]: [string, any]) => {
            const fullPath = [...path, key];
            const fieldValue = fullPath.reduce((acc, curr) => acc?.[curr], formData);

            if (fieldSchema.required && !fieldValue) {
                missingFields.push(fullPath.join('.'));
            }

            if (fieldSchema.type === 'object') {
                validateFields(fieldSchema, fullPath);
            }
        });
    };

    validateFields(schema);
    return missingFields;
};


export const ReaderOptionsForm: React.FC<ReaderOptionsFormProps> = ({
    onSubmit,
    onClose,
    initialData,
    onSourceUpdate,
    nodeId,
    onFormDataChange
}:any) => {

    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState<FormData>(initialData || {});
    const [currentSchema, setCurrentSchema] = useState<FormSchema | null>(null);
    const [baseReaderSchema, setBaseReaderSchema] = useState<FormSchema | null>(null);
    const [isSchemaLoading, setIsSchemaLoading] = useState<boolean>(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [sourceTypeFields, setSourceTypeFields] = useState<any>(null);
    const [fileTypeSchema, setFileTypeSchema] = useState<any>(null);
    const [readOptionsSchema, setReadOptionsSchema] = useState<any>(null);
    const { connectionConfigList } = useAppSelector((state) => state.datasource);
    const { isRightPanelOpen, selectedEngineType } = useAppSelector((state) => state.buildPipeline) as { isRightPanelOpen: boolean; selectedEngineType: ValidEngineTypes };
    const [selectedConnection, setSelectedConnection] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<string>("basic");
    const hasGeneratedDataSrcId = useRef<boolean>(false);

    // Load schema based on selected engine type
    useEffect(() => {
        const loadSchema = async () => {
            setIsSchemaLoading(true);
            try {
                const readerSchema = extractReaderSchema(selectedEngineType);
                
                if (readerSchema) {
                    setBaseReaderSchema(readerSchema);
                    setCurrentSchema(readerSchema);
                    
                    // Debug the reader schema structure (comprehensive test)
                    // debugReaderSchema(selectedEngineType);
                } else {
                    console.warn('🔧 No Reader schema found for engine type:', selectedEngineType);
                    toast.error(`No Reader schema available for ${selectedEngineType}`);
                }
            } catch (error) {
                console.error('🔧 Error loading Reader schema:', error);
                toast.error('Failed to load Reader schema');
            } finally {
                setIsSchemaLoading(false);
            }
        };

        if (selectedEngineType) {
            loadSchema();
        }
    }, [selectedEngineType]);

    // Fetch connection list on component mount
    useEffect(() => {
        dispatch(getConnectionConfigList());
    }, [dispatch]);

    useEffect(() => {
        if (initialData && connectionConfigList && connectionConfigList.length > 0) {
         
            // Try each lookup method step by step with improved priority order
            const method1 = connectionConfigList.find(
                conn => conn.id === initialData.source?.connection_config_id || 
                        conn.id === parseInt(initialData.source?.connection_config_id)
            );
            const method2 = connectionConfigList.find(
                conn => conn.id === initialData.source?.connection?.connection_config_id ||
                        conn.id === parseInt(initialData.source?.connection?.connection_config_id)
            );
            const method3 = connectionConfigList.find(
                conn => conn.connection_config_name === initialData.source?.connection?.name
            );
            const method4 = connectionConfigList.find(
                conn => conn.connection_name === initialData.source?.connection?.name
            );
            const method5 = connectionConfigList.find(
                conn => conn.id === parseInt(initialData.source?.connection?.connection_config_id)
            );
            // Prioritize ID-based matches over name-based matches
            const selectedConn = method1 || method2 || method5 || method3 || method4;
            
            // Set source_name from various possible sources
            const sourceName = initialData.source?.source_name || 
                              initialData.source?.name || 
                              initialData.source?.data_src_name || 
                              initialData.data_src_name || 
                              initialData.reader_name || 
                              initialData.name || '';

            // Clean the reader name and source name for consistent formatting
            const cleanedReaderName = cleanFileNameForId(initialData.reader_name || initialData.name || sourceName);
            const cleanedSourceName = cleanFileNameForId(sourceName);

            setFormData({
                ...initialData,
                reader_name: cleanedReaderName,
                name: cleanedReaderName,
                file_type: (initialData.file_type || initialData.source?.file_type || initialData.source?.connection?.file_type || 'CSV').toUpperCase(),
                source: {
                    ...initialData.source,
                    source_name: cleanedSourceName,
                    name: cleanedSourceName,
                    source_type: initialData.source?.source_type || initialData.source?.type || 'File',
                    file_name: initialData.source?.file_name || initialData.source?.data_src_name || sourceName || '',
                    table_name: initialData.source?.table_name || sourceName,
                    bh_project_id: initialData.source?.bh_project_id || '',
                    data_src_id: initialData.source?.data_src_id || undefined,
                    file_type: (initialData.source?.file_type || initialData.file_type || 'CSV').toUpperCase(),
                    connection: {
                        ...initialData.source?.connection,
                        connection_config_id: 
                                            initialData.source?.connection?.connection_config_id || 
                                            initialData.source?.connection_config_id || '',
                        name: selectedConn?.connection_config_name || 
                              selectedConn?.connection_name || 
                              initialData.source?.connection?.name || '',
                        connection_type: selectedConn?.custom_metadata?.connection_type || 
                                       initialData.source?.connection?.connection_type || '',
                        database: selectedConn?.custom_metadata?.database || 
                                initialData.source?.connection?.database || '',
                        schema: selectedConn?.custom_metadata?.schema || 
                              initialData.source?.connection?.schema || '',
                        secret_name: selectedConn?.custom_metadata?.secret_name || 
                                   initialData.source?.connection?.secret_name || '',
                        file_path_prefix: initialData.source?.connection?.file_path_prefix || 
                                        selectedConn?.custom_metadata?.file_path_prefix || ''
                    },
                    connection_config_id: selectedConn?.id || 
                                        initialData.source?.connection_config_id || 
                                        initialData.source?.connection?.connection_config_id || ''
                }
            });
            setSelectedConnection(selectedConn);
            
            // Reset the ref when initialData changes
            hasGeneratedDataSrcId.current = false;
        }
    }, [initialData, connectionConfigList]);


    // Update source type specific fields when source type changes
    useEffect(() => {
        if (baseReaderSchema && formData.source?.source_type) {
            const fields = getSourceTypeFields(baseReaderSchema, formData.source.source_type);
            setSourceTypeFields(fields);
         
            // Update the current schema to include the source type specific fields
            if (fields && baseReaderSchema.properties?.source) {
                const updatedSourceSchema = {
                    ...baseReaderSchema.properties.source,
                    properties: {
                        ...baseReaderSchema.properties.source.properties,
                        ...fields.properties
                    },
                    required: [
                        ...(baseReaderSchema.properties.source.required || []),
                        ...(fields.required || [])
                    ]
                };

                const updatedReaderSchema = {
                    ...baseReaderSchema,
                    properties: {
                        ...baseReaderSchema.properties,
                        source: updatedSourceSchema
                    }
                };

                setCurrentSchema(updatedReaderSchema);
            }
        }
    }, [baseReaderSchema, formData.source?.source_type]);

    // Update file type schema when file_type changes
    useEffect(() => {
        if (baseReaderSchema && formData.file_type && formData.source?.source_type === 'File') {
            const fileSchema = getFileTypeSchema(baseReaderSchema, formData.file_type);
            setFileTypeSchema(fileSchema);
            
            // Extract read_options schema from the file type schema
            const readOptsSchema = getReadOptionsSchema(fileSchema, formData.file_type);
            setReadOptionsSchema(readOptsSchema);
        } else {
            setFileTypeSchema(null);
            setReadOptionsSchema(null);
        }
    }, [baseReaderSchema, formData.file_type, formData.source?.source_type]);

    const resolveSchema = useCallback(async () => {
        if (!baseReaderSchema) return;

        try {
            // Start with the base schema
            let resolvedSchema = resolveConditionalSchema(baseReaderSchema, formData);
            
            // Add source type specific fields
            if (sourceTypeFields && resolvedSchema.properties?.source) {
                resolvedSchema.properties.source = {
                    ...resolvedSchema.properties.source,
                    properties: {
                        ...resolvedSchema.properties.source.properties,
                        ...sourceTypeFields.properties
                    },
                    required: [
                        ...(resolvedSchema.properties.source.required || []),
                        ...(sourceTypeFields.required || [])
                    ]
                };
            }
            
            // Add file type specific fields
            if (fileTypeSchema) {
                resolvedSchema = {
                    ...resolvedSchema,
                    properties: {
                        ...resolvedSchema.properties,
                        ...fileTypeSchema.properties
                    },
                    required: [
                        ...(resolvedSchema.required || []),
                        ...(fileTypeSchema.required || [])
                    ]
                };
            }

            // Add read_options fields as individual form fields
            if (readOptionsSchema && readOptionsSchema.properties) {
                // Instead of adding read_options as an object, add each field individually with read_options prefix
                const readOptionsFields = {};
                Object.entries(readOptionsSchema.properties).forEach(([key, schema]) => {
                    readOptionsFields[`read_options.${key}`] = schema;
                });

                resolvedSchema.properties = {
                    ...resolvedSchema.properties,
                    ...readOptionsFields
                };

            }
            
            setCurrentSchema(resolvedSchema);
          
        } catch (error) {
            console.error('🔧 Error resolving schema:', error);
        }
    }, [baseReaderSchema, formData, sourceTypeFields, fileTypeSchema, readOptionsSchema]);

    useEffect(() => {
        resolveSchema();
    }, [resolveSchema]);

    // Auto-generate data_src_id when connection and file_name/table_name are available
    useEffect(() => {
        const shouldGenerateId = (!formData.source?.data_src_id || formData.source?.data_src_id === '') && 
                                formData.source?.connection?.connection_config_id && 
                                (formData.source?.file_name || formData.source?.table_name) &&
                                !hasGeneratedDataSrcId.current;

        if (shouldGenerateId) {
            const connectionId = formData.source.connection.connection_config_id;
            const sourceName = formData.source.file_name || formData.source.table_name;
            
            const cleanSourceName = cleanFileNameForId(sourceName);
            const generatedId = `${connectionId}_${cleanSourceName}`;
            
            hasGeneratedDataSrcId.current = true;
            
            setFormData(prev => ({
                ...prev,
                source: {
                    ...prev.source,
                    data_src_id: generatedId
                }
            }));
        }
    }, [formData.source?.connection?.connection_config_id, formData.source?.file_name, formData.source?.table_name]);

    // Memoized debounced callback for form data changes
    const debouncedOnFormDataChange = useCallback(
        debounce((data: FormData) => {
            if (onFormDataChange) {
                console.log('🔧 ReaderOptionsForm: Calling onFormDataChange with:', data);
                onFormDataChange(data);
            }
        }, 300),
        [onFormDataChange]
    );

    // Notify parent when formData changes (with debouncing to avoid excessive calls)
    useEffect(() => {
        if (formData && Object.keys(formData).length > 0) {
            debouncedOnFormDataChange(formData);
        }
    }, [formData, debouncedOnFormDataChange]);

    // Memoized helper function to organize form fields into tabs
    const organizeFieldsIntoTabs = useCallback((schema: FormSchema) => {
        if (!schema.properties) return { basic: {}, source: {}, readOptions: {}, advanced: {} };

        const tabs = {
            basic: {} as Record<string, any>,
            source: {} as Record<string, any>,
            readOptions: {} as Record<string, any>,
            advanced: {} as Record<string, any>
        };

        Object.entries(schema.properties).forEach(([fieldKey, fieldSchema]) => {
            // Basic Info: reader name, transformation type, etc.
            if (['reader_name', 'name', 'transformation', 'file_type'].includes(fieldKey)) {
                tabs.basic[fieldKey] = fieldSchema;
            }
            // Source Configuration: all source-related fields
            else if (fieldKey === 'source' || fieldKey.startsWith('source.')) {
                tabs.source[fieldKey] = fieldSchema;
            }
            // Read Options: read_options and related processing fields
            else if (['read_options', 'select_columns', 'drop_columns', 'rename_columns'].includes(fieldKey)) {
                tabs.readOptions[fieldKey] = fieldSchema;
            }
            // Advanced Settings: everything else
            else {
                tabs.advanced[fieldKey] = fieldSchema;
            }
        });

        return tabs;
    }, []);

    // Memoized organized tabs
    const organizedTabs = useMemo(() => {
        return currentSchema ? organizeFieldsIntoTabs(currentSchema) : { basic: {}, source: {}, readOptions: {}, advanced: {} };
    }, [currentSchema, organizeFieldsIntoTabs]);

    // Memoized helper functions
    const hasFields = useCallback((tabFields: Record<string, any>) => Object.keys(tabFields).length > 0, []);

    const hasTabErrors = useCallback((tabFields: Record<string, any>) => {
        return Object.keys(tabFields).some(fieldKey => {
            // Check for direct field errors
            if (errors[fieldKey]) return true;
            // Check for nested field errors (e.g., source.connection_config_id)
            return Object.keys(errors).some(errorKey => errorKey.startsWith(fieldKey + '.'));
        });
    }, [errors]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!currentSchema) {
            toast.error('Schema not loaded. Please try again.');
            return;
        }

        const missingFields = validateFormData(currentSchema, formData);

        if (missingFields.length > 0) {
            setErrors(missingFields.reduce((acc, field) => ({
                ...acc,
                [field]: 'This field is required'
            }), {}));

            toast.error('Please fill out all required fields.');
            return;
        }

        try {
            let finalFormData = { ...formData };
            if ((!finalFormData.source?.data_src_id || finalFormData.source?.data_src_id === '') && 
                finalFormData.source?.connection?.connection_config_id && 
                (finalFormData.source?.file_name || finalFormData.source?.table_name)) {
                
                const connectionId = finalFormData.source.connection.connection_config_id;
                const sourceName = finalFormData.source.file_name || finalFormData.source.table_name;
                const cleanSourceName = cleanFileNameForId(sourceName);
                const generatedId = `${connectionId}_${cleanSourceName}`;
                
                finalFormData = {
                    ...finalFormData,
                    source: {
                        ...finalFormData.source,
                        data_src_id: generatedId
                    }
                };
            }
      
            const sourceData = {
                nodeId,
                sourceData: {
                    name: cleanFileNameForId(finalFormData.source?.name || finalFormData.reader_name || ''),
                    data_src_desc: finalFormData.reader_name,
                    reader_name: finalFormData.source?.file_name || finalFormData.reader_name,
                    source_type: finalFormData.source?.source_type,
                    file_name: finalFormData.source?.file_name,
                    data_src_id: finalFormData.source?.data_src_id,
                    project_id: finalFormData.project_id,
                    file_path_prefix: finalFormData.source?.connection?.file_path_prefix,
                    connection_config_id: finalFormData.source?.connection?.connection_config_id,
                    connection_config: {
                        custom_metadata:{...finalFormData.source?.connection?.custom_metadata,
                            connection_config_id: finalFormData.source?.connection?.connection_config_id
                         }
                    },
                    connection: {
                        name: finalFormData.source?.connection?.name,
                        connection_type: finalFormData.source?.connection?.connection_type,
                        file_path_prefix: finalFormData.source?.connection?.file_path_prefix,
                        bucket: finalFormData.source?.connection?.bucket,
                        secret_name: finalFormData.source?.connection?.secret_name
                    }
                }
            };
            console.log(sourceData, "sourceData")
            onSourceUpdate?.(sourceData);
            onClose?.();
            toast.success("Reader configuration saved successfully");
        } catch (error) {
            console.error('Error during form submission:', error);
            toast.error('An error occurred while saving the configuration.');
        }
    };

    // Memoized handle form field changes
    const handleFieldChange = useCallback((fieldKey: string, value: any) => {
        setFormData(prev => {
            const newData = { ...prev };
            
            // Handle special cases for connection selection
            if (fieldKey === 'source.connection_config_id' || fieldKey === 'connection_config_id' || fieldKey === 'source.connection') {
                let selectedConn;
                
                if (typeof value === 'object' && value.connection_config_id) {
                    // Value is already a connection object from the API endpoint
                    selectedConn = connectionConfigList.find(conn => conn.id === parseInt(value.connection_config_id));
                    setSelectedConnection(selectedConn);
                    
                    newData.source = {
                        ...newData.source,
                        connection: value,
                        connection_config_id: value.connection_config_id
                    };
                } else {
                    // Value is just an ID
                    selectedConn = connectionConfigList.find(conn => conn.id === parseInt(value));
                    setSelectedConnection(selectedConn);

                    if (selectedConn) {
                        newData.source = {
                            ...newData.source,
                            connection: {
                                ...newData.source?.connection,
                                connection_config_id: selectedConn.id,
                                name: selectedConn.connection_config_name || '',
                                connection_type: selectedConn.custom_metadata?.connection_type || '',
                                file_path_prefix: selectedConn.custom_metadata?.file_path_prefix || '',
                            },
                            connection_config_id: selectedConn.id
                        };
                    }
                }
                return newData;
            }

            // Handle source type change - clear opposite field
            if (fieldKey === 'source.source_type') {
                newData.source = {
                    ...newData.source,
                    source_type: value
                };
                
                // Clear the opposite field when switching source types
                if (value === 'File') {
                    delete newData.source.table_name;
                } else {
                    delete newData.source.file_name;
                }
                
                // Reset data_src_id generation flag
                hasGeneratedDataSrcId.current = false;
                
                return newData;
            }

            // Handle file type change
            if (fieldKey === 'file_type') {
                newData.file_type = value;
                
                // Clear existing read_options when file type changes
                if (newData.read_options) {
                    delete newData.read_options;
                }
                
                return newData;
            }

            // Handle read_options field changes
            if (fieldKey.startsWith('read_options.')) {
                const readOptionKey = fieldKey.replace('read_options.', '');
                newData.read_options = {
                    ...newData.read_options,
                    [readOptionKey]: value
                };
                return newData;
            }

            // Handle name cleaning for specific fields
            if (fieldKey === 'name' || fieldKey === 'reader_name') {
                const cleanedValue = cleanFileNameForId(value);
                newData.reader_name = cleanedValue;
                newData.name = cleanedValue;
                newData.source = {
                    ...newData.source,
                    name: cleanedValue,
                    source_name: cleanedValue
                };
                return newData;
            }

            // Handle nested field updates
            const keys = fieldKey.split('.');
            if (keys.length === 1) {
                newData[fieldKey] = value;
            } else {
                let current = newData;
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) {
                        current[keys[i]] = {};
                    }
                    current[keys[i]] = { ...current[keys[i]] };
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = value;
            }
            
            return newData;
        });
    }, [connectionConfigList]);

    // Memoized tab content components to prevent unnecessary rerenders
    const TabContent = useMemo(() => ({
        basic: (
            <TabsContent value="basic" className="space-y-6 mt-0">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {hasFields(organizedTabs.basic) ? (
                                Object.entries(organizedTabs.basic).map(([fieldKey, fieldSchema]: [string, any]) => (
                                    <div key={fieldKey} className={fieldSchema.type === 'object' ? 'md:col-span-2 xl:col-span-3' : ''}>
                                        <DynamicFormField
                                            fieldKey={fieldKey}
                                            fieldSchema={fieldSchema}
                                            value={formData[fieldKey]}
                                            onChange={handleFieldChange}
                                            errors={errors}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center text-gray-500 py-12">
                                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">No basic configuration fields</p>
                                    <p className="text-sm mt-1">All basic settings are configured automatically</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        ),
        source: (
            <TabsContent value="source" className="space-y-6 mt-0">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {hasFields(organizedTabs.source) ? (
                                Object.entries(organizedTabs.source).map(([fieldKey, fieldSchema]: [string, any]) => (
                                    <div key={fieldKey} className={fieldSchema.type === 'object' ? 'md:col-span-2 xl:col-span-3' : ''}>
                                        <DynamicFormField
                                            fieldKey={fieldKey}
                                            fieldSchema={fieldSchema}
                                            value={formData[fieldKey]}
                                            onChange={handleFieldChange}
                                            errors={errors}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center text-gray-500 py-12">
                                    <Database className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">No source configuration fields</p>
                                    <p className="text-sm mt-1">Source settings are configured automatically</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        ),
        readOptions: (
            <TabsContent value="readOptions" className="space-y-6 mt-0">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {hasFields(organizedTabs.readOptions) ? (
                                Object.entries(organizedTabs.readOptions).map(([fieldKey, fieldSchema]: [string, any]) => (
                                    <div key={fieldKey} className={fieldSchema.type === 'object' ? 'md:col-span-2 xl:col-span-3' : ''}>
                                        <DynamicFormField
                                            fieldKey={fieldKey}
                                            fieldSchema={fieldSchema}
                                            value={formData[fieldKey]}
                                            onChange={handleFieldChange}
                                            errors={errors}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center text-gray-500 py-12">
                                    <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">No read options available</p>
                                    <p className="text-sm mt-1">Default read settings will be used</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        ),
        advanced: (
            <TabsContent value="advanced" className="space-y-6 mt-0">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-3 gap-6">
                            {hasFields(organizedTabs.advanced) ? (
                                Object.entries(organizedTabs.advanced).map(([fieldKey, fieldSchema]: [string, any]) => (
                                    <div key={fieldKey} className={fieldSchema.type === 'object' ? 'col-span-3' : ''}>
                                        <DynamicFormField
                                            fieldKey={fieldKey}
                                            fieldSchema={fieldSchema}
                                            value={formData[fieldKey]}
                                            onChange={handleFieldChange}
                                            errors={errors}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-3 text-center text-gray-500 py-12">
                                    <Wrench className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">No advanced settings available</p>
                                    <p className="text-sm mt-1">Standard configuration is sufficient</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        )
    }), [organizedTabs, formData, handleFieldChange, errors, hasFields]);

    if (isSchemaLoading) {
        return (
            <div className="flex flex-col h-full w-full bg-white p-4">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        );
    }

    if (!currentSchema) {
        return (
            <div className="flex flex-col h-full w-full bg-white p-4">
                <div className="text-center text-gray-500">
                    <p>No schema available for the selected engine type.</p>
                    <p className="text-sm mt-2">Please select a different engine type or contact support.</p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full w-full bg-white">
            <div className="flex-1 overflow-auto">
                <div className="p-4">
                    {isRightPanelOpen ? (
                        /* Simplified view when right panel is open */
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-4">Reader Configuration</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentSchema.properties && Object.entries(currentSchema.properties)
                                        .filter(([key]) => ['reader_name', 'name'].includes(key))
                                        .map(([fieldKey, fieldSchema]: [string, any]) => (
                                            <DynamicFormField
                                                key={fieldKey}
                                                fieldKey={fieldKey}
                                                fieldSchema={fieldSchema}
                                                value={formData[fieldKey]}
                                                onChange={handleFieldChange}
                                                errors={errors}
                                            />
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        /* Elegant Tabbed Interface */
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-50 p-1 rounded-lg">
                                <TabsTrigger 
                                    value="basic" 
                                    className={`flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 relative ${
                                        hasTabErrors(organizedTabs.basic) ? 'text-red-600' : ''
                                    }`}
                                >
                                    <FileText className="h-4 w-4" />
                                    <span className="hidden sm:inline">Basic Info</span>
                                    <span className="sm:hidden">Basic</span>
                                    {hasTabErrors(organizedTabs.basic) && (
                                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></div>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="source" 
                                    className={`flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 relative ${
                                        hasTabErrors(organizedTabs.source) ? 'text-red-600' : ''
                                    }`}
                                >
                                    <Database className="h-4 w-4" />
                                    <span className="hidden sm:inline">Source Config</span>
                                    <span className="sm:hidden">Source</span>
                                    {hasTabErrors(organizedTabs.source) && (
                                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></div>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="readOptions" 
                                    className={`flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 relative ${
                                        hasTabErrors(organizedTabs.readOptions) ? 'text-red-600' : ''
                                    }`}
                                >
                                    <Settings className="h-4 w-4" />
                                    <span className="hidden sm:inline">Read Options</span>
                                    <span className="sm:hidden">Options</span>
                                    {hasTabErrors(organizedTabs.readOptions) && (
                                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></div>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="advanced" 
                                    className={`flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 relative ${
                                        hasTabErrors(organizedTabs.advanced) ? 'text-red-600' : ''
                                    }`}
                                >
                                    <Wrench className="h-4 w-4" />
                                    <span className="hidden sm:inline">Advanced</span>
                                    <span className="sm:hidden">Adv</span>
                                    {hasTabErrors(organizedTabs.advanced) && (
                                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></div>
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            {/* Memoized Tab Content */}
                            {TabContent.basic}
                            {TabContent.source}
                            {TabContent.readOptions}
                            {TabContent.advanced}
                        </Tabs>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-2 p-2 border-t border-gray-200 shrink-0 bg-gray-50">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="h-8 px-3 py-0 text-xs font-medium border-gray-300 hover:bg-gray-50"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="h-8 px-3 py-0 text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white"
                >
                    Save Configuration
                </Button>
            </div>
        </form>
    );
};
