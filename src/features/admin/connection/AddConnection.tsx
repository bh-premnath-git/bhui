import { useState } from 'react';
import { useConnectionType } from './hooks/useConnection';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ConnectionForm } from './components/ConnectionForm';
import { ConnectionType } from '@/types/admin/connection';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Label } from '@/components/ui/label';

export function 
AddConnection() {
  const { connectionTypes, isLoading } = useConnectionType();
  const [selectedType, setSelectedType] = useState<ConnectionType | null>(null);
  const [activeTab, setActiveTab] = useState<string>("source");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [connectionConfigName, setConnectionConfigName] = useState<string>("");
  const [showNameError, setShowNameError] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (selectedType) {
    return (
      <ConnectionForm 
        connectionId={selectedType.id.toString()}
        connectionType={selectedType.connection_type}
        connectionDisplayName={selectedType.connection_display_name}
        connectionName={selectedType.connection_name}
        onBack={() => setSelectedType(null)} 
        connectionConfigName={connectionConfigName}
      />
    );
  }

  const connectionImages = {
    "mysql": "/assets/buildPipeline/connection/mysql.png",
    "postgres": "/assets/buildPipeline/connection/postgres.png",
    "oracle": "/assets/buildPipeline/connection/oracle.png",
    "snowflake": "/assets/buildPipeline/connection/snowflake.png",
    "bigquery": "/assets/buildPipeline/connection/bigquery.png",
    "redshift": "/assets/buildPipeline/connection/redshift.jpg",
    "local": "/assets/buildPipeline/connection/local.png",
    "gcs": "/assets/buildPipeline/connection/gcs.png",
    "s3": "/assets/buildPipeline/connection/s3.png"
  };

  // Filter connections by type and search term
  const filteredConnections = connectionTypes?.filter(type => 
    type.connection_type === activeTab && 
    (type.connection_display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  ) ?? [];

  const handleCardClick = (type: ConnectionType) => {
    if (!connectionConfigName.trim()) {
      setShowNameError(true);
      return;
    }
    setShowNameError(false);
    setSelectedType(type);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Connection</CardTitle>
        <CardDescription>Configure a new data connection</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-6 space-y-2">
          <Label htmlFor="connectionName" className="font-medium">
            Connection Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="connectionName"
            placeholder="Enter connection configuration name..."
            className={`w-full max-w-md h-9 text-sm ${showNameError ? 'border-red-500 focus:ring-red-500' : ''}`}
            value={connectionConfigName}
            onChange={(e) => {
              setConnectionConfigName(e.target.value);
              if (e.target.value.trim()) {
                setShowNameError(false);
              }
            }}
            required
          />
        </div>
        
        <Tabs defaultValue="source" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="source">Source</TabsTrigger>
            <TabsTrigger value="destination">Destination</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search connections..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {filteredConnections?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConnections.map((type) => (
              <Card 
                key={type.id}
                className={`transition-all ${
                  connectionConfigName.trim() 
                    ? 'cursor-pointer hover:shadow-md' 
                    : 'opacity-70 cursor-not-allowed'
                }`}
                onClick={() => handleCardClick(type)}
              >
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="w-16 h-16 mb-4 flex items-center justify-center">
                    <img 
                      src={connectionImages[type.connection_name]} 
                      alt={type.connection_display_name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <CardTitle className="text-center text-sm mb-1">
                    {type.connection_display_name}
                  </CardTitle>
                  <CardDescription className="text-center text-xs">
                    {type.connection_description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <p className="text-muted-foreground mb-2">No connections found</p>
              <p className="text-sm text-center">
                {searchTerm ? 
                  `No ${activeTab} connections match "${searchTerm}"` : 
                  `No ${activeTab} connections available`}
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}