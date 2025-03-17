import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import targetSchema from "@/components/bh-reactflow-comps/builddata/json/Target.json";
import writerSchema from "@/components/bh-reactflow-comps/builddata/json/Writer.json";
import csvOptionsSchema from "@/components/bh-reactflow-comps/builddata/json/CSVOptions.json";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { getConnectionConfigList } from "@/store/slices/dataCatalog/datasourceSlice";
import { usePipelineContext } from "@/context/designers/DataPipelineContext";
const schemaReferences: Record<string, any> = {
    "schemas/Target.json": targetSchema,
    "transformations/writers/CSVOptions.json": csvOptionsSchema,
};

interface FormSchema {
    type: string;
    properties: Record<string, any>;
    allOf?: any[];
}

interface WriterSchema extends FormSchema {
    properties: {
        name: { type: string; minLength: number; };
        target: { type: string; $ref: string; };
        file_type?: { type: string; enum: string[]; };
        write_options?: {
            type: string;
            properties: Record<string, any>;
        };
        [key: string]: any; // Allow additional properties
    };
}

interface FormData {
    name?: string;
    target?: {
        target_type?: string;
        connection?: {
            connection_config_id?: number;
            [key: string]: any;
        };
        [key: string]: any;
    };
    file_type?: string;
    write_options?: Record<string, any>;
    [key: string]: any;
}

interface TargetPopUpProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: FormData;
    onSourceUpdate?: (updatedSource: any) => void;
    nodeId?: string;
    source?: any;
}

