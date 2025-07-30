import React, { useState, useEffect, useCallback, useRef } from "react";
import sourceSchema from "./json/Source.json";
import readerSchema from "./json/Reader.json";
import csvOptionsSchema from "./json/CSVOptions.json";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
// import { getConnectionConfigList } from "@/store/slices/dataCatalog/datasourceSlice";

import { FormData, ReaderFormField } from "./components/form/reader-form-field";
import { getConnectionConfigList } from "@/store/slices/dataCatalog/datasourceSlice";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";

interface FormSchema {
    type: string;
    properties: Record<string, any>;
    allOf?: any[];
}

interface ReaderOptionsFormProps {
    onSubmit?: (data: FormData) => void;
    onClose?: () => void;
    initialData?: FormData;
    onSourceUpdate?: (updatedSource: any) => void;
    nodeId?: string;
    onFormDataChange?: (formData: FormData) => void;
}



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

const getSourceTypeFields = (sourceType: string) => {
    const condition = sourceSchema.allOf?.find(
        condition => condition.if.properties.type.const === sourceType
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
}) => {

    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState<FormData>(initialData || {});
    const [currentSchema, setCurrentSchema] = useState<FormSchema>(readerSchema);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { connectionConfigList } = useAppSelector((state) => state.datasource);
    const { isRightPanelOpen } = useAppSelector((state) => state.buildPipeline);
    const [selectedConnection, setSelectedConnection] = useState<any>(null);
    const [isAdvance, setIsAdvanvce] = useState<boolean>(false);
    const hasGeneratedDataSrcId = useRef<boolean>(false);
    console.log(connectionConfigList)
    console.log(initialData, "initialData")

    // Fetch connection list on component mount
    useEffect(() => {
        dispatch(getConnectionConfigList());
    }, [dispatch]);

    useEffect(() => {
        if (initialData && connectionConfigList && connectionConfigList.length > 0) {
            console.log('🔧 === READEROPTIONSFORM CONNECTION DEBUGGING ===');
            console.log('🔧 ReaderOptionsForm received initialData:', initialData);
            console.log('🔧 initialData.source:', initialData.source);
            console.log('🔧 initialData.source?.connection:', initialData.source?.connection);
            console.log('🔧 Looking for connection with name:', initialData.source?.connection?.name);
            console.log('🔧 Looking for connection with connection_config_id:', initialData.source?.connection?.connection_config_id);
            console.log('🔧 Looking for connection with source connection_config_id:', initialData.source?.connection_config_id);
            console.log('🔧 Available connections:', connectionConfigList);
            console.log('🔧 Available connections summary:', connectionConfigList.map(c => ({ 
                id: c.id, 
                connection_config_name: c.connection_config_name,
                connection_name: c.connection_name 
            })));
            
            // Try each lookup method step by step with improved priority order
            console.log('🔧 Trying lookup method 1: by source.connection_config_id');
            const method1 = connectionConfigList.find(
                conn => conn.id === initialData.source?.connection_config_id || 
                        conn.id === parseInt(initialData.source?.connection_config_id)
            );
            console.log('🔧 Method 1 result:', method1);
            
            console.log('🔧 Trying lookup method 2: by connection.connection_config_id');
            const method2 = connectionConfigList.find(
                conn => conn.id === initialData.source?.connection?.connection_config_id ||
                        conn.id === parseInt(initialData.source?.connection?.connection_config_id)
            );
            console.log('🔧 Method 2 result:', method2);
            
            console.log('🔧 Trying lookup method 3: by connection_config_name');
            const method3 = connectionConfigList.find(
                conn => conn.connection_config_name === initialData.source?.connection?.name
            );
            console.log('🔧 Method 3 result:', method3);
            
            console.log('🔧 Trying lookup method 4: by connection_name');
            const method4 = connectionConfigList.find(
                conn => conn.connection_name === initialData.source?.connection?.name
            );
            console.log('🔧 Method 4 result:', method4);
            
            console.log('🔧 Trying lookup method 5: by numeric connection_config_id (fallback)');
            const method5 = connectionConfigList.find(
                conn => conn.id === parseInt(initialData.source?.connection?.connection_config_id)
            );
            console.log('🔧 Method 5 result:', method5);
            
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
                    type: initialData.source?.type || 'File',
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


    const resolveFileTypeSchema = (schema: any) => {
        const fileTypeCondition = readerSchema.allOf?.find(
            (condition: any) => condition.if.properties.file_type?.const === formData.file_type
        );

        if (fileTypeCondition) {
            return {
                ...schema,
                properties: {
                    ...schema.properties,
                    ...fileTypeCondition.then.properties,
                }
            };
        }
        return schema;
    };

    const resolveSourceTypeSchema = (schema: any) => {
        const sourceTypeCondition = readerSchema.allOf?.find(
            (condition) => condition.if.properties.source?.properties?.type?.const === formData.source?.type
        );

        if (sourceTypeCondition) {
            return {
                ...schema,
                properties: {
                    ...schema.properties,
                    ...sourceTypeCondition.then.properties,
                }
            };
        }
        return schema;
    };

    const resolveSchema = useCallback(async () => {
        let resolvedSchema = { ...readerSchema };

        if (formData.source?.type) {
            resolvedSchema = resolveSourceTypeSchema(resolvedSchema);
        }

        if (formData.source?.type === 'File' && formData.file_type) {
            resolvedSchema = resolveFileTypeSchema(resolvedSchema);
        }

        setCurrentSchema(resolvedSchema);
    }, [formData.source?.type, formData.file_type]);

    useEffect(() => {
        resolveSchema();
    }, [resolveSchema]);

    // Auto-generate data_src_id when connection and file_name are available
    useEffect(() => {
        const shouldGenerateId = (!formData.source?.data_src_id || formData.source?.data_src_id === '') && 
                                formData.source?.connection?.connection_config_id && 
                                formData.source?.file_name &&
                                !hasGeneratedDataSrcId.current;

        if (shouldGenerateId) {
            const connectionId = formData.source.connection.connection_config_id;
            const fileName = formData.source.file_name;
            
            const cleanFileName = cleanFileNameForId(fileName);
            const generatedId = `${connectionId}_${cleanFileName}`;
            
            console.log('🔧 ReaderOptionsForm: Auto-generating data_src_id from:', fileName, '→', generatedId);
            hasGeneratedDataSrcId.current = true;
            
            setFormData(prev => ({
                ...prev,
                source: {
                    ...prev.source,
                    data_src_id: generatedId
                }
            }));
        }
    }, [formData.source?.connection?.connection_config_id, formData.source?.file_name]);

    // Notify parent when formData changes (with debouncing to avoid excessive calls)
    useEffect(() => {
        if (onFormDataChange && formData) {
            const timeoutId = setTimeout(() => {
                console.log('🔧 ReaderOptionsForm: Calling onFormDataChange with:', formData);
                onFormDataChange(formData);
            }, 100); // Small debounce to avoid excessive calls

            return () => clearTimeout(timeoutId);
        }
    }, [formData, onFormDataChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, path: string[] = []) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev };

            if (name === 'connection_config_id') {
                const selectedConn = connectionConfigList.find(conn => conn.id === parseInt(value));
                setSelectedConnection(selectedConn);

                if (selectedConn) {
                    newData.source = {
                        ...newData.source,
                        connection: {
                            ...newData.source?.connection,
                            connection_config_id: selectedConn.id,
                            type: selectedConn.custom_metadata?.type || '',
                            file_path_prefix: selectedConn.custom_metadata?.file_path_prefix || '',
                            connection_name: selectedConn.connection_config_name || ''
                        },
                        connection_config_id: selectedConn.id // Also set at source level
                    };
                }
            } else if (name === 'type') {
                newData.source = {
                    ...newData.source,
                    type: value,
                    connection: newData.source?.connection || {} // Preserve existing connection data
                };
            } else if (name === 'file_path_prefix') {
                newData.source = {
                    ...newData.source,
                    connection: {
                        ...newData.source?.connection,
                        file_path_prefix: value
                    }
                };
            } else if (name === 'file_name' || name === 'table_name') {
                newData.source = {
                    ...newData.source,
                    [name]: value
                };
            } else if (name === 'name') {
                const cleanedValue = cleanFileNameForId(value);
                newData.source = {
                    ...newData.source,
                    name: cleanedValue,
                    source_name: cleanedValue
                };
                newData.name = cleanedValue;
                newData.reader_name = cleanedValue;
            } else if (name === 'reader_name') {
                const cleanedValue = cleanFileNameForId(value);
                newData.reader_name = cleanedValue;
                newData.name = cleanedValue;
                newData.source = {
                    ...newData.source,
                    name: cleanedValue,
                    source_name: cleanedValue
                };
            } else {
                if (path.length === 0) {
                    newData[name] = value;
                } else {
                    let current = newData;
                    for (let i = 0; i < path.length - 1; i++) {
                        current[path[i]] = { ...current[path[i]] };
                        current = current[path[i]];
                    }
                    current[path[path.length - 1]] = value;
                }
            }
            return newData;
        });
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                finalFormData.source?.file_name) {
                
                const connectionId = finalFormData.source.connection.connection_config_id;
                const fileName = finalFormData.source.file_name;
                const cleanFileName = cleanFileNameForId(fileName);
                const generatedId = `${connectionId}_${cleanFileName}`;
                
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
                    data: {
                        label: cleanFileNameForId(finalFormData.reader_name || finalFormData.source?.name || finalFormData.source?.data_src_name || ''),
                        source: {
                            data_src_id: finalFormData.source?.data_src_id,
                            data_src_name: cleanFileNameForId(finalFormData.source?.name || finalFormData.reader_name || ''),
                            source_name: cleanFileNameForId(finalFormData.source?.name || finalFormData.reader_name || ''),
                            data_src_desc: finalFormData.reader_name,
                            connection_type: finalFormData.source?.connection?.connection_type,
                            connection_config_id: finalFormData.source?.connection?.connection_config_id,
                            file_name: finalFormData.source?.file_name,
                            file_path_prefix: finalFormData.source?.connection?.file_path_prefix,
                            file_type: finalFormData?.file_type,
                            table_name: finalFormData.source?.table_name,
                            type: finalFormData.source?.type,
                            connection_config: {
                                custom_metadata: finalFormData.source?.connection,
                                connection_config_name: finalFormData.source?.connection?.name
                            },
                            name: cleanFileNameForId(finalFormData.source?.name || finalFormData.reader_name || '')
                        }
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

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full w-full bg-white">
            <div className="flex-1 overflow-auto">
                <div className="">
                    {/* Form Content */}
                    <div className="space-y-3">
                        {isRightPanelOpen ? (
                            /* Simplified view when right panel is open - only show reader_name and file_name */
                            <div className="bg-gray-50 p-2.5 rounded-md">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-4 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                                    <h3 className="text-xs font-medium text-gray-700">Reader Configuration</h3>
                                </div>
                                <div className="space-y-3 px-2">
                                    {/* Reader Name Field */}
                                    {currentSchema.properties.reader_name && (
                                        <div>{ReaderFormField({ fieldName: 'reader_name', fieldSchema: currentSchema.properties.reader_name, path: [], formData, onChange: handleChange, errors, connectionConfigList, selectedConnection })}</div>
                                    )}
                                    
                                    {/* File Name Field - only show if source type is File */}
                                    {formData.source?.type === 'File' && (
                                        <div>
                                            {Object.entries(getSourceTypeFields(formData.source.type).properties)
                                                .filter(([fieldName]) => fieldName === 'file_name')
                                                .map(([fieldName, schema]: [string, any]) => (
                                                    <div key={fieldName}>
                                                        {ReaderFormField({ fieldName, fieldSchema: schema, path: ['source'], formData, onChange: handleChange, errors, connectionConfigList, selectedConnection })}
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Full form when right panel is closed */
                            <>
                                {/* Basic Info Section */}
                                <div className="bg-gray-50 p-2.5 rounded-md">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-4 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                                        <h3 className="text-xs font-medium text-gray-700">Basic Information</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 px-2">
                                        {currentSchema.properties.reader_name && (
                                            <div>{ReaderFormField({ fieldName: 'reader_name', fieldSchema: currentSchema.properties.reader_name, path: [], formData, onChange: handleChange, errors, connectionConfigList, selectedConnection })}</div>
                                        )}
                                        {currentSchema.properties.name && (
                                            <div>{ReaderFormField({ fieldName: 'name', fieldSchema: currentSchema.properties.name, path: [], formData, onChange: handleChange, errors, connectionConfigList, selectedConnection })}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Source Configuration Section */}
                                <div className="bg-gray-50 p-2.5 rounded-md">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-4 w-1 bg-gradient-to-b from-green-500 to-green-600 rounded-full" />
                                        <h3 className="text-xs font-medium text-gray-700">Source Configuration</h3>
                                    </div>
                                    <div className="space-y-2 px-2">
                                        <div>{ReaderFormField({ fieldName: 'source', fieldSchema: currentSchema.properties.source, path: [], formData, onChange: handleChange, errors, connectionConfigList, selectedConnection })}</div>

                                        {formData.source?.type && (
                                            <>
                                                {/* File Type Selection */}
                                                {formData.source.type === 'File' && (
                                                    <div className="mb-4">
                                                        {ReaderFormField({ fieldName: 'file_type', fieldSchema: currentSchema.properties.file_type, path: [], formData, onChange: handleChange, errors, connectionConfigList, selectedConnection })}
                                                    </div>
                                                )}

                                                {/* Source Type Fields */}
                                                <div className="grid grid-cols-2 gap-6">
                                                    {Object.entries(getSourceTypeFields(formData.source.type).properties)
                                                        .map(([fieldName, schema]: [string, any]) => (
                                                            <div key={fieldName}>
                                                                {ReaderFormField({ fieldName, fieldSchema: schema, path: ['source'], formData, onChange: handleChange, errors, connectionConfigList, selectedConnection })}
                                                            </div>
                                                        ))}
                                                </div>
                                                <Collapsible className="mt-2">
                                                    <CollapsibleTrigger onClick={()=>setIsAdvanvce(!isAdvance)} className="flex items-center gap-1 text-blue-600 text-xs font-medium cursor-pointer">
                                                        Advanced Options
                                                        <span>{isAdvance ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        {formData.source.type === 'File' && formData.file_type === 'CSV' && (
                                                            <div className="mt-3 bg-gray-50 p-2.5 rounded-md">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div className="h-4 w-1 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full" />
                                                                    <h3 className="text-xs font-medium text-gray-700">CSV Options</h3>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-3 px-2">
                                                                    {Object.entries(csvOptionsSchema.properties).map(([key, schema]: [string, any]) => (
                                                                        <div key={key}>
                                                                            {ReaderFormField({ fieldName: key, fieldSchema: schema, path: ['read_options'], formData, onChange: handleChange, errors, connectionConfigList, selectedConnection })}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
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
