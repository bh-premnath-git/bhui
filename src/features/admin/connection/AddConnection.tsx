import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { apiService } from '@/lib/api/api-service';
import { CATALOG_API_PORT } from '@/config/platformenv';
import { RequiredFormLabel } from '@/components/shared/RequiredFormLabel';
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { decrypt_string, encrypt_string } from '@/services/encryption';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';

interface ConnectionType {
  id: string;
  connection_display_name: string;
}

// ------------------
// SCHEMA BUILD HELPERS
// ------------------

/**
 * Build a Zod schema for base fields
 */
const baseSchema = z.object({
  connection_name: z.string().min(1, 'Connection name is required'),
  type: z.string().min(1, 'Connection type is required'),
});

/**
 * Given a JSON schema property definition, build a Zod schema.
 * This is a basic implementation; adapt as needed for more complex constraints.
 */
function buildZodField(fieldConfig: any, requiredFields?: string[]): z.ZodTypeAny {
  const isRequired = requiredFields?.includes(fieldConfig.title) || false;

  // If `oneOf` is present, handle that scenario separately (like a union).
  if (fieldConfig.oneOf && Array.isArray(fieldConfig.oneOf)) {
    // We will union all possible shapes
    const unionSchemas = fieldConfig.oneOf.map((option: any) => {
      const optionFields = { ...(option.properties || {}) };
      const optionRequired = option.required || [];
      const shape: Record<string, z.ZodTypeAny> = {};

      Object.entries(optionFields).forEach(([subFieldName, subFieldConfig]: [string, any]) => {
        // "mode" is often a constant; if so, force it with z.literal
        if (subFieldName === 'mode' && subFieldConfig.const) {
          shape[subFieldName] = z.literal(subFieldConfig.const);
        } else {
          shape[subFieldName] = buildZodField(subFieldConfig, optionRequired);
        }
      });
      return z.object(shape);
    });
    return z.union(unionSchemas);
  }

  // For array fields, we can recursively build item schemas if needed
  if (fieldConfig.type === 'array') {
    const itemType = fieldConfig.items?.type || 'string';
    let arrSchema: z.ZodTypeAny = z.string();
    if (itemType === 'integer') {
      arrSchema = z.coerce.number();
    }
    let result = z.array(arrSchema);
    if (isRequired) {
      result = result.min(1, `${fieldConfig.title || 'This array'} cannot be empty`);
    }
    return result;
  }

  // Basic scalar types
  if (fieldConfig.type === 'integer') {
    let intSchema = z.coerce.number().int(`${fieldConfig.title} must be an integer`);
    if (typeof fieldConfig.minimum === 'number') {
      intSchema = intSchema.min(fieldConfig.minimum, `Minimum is ${fieldConfig.minimum}`);
    }
    if (typeof fieldConfig.maximum === 'number') {
      intSchema = intSchema.max(fieldConfig.maximum, `Maximum is ${fieldConfig.maximum}`);
    }
    return isRequired ? intSchema : intSchema.optional();
  }

  if (fieldConfig.enum && Array.isArray(fieldConfig.enum)) {
    // If there's an enum, it's a finite set of string values
    let enumSchema = z.enum(fieldConfig.enum as [string, ...string[]]);
    return isRequired ? enumSchema : enumSchema.optional();
  }

  // Default: treat as string
  let stringSchema = z.string();
  if (isRequired) {
    stringSchema = stringSchema.min(1, `${fieldConfig.title} is required`);
  } else {
    stringSchema = stringSchema.optional();
  }
  return stringSchema;
}

/**
 * Build a Zod schema from a "connectionSpecification" style JSON
 */
function buildZodSchemaFromConnectionSpec(
  connectionSpecification: any
): z.ZodObject<any> {
  if (!connectionSpecification?.properties) {
    // Fallback to an empty object
    return z.object({});
  }

  const { properties, required = [] } = connectionSpecification;

  const shape: Record<string, z.ZodTypeAny> = {};

  Object.entries(properties).forEach(([fieldName, fieldConfig]) => {
    shape[fieldName] = buildZodField(fieldConfig, required);
  });

  return z.object(shape);
}

