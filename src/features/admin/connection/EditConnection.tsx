import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Loader2, 
  Database, 
  History, 
  RotateCw, 
} from 'lucide-react';

import { useConnectionType } from './hooks/useConnection';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ConnectionForm } from './components/ConnectionForm';
import { ConnectionPageLayout } from './components/ConnectionPageLayout';
import { apiService } from '@/lib/api/api-service';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { ROUTES } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { decrypt_string } from '@/lib/encryption';

/* -----------------------------------------------------------
   Helper: map API response -> form-friendly shape
----------------------------------------------------------- */
type ApiConnection = {
  id: string | number;
  connection_type: string;
  connection_name?: string;
  connection_config_name?: string;
  connection_description?: string;
  custom_metadata?: Record<string, any>;
  config?: string;
  init_vector?: string;
};

function mapApiToForm(resp: ApiConnection) {
  const meta = resp.custom_metadata ?? {};
  let decryptedConfig = {};
  
  // Decrypt the config if it exists
  if (resp.config && resp.init_vector) {
    try {
      decryptedConfig = JSON.parse(
        decrypt_string(resp.config, resp.init_vector)
      );
    } catch (error) {
      console.error('Failed to decrypt connection config:', error);
      // Continue with empty config if decryption fails
    }
  }

  return {
    id: resp.id,
    connection_type: resp.connection_type,
    connection_name: resp.connection_name?.toLowerCase() ?? '',
    connection_display_name: resp.connection_config_name ?? '',
    connection_description: resp.connection_description ?? '',
    file_path_prefix: meta.file_path_prefix,
    ...meta,
    ...decryptedConfig, // Spread decrypted config values
  };
}

export function EditConnection() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { connectionTypes, isLoading: isTypesLoading } = useConnectionType();

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['connection_config', id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) throw new Error('Invalid connection ID');
      const resp = await apiService.get<ApiConnection>({
        url: `/connection_registry/connection_config/${id}`,
        method: 'GET',
        baseUrl: CATALOG_REMOTE_API_URL,
        usePrefix: true,
      });
      if (!resp || !resp.connection_type) {
        throw new Error('Failed to load connection details. Invalid data structure.');
      }
      return resp as ApiConnection;
    },
    // If you want to always show a spinner on refetch in foreground:
    // refetchOnWindowFocus: false,
  });

  const selectedType = useMemo(() => (data ? mapApiToForm(data) : null), [data]);

  const connectionConfigName = selectedType?.connection_display_name ?? '';

  const connectionTypeInfo = useMemo(
    () =>
      connectionTypes?.find(
        (t) =>
          t.connection_name?.toLowerCase() ===
          selectedType?.connection_name?.toLowerCase()
      ),
    [connectionTypes, selectedType]
  );

  const lastRefreshed = useMemo(
    () => (dataUpdatedAt ? new Date(dataUpdatedAt) : new Date()),
    [dataUpdatedAt]
  );

  const handleBack = () => navigate(ROUTES.ADMIN.CONNECTION.INDEX);

  const refreshConnectionData = async () => {
    await refetch();
  };

  const connectionIcon = connectionTypeInfo ? (
    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
      <Database className="h-5 w-5 text-primary" />
    </div>
  ) : null;

  // Loading
  if (isLoading || isTypesLoading) {
    return (
      <ConnectionPageLayout description="Loading connection details...">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-64"
        >
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading connection configuration...</p>
        </motion.div>
      </ConnectionPageLayout>
    );
  }

  // Error
  if (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load connection. Please try again.';
    return (
      <ConnectionPageLayout description="There was an error loading the connection details.">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-destructive/30 shadow-md overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-destructive" />
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle>Error Loading Connection</CardTitle>
              </div>
              <CardDescription className="mt-2 text-destructive/90">
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent className="border-t border-muted/30 pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                This could be due to network issues or the connection might no longer exist.
                You can try refreshing or return to the connections list.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-muted/30 pt-4">
              <Button variant="outline" onClick={handleBack} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Back to Connections
              </Button>
              <Button onClick={refreshConnectionData} variant="default" className="gap-1.5">
                <RotateCw className="h-4 w-4" />
                Retry
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </ConnectionPageLayout>
    );
  }

  // Not found / invalid (should be caught by error branch above, but keep UX)
  if (!selectedType) {
    return (
      <ConnectionPageLayout description="Connection not found or invalid ID.">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border shadow-md overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <CardTitle>Connection Not Found</CardTitle>
              </div>
              <CardDescription className="mt-1">
                The requested connection could not be found or may have been deleted.
              </CardDescription>
            </CardHeader>
            <CardContent className="border-t border-muted/30 pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                You can return to the connections list to view available connections.
              </p>
            </CardContent>
            <CardFooter className="justify-start border-t border-muted/30 pt-4">
              <Button variant="outline" onClick={handleBack} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Back to Connections
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </ConnectionPageLayout>
    );
  }

  return (
    <ConnectionPageLayout description="Edit your database connection here.">
      <div className="mb-6">
        <div className="flex flex-col space-y-1 mb-6">
          <div className="flex items-center">
            {connectionIcon}
            <h2 className="text-2xl font-semibold tracking-tight">{connectionConfigName}</h2>
          </div>
          {connectionTypeInfo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pl-[52px]">
              <span className="capitalize">{selectedType?.connection_name} connection</span>
              <span className="bg-muted text-xs px-1.5 py-0.5 rounded-md">
                {selectedType?.connection_type}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex w-1 h-1 rounded-full bg-green-500" />
                <span className="text-xs">Active</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-muted/30 border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Connection Details</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <History className="h-3 w-3" />
              Last refreshed {lastRefreshed.toLocaleTimeString()}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs gap-1"
                onClick={refreshConnectionData}
                disabled={isFetching}
                aria-label="Refresh connection details"
              >
                <RotateCw className={cn('h-3 w-3', isFetching && 'animate-spin')} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <ConnectionForm
          connectionId={String(selectedType?.id ?? '')}
          connectionType={selectedType?.connection_type ?? ''}
          connectionDisplayName={selectedType?.connection_display_name ?? ''}
          connectionName={selectedType?.connection_name ?? ''}
          onBack={handleBack}
          connectionConfigName={connectionConfigName}
          formData={selectedType}
          isEdit
          mode="edit"
        />
      </motion.div>
    </ConnectionPageLayout>
  );
}
