import { useState } from "react";
import {
  useConnectionType,
  useConnectionSearch,
  useEnvironments,
} from "./hooks/useConnection";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ConnectionForm } from "./components/ConnectionForm";
import { ConnectionTypes } from "@/types/admin/connection";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ConnectionPageLayout } from "./components/ConnectionPageLayout";

export function AddConnection() {
  const { connectionTypes, isLoading } = useConnectionType();
  const { environments, isLoading: environmentsLoading } = useEnvironments();
  const {
    searchedConnection,
    connectionFound,
    connectionNotFound,
    isLoading: searchLoading,
    error,
    debounceSearchConnection,
  } = useConnectionSearch();

  const [selectedType, setSelectedType] = useState<ConnectionTypes | null>(null);
  const [activeTab, setActiveTab] = useState<string>("source");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [connectionConfigName, setConnectionConfigName] = useState<string>("");
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("");
  const [showNameError, setShowNameError] = useState<boolean>(false);
  const [showEnvironmentError, setShowEnvironmentError] = useState<boolean>(false);

  if (isLoading || environmentsLoading) {
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
        selectedEnvironment={selectedEnvironment}
      />
    );
  }

  const connectionImages: Record<string, string> = {
    mysql: "/assets/buildPipeline/connection/mysql.svg",
    postgres: "/assets/buildPipeline/connection/postgres.svg",
    oracle: "/assets/buildPipeline/connection/oracle.svg",
    snowflake: "/assets/buildPipeline/connection/snowflake.svg",
    bigquery: "/assets/buildPipeline/connection/bigquery.svg",
    redshift: "/assets/buildPipeline/connection/redshift.svg",
    local: "/assets/buildPipeline/connection/local.png",
    gcs: "/assets/buildPipeline/connection/gcs.svg",
    s3: "/assets/buildPipeline/connection/s3.svg",
    databricks_lakehouse: "/assets/buildPipeline/connection/databricks.svg",
    ms_sql_server: "/assets/buildPipeline/connection/ms_sql_server.svg",
    mongodb: "/assets/buildPipeline/connection/mongodb.svg",
    clickhouse: "/assets/buildPipeline/connection/clickhouse.svg",
    pinecone: "/assets/buildPipeline/connection/pinecone.svg",
    redis: "/assets/buildPipeline/connection/redis.svg",
    salesforce: "/assets/buildPipeline/connection/salesforce.svg",
    weaviate: "/assets/buildPipeline/connection/weaviate.svg",
    apache_iceberg: "/assets/buildPipeline/connection/apache_iceberg.svg",
    azure_blob_storage:
      "/assets/buildPipeline/connection/azure_blob_storage.svg",
    duckdb: "/assets/buildPipeline/connection/duckdb.svg",
    elasticsearch: "/assets/buildPipeline/connection/elasticsearch.svg",
    google_sheets: "/assets/buildPipeline/connection/google_sheets.svg",
    google_pubsub: "/assets/buildPipeline/connection/google_pubsub.svg",
    kafka: "/assets/buildPipeline/connection/kafka.svg",
    dynamodb: "/assets/buildPipeline/connection/dynamodb.svg",
    starburst_galaxy: "/assets/buildPipeline/connection/starburst.svg",
    google_firestore: "/assets/buildPipeline/connection/google_firestore.svg",
    ibm_db2: "/assets/buildPipeline/connection/ibm_db2.svg",
    ibm_idms: "/assets/buildPipeline/connection/idms.png",
    teradata: "/assets/buildPipeline/connection/teradata.svg",
  };

  const filteredConnections =
    connectionTypes?.filter(
      (type) =>
        type.connection_type === activeTab &&
        (type.connection_display_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ??
          false)
    ) ?? [];

  const handleCardClick = (type: ConnectionTypes) => {
    let hasErrors = false;

    if (!connectionConfigName.trim()) {
      setShowNameError(true);
      hasErrors = true;
    } else {
      setShowNameError(false);
    }

    if (!selectedEnvironment.trim()) {
      setShowEnvironmentError(true);
      hasErrors = true;
    } else {
      setShowEnvironmentError(false);
    }

    if (connectionFound) {
      hasErrors = true;
    }

    if (hasErrors) return;

    setSelectedType(type);
  };

  return (
    <ConnectionPageLayout description="Establish your database connection here.">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Connection</CardTitle>
          <CardDescription>Configure a new data connection</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex gap-2">
            {/* Connection Name */}
            <div className="mb-6 space-y-2 w-full">
              <Label htmlFor="connectionName" className="font-medium">
                Connection Name <span className="text-red-500">*</span>
              </Label>
              <div>
                <Input
                  id="connectionName"
                  placeholder="Enter connection configuration name..."
                  className={`w-full max-w-md h-9 text-sm ${
                    showNameError || connectionFound
                      ? "border-red-500 focus:ring-red-500"
                      : connectionNotFound
                      ? "border-green-500 focus:ring-green-500"
                      : ""
                  }`}
                  value={connectionConfigName}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setConnectionConfigName(newValue);
                    if (newValue.trim()) {
                      setShowNameError(false);
                      debounceSearchConnection(newValue);
                    } else {
                      setShowNameError(true);
                    }
                  }}
                  required
                />
                {searchLoading && connectionConfigName.trim() && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Checking availability...
                  </p>
                )}
                {connectionNotFound && connectionConfigName.trim() && (
                  <p className="text-sm text-green-500 mt-1">
                    This connection name is available
                  </p>
                )}
                {error && (
                  <p className="text-sm text-red-500 mt-1">
                    Error checking connection name availability
                  </p>
                )}
                {showNameError && (
                  <p className="text-sm text-red-500 mt-1">
                    Connection name is required
                  </p>
                )}
                {/* Show only if input is not empty and connection is duplicate */}
                {!showNameError && connectionFound && (
                  <p className="text-sm text-red-500 mt-1">
                    This connection name is already in use.
                  </p>
                )}
              </div>
            </div>

            {/* Environment */}
            <div className="mb-6 space-y-2 w-full">
              <Label htmlFor="environment" className="font-medium">
                Environment <span className="text-red-500">*</span>
              </Label>
              <div>
                <Select
                  value={selectedEnvironment}
                  onValueChange={(value) => {
                    setSelectedEnvironment(value);
                    if (value) setShowEnvironmentError(false);
                  }}
                >
                  <SelectTrigger
                    className={`w-full max-w-md h-9 text-sm ${
                      showEnvironmentError
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    {environments.map((env) => (
                      <SelectItem
                        key={env.bh_env_id}
                        value={env.bh_env_id.toString()}
                      >
                        {env.bh_env_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showEnvironmentError && (
                  <p className="text-sm text-red-500 mt-1">
                    Environment is required
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            defaultValue="source"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="source">Source</TabsTrigger>
              <TabsTrigger value="destination">Destination</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search connections..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Connection Cards */}
          {filteredConnections.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConnections.map((type) => (
                <Card
                  key={type.id}
                  className={`transition-all ${
                    connectionConfigName.trim() &&
                    selectedEnvironment.trim() &&
                    !connectionFound
                      ? "cursor-pointer hover:shadow-md"
                      : "opacity-70 cursor-not-allowed"
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
                <p className="text-muted-foreground mb-2">
                  No connections found
                </p>
                <p className="text-sm text-center">
                  {searchTerm
                    ? `No ${activeTab} connections match "${searchTerm}"`
                    : `No ${activeTab} connections available`}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </ConnectionPageLayout>
  );
}
