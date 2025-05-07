import { useEffect, useState } from 'react';
import { useConnectionType } from './hooks/useConnection';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ConnectionForm } from './components/ConnectionForm';
import { ConnectionPageLayout } from './components/ConnectionPageLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '@/lib/api/api-service';
import { toast } from 'sonner';
import { CATALOG_API_PORT } from '@/config/platformenv';
import { ROUTES } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export function EditConnection() {
  const { id } = useParams();
  const navigate = useNavigate();
  console.log("Connection ID from URL:", id);
  
  const { connectionTypes, isLoading: isTypesLoading } = useConnectionType();
  const [selectedType, setSelectedType] = useState<any | null>(null);
  const [connectionConfigName, setConnectionConfigName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Go back to connection list
  const handleBack = () => {
    navigate(ROUTES.ADMIN.CONNECTION.INDEX);
  };

  useEffect(() => {
    const fetchConnectionData = async () => {
      if (!id) {
        setError("Invalid connection ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response: any = await apiService.get({
          url: `/connection_registry/connection_config/${id}`,
          method: 'GET',
          portNumber: CATALOG_API_PORT,
          usePrefix: true
        });
        
        console.log("Connection data response:", response);

        if (!response || !response.connection_type) {
          console.error("Invalid connection data:", response);
          setError("Failed to load connection details. Invalid data structure.");
          setIsLoading(false);
          return;
        }

        setSelectedType({
          id: response.id,
          connection_type: response.connection_type,
          connection_name: response.connection_name?.toLowerCase(),
          connection_display_name: response.connection_config_name,
          connection_description: response.connection_description,
          file_path_prefix: response.custom_metadata?.file_path_prefix,
          // Include other necessary fields from the response
          ...response.custom_metadata,
        });

        // Set the connection config name
        setConnectionConfigName(response.connection_config_name || "");
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching connection data:", error);
        setError("Failed to load connection. Please try again.");
        setIsLoading(false);
      }
    };

    fetchConnectionData();
  }, [id, navigate]);

  // TODO: Get the existing connection details from URL params or props
  // const { connectionId } = useParams(); // If using react-router
  // const { connection } = useExistingConnection(connectionId); // Create this hook to fetch connection details

  // Display loading state
  if (isLoading || isTypesLoading) {
    return (
      <ConnectionPageLayout description='Loading connection details...'>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </ConnectionPageLayout>
    );
  }

  // Display error state
  if (error) {
    return (
      <ConnectionPageLayout description='There was an error loading the connection details.'>
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <CardTitle className="text-destructive">Error Loading Connection</CardTitle>
            </div>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Connections
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="default"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </ConnectionPageLayout>
    );
  }

  // If no connection type is selected or found
  if (!selectedType) {
    return (
      <ConnectionPageLayout description='Connection not found or invalid ID.'>
        <Card>
          <CardHeader>
            <CardTitle>Connection Not Found</CardTitle>
            <CardDescription>The requested connection could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Connections
            </Button>
          </CardContent>
        </Card>
      </ConnectionPageLayout>
    );
  }
  return (
    <ConnectionPageLayout description='Edit your database connection here.'>
      <ConnectionForm 
        connectionId={selectedType?.id?.toString() ?? ""}
        connectionType={selectedType?.connection_type ?? ""}
        connectionDisplayName={selectedType?.connection_display_name ?? ""}
        connectionName={selectedType?.connection_name ?? ""}
        onBack={handleBack}
        connectionConfigName={connectionConfigName}
        formData={selectedType}
        isEdit={true}
      />
    </ConnectionPageLayout>
  );
}
  