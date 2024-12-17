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

const schemaReferences: Record<string, any> = {
    "schemas/Source.json": sourceSchema,
    "Connection.json": connectionSchema,
    "connections/bigquery.json": bigQuerySchema,
    "connections/postgres.json": postgresSchema,
    "connections/snowflake.json": snowflakeSchema,
    "transformations/readers/CSVOptions.json": csvOptionsSchema,
};


export const ReaderOptionsForm: React.FC<any> = () => {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [currentSchema, setCurrentSchema] = useState<any>(readerSchema);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        resolveSchema();
    }, [formData]);

    const resolveSchema = async () => {
        let resolvedSchema = { ...readerSchema };

        // Resolve Source schema conditions
        if (formData.type) {
            const sourceCondition = readerSchema.allOf?.find(
                (condition) =>
                    condition.if.properties.source?.properties?.type?.const === formData.type
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
                if (formData.type === 'File' && formData.file_type) {
                    const fileTypeCondition = sourceCondition.then.allOf?.find(
                        (condition) =>
                            condition.if.properties.file_type?.const === formData.file_type
                    );

                    if (fileTypeCondition) {
                        // Add CSV options schema when file_type is CSV
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
                            };
                        } else {
                            resolvedSchema = {
                                ...resolvedSchema,
                                properties: {
                                    ...resolvedSchema.properties,
                                    ...fileTypeCondition.then.properties,
                                },
                            };
                        }
                    }
                }
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
            .replace(/([A-Z])/g, " $1") // Insert space before each uppercase letter
            .replace(/^ /, "") // Remove leading space if it exists
            .split("_") // Handle underscores if they exist
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
            .join(" "); // Join the words with spaces
    };


    const renderField = (
        fieldName: string,
        fieldSchema: any,
        path: string[] = []
    ) => {
        // For object type with properties
        if (fieldSchema.type === "object" && fieldSchema.properties) {
            return (
                <div key={fieldName} className="col-span-3 border p-4 my-2 rounded">
                    <h3 className="text-lg font-semibold mb-2">{formatFieldName(fieldName)}</h3>
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
                        <div className="grid grid-cols-4 gap-2">
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
                    <Label>{formatFieldName(fieldName)}</Label>
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

        return (
            <div key={fieldName} className="mb-4">
                <Label>{formatFieldName(fieldName)}</Label>
                <Input type={fieldSchema.type === "number" ? "number" : "text"}
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
        // Add validation logic here
        onSubmit(formData);
    };
    function onSubmit(formData) {
        console.log(formData)
    }

    const renderFields = () => {
        const orderedFields = [];

        // Always render name first
        if (currentSchema.properties.name) {
            orderedFields.push(['name', currentSchema.properties.name]);
        }

        // Then render type selection
        if (currentSchema.properties.type) {
            orderedFields.push(['type', currentSchema.properties.type]);
        }

        // If File type is selected, show file_type
        if (formData.type === 'File' && currentSchema.properties.file_type) {
            orderedFields.push(['file_type', currentSchema.properties.file_type]);
        }

        // If Relational type is selected, show query field
        if (formData.type === 'Relational' && currentSchema.properties.query) {
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

    return (
        <form onSubmit={handleSubmit} className="mx-auto p-4" style={{ width: '100%' }}>
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
