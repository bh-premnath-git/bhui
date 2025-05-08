import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDatabase } from '@/lib/hooks/useDatabase';
interface SchemaSelectionProps {
  selectedConnection: string;
  selectedSchema: string;
  setSelectedSchema: (schema: string) => void;
  setSelectedTables: (tables: string[]) => void;
  handleFetchTable: () => Promise<void>;
  schemas: string[];
  setSchemas: (schemas: string[]) => void;
}

export const SchemaSelection: React.FC<SchemaSelectionProps> = ({ 
  selectedConnection,
  schemas, 
  selectedSchema, 
  setSelectedSchema, 
  setSelectedTables, 
  handleFetchTable,
  setSchemas
}) => {
  const { fetchSchema } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);

  // Load schemas when connection changes
  useEffect(() => {
    let isMounted = true;

    const loadSchemas = async () => {
      if (!selectedConnection) return;
      
      try {
        setIsLoading(true);
        const result = await fetchSchema(selectedConnection);
        if (isMounted) {
          setSchemas(result);
        }
      } catch (error) {
        console.error("Failed to load schemas:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSchemas();
    
    return () => {
      isMounted = false;
    };
  }, [selectedConnection, fetchSchema, setSchemas]);
 
  return (
    <div className="space-y-4 pl-6 border-l-2 border-gray-200">
      <div className="flex items-center">
        <ChevronRight className="h-5 w-5 mr-2 text-primary" />
        <h2 className="text-lg font-semibold">Database Schema</h2>
      </div>
      <Select
        value={selectedSchema}
        disabled={isLoading}
        onValueChange={(value) => {
          setSelectedSchema(value);
          setSelectedTables([]);
          handleFetchTable();
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isLoading ? "Loading schemas..." : "Select a schema"} />
        </SelectTrigger>
        <SelectContent>
          {schemas.map((schema) => (
            <SelectItem key={schema} value={schema}>
              {schema}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
