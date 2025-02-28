import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService } from '@/lib/api/api-service';
import { CATALOG_API_PORT } from '@/config/platformenv';
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
import { RequiredFormLabel } from "@/components/shared/RequiredFormLabel";
import { Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ConnectionType {
  id: string;
  connection_display_name: string;
}

const baseSchema = z.object({
  connection_name: z.string().min(1, 'Connection name is required'),
  type: z.string().min(1, 'Connection type is required'),
});

function buildZodField(fieldConfig: any, requiredFields?: string[]): z.ZodTypeAny {
  const isRequired = requiredFields?.includes(fieldConfig.title) || false;

  if (fieldConfig.oneOf && Array.isArray(fieldConfig.oneOf)) {
    const unionSchemas = fieldConfig.oneOf.map((option: any) => {
      const optionFields = { ...(option.properties || {}) };
      const optionRequired = option.required || [];
      const shape: Record<string, z.ZodTypeAny> = {};

      Object.entries(optionFields).forEach(([subFieldName, subFieldConfig]: [string, any]) => {
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
    let enumSchema = z.enum(fieldConfig.enum as [string, ...string[]]);
    return isRequired ? enumSchema : enumSchema.optional();
  }

  if (isRequired) {
    return z.string().min(1, `${fieldConfig.title} is required`);
  } else {
    return z.string().optional();
  }
}

function buildZodSchemaFromConnectionSpec(
  connectionSpecification: any
): z.ZodObject<any> {
  if (!connectionSpecification?.properties) {
    return z.object({}) as z.ZodObject<any>;
  }

  const { properties, required = [] } = connectionSpecification;
  const shape: Record<string, z.ZodTypeAny> = {};

  Object.entries(properties).forEach(([fieldName, fieldConfig]) => {
    shape[fieldName] = buildZodField(fieldConfig, required);
  });

  return z.object(shape) as z.ZodObject<any>;
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

  useEffect(() => {
    const fetchConnectionTypes = async () => {
      if (connectionSchema?.properties?.type?.endpoint) {
        try {
          const response = await apiService.get({
            portNumber: CATALOG_API_PORT,
            method: 'GET',
            url: connectionSchema.properties.type.endpoint
          });
          setConnectionTypes(response as ConnectionType[]);
        } catch (error) {
          console.error('Error fetching connection types:', error);
        }
      }
    };
    fetchConnectionTypes();
  }, [connectionSchema]);

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

  useEffect(() => {
    const fetchConnectionData = async () => {
      if (id) {
        setIsEditMode(true);

        try {
          const queryParams = new URLSearchParams({
            id: id.toString(),
          }).toString();

          const response = await apiService.get({
            portNumber: CATALOG_API_PORT,
            method: 'GET',
            url: `/connection_registry/connection_config/list/?${queryParams}`
          });

          if (response && (response as any[]).length > 0) {
            const connectionData = (response as any[])[0];

            const connectionType =
              connectionData.custom_metadata?.type ||
              connectionData.connection_name.charAt(0).toUpperCase() +
                connectionData.connection_name.slice(1);

            setSelectedType(connectionType);

            let configData = {};
            if (connectionData.config && connectionData.init_vector) {
              const decryptedConfig = decrypt_string(connectionData.config, connectionData.init_vector);
              configData = JSON.parse(decryptedConfig);
            } else if (connectionData.custom_metadata) {
              configData = {
                file_path_prefix: connectionData.custom_metadata.file_path_prefix,
              };
            }

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

  const organizeFieldsByGroup = (schema: any) => {
    if (!schema?.connectionSpecification?.properties) return;

    const fields = schema.connectionSpecification.properties;
    const groups = schema.connectionSpecification.groups || [];
    const groupedFields: any = {};

    if (selectedType.toLowerCase() === 'snowflake') {
      groupedFields.authorization = {
        title: "Authorization Method",
        fields: {
          credentials: fields.credentials 
        }
      };

      const connectionFields = { ...fields };
      delete connectionFields.credentials; 

      groupedFields.connection = {
        title: "Connection Details",
        fields: connectionFields
      };
    } else if (groups.length > 0) {
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

  // Build the final schema and enforce strict mode to match the expected unknown keys handling
  const buildFinalSchema = () => {
    let dynamicSchema:any = z.object({});
    if (specificSchema?.connectionSpecification) {
      dynamicSchema = buildZodSchemaFromConnectionSpec(
        specificSchema.connectionSpecification
      );
    }
    return baseSchema.merge(dynamicSchema).strict();
  };

  const generateInitialValues = () => {
    if (isEditMode && initialConnectionData) {
      return initialConnectionData;
    }

    const baseValues: any = {
      connection_name: '',
      type: selectedType || '',
    };

    if (specificSchema?.connectionSpecification?.properties) {
      Object.entries(specificSchema.connectionSpecification.properties).forEach(
        ([key, value]: [string, any]) => {
          if (typeof value.default !== 'undefined') {
            baseValues[key] = value.default;
          } else if (value.type === 'array') {
            baseValues[key] = [];
          } else {
            baseValues[key] = '';
          }
        }
      );
    }

    return baseValues;
  };

  const finalSchema = buildFinalSchema();

  type FormData = any;

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(finalSchema),
    defaultValues: {},
    mode: 'onBlur',
  });

  useEffect(() => {
    const newDefaultValues = generateInitialValues();
    reset(newDefaultValues);
  }, [specificSchema, initialConnectionData]);

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
      default:
        connectionData = { ...values, source_type: values.type.toLowerCase() };
        break;
    }

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
        await apiService.put({
          portNumber: CATALOG_API_PORT,
          method: 'PUT',
          url: `/connection_registry/connection_config/${id}`,
          data: transformedData
        });
        toast.success("Connection updated successfully");
      } else {
        await apiService.post({
          portNumber: CATALOG_API_PORT,
          method: 'POST',
          url: '/connection_registry/connection_config',
          data: transformedData
        });
        toast.success("Connection created successfully");
      }

      navigate('/admin-console/connection');
    } catch (error) {
      console.error('Error saving connection:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} connection`);
    }
  };

  const renderSingleField = (fieldName: string, fieldConfig: any) => {
    const errorMessage = (errors as any)[fieldName]?.message;
    const isRequired = specificSchema?.connectionSpecification?.required?.includes(fieldName);

    if (fieldConfig.type === 'array') {
      return renderArrayField(fieldName, fieldConfig);
    }

    const inputType = fieldConfig.type === 'integer' ? 'number' : 'text';
    const placeholder = fieldConfig.description || fieldConfig.title || '';

    return (
      <div key={fieldName} className="space-y-1">
        <div className="flex items-center gap-2">
          <Label>
            {isRequired ? <RequiredFormLabel>{fieldConfig.title}</RequiredFormLabel> : fieldConfig.title}
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

  const renderOneOfField = (fieldName: string, fieldConfig: any) => {
    const errorMessage = (errors as any)[fieldName]?.message;
    const parentValue = watch(fieldName);

    return (
      <div className="space-y-4 w-full">
        <div className="flex items-center gap-2">
          <Label className="font-medium">{fieldConfig.title}</Label>
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
        <div className="grid grid-cols-[200px_1fr] gap-6">
          <div>
            {fieldConfig.oneOf.map((option: any, index: number) => {
              const modeValue = option.properties?.mode?.const || `option_${index}`;
              return (
                <div key={modeValue} className="mb-3">
                  <RadioGroup
                    value={parentValue?.mode || ''}
                    onValueChange={(val) => {
                      const newObj = { ...parentValue, mode: val };
                      Object.keys(newObj).forEach((key) => {
                        if (key !== 'mode') {
                          delete newObj[key];
                        }
                      });
                      setValue(fieldName, newObj, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true
                      });
                    }}
                  >
                    <RadioGroupItem
                      key={modeValue}
                      value={modeValue}
                      onClick={() => {
                        const newObj = { mode: modeValue };
                        Object.entries(option.properties || {}).forEach(([propName, propConfig]) => {
                          if (propName !== 'mode') {
                            newObj[propName] = '';
                          }
                        });
                        setValue(fieldName, newObj, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true
                        });
                      }}
                      className="mr-2"
                    />
                    <Label htmlFor={modeValue}>
                      {option.title || option.properties?.mode?.title || `Option ${index + 1}`}
                    </Label>
                  </RadioGroup>
                </div>
              );
            })}
          </div>

          <div>
            {fieldConfig.oneOf.map((option: any, index: number) => {
              const modeValue = option.properties?.mode?.const || `option_${index}`;
              return (
                parentValue?.mode === modeValue && (
                  <div key={modeValue} className="space-y-4">
                    {Object.entries(option.properties || {})
                      .filter(([propName]) => propName !== 'mode')
                      .map(([propName, propConfig]: [string, any]) => {
                        const fullFieldName = `${fieldName}.${propName}`;
                        const subErrorMessage = (errors as any)[fieldName]?.[propName]?.message;
                        const subIsRequired = option.required?.includes(propName);

                        return (
                          <div key={fullFieldName} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label>
                                {subIsRequired ? (
                                  <RequiredFormLabel>{propConfig.title || propName}</RequiredFormLabel>
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

                            {propConfig.type === 'integer' ? (
                              <Input
                                type="number"
                                placeholder={propConfig.description || propConfig.title || ''}
                                {...register(`${fieldName}.${propName}` as any)}
                              />
                            ) : (
                              <Input
                                type={propConfig.bh_secret ? 'password' : 'text'}
                                placeholder={propConfig.description || propConfig.title || ''}
                                {...register(`${fieldName}.${propName}` as any)}
                              />
                            )}

                            {subErrorMessage && (
                              <p className="text-red-500 text-sm">{subErrorMessage}</p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )
              );
            })}
          </div>
        </div>
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      </div>
    );
  };

  const renderField = (fieldName: string, fieldConfig: any) => {
    if (fieldConfig.oneOf && Array.isArray(fieldConfig.oneOf)) {
      return (
        <div key={fieldName}>{renderOneOfField(fieldName, fieldConfig)}</div>
      );
    }
    return renderSingleField(fieldName, fieldConfig);
  };

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
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <RequiredFormLabel>
                <Label className="text-sm font-medium">Connection Name</Label>
              </RequiredFormLabel>
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

            <div className="space-y-2">
              <RequiredFormLabel>
                <Label className="text-sm font-medium">Connection Type</Label>
              </RequiredFormLabel>
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

        {Object.keys(groupedFields).length > 0 && (
          <div className="rounded-lg border bg-card shadow-sm">
            {Object.keys(groupedFields).length > 1 ? (
              <Tabs
                defaultValue={Object.keys(groupedFields)[0]}
                className="p-6"
              >
                <TabsList className="mb-6 bg-muted/50 p-1">
                  {Object.entries(groupedFields).map(([groupId, group]: [string, { title: string; fields: any }]) => (
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
                  ([groupId, group]: [string, { title: string; fields: any }]) => (
                    <TabsContent key={groupId} value={groupId}>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(group.fields).map(
                            ([fieldName, fieldConfig]: [string, any]) =>
                              fieldName === 'replication_method'
                                ? null
                                : renderField(fieldName, fieldConfig)
                          )}
                        </div>

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
