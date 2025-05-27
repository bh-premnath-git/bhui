import React, { useState, useEffect, useCallback } from "react";
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
}




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

    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState<FormData>(initialData || {});
    const [currentSchema, setCurrentSchema] = useState<FormSchema>(readerSchema);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { connectionConfigList } = useAppSelector((state) => state.datasource);
    const [selectedConnection, setSelectedConnection] = useState<any>(null);
    const [isAdvance, setIsAdvanvce] = useState<boolean>(false);

    useEffect(() => {
        if (initialData) {
            const selectedConn = connectionConfigList.find(
                conn => conn.connection_config_name === initialData.source?.connection?.name
            );

            // Set source_name from data_src_name if it's not already set
            const sourceName = initialData.source?.name || initialData.source?.data_src_name || initialData.data_src_name || '';

            setFormData({
                ...initialData,
                reader_name: initialData.reader_name || sourceName,
                file_type: initialData.source?.connection?.file_type?.toUpperCase() || initialData.file_type,
                source: {
                    ...initialData.source,
                    name: sourceName,
                    connection: {
                        ...initialData.source.connection,
                        connection_config_id: selectedConn?.id || initialData.source.connection.connection_config_id || initialData.source?.connection_config_id,
                        name: selectedConn?.connection_config_name || initialData.source.connection.name,
                        connection_type: selectedConn?.custom_metadata?.connection_type || initialData.source.connection.connection_type,
                        database: selectedConn?.custom_metadata?.database || initialData.source.connection.database,
                        schema: selectedConn?.custom_metadata?.schema || initialData.source.connection.schema,
                        secret_name: selectedConn?.custom_metadata?.secret_name || initialData.source.connection.secret_name
                    },
                    table_name: initialData.source?.table_name || ''
                }
            });

            setSelectedConnection(selectedConn);
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
                        }
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
                newData.source = {
                    ...newData.source,
                    name: value
                };
                newData.name = value;
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
        console.log(formData, "formData")
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
                        label: formData.reader_name || formData.source?.name || formData.source?.data_src_name,
                        source: {
                            data_src_id: formData.source?.data_src_id,
                            data_src_name: formData.source?.name || formData.reader_name,
                            source_name: formData.source?.name || formData.reader_name,
                            data_src_desc: formData.reader_name,
                            connection_type: formData.source?.connection?.connection_type,
                            connection_config_id: formData.source?.connection?.connection_config_id,
                            file_name: formData.source?.file_name,
                            file_path_prefix: formData.source?.connection?.file_path_prefix,
                            file_type: formData?.file_type,
                            table_name: formData.source?.table_name,
                            type: formData.source?.type,
                            connection_config: {
                                custom_metadata: formData.source?.connection,
                                connection_config_name: formData.source?.connection?.name
                            },
                            name: formData.source?.name || formData.reader_name
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
                <div className="p-3">
                    {/* Form Content */}
                    <div className="space-y-3">
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
                                            <CollapsibleTrigger className="flex items-center gap-1 text-blue-600 text-xs font-medium cursor-pointer">
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
