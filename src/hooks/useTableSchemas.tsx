import { useState, useEffect } from 'react';
import { TableSchema } from '@/types/data-catalog/xplore/type';

let dynamicTableSchemas: TableSchema[] = [];

export function updateTableSchemas(schemas: TableSchema[]) {
  dynamicTableSchemas = schemas;
}

export interface UseTableSchemasOptions {
  connectionId?: string;
  fetchOnMount?: boolean;
}

export function useTableSchemas(options: UseTableSchemasOptions = {}) {
  const {
    connectionId,
    fetchOnMount = true
  } = options;

  const [tables, setTables] = useState<TableSchema[]>(dynamicTableSchemas);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchemas = async (_connId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTables(dynamicTableSchemas);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching table schemas:', err);
      setError('Failed to fetch database schema');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (fetchOnMount) {
      fetchSchemas();
    }
  }, [fetchOnMount]);

  // This will be useful when the connectionId changes
  useEffect(() => {
    if (connectionId) {
      fetchSchemas(connectionId);
    }
  }, [connectionId]);

  // Listen for changes to dynamicTableSchemas
  useEffect(() => {
    if (dynamicTableSchemas.length > 0) {
      setTables(dynamicTableSchemas);
    }
  }, [dynamicTableSchemas]);

  return {
    tables,
    isLoading,
    error,
    fetchSchemas,
    setTables
  };
}
