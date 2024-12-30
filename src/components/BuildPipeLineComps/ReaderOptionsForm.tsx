import React, { useState, useEffect } from "react";
import sourceSchema from "./json/Source.json";
import readerSchema from "./json/Reader.json";
import connectionSchema from "./json/Connection.json";
import bigQuerySchema from "./json/bigquery.json";
import postgresSchema from "./json/postgres.json";
import snowflakeSchema from "./json/snowflake.json";
import csvOptionsSchema from "./json/CSVOptions.json";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import { ApiService } from "@/services/apiServices";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { decrypt_string, encrypt_string } from "@/services/encryption";
import { toast } from "sonner";

const schemaReferences: Record<string, any> = {
    "schemas/Source.json": sourceSchema,
    "Connection.json": connectionSchema,
    "connections/bigquery.json": bigQuerySchema,
    "connections/postgres.json": postgresSchema,
    "connections/snowflake.json": snowflakeSchema,
    "transformations/readers/CSVOptions.json": csvOptionsSchema,
};

// Add new interface for connection type
interface ConnectionType {
    id: number;
    connection_name: string;
    connection_display_name: string | null;
    connection_description: string;
    connection_type: string;
}

// Add proper interfaces for form data and schema
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
            name?: string;
            type?: string;
            [key: string]: any;
        };
        [key: string]: any;
    };
    file_type?: string;
    query?: string;
    read_options?: Record<string, any>;
    [key: string]: any;
}

// Update component props interface
interface ReaderOptionsFormProps {
    onSubmit?: (data: FormData) => void;
    onClose?: () => void;
    initialData?: FormData;
}

// Add this interface to type the groups
interface SchemaGroup {
    id: string;
    title?: string;
}



// Update the isFieldRequired function to handle nested source properties
const isFieldRequired = (
    fieldName: string,
    schema: any,
    path: string[],
    currentFormData: FormData
) => {
    // Check direct required fields from the base schema (readerSchema)
    if (Array.isArray(readerSchema.required) && readerSchema.required.includes(fieldName)) {
        return true;
    }

    // Check direct required fields from the current schema
    if (Array.isArray(schema.required) && schema.required.includes(fieldName)) {
        return true;
    }

    // Check if we're in the source object
    if (path[0] === 'source') {
        const sourceType = currentFormData.source?.type;
        if (sourceType) {
            // Find the matching condition in Source.json
            const sourceCondition = sourceSchema.allOf?.find(
                condition => condition.if.properties.type.const === sourceType
            );

            // Check if the field is required for this source type
            if (sourceCondition?.then?.required?.includes(fieldName)) {
                return true;
            }
        }

        // Check if the field is required in the base Source schema
        if (sourceSchema.required?.includes(fieldName)) {
            return true;
        }
    }

    // For nested objects in source.connection
    if (path.includes('connection') && currentFormData.source?.connection?.type) {
        const connectionType = currentFormData.source.connection.type;
        const connectionCondition = connectionSchema.allOf?.find(
            (condition) => condition.if?.properties?.type?.const === connectionType
        );

        if (Array.isArray(connectionCondition?.then?.required)) {
            return connectionCondition.then.required.includes(fieldName);
        }
    }

    return false;
};

