import React, { useState, useEffect } from "react";
import sourceSchema from "./json/Source.json";
import readerSchema from "./json/Reader.json";
import csvOptionsSchema from "./json/CSVOptions.json";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {  Info } from "lucide-react";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { getConnectionConfigList } from "@/store/slices/dataCatalog/datasourceSlice";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


const schemaReferences: Record<string, any> = {
    "schemas/Source.json": sourceSchema,
    "transformations/readers/CSVOptions.json": csvOptionsSchema,
};

interface FormSchema {
    type: string;
    properties: Record<string, any>;
    allOf?: any[];
}

interface FormData {
    name?: string;
    source?: {
        type?: string;
        connection?: {
            connection_config_id?: number;
            [key: string]: any;
        };
        [key: string]: any;
    };
    file_type?: string;
    query?: string;
    read_options?: Record<string, any>;
    [key: string]: any;
}

interface ReaderOptionsFormProps {
    onSubmit?: (data: FormData) => void;
    onClose?: () => void;
    initialData?: FormData;
    onSourceUpdate?: (updatedSource: any) => void;
    nodeId?: string;
}


const isFieldRequired = (
    fieldName: string,
    schema: any,
    path: string[],
    currentFormData: FormData
) => {
    if (Array.isArray(readerSchema.required) && readerSchema.required.includes(fieldName)) {
        return true;
    }

    if (Array.isArray(schema.required) && schema.required.includes(fieldName)) {
        return true;
    }

    if (path[0] === 'source') {
        const sourceType = currentFormData.source?.type;
        if (sourceType) {
            const sourceCondition = sourceSchema.allOf?.find(
                condition => condition.if.properties.type.const === sourceType
            );

            if (sourceCondition?.then?.required?.includes(fieldName)) {
                return true;
            }
        }

        if (sourceSchema.required?.includes(fieldName)) {
            return true;
        }
    }

  

    return false;
};

