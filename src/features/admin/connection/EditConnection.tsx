import { useEffect, useState } from 'react';
import { useConnectionType } from './hooks/useConnection';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ConnectionForm } from './components/ConnectionForm';
import { ConnectionType } from '@/types/admin/connection';
import { ConnectionPageLayout } from './components/ConnectionPageLayout';
import { useParams } from 'react-router-dom';
import { apiService } from '@/lib/api/api-service';

export function EditConnection() {
  const {id} = useParams();
  console.log(id,"id")
  const { connectionTypes, isLoading } = useConnectionType();
  const [selectedType, setSelectedType] = useState<any | null>(null);
  const [connectionConfigName, setConnectionConfigName] = useState<string>("");


  useEffect(() => {
    const fetchConnectionData = async () => {
      const response:any = await apiService.get({
        url: `/connection_registry/connection_config/${id}`,
        method: 'GET',
        portNumber: '8011',
        usePrefix:true
      });
      console.log(response,"response")

      setSelectedType({
        id: response.id,
        connection_type: response.connection_type,
        connection_name: response.connection_name.toLowerCase(),
        connection_display_name: response.connection_config_name,
        connection_description: response.connection_description,
        file_path_prefix: response.custom_metadata?.file_path_prefix,

      });

    };
    fetchConnectionData();
  }, [id]);

  // TODO: Get the existing connection details from URL params or props
  // const { connectionId } = useParams(); // If using react-router
  // const { connection } = useExistingConnection(connectionId); // Create this hook to fetch connection details

  if (isLoading ) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  console.log(selectedType,"selectedType")
  return (
    <ConnectionPageLayout description='Edit your database connection here.'>
      <ConnectionForm 
        connectionId={selectedType?.id.toString() ?? ""}
        connectionType={selectedType?.connection_type ?? ""}
        connectionDisplayName={selectedType?.connection_display_name ?? ""}
        connectionName={selectedType?.connection_name ?? ""}
        onBack={() => setSelectedType(null)}
        connectionConfigName={connectionConfigName}
        formData={selectedType}
        isEdit={true}
      />
    </ConnectionPageLayout>
  );
}
  