// First define the formatFieldName function
const formatFieldName = (fieldName: string) => {
    return fieldName
        .replace(/([A-Z])/g, " $1")
        .replace(/^ /, "")
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

// Then define the RequiredFieldLabel component that uses formatFieldName
const RequiredFieldLabel: React.FC<{ fieldName: string }> = ({ fieldName }) => (
    <div className="flex items-center gap-1">
        {formatFieldName(fieldName)}
        <span className="text-red-500">*</span>
    </div>
);

// Add helper function to safely get auth type
const getAuthType = (option: any) => {
    return option.properties?.auth_type?.const ||
        option.properties?.method?.const ||
        option.title || '';
};

// Add this helper function to check if a field is required in CSV options
const isCSVFieldRequired = (fieldName: string) => {
    return csvOptionsSchema.required?.includes(fieldName);
};

// Add this helper function to get source type specific fields
const getSourceTypeFields = (sourceType: string) => {
    const condition = sourceSchema.allOf?.find(
        condition => condition.if.properties.type.const === sourceType
    );

    // Get additional properties from the condition only
    const additionalProperties = condition?.then?.properties || {};

    // Return only the additional properties, excluding base properties
    return {
        properties: additionalProperties,
        required: [...(condition?.then?.required || [])]
    };
};

const EmptyStateMessage = ({
    title,
    description,
    prerequisite
}: {
    title: string;
    description: string;
    prerequisite?: string;
}) => (
    <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 min-h-[200px]">
        <div className="max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 mb-4">{description}</p>
            {prerequisite && (
                <div className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-200 rounded-md">
                    <span className="text-sm text-gray-600">Required: {prerequisite}</span>
                </div>
            )}
        </div>
    </div>
);

export const ReaderOptionsForm: React.FC<ReaderOptionsFormProps> = ({
    onSubmit,
    onClose,
    initialData
}) => {
    const [formData, setFormData] = useState<FormData>({});
    const [currentSchema, setCurrentSchema] = useState<FormSchema>(readerSchema);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [connectionTypes, setConnectionTypes] = useState<ConnectionType[]>([]);
    const [activeSection, setActiveSection] = useState(0);

    // Add effect to fetch connection types
    useEffect(() => {
        fetchConnectionTypes();
    }, []);

    const fetchConnectionTypes = async () => {
        try {
            const response = await ApiService('8011', 'GET', '/connection_registry/list/?connection_type=source');
            console.log(response)
            setConnectionTypes(response);
        } catch (error) {
            console.error('Error fetching connection types:', error);
        }
    };

    useEffect(() => {
        resolveSchema();
    }, [formData]);

    const resolveSchema = async () => {
        let resolvedSchema: any = {
            properties: {
                ...sourceSchema.properties,
                connection: {} // Initialize connection property
            }
        };

        // Correct check for source.type instead of just type
        if (formData.source?.type) {
            // First handle the source type conditions from Source.json
            const sourceTypeCondition = sourceSchema.allOf?.find(
                (condition) => condition.if.properties.type?.const === formData.source.type
            );

            if (sourceTypeCondition) {
                resolvedSchema = {
                    ...resolvedSchema,
                    properties: {
                        ...resolvedSchema.properties,
                        ...sourceTypeCondition.then.properties // This will add file_name or table_name
                    },
                };
            }

            // Then handle the reader schema conditions
            const sourceCondition = readerSchema.allOf?.find(
                (condition) =>
                    condition.if.properties.source?.properties?.type?.const === formData.source.type
            );

            if (sourceCondition) {
                resolvedSchema = {
                    ...resolvedSchema,
                    properties: {
                        ...resolvedSchema.properties,
                        ...sourceCondition.then.properties,
                    },
                };

                // Handle file-specific options for File type
                if (formData.source.type === 'File' && formData.file_type) {
                    const fileTypeCondition = sourceCondition.then.allOf?.find(
                        (condition) =>
                            condition.if.properties.file_type?.const === formData.file_type
                    );

                    if (fileTypeCondition) {
                        if (formData.file_type === 'CSV') {
                            resolvedSchema = {
                                ...resolvedSchema,
                                properties: {
                                    ...resolvedSchema.properties,
                                    read_options: {
                                        type: "object",
                                        properties: csvOptionsSchema.properties
                                    }
                                },
                            } as any;
                        } else {
                            resolvedSchema = {
                                ...resolvedSchema,
                                properties: {
                                    ...resolvedSchema.properties,
                                    ...fileTypeCondition.then.properties,
                                },
                            } as any;
                        }
                    }
                }
            }
        }

        // Handle connection schema resolution
        if (formData.source?.connection?.type) {
            const connectionType = formData.source.connection.type;

            // Find the matching condition in Connection.json
            const connectionCondition = connectionSchema.allOf.find(
                (condition) => condition.if.properties.type?.const === connectionType
            );

            if (connectionCondition) {
                if (connectionCondition.then.$ref) {
                    // Handle referenced schemas (like bigquery, postgres, snowflake)
                    const schemaName = connectionCondition.then.$ref.split('/').pop().replace('.json', '');
                    const referencedSchema = schemaReferences[`connections/${schemaName}.json`];

                    resolvedSchema.properties.connection = {
                        ...resolvedSchema.properties.connection,
                        ...referencedSchema.connectionSpecification
                    };
                } else {
                    // Handle inline schema definitions (like local, GCS, S3)
                    resolvedSchema.properties.connection = {
                        ...resolvedSchema.properties.connection,
                        properties: connectionCondition.then.properties
                    };
                }
            }
        }

        setCurrentSchema(resolvedSchema);
    };

    // Update handleChange to be more type-safe
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        path: string[] = []
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const newData = { ...prev };
            let current = newData;

            // Handle nested paths with type safety
            for (let i = 0; i < path.length - 1; i++) {
                if (!current[path[i]]) {
                    current[path[i]] = {};
                }
                current = current[path[i]] as Record<string, any>;
            }

            if (path.length > 0) {
                const lastPath = path[path.length - 1];
                current[lastPath] = {
                    ...(current[lastPath] as Record<string, any>),
                    [name]: value,
                };
            } else {
                current[name] = value;
            }

            return newData;
        });
    };

    // Move radio handling functions inside the component
    const renderPostgresRadioField = (fieldName: string, fieldSchema: any, path: string[]) => {
        return (
            <div key={fieldName} className="col-span-3 border p-4 my-2 rounded">
                <Label className="text-lg font-semibold mb-2">{fieldSchema.title}</Label>
                <p className="text-sm text-gray-500 mb-4">{fieldSchema.description}</p>
                <div className="space-y-4">
                    {fieldSchema.oneOf.map((option: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                            <input
                                type="radio"
                                id={`${fieldName}-${index}`}
                                name={`${path.join('.')}.${fieldName}?.method`}
                                value={option.properties?.method?.const}
                                checked={formData.replication_method?.method === option.properties?.method?.const}
                                onChange={(e) => {
                                    const newMethod = {
                                        method: option.properties.method.const,
                                        ...(option.properties.plugin?.default && { plugin: option.properties.plugin.default }),
                                    };
                                    setFormData(prev => ({
                                        ...prev,
                                        replication_method: newMethod
                                    }));
                                }}
                                className="mt-1"
                            />
                            <div className="flex-1">
                                <Label htmlFor={`${fieldName}-${index}`} className="font-medium">
                                    {option.title}
                                </Label>
                                <p className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: option.description }} />

                                {/* Show additional fields when this option is selected */}
                                {formData.replication_method?.method === option.properties?.method?.const && (
                                    <div className="mt-4 ml-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(option.properties)
                                                .filter(([key, schema]: [string, any]) => {
                                                    // For CDC method, exclude method and plugin fields
                                                    if (option.properties.method?.const === 'CDC') {
                                                        return !['method', 'plugin'].includes(key);
                                                    }
                                                    // For other methods, show all fields
                                                    return true;
                                                })
                                                .map(([key, schema]: [string, any]) => {
                                                    // Skip if the property should only show based on certain conditions
                                                    if (schema.required && !option.required?.includes(key)) {
                                                        return null;
                                                    }

                                                    return (
                                                        <div key={key} className="mb-4">
                                                            <Label>
                                                                {schema.title || formatFieldName(key)}
                                                                {option.required?.includes(key) && (
                                                                    <span className="text-red-500 ml-1">*</span>
                                                                )}
                                                            </Label>
                                                            {schema.type === "string" && (
                                                                <Input
                                                                    className="border-gray-200"
                                                                    type={schema.bh_secret ? "password" : "text"}
                                                                    name={key}
                                                                    value={formData.replication_method?.[key] || ''}
                                                                    onChange={(e) => {
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            replication_method: {
                                                                                ...prev.replication_method,
                                                                                [key]: e.target.value
                                                                            }
                                                                        }));
                                                                    }}
                                                                    placeholder={`Enter ${formatFieldName(key)}`}
                                                                />
                                                            )}
                                                            {schema.type === "integer" && (
                                                                <Input className="border-gray-200"
                                                                    type="number"
                                                                    name={key}
                                                                    value={formData.replication_method?.[key] || schema.default || ''}
                                                                    min={schema.min}
                                                                    max={schema.max}
                                                                    onChange={(e) => {
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            replication_method: {
                                                                                ...prev.replication_method,
                                                                                [key]: parseInt(e.target.value)
                                                                            }
                                                                        }));
                                                                    }}
                                                                />
                                                            )}
                                                            {schema.type === "array" && (
                                                                <Select
                                                                    value={formData.replication_method?.[key] || schema.default?.[0] || ''}
                                                                // onChange={(e) => {
                                                                //     setFormData(prev => ({
                                                                //         ...prev,
                                                                //         replication_method: {
                                                                //             ...prev.replication_method,
                                                                //             [key]: e.target.value
                                                                //         }
                                                                //     }));
                                                                // }}
                                                                >
                                                                    {schema.items?.enum?.map((item: string) => (
                                                                        <option key={item} value={item}>
                                                                            {item}
                                                                        </option>
                                                                    ))}
                                                                </Select>
                                                            )}
                                                            {schema.description && (
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    {schema.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderSnowflakeRadioField = (fieldName: string, fieldSchema: any, path: string[]) => {
        return (
            <div key={fieldName} className="col-span-2 space-y-6">
                <Label className="text-lg font-semibold">
                    {fieldSchema.title || formatFieldName(fieldName)}
                </Label>

                <div className="space-y-6">
                    {fieldSchema.oneOf.map((option: any, index: number) => {
                        const authType = option.title || `option-${index}`;

                        return (
                            <div key={index} className="p-4 border rounded-lg bg-white">
                                <div className="flex items-start space-x-3 mb-4">
                                    <input
                                        type="radio"
                                        id={`${fieldName}-${index}`}
                                        name={`${path.join('.')}.${fieldName}`}
                                        value={authType}
                                        checked={formData.source?.connection?.credentials?.auth_type === authType}
                                        onChange={(e) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                source: {
                                                    ...prev.source,
                                                    connection: {
                                                        ...prev.source?.connection,
                                                        credentials: {
                                                            auth_type: e.target.value
                                                        }
                                                    }
                                                }
                                            }));
                                        }}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <Label htmlFor={`${fieldName}-${index}`} className="text-base font-medium">
                                            {option.title}
                                        </Label>
                                        {option.description && (
                                            <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Show fields when this option is selected */}
                                {formData.source?.connection?.credentials?.auth_type === authType &&
                                    option.properties && (
                                        <div className="ml-7">
                                            <div className="grid grid-cols-2 gap-4">
                                                {Object.entries(option.properties)
                                                    .filter(([key]) => key !== 'auth_type')
                                                    .map(([key, schema]: [string, any]) => (
                                                        <div key={key} className="w-full space-y-2">
                                                            <Label className="text-sm font-medium flex items-center gap-1">
                                                                {schema.title || formatFieldName(key)}
                                                                {option.required?.includes(key) && (
                                                                    <span className="text-red-500">*</span>
                                                                )}
                                                            </Label>
                                                            <Input
                                                                type={schema.bh_secret ? "password" : "text"}
                                                                name={key}
                                                                value={formData.source?.connection?.credentials?.[key] || ''}
                                                                onChange={(e) => {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        source: {
                                                                            ...prev.source,
                                                                            connection: {
                                                                                ...prev.source?.connection,
                                                                                credentials: {
                                                                                    ...prev.source?.connection?.credentials,
                                                                                    [key]: e.target.value
                                                                                }
                                                                            }
                                                                        }
                                                                    }));
                                                                }}
                                                                placeholder={`Enter ${formatFieldName(key)}`}
                                                                className={`w-full ${option.required?.includes(key)
                                                                    ? 'border-red-300 focus:border-red-500'
                                                                    : 'border-gray-200'
                                                                    }`}
                                                            />
                                                            {schema.description && (
                                                                <p className="text-xs text-gray-500">{schema.description}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderField = (fieldName: string, fieldSchema: any, path: string[] = []): React.ReactNode => {
        if (!fieldSchema) return null;

        // Skip rendering titles for specific fields
        const skipTitleForFields = ['connection', 'connectionSpecification'];

        // Special handling for connection object
        if (fieldName === 'connection' && path.includes('source')) {
            return (
                <div key={fieldName} className="col-span-2 my-2">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Render fields based on Connection.json base properties */}
                        {Object.entries(connectionSchema.properties).map(([key, schema]: [string, any]) => (
                            <div key={key} className="mb-4">
                                <Label>
                                    {isFieldRequired(key, connectionSchema, path, formData) ? (
                                        <RequiredFieldLabel fieldName={schema.title || key} />
                                    ) : (
                                        schema.title || formatFieldName(key)
                                    )}
                                </Label>
                                {schema.endpoint ? (
                                    // For fields with endpoint (like type), render select
                                    <select
                                        name={key}
                                        value={formData.source?.connection?.[key] || ""}
                                        onChange={(e) => handleChange(e, ['source', 'connection'])}
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="">Select {formatFieldName(key)}</option>
                                        {connectionTypes.map((type) => (
                                            <option key={type.id} value={type.connection_name}>
                                                {type.connection_display_name || type.connection_name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    // For other fields (like name), render Input
                                    <Input
                                        name={key}
                                        value={formData.source?.connection?.[key] || ""}
                                        onChange={(e) => handleChange(e, ['source', 'connection'])}
                                        placeholder={`Enter ${formatFieldName(key)}`}
                                        className={isFieldRequired(key, connectionSchema, path, formData) && !formData.source?.connection?.[key] ? 'border-red-500' : 'border-gray-200'}
                                    />
                                )}
                                {schema.description && (
                                    <p className="text-sm text-gray-500 mt-1">{schema.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

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

        // Skip rendering if the field should be hidden
        if (skipTitleForFields.includes(fieldName)) {
            return null;
        }

        // Handle radio display type fields
        if (fieldSchema.display_type === 'radio') {
            if (fieldName === 'replication_method') {
                return renderPostgresRadioField(fieldName, fieldSchema, path);
            }
            if (fieldName === 'credentials' && path.includes('connection')) {
                return renderSnowflakeRadioField(fieldName, fieldSchema, path);
                // return renderSnowflakeRadioField(fieldName, fieldSchema, path);
            }
        }

        // Add special handling for SSL modes
        if (fieldName === 'ssl_mode' && fieldSchema.oneOf) {
            return (
                <div key={fieldName} className="col-span-2 border p-4 my-2 rounded">
                    <Label className="text-lg font-semibold mb-2">
                        {isFieldRequired(fieldName, fieldSchema, path, formData) ? (
                            <RequiredFieldLabel fieldName={fieldSchema.title || fieldName} />
                        ) : (
                            fieldSchema.title || formatFieldName(fieldName)
                        )}
                    </Label>
                    <p className="text-sm text-gray-500 mb-4">{fieldSchema.description}</p>
                    <div className="space-y-4">
                        {fieldSchema.oneOf.map((option: any, index: number) => (
                            <div key={index} className="flex items-start space-x-3">
                                <input
                                    type="radio"
                                    id={`${fieldName}-${index}`}
                                    name={`${path.join('.')}.${fieldName}.mode`}
                                    value={option.properties.mode.const}
                                    checked={formData.source?.connection?.ssl_mode?.mode === option.properties.mode.const}
                                    onChange={(e) => {
                                        const newSslMode = {
                                            mode: option.properties.mode.const
                                        };
                                        setFormData(prev => ({
                                            ...prev,
                                            source: {
                                                ...prev.source,
                                                connection: {
                                                    ...prev.source?.connection,
                                                    ssl_mode: newSslMode
                                                }
                                            }
                                        }));
                                    }}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <Label htmlFor={`${fieldName}-${index}`} className="font-medium">
                                        {option.title}
                                    </Label>
                                    <p className="text-sm text-gray-500">{option.description}</p>

                                    {/* Show additional fields for verify-ca and verify-full modes */}
                                    {formData.source?.connection?.ssl_mode?.mode === option.properties.mode.const &&
                                        (option.title === 'verify-ca' || option.title === 'verify-full') && (
                                            <div className="mt-4 ml-4">
                                                <div className="grid grid-cols-3 gap-4">
                                                    {Object.entries(option.properties)
                                                        .filter(([key]) => key !== 'mode')
                                                        .map(([key, schema]: [string, any]) => (
                                                            <div key={key} className="mb-4">
                                                                <Label>{schema.title || formatFieldName(key)}</Label>
                                                                {schema.multiline ? (
                                                                    <textarea
                                                                        name={key}
                                                                        value={formData.source?.connection?.ssl_mode?.[key] || ''}
                                                                        onChange={(e) => {
                                                                            setFormData(prev => ({
                                                                                ...prev,
                                                                                source: {
                                                                                    ...prev.source,
                                                                                    connection: {
                                                                                        ...prev.source?.connection,
                                                                                        ssl_mode: {
                                                                                            ...prev.source?.connection?.ssl_mode,
                                                                                            [key]: e.target.value
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }));
                                                                        }}
                                                                        className="w-full p-2 border rounded min-h-[100px]"
                                                                        placeholder={`Enter ${formatFieldName(key)}`}
                                                                    />
                                                                ) : (
                                                                    <Input className="border-gray-200"
                                                                        type={schema.type === "integer" ? "number" : "text"}
                                                                        name={key}
                                                                        value={formData.source?.connection?.ssl_mode?.[key] || ''}
                                                                        onChange={(e) => {
                                                                            setFormData(prev => ({
                                                                                ...prev,
                                                                                source: {
                                                                                    ...prev.source,
                                                                                    connection: {
                                                                                        ...prev.source?.connection,
                                                                                        ssl_mode: {
                                                                                            ...prev.source?.connection?.ssl_mode,
                                                                                            [key]: e.target.value
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }));
                                                                        }}
                                                                        placeholder={`Enter ${formatFieldName(key)}`}
                                                                    />
                                                                )}
                                                                {schema.description && (
                                                                    <p className="text-sm text-gray-500 mt-1">{schema.description}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Rest of your existing renderField code for handling primitive types
        const fieldPath = path.length > 0 ? [...path, fieldName] : [fieldName];
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
        console.log(formData)
        return (
            <div key={fieldName} className="w-full space-y-2">
                <Label className="block text-sm font-medium text-gray-800">
                    {fieldSchema.title || formatFieldName(fieldName)}
                    {isFieldRequired(fieldName, fieldSchema, path, formData) && (
                        <span className="text-red-500 ml-1">*</span>
                    )}
                </Label>
                <div className="relative">
                    <Input
                        type={fieldSchema.bh_secret ? "password" : fieldSchema.type === "number" ? "number" : "text"}
                        name={fieldName}
                        value={fieldValue || ""}
                        onChange={(e) => handleChange(e, path)}
                        placeholder={`Enter ${formatFieldName(fieldName)}`}
                        className={`w-full transition-all border-2 focus:ring-0 ${isFieldRequired(fieldName, fieldSchema, path, formData) && !fieldValue
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-200'
                            }`}
                    />
                </div>
                {fieldSchema.description && (
                    <p className="text-sm text-gray-500 mt-1">{fieldSchema.description}</p>
                )}
                {errors[fieldName] && (
                    <p className="text-red-500 text-sm mt-1">{errors[fieldName]}</p>
                )}
            </div>
        );
    };

    // Update handleSubmit to include console.log
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            console.log(formData)
            // Validate connection type exists
            const connectionTypeMatch = connectionTypes.find(
                conn => conn.connection_name === formData.source?.connection?.type
            );

            if (!connectionTypeMatch) {
                throw new Error('Invalid connection type selected');
            }

            // Validate required fields
            if (!formData.source?.connection?.dataset_id || !formData.source?.connection?.credentials_json) {
                throw new Error('Missing required connection configuration');
            }

            // Prepare config object
            const config = {
                "project_id": 1,
                "dataset_id": formData.source.connection.dataset_id,
                "credentials_json": formData.source.connection.credentials_json,
                "source_type": formData.source.connection.type
            };
            console.log(config)

            // Encrypt configuration
            const { encryptedString, initVector } = encrypt_string(JSON.stringify(config));

            // Prepare connection config payload
            const transformedData = {
                connection_config_name: formData.source?.connection?.connection_name || "default_name",
                custom_metadata: formData,
                connection_id: connectionTypeMatch.id,
                connection_name: connectionTypeMatch.connection_name,
                connection_type: "source",
                connection_status: "active",
                data_residency: "auto",
                config: encryptedString,
                init_vector: initVector
            };

            // Create connection config
            const response = await ApiService('8011', 'POST', '/connection_registry/connection_config', transformedData);

            if (!response || !response.id) {
                throw new Error('Failed to create connection configuration');
            }

            // Validate data source fields
            // if (!formData.source?.source?.name || !formData.reader_name || !formData.source?.type) {
            //     throw new Error('Missing required data source information');
            // }

            // Prepare data source payload
            if (response && response.id) {
                const dataSourcePayload = {
                    "connection_config_id": response.id,
                    "data_src_name": formData.source?.source_name,
                    "data_src_desc": formData.reader_name,
                    "data_src_key": formData.source?.type === 'File' ? formData.source?.file_name : "default_key",
                    "bh_project_id": 1,
                    "data_src_tags": {},
                    "data_src_quality": "string",
                    "data_src_status_cd": 0
                };

                const dataSourceResponse = await ApiService('8011', 'POST', '/data_source/', dataSourcePayload);


                if (dataSourceResponse) {
                    onClose();

                }
                // Show success message
                toast.success("Reader configuration saved successfully");


            }
        } catch (error) {
            console.error('Form submission error:', error);

            // Show error message to user
            toast.error(error instanceof Error ? error.message : "An unexpected error occurred");

            // Set form-level error state if needed
            setErrors(prev => ({
                ...prev,
                submit: error instanceof Error ? error.message : "An unexpected error occurred"
            }));
        }
    };

    const renderFields = () => {
        const orderedFields = [];

        // Always render reader_name first
        if (currentSchema.properties.reader_name) {
            orderedFields.push(['reader_name', currentSchema.properties.reader_name]);
        }

        // Then render name
        if (currentSchema.properties.name) {
            orderedFields.push(['name', currentSchema.properties.name]);
        }

        // Then render source object
        if (currentSchema.properties.source) {
            orderedFields.push(['source', currentSchema.properties.source]);
        }

        // If File type is selected, show file_type
        if (formData.source?.type === 'File' && currentSchema.properties.file_type) {
            orderedFields.push(['file_type', currentSchema.properties.file_type]);
        }

        // If Relational type is selected, show query field
        if (formData.source?.type === 'Relational' && currentSchema.properties.query) {
            orderedFields.push(['query', currentSchema.properties.query]);
        }

        // If CSV file type is selected, show read_options
        if (formData.file_type === 'CSV' && currentSchema.properties.read_options) {
            orderedFields.push(['read_options', currentSchema.properties.read_options]);
        }

        // Add remaining fields
        Object.entries(currentSchema.properties).forEach(([fieldName, fieldSchema]) => {
            if (!orderedFields.some(([name]) => name === fieldName)) {
                orderedFields.push([fieldName, fieldSchema]);
            }
        });

        return (
            <div className="grid grid-cols-3 gap-2">
                {orderedFields.map(([fieldName, fieldSchema]) =>
                    renderField(fieldName, fieldSchema)
                )}
            </div>
        );
    };

    // Update renderConnectionFields to be more dynamic
    const renderConnectionFields = (fieldSchema: any, path: string[], fieldName: string) => {
        if (!formData.source?.connection?.type) return null;

        const connectionType = formData.source.connection.type;
        let specificSchema = null;

        // Find the matching condition in Connection.json
        const connectionCondition = connectionSchema.allOf.find(
            (condition) => condition.if.properties.type?.const === connectionType
        );

        if (!connectionCondition) return null;

        if (connectionCondition.then.$ref) {
            // Handle referenced schemas
            const schemaName = connectionCondition.then.$ref.split('/').pop().replace('.json', '');
            specificSchema = schemaReferences[`connections/${schemaName}.json`]?.connectionSpecification;
        } else {
            // Handle inline schema definitions
            specificSchema = {
                properties: connectionCondition.then.properties,
                required: connectionCondition.then.required
            };
        }

        if (!specificSchema) return null;

        // Handle grouped fields (like in postgres)
        if (specificSchema.groups) {
            return renderGroupedFields(specificSchema, path);
        }
        console.log(specificSchema)
        // For non-grouped fields, render in a grid
        return (
            <div className="space-y-6">
                {/* First render radio fields (credentials) in full width */}
                {Object.entries(specificSchema.properties || {})
                    .filter(([name, schema]: [string, any]) => schema.display_type === 'radio')
                    .map(([name, schema]: [string, any]) => (
                        <div key={name} className="w-full">
                            {renderField(name, {
                                ...schema,
                                required: specificSchema.required?.includes(name)
                            }, [...path, 'connection'])}
                        </div>
                    ))}

                {/* Then render remaining fields in a three-column grid */}
                <div className="grid grid-cols-3 gap-4">
                    {Object.entries(specificSchema.properties || {})
                        .filter(([name, schema]: [string, any]) => !schema.display_type)
                        .map(([name, schema]: [string, any]) => (
                            <div key={name}>
                                {renderField(name, {
                                    ...schema,
                                    required: specificSchema.required?.includes(name)
                                }, [...path, 'connection'])}
                            </div>
                        ))}
                </div>
            </div>
        );
    };

    // Add helper function for grouped fields
    const renderGroupedFields = (schema: any, path: string[]) => {
        const groups = schema.groups;
        const fieldsByGroup = Object.entries(schema.properties || {}).reduce((acc: any, [name, schema]: [string, any]) => {
            const group = (schema as any).group || 'general';
            if (!acc[group]) acc[group] = [];
            acc[group].push([name, schema]);
            return acc;
        }, {});

        return (
            <Tabs defaultValue={groups[0].id} className="w-full">
                <TabsList className="mb-4">
                    {groups.map((group: SchemaGroup) => (
                        <TabsTrigger key={group.id} value={group.id}>
                            {group.title || formatFieldName(group.id)}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {groups.map((group: SchemaGroup) => (
                    <TabsContent key={group.id} value={group.id}>
                        <div className="grid grid-cols-2 gap-4">
                            {fieldsByGroup[group.id]?.map(([name, schema]: [string, any]) => {
                                // Check if the field is a radio type or ssl_mode
                                const isFullWidth = schema.display_type === 'radio' || name === 'ssl_mode';
                                return (
                                    <div key={name} className={isFullWidth ? "col-span-2" : "col-span-1"}>
                                        {renderField(name, {
                                            ...schema,
                                            required: schema.required?.includes(name)
                                        }, [...path, 'connection'])}
                                    </div>
                                );
                            })}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        );
    };

    // Define form sections
    const sections = [
        {
            id: 'basic',
            title: 'Basic Information',
            description: 'Configure the basic reader settings',
            content: (
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {currentSchema.properties.reader_name && renderField('reader_name', currentSchema.properties.reader_name)}
                    {currentSchema.properties.name && renderField('name', currentSchema.properties.name)}
                </div>
            )
        },
        {
            id: 'source',
            title: 'Source Configuration',
            description: 'Configure your data source',
            content: (
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {renderField('source', currentSchema.properties.source)}
                </div>
            )
        },
        {
            id: 'file',
            title: 'File Configuration',
            description: 'Configure file-specific settings',
            content: (
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {!formData.source?.type ? (
                        <div className="col-span-2">
                            <EmptyStateMessage
                                title="Source Type Required"
                                description="Please select a source type in the previous step to configure file settings."
                                prerequisite="Source Type"
                            />
                        </div>
                    ) : formData.source.type === 'File' || formData.source.type === 'Relational' ? (
                        <>
                            {/* Show file_type only for File source type */}
                            {formData.source.type === 'File' && renderField('file_type', currentSchema.properties.file_type)}

                            <div className="col-span-2">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Render source type specific fields (file_name or table_name) */}
                                    {Object.entries(getSourceTypeFields(formData.source.type).properties)
                                        .map(([fieldName, schema]: [string, any]) => (
                                            <div key={fieldName} className="col-span-1">
                                                {renderField(fieldName, schema, ['source'])}
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Show CSV options only for File source type with CSV file_type */}
                            {formData.source.type === 'File' && formData.file_type === 'CSV' && currentSchema.properties.read_options && (
                                <div className="col-span-2">
                                    <div className="grid grid-cols-3 gap-4">
                                        {Object.entries(csvOptionsSchema.properties).map(([key, schema]: [string, any]) => (
                                            <div key={key}>
                                                {renderField(key, schema, ['read_options'])}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="col-span-2">
                            <EmptyStateMessage
                                title="Not Applicable"
                                description="Configuration is only available for File or Relational source types."
                                prerequisite="File or Relational Source Type"
                            />
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'connection',
            title: 'Connection Configuration',
            description: 'Configure your connection settings',
            content: !formData.source?.type ? (
                <EmptyStateMessage
                    title="Source Type Required"
                    description="Please select a source type to view connection settings."
                    prerequisite="Source Type"
                />
            ) : !formData.source?.connection?.type ? (
                <EmptyStateMessage
                    title="Connection Type Required"
                    description="Please select a connection type to configure connection settings."
                    prerequisite="Connection Type"
                />
            ) : (
                renderConnectionFields(currentSchema.properties.connection, ['source'], 'connection')
            )
        }
    ];

    const handleNext = () => {
        if (activeSection < sections.length - 1) {
            setActiveSection(activeSection + 1);
        }
    };

    const handlePrevious = () => {
        if (activeSection > 0) {
            setActiveSection(activeSection - 1);
        }
    };

    // Update the progress bar styling
    const renderProgressBar = () => (
        <div className="mb-6">
            <div className="relative">
                {/* Progress line */}
                <div className="absolute top-[18px] left-[50px] right-[50px] h-0.5 bg-gray-200">
                    <div
                        className="h-full bg-black transition-all duration-500 ease-in-out"
                        style={{
                            width: `${(activeSection / (sections.length - 1)) * 100}%`,
                        }}
                    />
                </div>

                {/* Steps - reduced vertical spacing */}
                <div className="relative flex justify-between">
                    {sections.map((section, index) => (
                        <div
                            key={section.id}
                            className={`flex flex-col items-center w-32 transition-all duration-300 ${index <= activeSection ? 'opacity-100' : 'opacity-60'
                                }`}
                        >
                            {/* Step circle - reduced size */}
                            <div
                                className={`
                                    w-9 h-9 rounded-full flex items-center justify-center
                                    font-medium text-sm transition-all duration-300
                                    border-2 relative z-10
                                    ${index < activeSection
                                        ? 'bg-black border-black text-white'
                                        : index === activeSection
                                            ? 'bg-white border-black text-black'
                                            : 'bg-white border-gray-200 text-gray-400'
                                    }
                                `}
                            >
                                {index < activeSection ? (
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                ) : (
                                    index + 1
                                )}
                            </div>

                            {/* Step label - reduced spacing */}
                            <div className="mt-2 space-y-0.5 text-center">
                                <p className={`text-sm font-medium ${index <= activeSection ? 'text-black' : 'text-gray-400'
                                    }`}>
                                    {section.title}
                                </p>
                                <p className={`text-xs ${index <= activeSection ? 'text-gray-600' : 'text-gray-400'
                                    }`}>
                                    {section.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // Add an effect to set default values when CSV is selected
    useEffect(() => {
        if (formData.file_type === 'CSV') {
            const defaultValues = Object.entries(csvOptionsSchema.properties).reduce((acc, [key, schema]: [string, any]) => {
                acc[key] = schema.default;
                return acc;
            }, {} as Record<string, any>);

            setFormData(prev => ({
                ...prev,
                read_options: {
                    ...defaultValues,
                    ...prev.read_options // Keep any existing values
                }
            }));
        }
    }, [formData.file_type]);

    // Add this useEffect to handle initial data
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);

            // If there's a source type, we need to fetch connection types
            if (initialData.source?.type) {
                fetchConnectionTypes();
            }

            // If there's a file type and it's CSV, we need to set default read options
            if (initialData.source?.type === 'File' && initialData.file_type === 'CSV') {
                const defaultValues = Object.entries(csvOptionsSchema.properties).reduce((acc, [key, schema]: [string, any]) => {
                    acc[key] = schema.default;
                    return acc;
                }, {} as Record<string, any>);

                setFormData(prev => ({
                    ...prev,
                    read_options: {
                        ...defaultValues,
                        ...prev.read_options
                    }
                }));
            }
        }
    }, [initialData]);

    // Update the main form return statement with reduced spacing
    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full max-w-6xl mx-auto bg-white">
            {/* Progress bar - reduced padding */}
            <div className="flex-none px-3 pt-3">
                {renderProgressBar()}
            </div>

            {/* Scrollable content area - reduced padding */}
            <div className="flex-1 overflow-auto px-3 min-h-0">
                <Card className="mb-3 shadow-sm border border-gray-200 rounded-lg">
                    <CardContent className="p-3">
                        {/* Section header - reduced spacing */}
                        <div className="mb-3 border-b border-gray-200 pb-3">
                            <h2 className="text-lg font-semibold mb-0.5 text-black">
                                {sections[activeSection].title}
                            </h2>
                            <p className="text-gray-600 text-sm">
                                {sections[activeSection].description}
                            </p>
                        </div>

                        {/* Content area - reduced gap */}
                        <div className="relative">
                            <div className="grid gap-3">
                                {sections[activeSection].content}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Footer - reduced padding */}
            <div className="flex-none px-3 py-3 border-t bg-white">
                <div className="flex justify-between items-center">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={activeSection === 0}
                        className={`flex items-center gap-2 px-4 py-2 transition-all border-2 ${activeSection === 0
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-gray-50 border-black text-black'
                            }`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </Button>

                    <div className="flex gap-2">
                        {activeSection === sections.length - 1 ? (
                            <Button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2 bg-black hover:bg-gray-900 text-white"
                            >
                                Save Configuration
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleNext}
                                className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 text-white"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
};
