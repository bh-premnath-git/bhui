import React, { useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDatabase } from '../../hooks/useDatabase';

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
  const data = fetchSchema(selectedConnection).then(result => {
    setSchemas(result)
  })
 
  
  return (
    <div className="space-y-4 pl-6 border-l-2 border-gray-200">
      <div className="flex items-center">
        <ChevronRight className="h-5 w-5 mr-2 text-primary" />
        <h2 className="text-lg font-semibold">Database Schema</h2>
      </div>
      <Select
        value={selectedSchema}
        onValueChange={(value) => {
          setSelectedSchema(value);
          setSelectedTables([]);
          handleFetchTable();
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a schema" />
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