const isFieldRequired = (
    fieldName: string,
    schema: any,
    path: string[],
    currentFormData: FormData
) => {
    if (Array.isArray(writerSchema.required) && writerSchema.required.includes(fieldName)) {
        return true;
    }

    if (Array.isArray(schema.required) && schema.required.includes(fieldName)) {
        return true;
    }

    if (path[0] === 'target') {
        const targetType = currentFormData.target?.target_type;
        if (targetType) {
            const targetCondition = targetSchema.allOf?.find(
                condition => condition.if.properties.target_type?.const === targetType
            );
            if (targetCondition?.then?.required?.includes(fieldName)) {
                return true;
            }
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

export default function TargetPopUp({ isOpen, onClose, initialData, onSourceUpdate, nodeId, source }: TargetPopUpProps) {
    const [formData, setFormData] = useState<FormData>({});
    const [currentSchema, setCurrentSchema] = useState<FormSchema>(writerSchema);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { connectionConfigList } = useAppSelector((state) => state.datasource);
    const [selectedConnection, setSelectedConnection] = useState<any>(null);
    const dispatch = useAppDispatch();
    const { pipelineJson } = usePipelineContext();

    console.log(source,"source")
    console.log(initialData,"initialData")
    console.log(pipelineJson,"pipelineJson")
    useEffect(() => {
        dispatch(getConnectionConfigList({offset: 0, limit: 1000}));
    }, [dispatch]);

    useEffect(() => {
        if (source) {
            console.log(source.source,"source")
            let pipelineJsonData = pipelineJson?.targets?.find((item: any) => item.name === source?.source?.name);
            console.log(pipelineJsonData,"pipelineJsonData")
            const initialFormData: FormData = {
                name: source.title,
                target: {
                    target_type: source.source?.target_type,
                    target_name: source.source?.target_name,
                    load_mode: source.source?.load_mode,
                    file_name: source.source?.file_name,
                    connection: {
                        connection_config_id: source.source?.connection?.connection_config_id,
                        file_path_prefix: source.source?.connection?.file_path_prefix,
                        type: source.source?.connection?.connection_type,
                        connection_name: source.source?.connection?.name
                    }
                },
                file_type: source.source?.file_type||pipelineJsonData?.target?.file_type?.toUpperCase()||'CSV',
                write_options: source.transformationData?.write_options
            };

            setFormData(initialFormData);

            // Set selected connection if connection_config_id exists
            if (source.source?.connection?.connection_config_id) {
                const selectedConn = connectionConfigList.find(
                    conn => conn.id === source.source.connection.connection_config_id
                );
                setSelectedConnection(selectedConn || null);
            }
        } else if (initialData) {
            setFormData(initialData);
            if (initialData.target?.connection?.connection_config_id) {
                const selectedConn = connectionConfigList.find(
                    conn => conn.id === initialData.target.connection.connection_config_id
                );
                setSelectedConnection(selectedConn || null);
            }
        }
    }, [source, initialData, connectionConfigList]);

    useEffect(() => {
        resolveSchema();
    }, [formData]);

    const resolveSchema = async () => {
        let resolvedSchema = { ...writerSchema } as WriterSchema;

        if (formData.target?.target_type === 'File' && formData.file_type === 'CSV') {
            resolvedSchema = {
                ...resolvedSchema,
                properties: {
                    ...resolvedSchema.properties,
                    write_options: {
                        type: 'object',
                        properties: csvOptionsSchema.properties
                    }
                }
            };
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
                    if (!newData.target) newData.target = {};
                    if (!newData.target.connection) newData.target.connection = {};
                    newData.target.connection = {
                        ...newData.target.connection,
                        connection_config_id: selectedConn.id,
                        type: selectedConn.custom_metadata?.type || '',
                        connection_name: selectedConn.connection_config_name || ''
                    };
                }
            } else if (name === 'file_path_prefix') {
                if (!newData.target) newData.target = {};
                if (!newData.target.connection) newData.target.connection = {};
                newData.target.connection.file_path_prefix = value;
            } else if (name === 'target_type') {
                if (!newData.target) newData.target = {};
                newData.target.target_type = value;
            } else if (name === 'load_mode') {
                if (!newData.target) newData.target = {};
                newData.target.load_mode = value;
            } else if (name === 'target_name') {
                if (!newData.target) newData.target = {};
                newData.target.target_name = value;
            } else if (name === 'file_name' && newData.target?.target_type === 'File') {
                if (!newData.target) newData.target = {};
                newData.target.file_name = value;
            } else if (name === 'file_type' && newData.target?.target_type === 'File') {
                newData.file_type = value;
            } else {
                // Handle other nested fields
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

    const renderField = (fieldName: string, fieldSchema: any, path: string[] = []) => {
        if (!fieldSchema) return null;

        if (fieldSchema.$ref) {
            const referencedSchema = schemaReferences[fieldSchema.$ref];
            if (referencedSchema && referencedSchema.properties) {
                return (
                    <div key={fieldName} className="col-span-3 border p-4">
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

        // Special handling for connection field
        if (fieldName === 'connection') {
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
                            value={formData.target?.connection?.connection_config_id || ""}
                            onChange={(e) => handleChange(e, path)}
                            className="w-full h-9 text-sm border rounded bg-white shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring px-3"
                        >
                            <option value="">Select Connection</option>
                            {connectionConfigList.map((conn) => (
                                <option key={conn.id} value={conn.id}>
                                    {conn.connection_config_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedConnection?.custom_metadata?.type === 'Local' && (
                        <div className="w-full space-y-1">
                            <Label className="text-xs font-medium text-gray-700">
                                File Path Prefix
                            </Label>
                            <Input
                                name="file_path_prefix"
                                value={formData.target?.connection?.file_path_prefix || ""}
                                onChange={(e) => handleChange(e, path)}
                                className="h-8 text-sm"
                                placeholder="Enter file path prefix"
                            />
                        </div>
                    )}
                </div>
            );
        }

        // Handle enum fields (select boxes)
        if (fieldSchema.enum) {
            const currentValue = path.length > 0 
                ? path.reduce((obj, key) => obj?.[key] || {}, formData)[fieldName]
                : formData[fieldName];

            return (
                <div key={fieldName} className="mb-2">
                    <Label className="text-xs font-medium text-gray-700">
                        {isFieldRequired(fieldName, fieldSchema, path, formData) ? (
                            <RequiredFieldLabel fieldName={fieldSchema.title || fieldName} />
                        ) : (
                            fieldSchema.title || formatFieldName(fieldName)
                        )}
                    </Label>
                    <select
                        name={fieldName}
                        value={currentValue || ""}
                        onChange={(e) => handleChange(e, path)}
                        className="w-full h-9 text-sm border rounded bg-white shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring px-3"
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

        // Regular input fields
        return (
            <div key={fieldName} className="w-full space-y-0.5">
                <Label className="text-xs font-medium text-gray-600">
                    {isFieldRequired(fieldName, fieldSchema, path, formData) ? (
                        <RequiredFieldLabel fieldName={fieldSchema.title || fieldName} />
                    ) : (
                        fieldSchema.title || formatFieldName(fieldName)
                    )}
                </Label>
                <Input
                    name={fieldName}
                    value={fieldValue || ""}
                    onChange={(e) => handleChange(e, path)}
                    className="h-9 text-sm bg-white"
                    placeholder={`Enter ${formatFieldName(fieldName)}`}
                />
                {errors[fieldName] && (
                    <p className="text-xs text-red-500">{errors[fieldName]}</p>
                )}
            </div>
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Record<string, string> = {};

        // Validate required fields
        if (!formData.name) errors.name = "Name is required";
        if (!formData.target?.target_type) errors["target.target_type"] = "Target type is required";
        if (!formData.target?.load_mode) errors["target.load_mode"] = "Load mode is required";

        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            toast.error("Please fill all required fields");
            return;
        }

        try {
            const connectionData = connectionConfigList.find(conn => conn.id === formData.target?.connection?.connection_config_id);
            
            // Use formData.name as the nodeTitle
            const nodeTitle = formData.name;
            console.log(formData,"nodeTitle")
            // Create a properly structured source data object
            const sourceData = {
                nodeId,
                sourceData: {
                    data: {
                        ...formData,
                        label: formData.name,
                        title: formData.name, // Set the title to the name entered by user
                        source: {
                            name: formData.name, // Also update the source name
                            target_type: formData.target?.target_type,
                            target_name: formData.target?.target_name,
                            file_type: formData.file_type,
                            connection: {
                                name: connectionData?.connection_config_name,
                                connection_type: connectionData?.custom_metadata?.type,
                                file_path_prefix: formData.target?.connection?.file_path_prefix,
                                connection_config_id: formData.target?.connection?.connection_config_id
                            },
                            file_name: formData.target?.file_name ,
                            load_mode: formData.target?.load_mode 
                        },
                        transformationData: {
                            ...formData, 
                            name: nodeTitle, // Update transformation name as well
                            file_type: formData.file_type || "csv",
                            write_options: formData.write_options || {
                                header: true,
                                sep: "|"
                            }
                        }
                    }
                }
            };
console.log(sourceData,"sourceData")
            if (onSourceUpdate) {
                onSourceUpdate(sourceData);
            }
            onClose();
            toast.success("Target configuration saved successfully");
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to save configuration');
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[1200px] h-[750px] p-0 overflow-hidden flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-black to-black flex items-center justify-center">
                                <span className="text-white text-sm font-medium">T</span>
                            </div>
                            <h2 className="text-lg font-medium text-gray-800">
                                Target Configuration
                            </h2>
                        </div>
                        {/* <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-full h-7 w-7 hover:bg-gray-100"
                        >
                            <X className="h-4 w-4 text-gray-400" />
                        </Button> */}
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
                                {renderField('name', currentSchema.properties.name)}
                                {renderField('target_name', targetSchema.properties.target_name, ['target'])}
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
                                    {renderField('target_type', targetSchema.properties.target_type, ['target'])}
                                    {renderField('load_mode', targetSchema.properties.load_mode, ['target'])}
                                </div>
                                
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    {renderField('connection', targetSchema.properties.connection, ['target'])}
                                </div>

                                {formData.target?.load_mode === 'merge' && (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        {renderField('merge_keys', targetSchema.properties.merge_keys, ['target'])}
                                    </div>
                                )}

                                {formData.target?.target_type === 'File' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                                            {renderField('file_name', targetSchema.allOf[1].then.properties.file_name, ['target'])}
                                            {renderField('file_type', writerSchema.allOf[0].then.properties.file_type)}
                                        </div>
                                        
                                        {formData.file_type === 'CSV' && (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-700 mb-3">CSV Options</h3>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {Object.entries(csvOptionsSchema.properties).map(([key, schema]: [string, any]) => (
                                                        <div key={key}>
                                                            {renderField(key, schema, ['write_options'])}
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
                            className="px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-black to-black hover:from-black hover:to-black text-white"
                        >
                            Save Configuration
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}