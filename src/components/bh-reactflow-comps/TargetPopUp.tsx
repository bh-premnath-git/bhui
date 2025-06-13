/**
 * TargetPopUp Component
 * 
 * This component can be used in two modes:
 * 1. Dialog mode: When isOpen is true, it renders as a modal dialog
 * 2. Inline mode: When isOpen is false, it renders directly in the parent component (used in chat panel)
 */
import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Database, Save, FileText, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import targetSchema from "@/components/bh-reactflow-comps/builddata/json/Target.json";
import writerSchema from "@/components/bh-reactflow-comps/builddata/json/Writer.json";
import csvOptionsSchema from "@/components/bh-reactflow-comps/builddata/json/CSVOptions.json";
import connectionSchema from "@/components/bh-reactflow-comps/builddata/json/Connection.json";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { getConnectionConfigList } from "@/store/slices/dataCatalog/datasourceSlice";
import { usePipelineContext } from "@/context/designers/DataPipelineContext";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
const schemaReferences: Record<string, any> = {
    "schemas/Target.json": targetSchema,
    "transformations/writers/CSVOptions.json": csvOptionsSchema,
    "Connection.json": connectionSchema,
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
            items?: { $ref: string; };
            properties?: Record<string, any>; // Added for compatibility with our runtime modifications
        };
        [key: string]: any; // Allow additional properties
    };
}

