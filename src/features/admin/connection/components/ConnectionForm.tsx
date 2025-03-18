import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useConnections } from '../hooks/useConnection';
import { generateFormSchema } from './connectionFormSchema';
import { FormFields } from './FormFields';
import { useState, useEffect } from 'react';
import { ConnectionValue } from '@/types/admin/connection';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Database, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { encrypt_string } from '@/lib/encryption';
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
}

export function ConnectionForm({ 
  connectionType, 
  connectionDisplayName,
  connectionName,
  connectionId,
  onBack,
  connectionConfigName
}: ConnectionFormProps) {
  const { handleCreateConnection } = useConnections();
  const [schema, setSchema] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadSchema = async () => {
      setIsLoading(true);
      try {
        // Special handling for local connection type
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
            setSchema(module.default.connectionSpecification);
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

  const form = useForm({
    resolver: schema ? zodResolver(generateFormSchema(schema)) : undefined,
    defaultValues: {
      name: `${connectionDisplayName} Connection`,
      project_id: '',
      dataset_id: '',
      credentials_json: '',
      host: '',
      port: connectionName.toLowerCase() === 'mysql' ? 3306 : 5432,
      database: '',
      username: '',
      password: '',
    }
  });

  // Reset form when schema changes
  useEffect(() => {
    if (schema) {
      form.reset({
        name: `${connectionDisplayName} Connection`,
        project_id: '',
        dataset_id: '',
        credentials_json: '',
        host: '',
        port: connectionName.toLowerCase() === 'mysql' ? 3306 : 5432,
        database: '',
        username: '',
        password: '',
      });
    }
  }, [schema, connectionDisplayName, connectionName, form]);

  const getConfigUnionForType = (connectionName: string, data: any) => {
    const type = connectionName.toLowerCase();
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
        source_type: type
      };
    }
    
    if (type === 'bigquery') {
      return {
        project_id: data.project_id || '',
        dataset_id: data.dataset_id || '',
        credentials_json: data.credentials_json || '',
        source_type: type
      };
    }
    
    if (type === 'postgres' || type === 'mysql') {
      return {
        host: data.host || '',
        port: data.port || (type === 'mysql' ? 3306 : 5432),
        database: data.database || '',
        username: data.username || '',
        password: data.password || '',
        db_schema: data.db_schema || '',
        source_type: type
      };
    }
    
    if (type === 'oracle') {
      return {
        host: data.host || '',
        port: data.port || '1521',
        service_name: data.service_name || '',
        sid: data.sid || '',
        username: data.username || '',
        password: data.password || '',
        db_schema: data.db_schema || 'None',
        source_type: type
      };
    }
    
    if (type === 'local') {
      return {
        file_path_prefix: data.file_path_prefix || '',
        source_type: type
      };
    }
    
    return null;
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Ensure port is a number
      const formData = {
        ...data,
        port: typeof data.port === 'string' ? parseInt(data.port, 10) : data.port
      };
      
      const configUnion = getConfigUnionForType(connectionName, formData);
      if (!configUnion) {
        throw new Error(`Unsupported connection type: ${connectionName}`);
      }

      const { encryptedString, initVector } = encrypt_string(JSON.stringify(configUnion));

      const connectionData: ConnectionValue = {
        connection_type: connectionType,
        connection_config_name: connectionConfigName,
        connection_name: data.name || `${connectionDisplayName}`,
        connection_id: connectionId,
        connection_status: 'active',
        data_residency: 'auto',
        custom_metadata: {},
        init_vector: initVector,
        config: encryptedString
      };

      await handleCreateConnection(connectionData);
      toast.success('Connection created successfully');
      navigate(ROUTES.ADMIN.CONNECTION.INDEX);
    } catch (error) {
      console.error('Failed to create connection:', error);
      toast.error('Failed to create connection');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <CardTitle className="text-destructive">Error Loading Form Schema</CardTitle>
            <CardDescription>We couldn't load the configuration for this connection type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Unable to load the connection form schema for {connectionDisplayName}. Please try again later.</p>
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

  // Debug schema
  console.log('Current schema:', schema);

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
            <CardTitle>Create {connectionDisplayName} Connection</CardTitle>
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
                  {isSubmitting ? 'Creating...' : 'Create Connection'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}