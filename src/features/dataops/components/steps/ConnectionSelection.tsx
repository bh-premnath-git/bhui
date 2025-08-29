import React, { useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getConnectionOptions } from '../schema';
import { useDispatch } from 'react-redux';
import { fetchConnections } from '@/store/slices/dataCatalog/datasourceSlice';
import { AppDispatch } from '@/store';

interface ConnectionSelectionProps {
  connections: any[];
  selectedConnection: string;
  setSelectedConnection: (connection: string) => void;
  setSelectedSchema: (schema: string) => void;
  setSelectedTables: (tables: string[]) => void;
}

export const ConnectionSelection: React.FC<ConnectionSelectionProps> = ({ 
  connections, 
  selectedConnection, 
  setSelectedConnection, 
  setSelectedSchema, 
  setSelectedTables 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const connectionOptions = getConnectionOptions(connections);
  
  useEffect(() => {
    dispatch(fetchConnections());
  }, [dispatch]);
  
  return (
    <div className="space-y-4 pl-6 border-l-2 border-gray-200">
      <div className="flex items-center">
        <ChevronRight className="h-5 w-5 mr-2 text-primary" />
        <h2 className="text-lg font-semibold">Database Connection</h2>
      </div>
      <Select
        value={selectedConnection}
        onValueChange={(value) => {
          console.log('Selected Connection Value:', value);
          setSelectedConnection(value);
          setSelectedSchema('');
          setSelectedTables([]);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a database connection" />
        </SelectTrigger>
        <SelectContent>
          {connectionOptions.map((conn) => (
            <SelectItem key={conn.value} value={conn.value.toString()}>
              {conn.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};