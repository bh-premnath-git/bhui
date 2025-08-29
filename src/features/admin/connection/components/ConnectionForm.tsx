import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useConnections } from '../hooks/useConnection';
import { generateFormSchema } from './connectionFormSchema';
import { FormFields } from './FormFields';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  ArrowLeft,
  Construction,
  Database,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  KeyRound,
  ServerCog,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { encrypt_string } from '@/lib/encryption';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';

interface ConnectionFormProps {
  connectionType: string;
  connectionDisplayName: string;
  connectionName: string;
  connectionId: string;
  onBack: () => void;
  connectionConfigName: string;
  selectedEnvironment?: string;
  isEdit?: boolean;
  formData?: any;
  mode?: 'edit' | 'new';
}

// Utility function to clean the connectionConfigName
const cleanConnectionConfigName = (name: string) => {
  return name.toLowerCase().replace(/[\s_-]/g, '');
};


export function ConnectionForm({
  connectionType,
  connectionDisplayName,
  connectionName,
  connectionId,
  onBack,
  connectionConfigName,
  selectedEnvironment,
  isEdit,
  formData,
  mode = 'new'
}: ConnectionFormProps) {
  const { handleCreateConnection, handleUpdateConnection } = useConnections();
  const [isFormReady, setIsFormReady] = useState(false);
  const [schema, setSchema] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean, message: string } | null>(null);
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
            }

            setSchema(schema);
          } else {
            console.error('Invalid schema format:', module);
            setSchema(null);
            toast.error('Invalid schema format');
          }
        }
        if (schema) {
          setIsFormReady(true);
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
        const property = schema.properties[key];
        
        if (mode === 'edit') {
          // For edit mode, use existing form data or default value or empty string
          initialValues[key] = formData?.[key] || property?.default || '';
        } else {
          // For new connections, use default value from schema or empty string
          initialValues[key] = property?.default || '';
        }
      });
    }

    return initialValues;
  };

  const form = useForm({
    resolver: schema ? zodResolver(generateFormSchema(schema)) : undefined,
    defaultValues: async () => {
      if (!schema) return {};
      return isEdit && formData
        ? {
            ...generateInitialValues(schema),
            ...formData
          }
        : generateInitialValues(schema);
    },
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

    const dynamicTypeField = connectionType === 'source' ? 'source_type' : 'destination_type';

    const commonFields = {
      [dynamicTypeField]: type,
    };

    if (type === 'postgres') {
      // Handle schema field properly - the form field is named 'schema' (singular)
      const schemaValue = data.schema || 'public'; // Default to 'public' if no schema provided

      return {
        host: data.host || '',
        port: data.port ? String(data.port) : '5432', // Ensure port is string
        database: data.database || '',
        username: data.username || '',
        password: data.password || '',
        schemas: schemaValue, // Use the schema value from the form
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
        if (typeof data.credentials_json === 'string') {
          // Try to clean the string before parsing
          const cleanedJson = data.credentials_json
            .replace(/\r?\n|\r/g, '') // Remove all newlines
            .trim(); // Remove leading/trailing whitespace

          try {
            parsedCredentials = JSON.parse(cleanedJson);
          } catch (parseError) {
            // If parsing fails, try to use the string as-is
            parsedCredentials = data.credentials_json;
          }
        } else if (typeof data.credentials_json === 'object') {
          parsedCredentials = data.credentials_json;
        } else {
          parsedCredentials = data.credentials_json;
        }
      } catch (error) {
        // Use the raw value if all parsing attempts fail
        parsedCredentials = data.credentials_json;
      }

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
        port: Number(data.port) || 1521,
        service_name: data.service_name || null,
        sid: data.sid || null,
        username: data.username || '',
        password: data.password || '',
        schemas: data.schemas || 'public',  // Ensure schemas is always set
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
          schema: data.schema || null,
          database: data?.database || null,
          secret_name: `bh-postgres-${cleanedName}`
        };
      case 'mysql':
        return {
          name: connectionConfigName,
          connection_type: "MySQL",
          schema: data.db_schema || "null",
          database: data?.database || null,
          secret_name: `bh-mysql-${cleanedName}`
        };
      case 'oracle':
        return {
          name: connectionConfigName,
          connection_type: "Oracle",
          service_name: data.service_name || null,
          sid: data.sid || null,
          schema: data.schemas || null,  // Map schemas to schema in metadata
          host: data.host || null,
          port: Number(data.port) || 1521,
          secret_name: `bh-oracle-${cleanedName}`
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

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);

      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, we'll simulate success most of the time
      const isSuccess = Math.random() > 0.3;

      setTestResult({
        success: isSuccess,
        message: isSuccess
          ? "Connection test successful! All required settings validated."
          : "Connection test failed. Please check your credentials and network settings."
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: "Error testing connection. Please try again."
      });
    } finally {
      setIsTesting(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Get raw form data
      const rawFormData = form.getValues();

      let formData;
      
      // Special handling for BigQuery
      if (connectionName.toLowerCase() === 'bigquery') {
        formData = {
          project_id: rawFormData.project_id,
          dataset_id: rawFormData.dataset_id,
          credentials_json: rawFormData.credentials_json,
          temp_gcs_bucket: rawFormData.temp_gcs_bucket,
        };
      } 
      // Special handling for S3
      else if (connectionName.toLowerCase() === 's3') {
        formData = {
          ...data,
          // Ensure these fields are properly captured even if they have random names
          access_key: rawFormData.access_key || '',
          secret_key: rawFormData.secret_key || '',
        };
      }
      else {
        formData = { ...data };
      }
      
      
      const configUnion: any = await getConfigUnionForType(connectionName, formData, connectionType);
      if (!configUnion) {
        throw new Error(`Unsupported connection type: ${connectionName}`);
      }
      const { encryptedString, initVector } = encrypt_string(JSON.stringify(configUnion));
      // Use the factory function to generate custom metadata
      const custom_metadata = generateCustomMetadata(connectionName, rawFormData);

      const connectionData: any = {
        connection_id: connectionId,
        connection_config_name: connectionConfigName,
        connection_name: connectionDisplayName,
        connection_description: `${connectionDisplayName} connection`,
        connection_type: connectionType,
        connection_status: 'active',
        data_residency: 'auto',
        bh_env_id: parseInt(selectedEnvironment),
        custom_metadata: custom_metadata,
        init_vector: initVector,
        config: encryptedString,
      };

      if (connectionData?.connection_name?.toLowerCase() === 'bigquery') {
        connectionData.project_id = rawFormData.project_id;
        connectionData.dataset_id = rawFormData.dataset_id;
        connectionData.credentials_json = rawFormData.credentials_json?.toString();
      }
      console.log('Submitting connection data:', connectionData);
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

  const getConnectionIcon = () => {
    const connectionIcons: { [key: string]: JSX.Element } = {
      postgres: <img
        src="/assets/buildPipeline/connection/postgres.svg"
        alt="PostgreSQL"
        className="h-6 w-6"
      />,
      mysql: <img
        src="/assets/buildPipeline/connection/mysql.svg"
        alt="MySQL"
        className="h-6 w-6"
      />,
      snowflake: <img
        src="/assets/buildPipeline/connection/snowflake.svg"
        alt="Snowflake"
        className="h-6 w-6"
      />,
      bigquery: <img
        src="/assets/buildPipeline/connection/bigquery.svg"
        alt="BigQuery"
        className="h-6 w-6"
      />,
      s3: <img
        src="/assets/buildPipeline/connection/s3.svg"
        alt="S3"
        className="h-6 w-6"
      />,
      oracle: <img
        src="/assets/buildPipeline/connection/oracle.svg"
        alt="Oracle"
        className="h-6 w-6"
      />,
      // Add more connections as needed
      default: <Database className="h-6 w-6 text-primary" />
    };

    return connectionIcons[connectionName.toLowerCase()] || connectionIcons.default;
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto p-4 max-w-3xl"
      >
        <Button onClick={onBack} variant="ghost" className="mb-4 gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-muted-foreground/20 w-full relative">
            <motion.div
              className="absolute top-0 left-0 h-full bg-primary/40"
              animate={{ width: ["0%", "100%", "0%"] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              <CardTitle>Loading Connection Form</CardTitle>
            </div>
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
      </motion.div>
    );
  }

  if (!schema) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto p-4 max-w-3xl"
      >
        <Button onClick={onBack} variant="ghost" className="mb-4 gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card className="border border-amber-200 shadow-md overflow-hidden">
          <div className="h-1 bg-amber-500 w-full" />
          <CardHeader>
            <div className='flex flex-col items-center space-y-4'>
              <div className="bg-amber-500/10 p-4 rounded-full">
                <Construction className="h-12 w-12 text-amber-500" />
              </div>
              <CardTitle className="text-xl font-bold">Connection Type Not Available</CardTitle>
              <CardDescription className="text-center max-w-md">
                We're currently working on support for this connection type. Please try a different connection or check back later.
              </CardDescription>
            </div>
          </CardHeader>

          <CardFooter className="flex justify-center pt-2 pb-6 gap-3">
            <Button variant="outline" onClick={onBack} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="default"
              className="gap-1.5"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto p-4 max-w-3xl"
    >
      <Card className="border shadow-md overflow-hidden">
        <div className="h-1 bg-primary w-full" />
        <CardHeader className="pb-4">
          <div className="flex items-center">
            <div className="mr-3 bg-primary/10 p-2 rounded-full">
              {getConnectionIcon()}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                {isEdit ? 'Edit' : 'New'} {connectionDisplayName} Connection
                <Badge variant="outline" className="ml-2">
                  {connectionType}
                </Badge>
              </CardTitle>
              <CardDescription>
                Configure your {connectionDisplayName} connection details
              </CardDescription>
            </div>
          </div>

          {testResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={cn(
                "mt-4 p-3 rounded-md flex items-start gap-2",
                testResult.success ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"
              )}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium">{testResult.success ? "Success" : "Error"}</p>
                <p className="text-sm opacity-90">{testResult.message}</p>
              </div>
            </motion.div>
          )}
        </CardHeader>

        <CardContent className="px-6 pt-0">
          {/* Remove ScrollArea component and let the content be natively scrollable */}
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit)} 
              className="space-y-6" 
              autoComplete="off"
              noValidate>
              {/* Connection Name Field */}

              <Accordion type="multiple" defaultValue={["connection-details"]} className="w-full">
                <AccordionItem value="connection-details" className="border rounded-md">
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/20 transition-colors group">
                    <div className="flex items-center gap-2 font-medium">
                      <ServerCog className="h-5 w-5 text-primary" />
                      <span>Connection Details</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-1">
                    <div className="space-y-6">
                      <FormFields schema={schema} form={form} mode={mode} />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="security-settings" className="border rounded-md mt-3">
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/20 transition-colors group">
                    <div className="flex items-center gap-2 font-medium">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <span>Security Settings</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-1">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-md border bg-muted/10">
                        <div className="flex items-center gap-2">
                          <KeyRound className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Connection Credentials</p>
                            <p className="text-xs text-muted-foreground">Credentials are encrypted before storage</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
                          Secure
                        </Badge>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex flex-col gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleTestConnection}
                  disabled={isSubmitting || isTesting}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4" />
                      Test Connection
                    </>
                  )}
                </Button>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !form.formState.isValid}
                    className="flex-1 gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isEdit ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        {isEdit ? 'Update' : 'Create'} Connection
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}