const formatFieldName = (fieldName: string) => {
    return fieldName
        .replace(/([A-Z])/g, " $1")
        .replace(/^ /, "")
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

const RequiredFieldLabel: React.FC<{ fieldName: string }> = ({ fieldName }) => (
    <div className="flex items-center gap-1">
        {formatFieldName(fieldName)}
        <span className="text-red-500">*</span>
    </div>
);


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


export const ReaderOptionsForm: React.FC<ReaderOptionsFormProps> = ({
    onSubmit,
    onClose,
    initialData,
    onSourceUpdate,
    nodeId
}) => {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState<FormData>({});
    const [currentSchema, setCurrentSchema] = useState<FormSchema>(readerSchema);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const {connectionConfigList} = useAppSelector((state) => state.datasource);
    const [selectedConnection, setSelectedConnection] = useState<any>(null);
console.log(initialData,"initialData")
console.log(connectionConfigList,"connectionConfigList")
    useEffect(() => {
        if (initialData) {
            // Ensure file_type is set from the source object
            setFormData({
                ...initialData,
                file_type: initialData.source?.file_type || initialData.file_type
            });
            // Set selected connection based on initial data
            if (initialData.source?.connection?.connection_config_id) {
                const selectedConn = connectionConfigList.find(
                    conn => conn.id === initialData.source.connection.connection_config_id
                );
                setSelectedConnection(selectedConn);
            }
        }
    }, [initialData, connectionConfigList]);

    useEffect(() => {
        dispatch(getConnectionConfigList({offset: 0, limit: 1000}));
    }, [dispatch]);

    

    useEffect(() => {
        resolveSchema();
    }, [formData]);

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


    const resolveSchema = async () => {
        let resolvedSchema = { ...readerSchema };

        const resolutionQueue = [
            {
                condition: () => formData.source?.type,
                resolver: () => resolveSourceTypeSchema(resolvedSchema)
            },
            {
                condition: () => formData.source?.type === 'File' && formData.file_type,
                resolver: () => resolveFileTypeSchema(resolvedSchema)
            }
          
        ];

        for (const step of resolutionQueue) {
            if (step.condition()) {
                resolvedSchema = await step.resolver();
            }
        }

        setCurrentSchema(resolvedSchema);
    };

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
   

    const renderField = (fieldName: string, fieldSchema: any, path: string[] = []): React.ReactNode => {
        if (!fieldSchema) return null;


        if (fieldSchema.$ref) {
            const referencedSchema = schemaReferences[fieldSchema.$ref];
            if (referencedSchema && referencedSchema.properties) {
                return (
                    <div key={fieldName} className="col-span-3 border p-4 ">
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(referencedSchema.properties).map(
                                ([name, schema]: [string, any]) =>
                                    renderField(name, schema, [...path, fieldName])
                            )}
                        </div>
                    </div>
                );
            }
        }

        const fieldValue = path.reduce(
            (obj, key) => (obj?.[key] || {}),
            formData
        )[fieldName];

        if (fieldSchema.enum) {
            return (
                <div key={fieldName} className="mb-4">
                    <Label>
                        {isFieldRequired(fieldName, fieldSchema, path, formData) ? (
                            <RequiredFieldLabel fieldName={fieldSchema.title || fieldName} />
                        ) : (
                            fieldSchema.title || formatFieldName(fieldName)
                        )}
                    </Label>
                    <select
                        name={fieldName}
                        value={fieldValue || ""}
                        onChange={(e) => handleChange(e, path)}
                        className={`w-full p-2 border rounded bg-white shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 ${isFieldRequired(fieldName, fieldSchema, path, formData) && !fieldValue ? 'border-red-500' : ''
                            }`}
                    >
                        <option value="">Select {formatFieldName(fieldName)}</option>
                        {fieldSchema.enum.map((option: string) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    {errors[fieldName] && (
                        <p className="text-red-500 text-sm">{errors[fieldName]}</p>
                    )}
                </div>

            );
        }

        

        if (fieldName.toLowerCase() === 'connection' && fieldSchema.endpoint) {
            return (
                <div key={fieldName} className="space-y-4">
                    <div className="w-full space-y-1">
                        <Label className="text-xs font-medium text-gray-700">
                            Connection
                            {isFieldRequired(fieldName, fieldSchema, path, formData) && (
                                <span className="text-red-500 ml-0.5">*</span>
                            )}
                        </Label>
                        <select
                            name="connection_config_id"
                            value={formData.source?.connection?.connection_config_id || ""}
                            onChange={(e) => handleChange(e, path)}
                            className="w-full h-8 text-sm border rounded bg-white shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                            <option value="">Select Connection</option>
                            {connectionConfigList.map((conn) => (
                                <option key={conn.id} value={conn.id}>
                                    {conn.connection_config_name} ({conn.custom_metadata?.type})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Show file_path_prefix input when type is Local */}
                    {selectedConnection?.custom_metadata?.type === 'Local' && (
                        <div className="w-full space-y-1">
                            <Label className="text-xs font-medium text-gray-700">
                                File Path Prefix
                            </Label>
                            <Input
                                name="file_path_prefix"
                                value={formData.source?.connection?.file_path_prefix || selectedConnection?.custom_metadata?.file_path_prefix || ""}
                                onChange={(e) => handleChange(e, path)}
                                className="h-8 text-sm"
                                placeholder="Enter file path prefix"
                            />
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div key={fieldName} className="w-full space-y-1">
                <div className="flex items-center gap-1.5">
                    <Label className="text-xs font-medium text-gray-700">
                        {fieldSchema.title || formatFieldName(fieldName)}
                        {isFieldRequired(fieldName, fieldSchema, path, formData) && (
                            <span className="text-red-500 ml-0.5">*</span>
                        )}
                    </Label>
                    {fieldSchema.description && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs max-w-xs">{fieldSchema.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <Input
                    type={fieldSchema.bh_secret ? "password" : fieldSchema.type === "number" ? "number" : "text"}
                    name={fieldName}
                    value={fieldValue || ""}
                    onChange={(e) => handleChange(e, path)}
                    placeholder={`Enter ${formatFieldName(fieldName)}`}
                    className="h-8 text-sm"
                />
                {errors[fieldName] && (
                    <p className="text-xs text-red-500">{errors[fieldName]}</p>
                )}
            </div>
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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

        validateFields(currentSchema);

        if (missingFields.length > 0) {
            setErrors(missingFields.reduce((acc, field) => {
                acc[field] = 'This field is required';
                return acc;
            }, {} as Record<string, string>));

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
                                connection_name: formData.source?.connection?.connection_name
                            },
                            custom_metadata: formData
                        }
                    }
                }
            };

            if (onSourceUpdate) {
                onSourceUpdate(sourceData);
            }

            onClose?.();
            toast.success("Reader configuration saved successfully");
        } catch (error) {
            console.error('Error during form submission:', error);
            toast.error('An error occurred while saving the configuration.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full w-full max-w-5xl mx-auto bg-white">
            <Card className="shadow-md border border-gray-200 my-2">
                <CardContent className="p-6 ">
                    {/* Header Section */}
                    <div className="mb-6 pb-3 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Reader Configuration</h2>
                        <p className="text-sm text-gray-500 mt-1">Configure your data reader settings</p>
                    </div>

                    {/* Form Content */}
                    <div className="space-y-6">
                        {/* Basic Info Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-6">
                                {currentSchema.properties.reader_name && (
                                    <div>{renderField('reader_name', currentSchema.properties.reader_name)}</div>
                                )}
                                {currentSchema.properties.name && (
                                    <div>{renderField('name', currentSchema.properties.name)}</div>
                                )}
                            </div>
                        </div>

                        {/* Source Configuration Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Source Configuration</h3>
                            <div className="space-y-4">
                                <div>{renderField('source', currentSchema.properties.source)}</div>

                                {formData.source?.type && (
                                    <>
                                        {/* File Type Selection */}
                                        {formData.source.type === 'File' && (
                                            <div className="mb-4">
                                                {renderField('file_type', currentSchema.properties.file_type)}
                                            </div>
                                        )}

                                        {/* Source Type Fields */}
                                        <div className="grid grid-cols-2 gap-6">
                                            {Object.entries(getSourceTypeFields(formData.source.type).properties)
                                                .map(([fieldName, schema]: [string, any]) => (
                                                    <div key={fieldName}>
                                                        {renderField(fieldName, schema, ['source'])}
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
                                                            {renderField(key, schema, ['read_options'])}
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
