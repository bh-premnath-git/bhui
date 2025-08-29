import { Badge } from '@/components/ui/badge';
import { getConnectionOptions } from '../schema';

export const ImportSummary = ({ 
  selectedConnection, 
  connections, 
  selectedSchema, 
  selectedTables 
}) => {
  const connectionOptions = getConnectionOptions(connections);
  const connection = selectedConnection ? 
    connectionOptions.find(c => c.value.toString() === selectedConnection) : null;

  return (
    <div className="bg-gray-50 p-6 rounded-lg border sticky top-4">
      <h3 className="text-lg font-medium mb-4">Import Summary</h3>
      
      <div className="space-y-4">
        {selectedConnection && connection ? (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-600">Connection</h4>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium">{connection.label}</div>
              <div className="text-sm text-gray-600">Type: {connection.type}</div>
              <div className="text-sm text-gray-600">Database: {connection.database}</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 italic">No connection selected</div>
        )}

        {selectedSchema && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-600">Schema</h4>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium">{selectedSchema}</div>
            </div>
          </div>
        )}

        {selectedTables.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-600">Selected Tables</h4>
            <div className="bg-white p-3 rounded border">
              <div className="text-sm mb-2">{selectedTables.length} tables selected</div>
              <div className="flex flex-wrap gap-1">
                {selectedTables.map((table) => (
                  <Badge key={table} variant="secondary" className="mb-1">
                    {table}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTables.length > 0 && (
          <div className="bg-blue-50 border-blue-200 border p-4 rounded-md mt-4">
            <p className="text-blue-800 text-sm">
              Only metadata will be imported, not the actual data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
