import { useEffect, useState } from 'react';
import { useConnections, useConnectionType } from './hooks/useConnection';
import { Card, CardContent } from '@/components/ui/card';
import { ConnectionForm } from './components/ConnectionForm';
import { ConnectionPageLayout } from './components/ConnectionPageLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';

export function EditConnection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedconnection } = useAppSelector((state: RootState) => state.connections);

  // Use the connections hook with connectionId
  const {
    connnectionResponses: connectionData,
    isConnectionLoading,
    isConnectionError,
    handleUpdateConnection
  } = useConnections({
    connectionId: id
  });
  
  const { connectionTypes, isLoading: isTypesLoading } = useConnectionType();
  const [selectedType, setSelectedType] = useState<any | null>(null);
  const [connectionConfigName, setConnectionConfigName] = useState<string>("");
  const handleBack = () => {
    navigate(ROUTES.ADMIN.CONNECTION.INDEX);
  };
  // Use Effect to set initial data
  useEffect(() => {
    if (connectionData) {
      setSelectedType(connectionData);
      setConnectionConfigName(connectionData.connection_config_name || "");
    }
  }, [connectionData]);
  
  // Loading state
  if (isConnectionLoading || isTypesLoading) {
    return <LoadingState />;
  }
  
  // Error state
  if (isConnectionError) {
    // Either update ErrorState component to accept onRetry prop or remove it
    return <ErrorState />; 
  }
  
  return (
    <ConnectionPageLayout description='Edit your database connection here.'>
      <div className="mb-4">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft size={16} /> Back to connections
        </Button>
      </div>
      
      {connectionData ? (
        <ConnectionForm
          connectionId={connectionData.id?.toString()}
          connectionType={connectionData.connection_type}
          connectionDisplayName={connectionData.connection_name}
          connectionName={connectionData.connection_name}
          onBack={handleBack}
          connectionConfigName={connectionConfigName}
          isEdit={true}
          formData={connectionData}
          onSubmit={(formData) => handleUpdateConnection(id, formData)}
        />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertTriangle size={48} className="text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Connection Not Found</h3>
            <p className="text-gray-500 text-center mb-4">
              The connection you're trying to edit could not be found.
            </p>
            <Button onClick={handleBack}>Return to Connections</Button>
          </CardContent>
        </Card>
      )}
    </ConnectionPageLayout>
  );
}