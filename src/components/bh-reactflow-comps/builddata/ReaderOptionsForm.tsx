import React, { useState, useEffect, useCallback } from "react";
import sourceSchema from "./json/Source.json";
import readerSchema from "./json/Reader.json";
import csvOptionsSchema from "./json/CSVOptions.json";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {  Info } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { getConnectionConfigList } from "@/store/slices/dataCatalog/datasourceSlice";

import { FormData, ReaderFormField } from "./components/form/reader-form-field";


const schemaReferences: Record<string, typeof sourceSchema | typeof csvOptionsSchema> = {
    "schemas/Source.json": sourceSchema,
    "transformations/readers/CSVOptions.json": csvOptionsSchema,
};

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
}




const formatFieldName = (fieldName: string) => {
    return fieldName
        .replace(/([A-Z])/g, " $1")
        .replace(/^ /, "")
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
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
    nodeId
}) => {
    console.log(initialData, "initialData");

    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState<FormData>(initialData || {});
    const [currentSchema, setCurrentSchema] = useState<FormSchema>(readerSchema);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { connectionConfigList } = useAppSelector((state) => state.datasource);
    const [selectedConnection, setSelectedConnection] = useState<any>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                file_type: initialData.source?.connection?.file_type.toUpperCase() || initialData.file_type,
                source: {
                    ...initialData.source,
                    connection: {
                        ...initialData.source.connection
                    }
                }
            });

            const selectedConn = connectionConfigList.find(
                conn => conn.id === initialData.source?.connection?.connection_config_id
            );
            setSelectedConnection(selectedConn);
        }
    }, [initialData, connectionConfigList]);

    useEffect(() => {
        const fetchConnectionConfigs = async () => {
            try {
                await dispatch(getConnectionConfigList({offset: 0, limit: 1000}));
            } catch (error) {
                console.error('Error fetching connection configs:', error);
                toast.error('Failed to load connection configurations');
            }
        };

        fetchConnectionConfigs();
    }, [dispatch]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, path: string[] = []) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const newData = { ...prev };
            
            if (name === 'connection_config_id') {
                const selectedConn = connectionConfigList.find(conn => conn.id === parseInt(value));
                setSelectedConnection(selectedConn);
                
                if (selectedConn) {
                    if (!newData.source) newData.source = {};
                    newData.source.connection = {
                        ...newData.source.connection,
                        connection_config_id: selectedConn.id,
                        type: selectedConn.custom_metadata?.type || '',
                        file_path_prefix: selectedConn.custom_metadata?.file_path_prefix || '',
                        connection_name: selectedConn.connection_config_name || ''
                    };
                }
            } else if (name === 'type') {
                if (!newData.source) newData.source = {};
                newData.source = {
                    ...newData.source,
                    type: value,
                    connection: newData.source.connection // Preserve existing connection data
                };
            } else if (name === 'file_path_prefix') {
                if (!newData.source) newData.source = {};
                if (!newData.source.connection) newData.source.connection = {};
                newData.source.connection.file_path_prefix = value;
            } else if (name === 'file_name') {
                if (!newData.source) newData.source = {};
                newData.source.file_name = value;
            } else if (name === 'name') {
                if (!newData.source) newData.source = {};
                newData.source.name = value;
                newData.name = value;
            } else {
                if (path.length === 0) {
                    newData[name] = value;
                } else {
                    let current = newData;
                    for (let i = 0; i < path.length - 1; i++) {
                        if (!current[path[i]]) current[path[i]] = {};
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
            const connectionData = connectionConfigList.find(conn => 
                conn.id === formData.source?.connection?.connection_config_id
            );
            
            const sourceData = {
                nodeId,
                sourceData: {
                    data: {
                        label: formData.reader_name || formData.source?.source_name,
                        source: {
                            data_src_id: formData.source?.data_src_id,
                            data_src_name: formData.reader_name,
                            data_src_desc: formData.reader_name,
                            connection_type: connectionData?.custom_metadata?.type,
                            connection_config_id: formData.source?.connection?.connection_config_id,
                            file_name: formData.source?.file_name,
                            file_path_prefix: formData.source?.connection?.file_path_prefix,
                            file_type: formData?.file_type,
                            connection_config: {
                                connection_name: formData.source?.connection?.connection_name,
                                file_type: formData?.file_type
                            },
                            custom_metadata: formData
                        }
                    }
                }
            };

            onSourceUpdate?.(sourceData);
            onClose?.();
            toast.success("Reader configuration saved successfully");
        } catch (error) {
            console.error('Error during form submission:', error);
            toast.error('An error occurred while saving the configuration.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-[750px] w-full max-w-5xl mx-auto bg-white">
            <Card className="shadow-md border border-gray-200 my-2">
                <CardContent className="p-6 ">
                    {/* Header Section */}
                    <div className="mb-6 pb-3 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Reader Configuration</h2>
                        <p className="text-sm text-gray-500 mt-1">Configure your data reader settings</p>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
                        {/* Basic Info Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-6">
                                {currentSchema.properties.reader_name && (
                                    <div>{ReaderFormField({ fieldName: 'reader_name', fieldSchema: currentSchema.properties.reader_name, path: [], formData, onChange: handleChange, errors, connectionConfigList, selectedConnection })}</div>
                                )}
                                {currentSchema.properties.name && (
                                    <div>{ReaderFormField({ fieldName: 'name', fieldSchema: currentSchema.properties.name, path: [], formData, onChange: handleChange, errors, connectionConfigList, selectedConnection })}</div>
                                )}
                            </div>
                        </div>

                        {/* Source Configuration Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Source Configuration</h3>
                            <div className="space-y-4">
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

                                        {/* CSV Options */}
                                        {formData.source.type === 'File' && formData.file_type === 'CSV' && (
                                            <div className="mt-6">
                                                <h3 className="text-sm font-medium text-gray-700 mb-3">CSV Options</h3>
                                                <div className="grid grid-cols-3 gap-6">
                                                    {Object.entries(csvOptionsSchema.properties).map(([key, schema]: [string, any]) => (
                                                        <div key={key}>
                                                            {ReaderFormField({ fieldName: key, fieldSchema: schema, path: ['read_options'], formData, onChange: handleChange, errors, connectionConfigList, selectedConnection })}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 mt-6 pb-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium border-gray-300 hover:bg-gray-50"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium bg-black hover:bg-gray-900 text-white"
                >
                    Save Configuration
                </Button>
            </div>
        </form>
    );
};
