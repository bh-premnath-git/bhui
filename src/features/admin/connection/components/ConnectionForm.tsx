import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useConnections } from '../hooks/useConnection';
import { generateFormSchema } from './connectionFormSchema';
import { FormFields } from './FormFields';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Construction, Database, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { decrypt_string, encrypt_string } from '@/lib/encryption';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

interface ConnectionFormProps {
  connectionType: string;
  connectionDisplayName: string;
  connectionName: string;
  connectionId: string;
  onBack: () => void;
  connectionConfigName: string;
  isEdit?: boolean;
  formData?: any;
  onSubmit?: (formData: any) => Promise<void>;
}

// Utility function to clean the connectionConfigName
const cleanConnectionConfigName = (name: string) => {
  return name.replace(/[_-]/g, '');
};

export function ConnectionForm({ 
  connectionType, 
  connectionDisplayName,
  connectionName,
  connectionId,
  onBack,
  connectionConfigName,
  isEdit,
  formData
}: ConnectionFormProps) {
  const { handleCreateConnection, handleUpdateConnection } = useConnections();
  const [schema, setSchema] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadSchema = async () => {
      setIsLoading(true);
      try {
        if (connectionName.toLowerCase() === 'local') {
          const localSchema = {
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
          setSchema(localSchema.connectionSpecification);
        } else {
          // Load schema from file for other connection types
          const module = await import(
            `@/components/bh-reactflow-comps/builddata/json/${connectionName.toLowerCase()}.json`
          );
          if (module?.default?.connectionSpecification) {
            let schema = module.default.connectionSpecification;
            
            // Modify the schema for BigQuery to use textarea
            if (connectionName.toLowerCase() === 'bigquery' && schema.properties.credentials_json) {
              schema = {
                ...schema,
                properties: {
                  ...schema.properties,
                  credentials_json: {
                    ...schema.properties.credentials_json,
                    type: "string",
                    format: "textarea",
                    title: "Credentials JSON",
                    description: "Your BigQuery credentials in JSON format"
                  }
                }
              };
              console.log('Modified BigQuery schema:', schema);
            }
            
            setSchema(schema);
          } else {
            console.error('Invalid schema format:', module);
            setSchema(null);
            toast.error('Invalid schema format');
          }
        }
      } catch (error) {
        console.error('Failed to load schema:', error);
        setSchema(null);
        toast.error('Failed to load connection schema');
      } finally {
        setIsLoading(false);
      }
    };

    loadSchema();
  }, [connectionName]);

  // Add this function to generate initial values based on schema
  const generateInitialValues = (schema: any) => {
    const initialValues: Record<string, string> = {
      name: `${connectionDisplayName} Connection`
    };

    if (schema?.properties) {
      Object.keys(schema.properties).forEach(key => {
        initialValues[key] = '';
      });
    }

    return initialValues;
  };

  const form = useForm({
    resolver: schema ? zodResolver(generateFormSchema(schema)) : undefined,
    defaultValues: isEdit && formData 
      ? {
          ...generateInitialValues(schema),
          ...formData
        }
      : generateInitialValues(schema),
    mode: 'onChange'
  });

  // Update the useEffect to properly handle schema changes
  useEffect(() => {
    if (schema) {
      const initialValues = isEdit && formData 
        ? {
            ...generateInitialValues(schema),
            ...formData
          }
        : generateInitialValues(schema);
      
      form.reset(initialValues);
    }
  }, [schema, connectionDisplayName, isEdit, formData]);

  const getConfigUnionForType = (connectionName: string, data: any, connectionType: string) => {
    const type = connectionName.toLowerCase();
    console.log("Form data received in getConfigUnionForType:", data);
  
    const dynamicTypeField = connectionType === 'source' ? 'source_type' : 'destination_type';
  
    const commonFields = {
      [dynamicTypeField]: type,
    };

    if (type === 'postgres') {
      // Handle schemas array properly
      const schemasArray = Array.isArray(data.schemas) 
        ? data.schemas 
        : data.schemas 
          ? [data.schemas] 
          : ['public']; // Default to ['public'] if no schemas provided

      return {
        host: data.host || '',
        port: data.port ? String(data.port) : '5432', // Ensure port is string
        database: data.database || '',
        username: data.username || '',
        password: data.password || '',
        schemas: schemasArray[0],
        // Add SSL mode if present
        ...(data.ssl_mode && { ssl_mode: data.ssl_mode }),
        // Add JDBC params if present
        ...(data.jdbc_url_params && { jdbc_url_params: data.jdbc_url_params }),
        // Add replication method if present
        ...(data.replication_method && { replication_method: data.replication_method }),
        ...commonFields,
      };
    }
  
    if (type === 'snowflake') {
      return {
        host: data.host || '',
        role: data.role || '',
        warehouse: data.warehouse || '',
        database: data.database || '',
        schema: data.schema || '',
        jdbc_url_params: data.jdbc_url_params || '',
        username: data.username || '',
        password: data.password || '',
        auth_type: data.auth_type || '',
        ...commonFields,
      };
    }
  
    if (type === 'bigquery') {
      let parsedCredentials;
      try {
        console.log('Raw credentials_json:', data.credentials_json);
        
        if (typeof data.credentials_json === 'string') {
          // Try to clean the string before parsing
          const cleanedJson = data.credentials_json
            .replace(/\r?\n|\r/g, '') // Remove all newlines
            .trim(); // Remove leading/trailing whitespace
          console.log('Cleaned credentials_json:', cleanedJson);
          
          try {
            parsedCredentials = JSON.parse(cleanedJson);
          } catch (parseError) {
            // If parsing fails, try to use the string as-is
            console.warn('Failed to parse cleaned JSON, using raw string:', parseError);
            parsedCredentials = data.credentials_json;
          }
        } else if (typeof data.credentials_json === 'object') {
          parsedCredentials = data.credentials_json;
        } else {
          console.warn('Unexpected credentials_json type:', typeof data.credentials_json);
          parsedCredentials = data.credentials_json;
        }
      } catch (error) {
        console.error('Error handling credentials_json:', error);
        // Use the raw value if all parsing attempts fail
        parsedCredentials = data.credentials_json;
      }

      // console.log('Final parsed credentials:', JSON.parse(parsedCredentials));
      console.log('Final parsed credentials:', typeof parsedCredentials);

      return {
        project_id: data.project_id,
        dataset_id: data.dataset_id,
        credentials_json: parsedCredentials,
        temp_gcs_bucket: data.temp_gcs_bucket,
        ...commonFields,
      };
    }
  
    if (type === 'mysql') {
      return {
        host: data.host || '',
        port: data.port || '',
        database: data.database || '',
        username: data.username || '',
        password: data.password || '',
        schemas: data.db_schema || '',
        ...commonFields,
      };
    }
  
    if (type === 'oracle') {
      return {
        host: data.host || '',
        port: data.port || '',
        database: data.database || 'None',
        service_name: data.service_name || '',
        sid: data.sid || '',
        username: data.username || '',
        password: data.password || '',
        db_schema: data.db_schema || 'None',
        ...commonFields,
      };
    }
  
    if (type === 'gcs') {
      return {
        bucket_name: data.bucket_name || '',
        credentials_json: data.credentials_json || '',
        ...commonFields,
      };
    }

    if (type === 's3') {
      return {
        bucket_name: data.bucket_name || '',
        access_key: data.access_key || '',
        secret_key: data.secret_key || '',
        region: data.region || '',
        role_arn: data.role_arn || '',
        file_path_prefix: data.file_path_prefix || '',
        ...commonFields,
      };
    }
  
    if (type === 'local') {
      return {
        file_path_prefix: data.file_path_prefix || '',
        ...commonFields,
      };
    }
  
    return null;
  };
  

  const generateCustomMetadata = (type: string, data: any) => {
    console.log(type, "type");
    console.log(data, "data");
    console.log(connectionConfigName, "data.file_path_prefix");

    // Clean the connectionConfigName
    const cleanedName = cleanConnectionConfigName(connectionConfigName || '');

    switch (type.toLowerCase()) {
      case 'local':
        return {
          name: connectionConfigName,
          connection_type: "Local",
          file_path_prefix: data.file_path_prefix || null
        };
      case 'postgres':
        return {
          name: connectionConfigName,
          connection_type: "PostgreSQL",
          schema: data.schemas || null,
          database: data?.database || null,
          secret_name: `bh-postgres-${cleanedName}`
        };
      case 'mysql':
        return {
          name: connectionConfigName,
          connection_type: "MySQL",
          schema: data.db_schema || null,
          database: data?.database || null,
          secret_name: `bh-mysql-${cleanedName}`
        };
      case 's3':
        return {
          name: connectionConfigName,
          connection_type: "S3",
          file_path_prefix: data.file_path_prefix || '',
          bucket: data?.bucket_name || null,
          secret_name: `bh-s3-${cleanedName}`
        };
      case 'bigquery':
        return {
          name: connectionConfigName,
          connection_type: "BigQuery",
          project_id: data.project_id || '',
          dataset_id: data?.dataset_id || null,
          temp_gcs_bucket: data?.temp_gcs_bucket || null,
          secret_name: `bh-bigquery-${cleanedName}`
        };
      default:
        throw new Error(`Unsupported connection type: ${type}`);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Get raw form data
      const rawFormData = form.getValues();
      console.log('Raw form values:', rawFormData);
      
      // Special handling for BigQuery
      const formData = connectionName.toLowerCase() === 'bigquery' 
        ? {
            project_id: rawFormData.project_id,
            dataset_id: rawFormData.dataset_id,
            credentials_json: rawFormData.credentials_json,
            temp_gcs_bucket: rawFormData.temp_gcs_bucket,
          }
        : { ...data };

      console.log('Form data before processing:', formData);
      
      const configUnion: any = await getConfigUnionForType(connectionName, formData, connectionType);
      console.log('Config before encryption:', configUnion);

      if (!configUnion) {
        throw new Error(`Unsupported connection type: ${connectionName}`);
      }

      const { encryptedString, initVector } = encrypt_string(JSON.stringify(configUnion));
      console.log(decrypt_string(encryptedString, initVector), "initVector");

      // Use the factory function to generate custom metadata
      const custom_metadata = generateCustomMetadata(connectionName, rawFormData);
      console.log(custom_metadata, "custom_metadata");

      const connectionData: any = {
        connection_id: connectionId,
        connection_config_name: connectionConfigName,
        connection_name: connectionDisplayName,
        connection_description: `${connectionDisplayName} connection`,
        connection_type: connectionType,
        connection_status: 'active',
        data_residency: 'auto',
        custom_metadata: custom_metadata,
        init_vector: initVector,
        config: encryptedString
      };

      if (connectionData?.connection_name?.toLowerCase() === 'bigquery') {
        connectionData.project_id = rawFormData.project_id;
        connectionData.dataset_id = rawFormData.dataset_id;
        connectionData.credentials_json = rawFormData.credentials_json?.toString();
      }

      console.log(connectionData, "connectionData");
      if (isEdit) {
        await handleUpdateConnection(connectionId, connectionData);
        toast.success('Connection updated successfully');
      } else {
        await handleCreateConnection(connectionData);
        toast.success('Connection created successfully');
      }
      navigate(ROUTES.ADMIN.CONNECTION.INDEX);
    } catch (error) {
      console.error(`Failed to ${isEdit ? 'update' : 'create'} connection:`, error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} connection`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this to debug form values
  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log('Form values changed:', value);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Loading Connection Form</CardTitle>
            <CardDescription>Please wait while we load the connection configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-8 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="border-destructive">
          <CardHeader>
            <div className='flex flex-col items-center space-y-4'>
              <Construction className="h-16 w-16" />
              <CardTitle className="text-destructive text-2xl font-bold">Under the Construction</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={onBack}>
                Go Back
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="default"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Button onClick={onBack} variant="ghost" className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Database className="mr-2 h-5 w-5 text-primary" />
            <CardTitle>{isEdit ? 'Update' : 'Create'} {connectionDisplayName} Connection</CardTitle>
          </div>
          <CardDescription>
            Configure your {connectionDisplayName} connection details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Connection Name Field */}
              <div className="mb-6">
                <FormFields 
                  schema={{
                    properties: {
                      name: {
                        type: "string",
                        title: "Connection Name",
                        description: "A unique name to identify this connection"
                      }
                    },
                    required: ["name"]
                  }} 
                  form={form} 
                />
              </div>
              
              <Separator className="my-6" />
              
              <h3 className="text-lg font-semibold mb-4">Connection Details</h3>
              
              {/* Connection Configuration Fields */}
              <FormFields schema={schema} form={form} />
              
              <div className="flex justify-end pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onBack}
                  className="mr-2"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Connection' : 'Create Connection')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}