import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConnectionType, Connection } from '@/utils/mockData';

interface ConnectionSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  connections: Connection[];
  placeholder?: string;
}

// Map of connection types to their icon CSS classes
const connectionIconMap = {
  [ConnectionType.POSTGRESQL]: "bg-blue-500",
  [ConnectionType.MYSQL]: "bg-orange-500",
  [ConnectionType.ORACLE]: "bg-red-500",
  [ConnectionType.S3]: "bg-yellow-500",
  [ConnectionType.BIGQUERY]: "bg-green-500",
  [ConnectionType.GCS]: "bg-blue-400",
};

export const ConnectionSelector: React.FC<ConnectionSelectorProps> = ({
  value,
  onValueChange,
  connections,
  placeholder = "Select connection"
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {connections.map((connection) => (
          <SelectItem 
            key={connection.id} 
            value={connection.id}
            className="flex items-center"
          >
            <div className="flex items-center gap-2">
              <div 
                className={`h-3 w-3 rounded-full ${connectionIconMap[connection.type]}`} 
                aria-hidden="true"
              />
              {connection.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};