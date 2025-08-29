import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Database, Check } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api/api-service';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';

interface SourceSelectorProps {
  value: any;
  onChange: (source: any) => void;
  disabled?: boolean;
}

const ITEMS_PER_PAGE = 10;

// Query keys
const dataSourceKeys = {
  all: ['dataSources'] as const,
  list: () => [...dataSourceKeys.all, 'list'] as const,
};

export const SourceSelector: React.FC<SourceSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelectingSource, setIsSelectingSource] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: dataSourceKeys.list(),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiService.get({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: '/data_source/list/',
        usePrefix: true,
        method: 'GET',
        metadata: {
          errorMessage: 'Failed to fetch data sources'
        },
        params: { limit: 1000 }
      });
      return (response as any).data;
    },
    getNextPageParam: (lastPage: any, allPages) => {
      return lastPage?.length === ITEMS_PER_PAGE ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1
  });

  // Flatten and filter data sources
  const dataSources = data?.pages.flat() || [];
  const filteredSources = dataSources.filter((source: any) =>
    source && source.data_src_name && typeof source.data_src_name === 'string'
      ? source.data_src_name.toLowerCase().includes(searchTerm.toLowerCase())
      : false
  );
console.log(filteredSources)
  const handleScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
      if (scrollHeight - scrollTop <= clientHeight * 1.5 && !isFetchingNextPage && hasNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  const handleSourceSelect = (source: any) => {
    console.log(source)
    onChange(source);
    setIsSelectingSource(false);
  };

  const getConnectionTypeIcon = (connectionType: string) => {
    console.log(connectionType)
    switch (connectionType?.toLowerCase()) {
      case 'postgres':
        return '/assets/buildPipeline/connection/postgres.svg';
      case 'snowflake':
        return '/assets/buildPipeline/connection/snowflake.svg';
      case 'local':
        return '/assets/buildPipeline/connection/bigquery.svg';
      case 'mysql':
        return '/assets/buildPipeline/connection/mysql.svg';
      case 's3':
        return '/assets/buildPipeline/connection/s3.svg';
      default:
        return '/assets/buildPipeline/connection/local.svg';
    }
  };

  if (isSelectingSource) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Select Data Source</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsSelectingSource(false)}
          >
            Cancel
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search data sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div
          className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-2"
          onScroll={handleScroll}
        >
          {filteredSources.map((source: any, index: number) => (
            <Card
              key={`${source.id || index}`}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleSourceSelect(source)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <img
                    src={getConnectionTypeIcon(source.connection_config?.custom_metadata?.connection_type)}
                    alt={source.connection_type}
                    className="w-8 h-8 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{source.data_src_name}</div>
                    <div className="text-xs text-gray-500 capitalize">
                      {source.connection_type}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {(isLoading || isFetchingNextPage) && (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          )}
          
          {filteredSources.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No data sources found</p>
              <p className="text-sm">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Data Source</Label>
      
      {value && (value.data_src_name || value.name) ? (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={getConnectionTypeIcon(value.connection_config?.custom_metadata?.connection_type || value.connection?.custom_metadata?.connection_type)}
                  alt={value.connection_type || value.connection?.custom_metadata?.connection_type}
                  className="w-8 h-8 rounded"
                />
                <div>
                  <div className="font-medium text-sm flex items-center gap-2">
                    {value.data_src_name || value.name}
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {value.connection_type || value.connection?.custom_metadata?.connection_type || value.source_type}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSelectingSource(true)}
                disabled={disabled}
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">No data source selected</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSelectingSource(true)}
              disabled={disabled}
            >
              Select Data Source
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};