interface FormData {
    name?: string;
    target?: {
        target_type?: string;
        target_name?: string;
        table_name?: string;
        file_name?: string;
        load_mode?: string;
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
    <div className="flex items-center">
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
    const [isAdvance, setIsAdvanvce] = useState<boolean>(false);
    const [isInlineMode, setIsInlineMode] = useState<boolean>(false);
    
    // Determine if we're in inline mode (used in chat panel) or modal mode (used in canvas)
    useEffect(() => {
        // When isOpen is false but we still want to render the component,
        // we're in inline mode (used in the chat panel)
        const inlineMode = isOpen === false;
        setIsInlineMode(inlineMode);
        console.log('TargetPopUp mode:', inlineMode ? 'inline (chat panel)' : 'modal (canvas)');
    }, [isOpen]);
    useEffect(() => {
        dispatch(getConnectionConfigList({ offset: 0, limit: 1000 }));
    }, [dispatch]);

    /**
     * Initialize form data from either source or initialData
     * 
     * This component can be initialized in two ways:
     * 1. With source data (when used in canvas mode)
     * 2. With initialData (when used in chat panel mode)
     */
    useEffect(() => {
        console.log('TargetPopUp initializing with:', {
            source,
            initialData,
            isInlineMode,
            nodeId
        });

        if (source) {
            console.log('Using source data for initialization');
            let connection = source.source?.connection ? { ...source.source.connection } : {};
            connection.connection_config_id = source?.source?.connection?.connection_config_id || 
                connectionConfigList.find((item: any) => item.connection_config_name === source?.source?.connection?.name)?.id;
            console.log('Connection data:', connection);
            
            let pipelineJsonData = pipelineJson?.targets?.find((item: any) => item.name === source?.source?.name);
            
            // Make sure we have a valid initialFormData object with all required fields
            const targetType = source.source?.target_type || pipelineJsonData?.target?.target_type || 'File';
            
            // Create base form data with common fields
            const initialFormData: FormData = {
                name: source.source?.name || '', // Use source name or empty, not the generated title
                target: {
                    target_type: targetType,
                    target_name: source.source?.target_name || '',
                    load_mode: source.source?.load_mode || 'append',
                    connection: connection
                },
                write_options: source.transformationData?.write_options || {
                    header: true,
                    sep: ",",
                    createDisposition: 'CREATE_IF_NEEDED',
                    writeMethod: targetType === 'Relational' ? 'direct' : 'APPEND'
                }
            };
            
            // Add target-type specific fields
            if (targetType === 'Relational') {
                initialFormData.target.table_name = source.source?.table_name || '';
            } else if (targetType === 'File') {
                initialFormData.target.file_name = source.source?.file_name || '';
                initialFormData.file_type = source.source?.file_type || pipelineJsonData?.target?.file_type?.toUpperCase() || 'CSV';
            }

            console.log('Setting form data from source:', initialFormData);
            setFormData(initialFormData);

            // Set selected connection if connection_config_id exists
            if (source.source?.connection?.connection_config_id) {
                const selectedConn = connectionConfigList.find(
                    conn => conn.id === source.source.connection.connection_config_id
                );
                setSelectedConnection(selectedConn || null);
            }
        } else if (initialData) {
            console.log('Using initialData for initialization:', initialData);
            
            // Make sure we have a valid initialData object with all required fields
            const targetType = initialData.target?.target_type || 'File';
            
            // Create base form data with common fields
            const safeInitialData: FormData = {
                name: '', // Always start with empty name for Target forms
                target: {
                    target_type: targetType,
                    target_name: initialData.target?.target_name || '',
                    load_mode: initialData.target?.load_mode || 'append',
                    connection: initialData.target?.connection || {}
                },
                write_options: initialData.write_options || {
                    header: true,
                    sep: ",",
                    createDisposition: 'CREATE_IF_NEEDED',
                    writeMethod: targetType === 'Relational' ? 'direct' : 'APPEND'
                }
            };
            
            // Add target-type specific fields
            if (targetType === 'Relational') {
                safeInitialData.target.table_name = initialData.target?.table_name || '';
            } else if (targetType === 'File') {
                safeInitialData.target.file_name = initialData.target?.file_name || '';
                safeInitialData.file_type = initialData.file_type || 'CSV';
            }
            
            console.log('Safe initialData:', safeInitialData);
            setFormData(safeInitialData);
            
            if (initialData.target?.connection?.connection_config_id) {
                const selectedConn = connectionConfigList.find(
                    conn => conn.id === initialData.target.connection.connection_config_id
                );
                console.log('Selected connection:', selectedConn);
                setSelectedConnection(selectedConn || null);
            }
        } else {
            console.log('No source or initialData provided');
        }
        
        console.log('Selected connection:', selectedConnection);
        console.log('Current form data:', formData);
    }, [source, initialData, connectionConfigList, isInlineMode, nodeId]);

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
            // Create a deep copy of the previous state
            const newData = JSON.parse(JSON.stringify(prev));

            if (name === 'connection_config_id') {
                const selectedConn = connectionConfigList.find(conn => conn.id === parseInt(value));
                setSelectedConnection(selectedConn);

                if (selectedConn) {
                    if (!newData.target) newData.target = {};
                    // Reset connection object to avoid keeping old connection details
                    newData.target.connection = {
                        connection_config_id: selectedConn.id,
                        type: selectedConn.custom_metadata?.type || '',
                        connection_name: selectedConn.connection_config_name || ''
                    };
                }
            } else if (name === 'target_type') {
                if (!newData.target) newData.target = {};
                newData.target.target_type = value;

                // Reset connection-specific fields when target type changes
                if (newData.target.connection) {
                    // Keep only the connection ID and basic info
                    const connectionId = newData.target.connection.connection_config_id;
                    const connectionType = newData.target.connection.type;
                    const connectionName = newData.target.connection.connection_name;
                    
                    // Reset connection object to avoid keeping fields from different target types
                    newData.target.connection = {
                        connection_config_id: connectionId,
                        type: connectionType,
                        connection_name: connectionName
                    };
                }

                // Set default values based on target type
                if (value === 'Relational') {
                    // Reset file-specific fields
                    if (newData.target.file_name) delete newData.target.file_name;
                    if (newData.target.connection?.file_path_prefix) delete newData.target.connection.file_path_prefix;
                    
                    newData.write_options = {
                        createDisposition: 'CREATE_IF_NEEDED',
                        writeMethod: 'direct'
                    };

                    // If target_name exists but table_name doesn't, set table_name to match target_name
                    if (newData.target.target_name && (!newData.target.table_name || newData.target.table_name === '')) {
                        newData.target.table_name = newData.target.target_name;
                    }
                } else if (value === 'File') {
                    // Reset relational-specific fields
                    if (newData.target.table_name) delete newData.target.table_name;
                    
                    newData.write_options = {
                        header: true,
                        sep: ",",
                        createDisposition: 'CREATE_IF_NEEDED',
                        writeMethod: 'APPEND'
                    };
                    
                    // If target_name exists but file_name doesn't, set file_name to match target_name
                    if (newData.target.target_name && (!newData.target.file_name || newData.target.file_name === '')) {
                        newData.target.file_name = newData.target.target_name;
                    }
                }
            } else if (name === 'file_path_prefix') {
                if (!newData.target) newData.target = {};
                if (!newData.target.connection) newData.target.connection = {};
                newData.target.connection.file_path_prefix = value;
            } else if (name === 'target_name') {
                if (!newData.target) newData.target = {};
                newData.target.target_name = value;
                
                // Auto-sync name field with target_name
                newData.name = value;
                console.log('Auto-synced name with target_name:', value);
                
                // Auto-sync table_name or file_name based on target_type
                if (newData.target.target_type === 'Relational') {
                    newData.target.table_name = value;
                    console.log('Auto-synced table_name with target_name:', value);
                } else if (newData.target.target_type === 'File') {
                    newData.target.file_name = value;
                    console.log('Auto-synced file_name with target_name:', value);
                }
            } else if (name === 'table_name') {
                if (!newData.target) newData.target = {};
                newData.target.table_name = value;
                
                // Auto-sync target_name and name with table_name
                newData.target.target_name = value;
                newData.name = value;
                console.log('Auto-synced target_name and name with table_name:', value);
            } else if (name === 'load_mode') {
                if (!newData.target) newData.target = {};
                newData.target.load_mode = value;
            } else if (name === 'file_name' && newData.target?.target_type === 'File') {
                if (!newData.target) newData.target = {};
                newData.target.file_name = value;
                
                // Auto-sync target_name and name with file_name
                newData.target.target_name = value;
                newData.name = value;
                console.log('Auto-synced target_name and name with file_name:', value);
            } else if (name === 'file_type' && newData.target?.target_type === 'File') {
                newData.file_type = value;
            } else if (name === 'name') {
                // Handle the main name field - auto-sync with target_name and file_name/table_name
                console.log('Name field changed to:', value);
                newData.name = value;
                
                if (!newData.target) newData.target = {};
                
                // Auto-sync target_name with name
                newData.target.target_name = value;
                console.log('Auto-synced target_name with name:', value);
                
                // Auto-sync file_name or table_name based on target_type
                if (newData.target.target_type === 'File') {
                    newData.target.file_name = value;
                    console.log('Auto-synced file_name with name:', value);
                } else if (newData.target.target_type === 'Relational') {
                    newData.target.table_name = value;
                    console.log('Auto-synced table_name with name:', value);
                }
            } else {
                // Handle nested fields using the path parameter
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

    /**
     * Renders form fields based on the schema
     * 
     * This function handles different field types:
     * - Referenced fields (using $ref)
     * - Connection fields (special handling)
     * - Enum fields (select boxes)
     * - Regular input fields
     * 
     * It works in both inline mode (chat panel) and dialog mode (canvas)
     */
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
            const filteredConnections = getFilteredConnections();

            return (
                <div key={fieldName} className="space-y-2">
                    <div className="w-full space-y-0.5">
                        <Label className="text-xs font-medium text-gray-700">
                            Connection
                            {isFieldRequired(fieldName, fieldSchema, path, formData) && (
                                <span className="text-red-500">*</span>
                            )}
                        </Label>
                        <select
                            name="connection_config_id"
                            value={formData.target?.connection?.connection_config_id || ""}
                            onChange={(e) => handleChange(e, path)}
                            className="w-full h-8 text-sm border rounded bg-white shadow-sm focus:ring-1 focus:ring-ring px-2"
                        >
                            <option value="">Select Connection</option>
                            {filteredConnections.map((conn) => (
                                <option key={conn.id} value={conn.id}>
                                    {conn.connection_config_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {formData.target?.target_type === 'File' && (
                        <div className="w-full space-y-0.5">
                            <Label className="text-xs font-medium text-gray-700">
                                File Path Prefix
                            </Label>
                            <Input
                                name="file_path_prefix"
                                value={formData.target?.connection?.file_path_prefix || ""}
                                onChange={(e) => handleChange(e, path)}
                                className="h-7 text-sm px-2"
                                placeholder="Enter file path prefix"
                            />
                        </div>
                    )}

                    {formData.target?.target_type === 'Relational' && (
                        <>
                            <div className="w-full space-y-0.5">
                                <Label className="text-xs font-medium text-gray-700">
                                    Table Name
                                </Label>
                                <Input
                                    name="table_name"
                                    value={formData.target?.table_name || ""}
                                    onChange={(e) => handleChange(e, ['target'])}
                                    className="h-7 text-sm px-2"
                                    placeholder="Enter table name"
                                />
                            </div>

                            {/* PostgreSQL Write Options Section */}
                            <div className="space-y-1 mt-1">
                                <Label className="text-xs font-medium text-gray-700">
                                    Write Options
                                </Label>
                                <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label className="text-xs font-medium text-gray-600">
                                            Create Disposition
                                        </Label>
                                        <Input
                                            name="createDisposition"
                                            value={formData.write_options?.createDisposition || "CREATE_IF_NEEDED"}
                                            onChange={(e) => handleChange(e, ['write_options'])}
                                            className="h-7 text-sm px-2"
                                            disabled
                                        />
                                    </div>
                                    <div className="space-y-0.5">
                                        <Label className="text-xs font-medium text-gray-600">
                                            Write Method
                                        </Label>
                                        <Input
                                            name="writeMethod"
                                            value={formData.write_options?.writeMethod || "direct"}
                                            onChange={(e) => handleChange(e, ['write_options'])}
                                            className="h-7 text-sm px-2"
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
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
                <div key={fieldName} className="mb-1">
                    <Label className="text-xs font-medium text-gray-700 mb-0.5 block">
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
                        className="w-full h-7 text-sm border rounded bg-white shadow-sm focus:ring-1 focus:ring-ring px-2"
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
            <div key={fieldName} className="w-full mb-1">
                <Label className="text-xs font-medium text-gray-600 mb-0.5 block">
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
                    className="h-7 text-sm bg-white px-2"
                    placeholder={`Enter ${formatFieldName(fieldName)}`}
                />
                {errors[fieldName] && (
                    <p className="text-xs text-red-500 mt-0.5">{errors[fieldName]}</p>
                )}
            </div>
        );
    };

    /**
     * Handle form submission for both inline mode (chat panel) and dialog mode (canvas)
     * 
     * In both modes, this function:
     * 1. Validates the form data
     * 2. Creates a structured sourceData object
     * 3. Calls onSourceUpdate with the sourceData
     * 4. Closes the form
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted with data:', formData);
        console.log('Is inline mode:', isInlineMode);
        console.log('Node ID:', nodeId);
        
        const errors: Record<string, string> = {};

        // Validate required fields
        if (!formData.name) errors.name = "Name is required";
        if (!formData.target?.target_type) errors["target.target_type"] = "Target type is required";
        if (!formData.target?.load_mode) errors["target.load_mode"] = "Load mode is required";

        // In inline mode (chat panel), we'll be more lenient with validation
        // to avoid blocking the user flow
        if (Object.keys(errors).length > 0 && !isInlineMode) {
            setErrors(errors);
            toast.error("Please fill all required fields");
            console.error('Form validation errors:', errors);
            return;
        } else if (Object.keys(errors).length > 0) {
            // In inline mode, just log the errors but continue
            console.warn('Form has validation errors, but continuing in inline mode:', errors);
        }

        try {
            console.log('Finding connection data for ID:', formData.target?.connection?.connection_config_id);
            const connectionData = connectionConfigList.find(conn => conn.id === formData.target?.connection?.connection_config_id);
            console.log('Found connection data:', connectionData);
            
            // Create a safe connection object with fallbacks
            let connection = { 
                ...connectionData?.custom_metadata,
                // Preserve existing connection data if available
                ...formData.target?.connection
            };
            
            // Make sure we have the connection_config_id
            connection.connection_config_id = formData.target?.connection?.connection_config_id;
            console.log('Prepared connection data:', connection);

            // Create a properly structured source data object
            // Make sure we have all the required fields with fallbacks
            const sourceData:any = {
                nodeId,
                sourceData: {
                    data: {
                        label: formData.name || 'Unnamed Target',
                        title: formData.name || 'Unnamed Target', // Set the title to the name entered by user
                        source: {
                            name: formData.name || 'Unnamed Target', // Also update the source name
                            target_type: formData.target?.target_type || 'File',
                            target_name: formData.target?.target_name || '',
                            connection: connection || {},
                            load_mode: formData.target?.load_mode || 'append'
                        },
                        transformationData: {
                            write_options: formData.write_options || {
                                header: true,
                                sep: ",",
                                createDisposition: 'CREATE_IF_NEEDED',
                                writeMethod: formData.target?.target_type === 'Relational' ? 'direct' : 'APPEND'
                            }
                        }
                    }
                }
            };
            
            // Add target-type specific fields
            if (formData.target?.target_type === 'Relational') {
                sourceData.sourceData.data.source.table_name = formData.target?.table_name || '';
            } else if (formData.target?.target_type === 'File') {
                sourceData.sourceData.data.source.file_name = formData.target?.file_name || '';
                sourceData.sourceData.data.source.file_type = formData.file_type || 'CSV';
            }
            
            console.log('Sending source data to parent component:', JSON.stringify(sourceData, null, 2));
            console.log('onSourceUpdate function exists:', !!onSourceUpdate);
            console.log('Current mode:', isInlineMode ? 'inline (chat panel)' : 'modal (canvas)');

            try {
                if (onSourceUpdate) {
                    console.log('Calling onSourceUpdate with data');
                    onSourceUpdate(sourceData);
                    console.log('onSourceUpdate called successfully');
                    
                    // For debugging - log what happens after the update
                    setTimeout(() => {
                        console.log('Form state after update (delayed check)');
                    }, 500);
                } else {
                    console.error('onSourceUpdate function is not defined');
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
        }
    };

    // Add a new function to filter connections based on target type
    const getFilteredConnections = () => {
        if (!formData.target?.target_type) return [];

        return connectionConfigList.filter(conn => {
            if (formData.target?.target_type === 'File') {
                // For File type, show only S3 and Local connections
                return ['S3', 'Local'].includes(conn.connection_name);
            } else if (formData.target?.target_type === 'Relational') {
                // For Relational type, show all except S3 and Local
                return !['S3', 'Local'].includes(conn.connection_name);
            }
            return false;
        });
    };

    /**
     * This is the main rendering logic for the component.
     * 
     * We have three rendering modes:
     * 1. Card mode (when isOpen is false) - used in the chat panel
     * 2. Inline mode (when isInlineMode is true) - alternative for chat panel
     * 3. Dialog mode (default) - used in the canvas
     */
    
    // Card mode rendering - an alternative presentation mode
    // This is not currently used in the chat panel (we use inline mode instead)
    if (false) { // Disabled for now to avoid conflicts with inline mode
        return (
            <Card className="w-full shadow-md border border-gray-200 my-2 overflow-hidden">
                <CardContent className="p-0">
                    <form onSubmit={handleSubmit} className="flex flex-col h-full">
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

                                            <div className="text-blue-600 flex items-center gap-2 cursor-pointer mt-2" onClick={() => setIsAdvanvce(!isAdvance)}>
                                                <span className="font-medium">Advanced</span>
                                                <span>{isAdvance ? <ChevronUp /> : <ChevronDown />}</span>
                                            </div>
                                            {isAdvance && (
                                                <div>
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
                </CardContent>
            </Card>
        );
    } 
    
    /**
     * Inline mode rendering (used in chat panel)
     * 
     * When isOpen is false but we still want to show the form,
     * we render it directly in the parent component without the dialog wrapper.
     * This is used in the chat panel where the form is embedded in the message.
     */
    if (isInlineMode) {
        return (
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                {/* Content */}
                <div className="flex-1 overflow-auto px-2 py-1 space-y-3">
                    {/* Basic Info Section */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <div className="h-3 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                            <h3 className="text-xs font-medium text-gray-700">Basic Information</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg">
                            {renderField('name', currentSchema.properties.name)}
                            {renderField('target_name', targetSchema.properties.target_name, ['target'])}
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
                                {renderField('target_type', targetSchema.properties.target_type, ['target'])}
                                {renderField('load_mode', targetSchema.properties.load_mode, ['target'])}
                            </div>

                            <div className="p-2 bg-gray-50 rounded-lg">
                                {renderField('connection', targetSchema.properties.connection, ['target'])}
                            </div>

                            {formData.target?.load_mode === 'merge' && (
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    {renderField('merge_keys', targetSchema.properties.merge_keys, ['target'])}
                                </div>
                            )}

                            {formData.target?.target_type === 'File' && (
                                <>
                                    <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg">
                                        {renderField('file_name', targetSchema.allOf[1].then.properties.file_name, ['target'])}
                                        {renderField('file_type', writerSchema.allOf[0].then.properties.file_type)}
                                    </div>
                                </>
                            )}
                        </div>
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
                        className="px-3 py-1 text-xs font-medium bg-black text-white"
                    >
                        Save
                    </Button>
                </div>
            </form>
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
            <DialogContent className="max-w-[1200px] h-[750px] p-0 overflow-hidden flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
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
                                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded-lg shadow-sm">
                                            {renderField('file_name', targetSchema.allOf[1].then.properties.file_name, ['target'])}
                                            {renderField('file_type', writerSchema.allOf[0].then.properties.file_type)}
                                        </div>
                                        <div className="text-blue-600 flex items-center gap-2 cursor-pointer mt-2" onClick={() => setIsAdvanvce(!isAdvance)}>
                                            <span className="font-medium">Advanced</span>
                                            <span>{isAdvance ? <ChevronUp /> : <ChevronDown />}</span>
                                        </div>
                                        {isAdvance && (
                                            <div className="mt-3">
                                                {formData.file_type === 'CSV' && (
                                                    <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
                                                        <h3 className="text-sm font-semibold text-gray-700 mb-3">CSV Options</h3>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            {Object.entries(csvOptionsSchema.properties).map(([key, schema]: [string, any]) => (
                                                                <div key={key}>
                                                                    {renderField(key, schema, ['write_options'])}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
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