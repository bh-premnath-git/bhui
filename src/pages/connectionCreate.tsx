import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ApiService } from '@/services/apiServices';
import { CATALOG_API_PORT } from '@/configration/environment';
import RequiredLabel from '@/components/RequiredFieldLabel';
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, useField } from 'formik';
import { decrypt_string, encrypt_string } from '@/services/encryption';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

interface ConnectionType {
  id: string;
  connection_display_name: string;
}

const ConnectionCreate = () => {
  const [connectionTypes, setConnectionTypes] = useState<ConnectionType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [connectionSchema, setConnectionSchema] = useState<any>(null);
  const [specificSchema, setSpecificSchema] = useState<any>(null);
  const [groupedFields, setGroupedFields] = useState<any>({});
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialConnectionData, setInitialConnectionData] = useState<any>(null);

  // Load initial connection schema
  useEffect(() => {
    const loadConnectionSchema = async () => {
      try {
        const schema = await import('../components/BuildPipeLineComps/json/Connection.json');
        setConnectionSchema(schema);
      } catch (error) {
        console.error('Error loading connection schema:', error);
      }
    };
    loadConnectionSchema();
  }, []);

  // Load connection types from API
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
          console.log(response);
        } catch (error) {
          console.error('Error fetching connection types:', error);
        }
      }
    };
    fetchConnectionTypes();
  }, [connectionSchema]);

  // Load specific connection schema based on type
  useEffect(() => {
    const loadSpecificSchema = async () => {
      if (selectedType) {
        try {
          let schema;
          switch (selectedType.toLowerCase()) {
            case 'postgres':
              schema = await import('../components/BuildPipeLineComps/json/postgres.json');
              break;
            case 'bigquery':
              schema = await import('../components/BuildPipeLineComps/json/bigquery.json');
              break;
            case 'snowflake':
              schema = await import('../components/BuildPipeLineComps/json/snowflake.json');
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

  // Add new useEffect for fetching connection data when in edit mode
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

          if (response && response?.length > 0) {
            const connectionData = response[0];
            
            // Get connection type from custom_metadata
            const connectionType = connectionData.custom_metadata?.type || 
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
              type: connectionType, // Use the same connectionType here
              ...configData
            };
            
            console.log('Setting initial connection data:', initialData);
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

  const generateValidationSchema = () => {
    const schema: any = {};
    
    // Add base connection validation
    schema.connection_name = Yup.string().required('Connection name is required');
    schema.type = Yup.string().required('Connection type is required');

    // Add specific schema validation
    if (specificSchema?.connectionSpecification?.properties) {
        const properties = specificSchema.connectionSpecification.properties;
        const required = specificSchema.connectionSpecification.required || [];

        Object.entries(properties).forEach(([fieldName, fieldConfig]: [string, any]) => {
            let fieldSchema;
            
            if (fieldConfig.type === 'integer') {
                fieldSchema = Yup.number()
                    .integer()
                    .min(fieldConfig.minimum || -Infinity)
                    .max(fieldConfig.maximum || Infinity);
            } else {
                fieldSchema = Yup.string();
            }

            if (required.includes(fieldName)) {
                fieldSchema = fieldSchema.required(`${fieldConfig.title} is required`);
            }

            schema[fieldName] = fieldSchema;
        });
    }

    return Yup.object().shape(schema);
  };

  const generateInitialValues = () => {
    if (isEditMode && initialConnectionData) {
      console.log('Initial Connection Data:', initialConnectionData);
      return initialConnectionData;
    }

    const baseValues: any = {
      connection_name: '',
      type: selectedType || ''
    };

    if (specificSchema?.connectionSpecification?.properties) {
      Object.entries(specificSchema.connectionSpecification.properties).forEach(([key, value]: [string, any]) => {
        if (value.oneOf) {
          const allProperties: any = {};
          value.oneOf.forEach((option: any) => {
            if (option.properties) {
              Object.keys(option.properties).forEach(propKey => {
                allProperties[propKey] = '';
              });
            }
          });
          baseValues[key] = {
            mode: '',
            ...allProperties
          };
        } else if (value.type === 'array') {
          baseValues[key] = value.default || [];
        } else {
          baseValues[key] = value.default || '';
        }
      });
    }

    return baseValues;
  };

  const renderField = (fieldName: string, fieldConfig: any) => {
    // Add safety check for fieldConfig
    if (!fieldConfig) return null;
    
    const isRequired = specificSchema?.connectionSpecification?.required?.includes(fieldName);

    // Handle oneOf fields with proper type checking
    if (fieldConfig.oneOf && Array.isArray(fieldConfig.oneOf)) {
      return renderOneOfField(fieldName, fieldConfig);
    }

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
        <Field name={fieldName}>
          {({ field }) => renderFieldInput(field, fieldConfig)}
        </Field>
      </div>
    );
  };

  const renderFieldInput = (field: any, fieldConfig: any) => {
    // Handle array type fields
    if (fieldConfig.type === 'array') {
      return (
        <Field name={field.name}>
          {({ field: arrayField, form }) => {
            const values = arrayField.value || [];
            
            return (
              <div className="space-y-2">
                {values.map((value: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={value}
                      onChange={(e) => {
                        const newValues = [...values];
                        newValues[index] = e.target.value;
                        form.setFieldValue(arrayField.name, newValues);
                      }}
                      placeholder={`Enter ${fieldConfig.items?.type || 'value'}`}
                    />
                    <button
                      type="button"
                      className="p-2 hover:bg-destructive/90 hover:text-destructive-foreground rounded-md"
                      onClick={() => {
                        const newValues = values.filter((_: any, i: number) => i !== index);
                        form.setFieldValue(arrayField.name, newValues);
                      }}
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
                  onClick={() => {
                    form.setFieldValue(arrayField.name, [...values, '']);
                  }}
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
              </div>
            );
          }}
        </Field>
      );
    }

    // Existing field type handling
    if (fieldConfig.type === 'string' && !fieldConfig.enum) {
      return (
        <Input
          {...field}
          type={fieldConfig.bh_secret ? 'password' : 'text'}
          placeholder={fieldConfig.description}
          className={fieldConfig.multiline ? 'min-h-[100px]' : ''}
          {...(fieldConfig.multiline ? { component: 'textarea' } : {})}
        />
      );
    }

    if (fieldConfig.type === 'integer') {
      return (
        <Input
          {...field}
          type="number"
          min={fieldConfig.minimum}
          max={fieldConfig.maximum}
          placeholder={fieldConfig.description}
        />
      );
    }

    if (fieldConfig.enum) {
      return (
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${fieldConfig.title}`} />
          </SelectTrigger>
          <SelectContent>
            {fieldConfig.enum.map((option: string) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return null;
  };

  const renderOneOfField = (fieldName: string, fieldConfig: any) => {
    if (!fieldConfig?.oneOf || !Array.isArray(fieldConfig.oneOf)) return null;

    return (
      <Field name={`${fieldName}.mode`}>
        {({ field, form }) => (
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
              <RadioGroup
                value={field.value}
                onValueChange={(value) => {
                  form.setFieldValue(`${fieldName}.mode`, value);
                }}
                className="space-y-4"
              >
                {fieldConfig.oneOf.map((option: any, index: number) => {
                  const modeValue = option.properties?.mode?.const || `option_${index}`;
                  const optionTitle = option.title || `Option ${index + 1}`;
                  
                  return (
                    <div key={modeValue} className="flex items-center space-x-2">
                      <RadioGroupItem value={modeValue} id={`${fieldName}-${modeValue}`} />
                      <Label htmlFor={`${fieldName}-${modeValue}`} className="font-normal">
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
              </RadioGroup>

              <div className="space-y-4">
                {fieldConfig.oneOf.map((option: any, index: number) => {
                  const modeValue = option.properties?.mode?.const || `option_${index}`;
                  
                  if (field.value === modeValue && option.properties) {
                    const propertyEntries = Object.entries(option.properties)
                      .filter(([propName]) => propName !== 'mode');
                    
                    return (
                      <div key={`fields-${modeValue}`} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {propertyEntries.map(([propName, propConfig]: [string, any], idx: number) => {
                            if (!propConfig) return null;
                            
                            const isRequired = option.required?.includes(propName);
                            const fullFieldName = `${fieldName}.${propName}`;
                            const fieldTitle = propConfig.title || propName;
                            
                            return (
                              <div key={fullFieldName} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Label>
                                    {isRequired ? (
                                      <RequiredLabel>{fieldTitle}</RequiredLabel>
                                    ) : (
                                      fieldTitle
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
                                <Field name={fullFieldName}>
                                  {({ field: innerField }) => renderFieldInput(innerField, propConfig)}
                                </Field>
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
          </div>
        )}
      </Field>
    );
  };

  const handleSubmit = async (values: any) => {
    console.log('Form Values:', values);
    let connectionData = {};

    // Format connection data based on connection type
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
    }

    // Encrypt the connection data
    const { encryptedString, initVector } = encrypt_string(JSON.stringify(connectionData));

    try {
      const connectionTypeMatch = connectionTypes.find(type => 
        type.connection_display_name === values.type
      );

      if (!connectionTypeMatch) {
        throw new Error('Connection type not found');
      }

      const transformedData = {
        connection_config_name: values.connection_name,
        connection_name: connectionTypeMatch.connection_display_name.toLowerCase(),
        connection_description: "", // Added this field
        custom_metadata: {
          connection_name: values.connection_name,
          type: values.type,
          ...connectionData
        },
        connection_type: "source",
        connection_status: "active",
        data_residency: "auto",
        config: encryptedString,
        init_vector: initVector,
        connection_id: connectionTypeMatch.id
      };

      if (isEditMode && id) {
        // Updated PUT request
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

      <Formik
        initialValues={generateInitialValues()}
        validationSchema={generateValidationSchema()}
        enableReinitialize={true}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form className="space-y-8">
            {/* Base Connection Fields */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <RequiredLabel>
                    <Label className="text-sm font-medium">Connection Name</Label>
                  </RequiredLabel>
                  <Field
                    name="connection_name"
                    as={Input}
                    className="transition-all hover:border-primary/50 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <RequiredLabel>
                    <Label className="text-sm font-medium">Connection Type</Label>
                  </RequiredLabel>
                  <Select
                    onValueChange={(value) => {
                      setFieldValue('type', value);
                      setSelectedType(value);
                    }}
                    value={values.type || selectedType}
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
                </div>
              </div>
            </div>

            {/* Specific Connection Fields */}
            {Object.keys(groupedFields).length > 0 && (
              <div className="rounded-lg border bg-card shadow-sm">
                {Object.keys(groupedFields).length > 1 ? (
                  <Tabs defaultValue={Object.keys(groupedFields)[0]} className="p-6">
                    <TabsList className="mb-6 bg-muted/50 p-1">
                      {Object.entries(groupedFields).map(([groupId, group]: [string, any]) => (
                        <TabsTrigger 
                          key={groupId} 
                          value={groupId}
                          className="transition-all data-[state=active]:bg-background data-[state=active]:text-primary"
                        >
                          {group.title}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {Object.entries(groupedFields).map(([groupId, group]: [string, any]) => (
                      <TabsContent key={groupId} value={groupId}>
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(group.fields).map(([fieldName, fieldConfig]: [string, any]) => 
                              // Render Update Method in a separate row
                              fieldName === 'replication_method' ? null :
                              renderField(fieldName, fieldConfig)
                            )}
                          </div>
                          
                          {/* Render Update Method in full width if it exists */}
                          {group.fields.replication_method && (
                            <div className="col-span-2">
                              {renderField('replication_method', group.fields.replication_method)}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <div className="p-6 space-y-6">
                    <h2 className="text-xl font-semibold mb-4">
                      {groupedFields[Object.keys(groupedFields)[0]].title}
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                      {Object.entries(groupedFields[Object.keys(groupedFields)[0]].fields).map(
                        ([fieldName, fieldConfig]: [string, any]) => 
                          // Render Update Method in a separate row
                          fieldName === 'replication_method' ? null :
                          renderField(fieldName, fieldConfig)
                      )}
                    </div>
                    
                    {/* Render Update Method in full width if it exists */}
                    {groupedFields[Object.keys(groupedFields)[0]].fields.replication_method && (
                      <div className="col-span-2">
                        {renderField('replication_method', groupedFields[Object.keys(groupedFields)[0]].fields.replication_method)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Add Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 rounded-md bg-black text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {isEditMode ? 'Update Connection' : 'Create Connection'}
              </button>
            </div>

            {/* Add this right before the submit button to debug */}
            {/* <pre className="text-sm">
              {JSON.stringify(values, null, 2)}
            </pre> */}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ConnectionCreate;
