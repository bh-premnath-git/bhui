import React, { useState, useEffect } from "react";
import sourceSchema from "./json/Source.json";
import connectionSchema from "./json/Connection.json";
import bigQuerySchema from "./json/bigquery.json";
import postgresSchema from "./json/postgres.json";
import snowflakeSchema from "./json/snowflake.json";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ApiService } from "@/services/apiServices";

const schemaReferences: Record<string, any> = {
    "Connection.json": connectionSchema,
    "connections/bigquery.json": bigQuerySchema,
    "connections/postgres.json": postgresSchema,
    "connections/snowflake.json": snowflakeSchema,
};

// Add a new type for connection types
type ConnectionType = {
    name: string;
    type: string;
};

export const SourceForm: React.FC<any> = () => {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [currentSchema, setCurrentSchema] = useState<any>(sourceSchema);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [connectionTypes, setConnectionTypes] = useState<ConnectionType[]>([]);

    useEffect(() => {
        resolveSchema();
    }, [formData]);

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
            // Optionally set some error state here
        }
    };

    const resolveSchema = async () => {
        let resolvedSchema:any = { ...sourceSchema };

        // Resolve Source schema conditions
        if (formData.type) {
            const sourceCondition = sourceSchema.allOf?.find(
                (condition) =>
                    condition.if.properties.type.const === formData.type
            );
            if (sourceCondition) {
                resolvedSchema = {
                    ...resolvedSchema,
                    properties: {
                        ...resolvedSchema.properties,
                        ...sourceCondition.then.properties,
                    },
                };
            }
        }

        // Resolve Connection schema - Simplified logic
        if (formData.connection?.type) {
            const connectionType = formData.connection.type.toLowerCase();
            const specificSchema = schemaReferences[`connections/${connectionType}.json`];

            if (specificSchema) {
                resolvedSchema = {
                    ...resolvedSchema,
                    properties: {
                        ...resolvedSchema.properties,
                        connection: {
                            ...resolvedSchema.properties.connection,
                            properties: {
                                ...connectionSchema.properties,
                                ...specificSchema.connectionSpecification.properties,
                            },
                            required: [
                                ...(resolvedSchema.properties.connection?.required || []),
                                ...(specificSchema.connectionSpecification?.required || [])
                            ]
                        },
                    },
                } as any;
            }
        }

        setCurrentSchema(resolvedSchema);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        path: string[] = []
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const newData = { ...prev };
            let current = newData;

            // Handle nested paths
            for (let i = 0; i < path.length - 1; i++) {
                if (!current[path[i]]) {
                    current[path[i]] = {};
                }
                current = current[path[i]];
            }

            if (path.length > 0) {
                current[path[path.length - 1]] = {
                    ...current[path[path.length - 1]],
                    [name]: value,
                };
            } else {
                current[name] = value;
            }

            return newData;
        });
    };
    const formatFieldName = (fieldName: string) => {
        return fieldName
            .split("_") // Split by underscores
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
            .join(" "); // Join the words with spaces
    };

    const isRequired = (fieldName: string, fieldSchema: any, path: string[] = []) => {
        // For connection fields, directly check the specific connection schema
        if (path.includes('connection') && formData.connection?.type) {
            const connectionType = formData.connection.type.toLowerCase();
            const specificSchema = schemaReferences[`connections/${connectionType}.json`];

            if (specificSchema?.connectionSpecification?.required) {
                if (specificSchema.connectionSpecification.required.includes(fieldName)) {
                    return true;
                }
            }
        }

        // Start with the current schema
        let schema = currentSchema;
        let requiredFields: string[] = [];

        // For nested paths, traverse to the correct schema level
        if (path.length > 0) {
            for (const pathSegment of path) {
                if (schema.properties?.[pathSegment]) {
                    schema = schema.properties[pathSegment];

                    // If this is a connection field, check its specification
                    if (pathSegment === 'connection' && schema.properties) {
                        Object.values(schemaReferences).forEach((refSchema: any) => {
                            if (refSchema.connectionSpecification?.required) {
                                requiredFields = [
                                    ...requiredFields,
                                    ...refSchema.connectionSpecification.required
                                ];
                            }
                        });
                    }
                }
            }
        }

        return (
            requiredFields.includes(fieldName) ||
            schema.required?.includes(fieldName) ||
            currentSchema.required?.includes(fieldName) ||
            schema.connectionSpecification?.required?.includes(fieldName)
        );
    };

    const renderGroupedFields = (schema: any, path: string[] = []) => {
        const groups = schema?.connectionSpecification?.groups;
        const properties = schema?.connectionSpecification?.properties;

        if (!groups || !properties) {
            return null;
        }

        // Create a map of fields by group
        const fieldsByGroup: Record<string, Array<[string, any]>> = {};

        // Initialize groups
        groups.forEach((group: any) => {
            fieldsByGroup[group.id] = [];
        });

        // Distribute fields to their groups based on the 'group' property
        Object.entries(properties).forEach(([fieldName, fieldSchema]: [string, any]) => {
            const groupId = (fieldSchema as any).group;
            if (groupId && fieldsByGroup[groupId]) {
                fieldsByGroup[groupId].push([fieldName, fieldSchema]);
            }
        });

        // Filter out empty groups
        const nonEmptyGroups = groups.filter((group: any) =>
            fieldsByGroup[group.id].length > 0
        );

        if (nonEmptyGroups.length === 0) {
            return null;
        }

        return (
            <div className="w-full">
                <Tabs defaultValue={nonEmptyGroups[0].id} className="w-full">
                    <TabsList className="w-full grid" style={{
                        gridTemplateColumns: `repeat(${nonEmptyGroups.length}, minmax(0, 1fr))`
                    }}>
                        {nonEmptyGroups.map((group: any) => (
                            <TabsTrigger key={group.id} value={group.id} className="w-full">
                                {group.title || formatFieldName(group.id)}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {nonEmptyGroups.map((group: any) => (
                        <TabsContent key={group.id} value={group.id} className="mt-4">
                            <div className="grid grid-cols-3 gap-4">
                                {fieldsByGroup[group.id]
                                    .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
                                    .map(([fieldName, fieldSchema]) =>
                                        renderField(fieldName, fieldSchema, path)
                                    )}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        );
    };

    const renderField = (
        fieldName: string,
        fieldSchema: any,
        path: string[] = []
    ) => {
        if (fieldSchema.oneOf) {
            // Check if this is specifically for Snowflake credentials
            const isSnowflakeCredentials =
                path.includes('connection') &&
                formData.connection?.type?.toLowerCase() === 'snowflake' &&
                fieldName === 'credentials';

            const displayType = isSnowflakeCredentials || fieldSchema.display_type === "radio"
                ? "radio"
                : "select";

            // Get the current value from nested form data
            const getCurrentValue = () => {
                let current = formData;
                for (const p of path) {
                    current = current[p] || {};
                }
                // For Snowflake credentials, look for auth_type
                if (isSnowflakeCredentials) {
                    return current[fieldName]?.auth_type;
                }
                return current[fieldName]?.method || current[fieldName]?.mode;
            };

            // Handle radio/select change
            const handleModeChange = (value: string) => {
                setFormData((prev) => {
                    const newData = { ...prev };
                    let current = newData;

                    for (const p of path) {
                        current[p] = current[p] || {};
                        current = current[p];
                    }

                    // For Snowflake credentials, use auth_type
                    if (isSnowflakeCredentials) {
                        current[fieldName] = {
                            ...(current[fieldName] || {}),
                            auth_type: value
                        };
                    } else {
                        current[fieldName] = {
                            ...(current[fieldName] || {}),
                            [fieldSchema.oneOf[0].properties.method ? 'method' : 'mode']: value
                        };
                    }

                    return newData;
                });
            };

            const currentValue = getCurrentValue();

            return (
                <div key={fieldName} className="col-span-3 border p-4 my-2 rounded">
                    <h3 className="text-lg font-semibold mb-2">
                        {fieldSchema.title || formatFieldName(fieldName)}
                        {isRequired(fieldName, fieldSchema, path) && (
                            <span className="text-red-500 ml-1">*</span>
                        )}
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {/* Render mode/method selector */}
                        <div className="mb-4 col-span-3">
                            <Label>{fieldSchema.title || "Mode"}</Label>
                            {displayType === "radio" ? (
                                <div className="">
                                    {fieldSchema.oneOf.map((option: any) => {
                                        const optionValue = isSnowflakeCredentials
                                            ? option.properties.auth_type?.const
                                            : (option.properties.mode?.const || option.properties.method?.const);
                                        return (
                                            <div key={option.title} className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id={`${fieldName}-${option.title}`}
                                                    name={`${path.join('.')}.${fieldName}`}
                                                    value={optionValue}
                                                    checked={currentValue === optionValue}
                                                    onChange={(e) => handleModeChange(e.target.value)}
                                                    className="mt-0"
                                                />
                                                <div>
                                                    <Label htmlFor={`${fieldName}-${option.title}`} className="font-medium">
                                                        {option.title}
                                                    </Label>
                                                    {option.description && (
                                                        <p className="text-sm text-gray-500"
                                                            dangerouslySetInnerHTML={{ __html: option.description }}>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <select
                                    name={fieldName}
                                    value={currentValue || ""}
                                    onChange={(e) => handleModeChange(e.target.value)}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="">Select {fieldSchema.title || "Mode"}</option>
                                    {fieldSchema.oneOf.map((option: any) => (
                                        <option
                                            key={option.title}
                                            value={option.properties.mode?.const || option.properties.method?.const}
                                        >
                                            {option.title}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Render additional fields based on selected mode/method */}
                        {currentValue && fieldSchema.oneOf.map((option: any) => {
                            const optionValue = isSnowflakeCredentials
                                ? option.properties.auth_type?.const
                                : (option.properties.mode?.const || option.properties.method?.const);

                            if (currentValue === optionValue) {
                                return (
                                    <div key={`${option.title}-fields`} className="col-span-3">
                                        <div className="grid grid-cols-3 gap-4">
                                            {Object.entries(option.properties)
                                                .filter(([propName]) => {
                                                    // Filter out the control fields
                                                    const controlFields = ['mode', 'method', 'auth_type'];
                                                    return !controlFields.includes(propName);
                                                })
                                                .map(([propName, propSchema]: [string, any]) => (
                                                    <div key={propName} className="col-span-1">
                                                        {renderField(
                                                            propName,
                                                            propSchema,
                                                            [...path, fieldName]
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
            );
        }

        // For object type with properties
        if (fieldSchema.type === "object" && fieldSchema.properties) {
            // Check if this is a connection field and we have a specific connection type
            if (path.includes('connection') && formData.connection?.type) {
                const connectionType = formData.connection.type.toLowerCase();
                const specificSchema = schemaReferences[`connections/${connectionType}.json`];

                if (specificSchema?.connectionSpecification?.groups) {
                    return renderGroupedFields(specificSchema, [...path, fieldName]);
                }
            }

            // Default object rendering
            return (
                <div key={fieldName} className="col-span-3 border p-4 my-2 rounded">
                    <h3 className="text-lg font-semibold mb-2">
                        {formatFieldName(fieldName)}
                        {isRequired(fieldName, fieldSchema, path) && (
                            <span className="text-red-500 ml-1">*</span>
                        )}
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.entries(fieldSchema.properties).map(
                            ([name, schema]: [string, any]) =>
                                renderField(name, schema, [...path, fieldName])
                        )}
                    </div>
                </div>
            );
        }

        // For object type with $ref
        if (fieldSchema.$ref) {
            const referencedSchema = schemaReferences[fieldSchema.$ref];
            if (referencedSchema && referencedSchema.properties) {
                return (
                    <div key={fieldName} className="col-span-3 border p-4 my-2 rounded">
                        <h3 className="text-lg font-semibold mb-2">{fieldName}</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(referencedSchema.properties).map(
                                ([name, schema]: [string, any]) =>
                                    renderField(name, schema, [...path, fieldName])
                            )}
                        </div>
                    </div>
                );
            }
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
                        {formatFieldName(fieldName)}
                        {isRequired(fieldName, fieldSchema, path) && (
                            <span className="text-red-500 ml-1">*</span>
                        )}
                    </Label>
                    <select
                        name={fieldName}
                        value={fieldValue || ""}
                        onChange={(e) => handleChange(e, path)}
                        className="w-full p-2 border rounded bg-white shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
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

        if (fieldSchema.endpoint) {
            return (
                <div key={fieldName} className="mb-4">
                    <Label>
                        {formatFieldName(fieldName)}
                        {isRequired(fieldName, fieldSchema, path) && (
                            <span className="text-red-500 ml-1">*</span>
                        )}
                    </Label>
                    <select
                        name={fieldName}
                        value={fieldValue || ""}
                        onChange={(e) => handleChange(e, path)}
                        className="w-full p-2 border rounded bg-white shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                    >
                        <option value="">Select {formatFieldName(fieldName)}</option>
                        {connectionTypes.map((type: any) => (
                            <option key={type.type} value={type.type}>
                                {type.connection_name}
                            </option>
                        ))}
                    </select>
                    {errors[fieldName] && (
                        <p className="text-red-500 text-sm">{errors[fieldName]}</p>
                    )}
                </div>
            );
        }

        return (
            <div key={fieldName}>
                <Label>
                    {formatFieldName(fieldName)}
                    {isRequired(fieldName, fieldSchema, path) && (
                        <span className="text-red-500 ml-1">*</span>
                    )}
                </Label>
                <Input
                    type={fieldSchema.bh_secret ? "password" : fieldSchema.type === "number" ? "number" : "text"}
                    name={fieldName}
                    value={fieldValue || ""}
                    onChange={(e) => handleChange(e, path)}
                    placeholder={`Enter ${formatFieldName(fieldName)}`}
                />
                {errors[fieldName] && (
                    <p className="text-red-500 text-sm">{errors[fieldName]}</p>
                )}
            </div>
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form Data:", formData);
    };

    const renderFields = () => {
        const orderedFields = [];

        // 1. Always render name first
        if (currentSchema.properties.name) {
            orderedFields.push(['name', currentSchema.properties.name]);
        }

        // 2. Then type
        if (currentSchema.properties.type) {
            orderedFields.push(['type', currentSchema.properties.type]);
        }

        // 3. Add filename or table_name based on the selected type
        if (formData.type) {
            const sourceCondition = sourceSchema.allOf?.find(
                (condition) => condition.if.properties.type.const === formData.type
            );
            if (sourceCondition?.then?.properties) {
                if (sourceCondition.then.properties.file_name) {
                    orderedFields.push(['file_name', sourceCondition.then.properties.file_name]);
                }
                if (sourceCondition.then.properties.table_name) {
                    orderedFields.push(['table_name', sourceCondition.then.properties.table_name]);
                }
            }
        }

        // 4. Finally, add connection properties
        if (currentSchema.properties.connection && formData.connection?.type !== 'postgres') {
            orderedFields.push(['connection', currentSchema.properties.connection]);
        }

        // Render the fields with groups if applicable
        if (formData.connection?.type === 'postgres') {
            orderedFields.push(['connection', {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "minLength": 1
                    },
                    "type": {
                        "type": "string",
                        "endpoint": "/connection_registry/list/?connection_type=source"
                    },
                }
            }]);
            const connectionType = formData.connection.type.toLowerCase();
            const specificSchema = schemaReferences[`connections/${connectionType}.json`];

            if (specificSchema?.connectionSpecification?.groups) {
                return (
                    <div className="grid grid-cols-3 gap-2">
                        {orderedFields.map(([fieldName, fieldSchema]) =>
                            renderField(fieldName, fieldSchema)
                        )}
                        <div className="col-span-3">
                            {renderGroupedFields(specificSchema, ['connection'])}
                        </div>
                    </div>
                );
            }
        }

        return (
            <div className="grid grid-cols-3 gap-2">
                {orderedFields.map(([fieldName, fieldSchema]) =>
                    renderField(fieldName, fieldSchema)
                )}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto px-4 py-4" style={{ width: '100vh' }}>
            {renderFields()}
            <div className="text-center">
                <button
                    type="submit"
                    className="mx-4 bg-dark text-center px-4 text-white p-2 rounded-sm "
                >
                    Save
                </button>
            </div>
        </form>
    );
};
