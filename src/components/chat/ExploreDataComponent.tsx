import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Search, ArrowRight } from 'lucide-react';

interface Connection {
  id: number | string;
  connection_config_name: string;
}

interface ExploreDataComponentProps {
  query?: string;
  connection?: Connection;
}

export const ExploreDataComponent: React.FC<ExploreDataComponentProps> = ({ query, connection }) => {
  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Compact Connection and Query Info */}
        {(connection || query) && (
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Connection Info - Compact */}
                {connection && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                      <Database className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Connected to</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {connection.connection_config_name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Query Info - Compact */}
                {query && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Search className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Query</p>
                      <p className="text-sm text-foreground leading-relaxed">
                        "{query}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Analysis Card */}
        <Card className="border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Database className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Data Exploration</CardTitle>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2">
              {connection && (
                <>
                  <span className="bg-primary/10 px-2 py-1 rounded text-primary font-medium">
                    {connection.connection_config_name}
                  </span>
                  {query && <ArrowRight className="w-4 h-4" />}
                </>
              )}
              {query && (
                <span className="bg-blue-100 px-2 py-1 rounded text-blue-700 font-medium">
                  Analysis Ready
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {connection && query ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Ready to analyze your data with the specified query on the selected connection.
                </p>
                <div className="bg-gradient-to-r from-primary/5 to-blue-50 rounded-lg p-6 border border-primary/10">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm font-medium">
                      <Database className="w-4 h-4 text-primary" />
                      <span>Connection: {connection.connection_config_name}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm font-medium">
                      <Search className="w-4 h-4 text-blue-600" />
                      <span>Query: "{query}"</span>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-8 border-2 border-dashed border-muted-foreground/20">
                  <p className="text-sm text-muted-foreground">
                    Data visualization and analysis tools will be implemented here...
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-2">
                    This component now has access to both connection and query data
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {!connection && !query && "No connection or query information available."}
                  {!connection && query && "Connection information is missing."}
                  {connection && !query && "Query information is missing."}
                </p>
                <div className="bg-muted/30 rounded-lg p-8 border-2 border-dashed border-muted-foreground/20">
                  <p className="text-sm text-muted-foreground">
                    Please select a connection and provide a query to start data exploration.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