export const AddConnection = () => {
  const [connectionTypes, setConnectionTypes] = useState<ConnectionType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [connectionSchema, setConnectionSchema] = useState<any>(null);
  const [specificSchema, setSpecificSchema] = useState<any>(null);
  const [groupedFields, setGroupedFields] = useState<any>({});
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialConnectionData, setInitialConnectionData] = useState<any>(null);

  // ---------------
  // Load initial connection schema
  // ---------------
  useEffect(() => {
    const loadConnectionSchema = async () => {
      try {
        const schema = await import('@/components/bh-reactflow-comps/builddata/json/Connection.json');
        setConnectionSchema(schema);
      } catch (error) {
        console.error('Error loading connection schema:', error);
      }
    };
    loadConnectionSchema();
  }, []);

  // ---------------
  // Load connection types from API
  // ---------------
  useEffect(() => {
    const fetchConnectionTypes = async () => {
      if (connectionSchema?.properties?.type?.endpoint) {
        try {
          const response = await ApiService(
            CATALOG_API_PORT,
            'get',
            connectionSchema.properties.type.endpoint
          );
          setConnectionTypes(response);
        } catch (error) {
          console.error('Error fetching connection types:', error);
        }
      }
    };
    fetchConnectionTypes();
  }, [connectionSchema]);

  // ---------------
  // Load specific connection schema based on type
  // ---------------
  useEffect(() => {
    const loadSpecificSchema = async () => {
      if (selectedType) {
        try {
          let schema: any;
          switch (selectedType.toLowerCase()) {
            case 'postgres':
              schema = await import('@/components/bh-reactflow-comps/builddata/json/postgres.json');
              break;
            case 'bigquery':
              schema = await import('@/components/bh-reactflow-comps/builddata/json/bigquery.json');
              break;
            case 'snowflake':
              schema = await import('@/components/bh-reactflow-comps/builddata/json/snowflake.json');
              break;
            case 'local':
              // Create a simple schema for local connection
              schema = {
                connectionSpecification: {
                  properties: {
                    file_path_prefix: {
                      type: "string",
                      title: "File Path Prefix",
                      description: "The path prefix for local files",
                      minLength: 1
                    }
                  },
                  required: ["file_path_prefix"]
                }
              };
              break;
            default:
              schema = null;
              break;
          }
          setSpecificSchema(schema);
          organizeFieldsByGroup(schema);
        } catch (error) {
          console.error('Error loading specific schema:', error);
        }
      }
    };
    loadSpecificSchema();
  }, [selectedType]);

  // ---------------
  // When in edit mode, fetch existing connection data
  // ---------------
  useEffect(() => {
    const fetchConnectionData = async () => {
      if (id) {
        setIsEditMode(true);

        try {
          const queryParams = new URLSearchParams({
            id: id.toString(),
          }).toString();

          const response = await ApiService(
            CATALOG_API_PORT,
            'get',
            `/connection_registry/connection_config/list/?${queryParams}`
          );

          if (response && response.length > 0) {
            const connectionData = response[0];

            // Get connection type from custom_metadata
            const connectionType =
              connectionData.custom_metadata?.type ||
              connectionData.connection_name.charAt(0).toUpperCase() +
                connectionData.connection_name.slice(1);

            // Set the selected type to trigger schema loading
            setSelectedType(connectionType);

            // Prepare initial data from custom_metadata or config
            let configData = {};
            if (connectionData.config && connectionData.init_vector) {
              // If config exists, decrypt it
              const decryptedConfig = decrypt_string(connectionData.config, connectionData.init_vector);
              configData = JSON.parse(decryptedConfig);
            } else if (connectionData.custom_metadata) {
              // Otherwise use custom_metadata
              configData = {
                file_path_prefix: connectionData.custom_metadata.file_path_prefix,
                // Add other fields as needed
              };
            }

            // Set initial form data
            const initialData = {
              connection_name: connectionData.connection_config_name,
              type: connectionType,
              ...configData,
            };
            setInitialConnectionData(initialData);
          } else {
            toast.error('Connection not found');
            navigate('/admin-console/connection');
          }
        } catch (error) {
          console.error('Error fetching connection data:', error);
          toast.error('Failed to fetch connection data');
        }
      }
    };

    fetchConnectionData();
  }, [id, navigate]);

  // ---------------
  // Organize fields by group (for Tabs usage)
  // ---------------
  const organizeFieldsByGroup = (schema: any) => {
    if (!schema?.connectionSpecification?.properties) return;

    const fields = schema.connectionSpecification.properties;
    const groups = schema.connectionSpecification.groups || [];
    const groupedFields: any = {};

    // Special handling for Snowflake
    if (selectedType.toLowerCase() === 'snowflake') {
      groupedFields.authorization = {
        title: "Authorization Method",
        fields: {
          credentials: fields.credentials // Use the credentials field directly from schema
        }
      };

      // Create connection details group with remaining fields
      const connectionFields = { ...fields };
      delete connectionFields.credentials; // Remove credentials as it's in the authorization group

      groupedFields.connection = {
        title: "Connection Details",
        fields: connectionFields
      };
    } else if (groups.length > 0) {
      // Original grouping logic for other connection types
      groups.forEach((group: any) => {
        groupedFields[group.id] = {
          title: group.title || group.id,
          fields: {}
        };
      });

      Object.entries(fields).forEach(([fieldName, fieldConfig]: [string, any]) => {
        const group = fieldConfig.group;
        if (group && groupedFields[group]) {
          groupedFields[group].fields[fieldName] = fieldConfig;
        }
      });
    } else {
      groupedFields.default = {
        title: "Connection Details",
        fields: fields
      };
    }

    setGroupedFields(groupedFields);
  };

  // ---------------
  // Build the dynamic Zod schema
  // ---------------
  const buildFinalSchema = (): z.ZodObject<any> => {
    let dynamicSchema = z.object({});
    if (specificSchema?.connectionSpecification) {
      dynamicSchema = buildZodSchemaFromConnectionSpec(
        specificSchema.connectionSpecification
      );
    }
    // Merge base schema with the dynamic schema
    return baseSchema.merge(dynamicSchema);
  };

  // ---------------
  // Generate default values for the form
  // ---------------
  const generateInitialValues = () => {
    // If editing and we have initial data, just return that
    if (isEditMode && initialConnectionData) {
      return initialConnectionData;
    }

    // Otherwise, create placeholders based on the JSON schema
    const baseValues: any = {
      connection_name: '',
      type: selectedType || '',
    };

    if (specificSchema?.connectionSpecification?.properties) {
      Object.entries(specificSchema.connectionSpecification.properties).forEach(
        ([key, value]: [string, any]) => {
          // If there's a default, set it
          if (typeof value.default !== 'undefined') {
            baseValues[key] = value.default;
          }
          // If it's an array, default to an empty array if not provided
          else if (value.type === 'array') {
            baseValues[key] = [];
          }
          // Otherwise, set empty string
          else {
            baseValues[key] = '';
          }
        }
      );
    }

    return baseValues;
  };

  // ---------------
  // Setup react-hook-form
  // ---------------
  const finalSchema = buildFinalSchema();

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(finalSchema),
    defaultValues: {},
    mode: 'onBlur',
  });

  // Whenever schema or initial data changes, reset the form
  useEffect(() => {
    const newDefaultValues = generateInitialValues();
    reset(newDefaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specificSchema, initialConnectionData]);

  // ---------------
  // Submit Handler
  // ---------------
  const onValidSubmit = async (values: any) => {
    console.log('Form Values:', values);

    let connectionData = {};
    switch (values.type.toLowerCase()) {
      case "bigquery":
        connectionData = {
          project_id: values.project_id,
          dataset_id: values.dataset_id,
          credentials_json: values.credentials_json,
          source_type: values.type.toLowerCase()
        };
        break;
      case "local":
        connectionData = {
          file_path_prefix: values.file_path_prefix,
          source_type: values.type.toLowerCase()
        };
        break;
      // Add other connection types as needed
      default:
        // For demonstration, just pass everything for unhandled types
        connectionData = { ...values, source_type: values.type.toLowerCase() };
        break;
    }

    // Encrypt the connection data
    const { encryptedString, initVector } = encrypt_string(
      JSON.stringify(connectionData)
    );

    try {
      const connectionTypeMatch = connectionTypes.find(
        (type) => type.connection_display_name === values.type
      );

      if (!connectionTypeMatch) {
        throw new Error('Connection type not found');
      }

      const transformedData = {
        connection_config_name: values.connection_name,
        connection_name: connectionTypeMatch.connection_display_name.toLowerCase(),
        custom_metadata: {
          connection_name: values.connection_name,
          type: values.type,
          ...connectionData,
        },
        connection_type: "source",
        connection_status: "active",
        data_residency: "auto",
        config: encryptedString,
        init_vector: initVector,
        connection_id: connectionTypeMatch.id
      };

      if (isEditMode && id) {
        // PUT for update
        await ApiService(
          CATALOG_API_PORT,
          'PUT',
          `/connection_registry/connection_config/${id}`,
          transformedData,
          null,
          {
            'Content-Type': 'application/json'
          }
        );
        toast.success("Connection updated successfully");
      } else {
        // POST for create
        await ApiService(
          CATALOG_API_PORT,
          'POST',
          '/connection_registry/connection_config',
          transformedData
        );
        toast.success("Connection created successfully");
      }

      navigate('/admin-console/connection');
    } catch (error) {
      console.error('Error saving connection:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} connection`);
    }
  };

  // ---------------
  // RENDERING HELPERS
  // ---------------

  /**
   * Render a single field (non-oneOf).
   */

  const renderSingleField = (fieldName: string, fieldConfig: any) => {
    const errorMessage = (errors as any)[fieldName]?.message;
    const isRequired = specificSchema?.connectionSpecification?.required?.includes(fieldName);

    // Arrays need special handling via useFieldArray
    if (fieldConfig.type === 'array') {
        return renderArrayField(fieldName, fieldConfig);
    }

    // If normal string/integer/enum
    if (fieldConfig.enum) {
        // ... (rest of the enum handling code is fine)
    }

    // Normal input (string or integer)
    const inputType = fieldConfig.type === 'integer' ? 'number' : 'text';
    const placeholder = fieldConfig.description || fieldConfig.title || '';

    return (
        <div key={fieldName} className="space-y-1">
            {/* ... (rest of the code is the same) */}
            <Input
                type={fieldConfig.bh_secret ? 'password' : inputType}
                placeholder={placeholder}
                {...(isRequired ? register(fieldName) : register(fieldName as ''))}
            />

            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
        </div>
    );
};


    // Normal input (string or integer)
    const inputType = fieldConfig.type === 'integer' ? 'number' : 'text';
    const placeholder = fieldConfig.description || fieldConfig.title || '';

    return (
      <div key={fieldName} className="space-y-1">
        <div className="flex items-center gap-2">
          <Label>
            {isRequired ? <RequiredLabel>{fieldConfig.title}</RequiredLabel> : fieldConfig.title}
          </Label>
          {fieldConfig.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{fieldConfig.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <Input
          type={fieldConfig.bh_secret ? 'password' : inputType}
          placeholder={placeholder}
          {...register(fieldName)}
        />

        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      </div>
    );
  };

  /**
   * Render array field via useFieldArray
   */
  const renderArrayField = (fieldName: string, fieldConfig: any) => {
    const { fields, append, remove } = useFieldArray({
      control,
      name: fieldName,
    });
    const errorMessage = (errors as any)[fieldName]?.message;

    return (
      <div key={fieldName} className="space-y-1">
        <div className="flex items-center gap-2">
          <Label>
            {fieldConfig.title}
          </Label>
          {fieldConfig.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{fieldConfig.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 mb-2">
            <Input
              placeholder={`Enter ${fieldConfig.title || 'value'}`}
              {...register(`${fieldName}.${index}`)}
            />
            <button
              type="button"
              className="p-2 hover:bg-destructive/90 hover:text-destructive-foreground rounded-md"
              onClick={() => remove(index)}
            >
              {/* Trash icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          onClick={() => append('')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          Add {fieldConfig.title || 'Item'}
        </button>
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      </div>
    );
  };

  /**
   * Render a oneOf field (radio group logic)
   */
  const renderOneOfField = (fieldName: string, fieldConfig: any) => {
    // Each item in oneOf can have its own properties
    // We'll watch the "mode" to figure out which sub-form to render
    const errorMessage = (errors as any)[fieldName]?.message;

    // We store the parent's entire object in watch, so that we can see which mode is selected
    // E.g. watch('credentials') => { mode: 'someConstant', ...subFields }
    const parentValue = watch(fieldName);

    return (
      <div className="space-y-4">
        <Label>{fieldConfig.title || 'Select Option'}</Label>
        {fieldConfig.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{fieldConfig.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <div className="grid grid-cols-[200px_1fr] gap-6">
          {/* Left side: radio group */}
          <div>
            {fieldConfig.oneOf.map((option: any, index: number) => {
              const modeValue = option.properties?.mode?.const || `option_${index}`;
              const optionTitle = option.title || `Option ${index + 1}`;
              return (
                <div key={modeValue} className="flex items-center space-x-2 mb-2">
                  <RadioGroup
                    value={parentValue?.mode || ''}
                    onValueChange={(val) => {
                      // We manually set the parent's mode
                      // Because each radio option is a separate shape, we might need to reset subfields
                      // Optionally, you can do a partial set here
                      // We'll do a direct approach below:
                      const newObj = { ...parentValue, mode: val };
                      // If the mode changes, reset other subfields
                      if (val !== parentValue?.mode) {
                        // Clear out old subfields (except mode)
                        Object.keys(newObj).forEach((key) => {
                          if (key !== 'mode') {
                            delete newObj[key];
                          }
                        });
                      }
                      // Set form state
                      // "fieldName" might be something like 'credentials'
                      // we can do something like setValue, but we must get from useForm context
                      // Instead, let's store it in watch logic:
                    }}
                  >
                    <RadioGroupItem
                      id={`${fieldName}.${modeValue}`}
                      value={modeValue}
                      // For radio group in React Hook Form, you might need a Controller or manual handle
                      // We'll handle the onChange above
                      onClick={() => {
                        const newObj = { mode: modeValue };
                        // Reset subfields
                        // Copy shape from 'option.properties' except mode
                        Object.entries(option.properties || {}).forEach(([propName, propConfig]) => {
                          if (propName !== 'mode') {
                            newObj[propName] = '';
                          }
                        });
                        // If you want to preserve old data if switching back, you’d store it somewhere else
                        // For simplicity, we always reset
                        const fieldPath = fieldName; // e.g. "credentials"
                        // We use "resetField" or "setValue"
                        // setValue from react-hook-form:
                        // use "control._formValues" if needed
                        control.setValue(fieldPath, newObj, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true
                        });
                      }}
                    />
                  </RadioGroup>
                  <Label htmlFor={`${fieldName}.${modeValue}`} className="font-normal">
                    {optionTitle}
                  </Label>
                  {option.description && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{option.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right side: subform for whichever radio is selected */}
          <div>
            {fieldConfig.oneOf.map((option: any, index: number) => {
              const modeValue = option.properties?.mode?.const || `option_${index}`;
              if (parentValue?.mode === modeValue) {
                // Render subfields
                const propertyEntries = Object.entries(option.properties).filter(
                  ([propName]) => propName !== 'mode'
                );
                return (
                  <div key={modeValue} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {propertyEntries.map(([propName, propConfig]: [string, any]) => {
                        const fullFieldName = `${fieldName}.${propName}`;
                        const subError = (errors as any)[fieldName]?.[propName]?.message;
                        const subIsRequired = option.required?.includes(propName);

                        return (
                          <div key={fullFieldName} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label>
                                {subIsRequired ? (
                                  <RequiredLabel>{propConfig.title || propName}</RequiredLabel>
                                ) : (
                                  propConfig.title || propName
                                )}
                              </Label>
                              {propConfig.description && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Info className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs">{propConfig.description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>

                            {/* Basic input or custom logic */}
                            {propConfig.type === 'integer' ? (
                              <Input
                                type="number"
                                placeholder={propConfig.description || propConfig.title}
                                {...register(fullFieldName as const)}
                              />
                            ) : (
                              <Input
                                type={propConfig.bh_secret ? 'password' : 'text'}
                                placeholder={propConfig.description || propConfig.title}
                                {...register(fullFieldName as const)}
                              />
                            )}
                            {subError && <p className="text-red-500 text-sm">{subError}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      </div>
    );
  };

  /**
   * Decide how to render a field based on whether it has oneOf or not.
   */
  const renderField = (fieldName: string, fieldConfig: any) => {
    // If it's a oneOf, render the specialized logic
    if (fieldConfig.oneOf && Array.isArray(fieldConfig.oneOf)) {
      return (
        <div key={fieldName}>{renderOneOfField(fieldName, fieldConfig)}</div>
      );
    }
    // Otherwise, normal field
    return renderSingleField(fieldName, fieldConfig);
  };

  // ---------------
  // Component JSX
  // ---------------
  return (
    <div className="max-w-6xl mx-auto p-6 shadow-md rounded-lg mt-10 border border-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {isEditMode ? 'Edit Connection' : 'Create New Connection'}
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure your data source connection settings
        </p>
      </div>

      <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-8">
        {/* Base Connection Fields */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-6">
            {/* Connection Name */}
            <div className="space-y-2">
              <RequiredLabel>
                <Label className="text-sm font-medium">Connection Name</Label>
              </RequiredLabel>
              <Input
                className="transition-all hover:border-primary/50 focus:border-primary"
                {...register('connection_name')}
              />
              {errors.connection_name && (
                <p className="text-red-500 text-sm">
                  {errors.connection_name.message as string}
                </p>
              )}
            </div>

            {/* Connection Type */}
            <div className="space-y-2">
              <RequiredLabel>
                <Label className="text-sm font-medium">Connection Type</Label>
              </RequiredLabel>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedType(value);
                    }}
                    value={field.value || ''}
                  >
                    <SelectTrigger className="transition-all hover:border-primary/50">
                      <SelectValue placeholder="Select connection type" />
                    </SelectTrigger>
                    <SelectContent>
                      {connectionTypes.map((type) => (
                        <SelectItem
                          key={type.id}
                          value={type.connection_display_name}
                          className="cursor-pointer transition-colors hover:bg-primary/10"
                        >
                          {type.connection_display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-red-500 text-sm">
                  {errors.type.message as string}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Specific Connection Fields */}
        {Object.keys(groupedFields).length > 0 && (
          <div className="rounded-lg border bg-card shadow-sm">
            {Object.keys(groupedFields).length > 1 ? (
              <Tabs
                defaultValue={Object.keys(groupedFields)[0]}
                className="p-6"
              >
                <TabsList className="mb-6 bg-muted/50 p-1">
                  {Object.entries(groupedFields).map(([groupId, group]) => (
                    <TabsTrigger
                      key={groupId}
                      value={groupId}
                      className="transition-all data-[state=active]:bg-background data-[state=active]:text-primary"
                    >
                      {group.title}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(groupedFields).map(
                  ([groupId, group]: [string, any]) => (
                    <TabsContent key={groupId} value={groupId}>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(group.fields).map(
                            ([fieldName, fieldConfig]: [string, any]) =>
                              // Render Update Method in a separate row
                              fieldName === 'replication_method'
                                ? null
                                : renderField(fieldName, fieldConfig)
                          )}
                        </div>

                        {/* replication_method in full width */}
                        {group.fields.replication_method && (
                          <div className="col-span-2">
                            {renderField(
                              'replication_method',
                              group.fields.replication_method
                            )}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  )
                )}
              </Tabs>
            ) : (
              <div className="p-6 space-y-6">
                <h2 className="text-xl font-semibold mb-4">
                  {groupedFields[Object.keys(groupedFields)[0]].title}
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(
                    groupedFields[Object.keys(groupedFields)[0]].fields
                  ).map(([fieldName, fieldConfig]: [string, any]) =>
                    fieldName === 'replication_method'
                      ? null
                      : renderField(fieldName, fieldConfig)
                  )}
                </div>
                {groupedFields[Object.keys(groupedFields)[0]].fields
                  .replication_method && (
                  <div className="col-span-2">
                    {renderField(
                      'replication_method',
                      groupedFields[Object.keys(groupedFields)[0]].fields.replication_method
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 rounded-md bg-black text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {isEditMode ? 'Update Connection' : 'Create Connection'}
          </button>
        </div>
      </form>
    </div>
  );
};
