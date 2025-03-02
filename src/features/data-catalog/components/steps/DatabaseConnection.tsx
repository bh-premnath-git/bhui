import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useImport } from '@/context/datacatalog/ImportContext';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Dummy data for database connections
const dummyConnections = [
  { id: 1, name: 'Production Database', type: 'Oracle', host: 'prod-db.example.com' },
  { id: 2, name: 'Development Database', type: 'MySQL', host: 'dev-db.example.com' },
  { id: 3, name: 'Analytics Database', type: 'PostgreSQL', host: 'analytics.example.com' },
  { id: 4, name: 'Legacy System', type: 'Oracle', host: 'legacy.example.com' },
  { id: 5, name: 'Customer Data', type: 'MySQL', host: 'customers.example.com' },
];

export function DatabaseConnection() {
  const { setStep } = useImport();
  const [selectedConnection, setSelectedConnection] = useState<string>('');

  const handleNext = () => {
    // In a real implementation, you would save the selected connection to context
    setStep(2);
  };

  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">Select Database Connection</h2>
      <p className="text-gray-600 mb-6">
        Choose a database connection to import data from. You can select from your existing connections.
      </p>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="connection" className="text-sm font-medium">
            Database Connection
          </label>
          <Select
            value={selectedConnection}
            onValueChange={setSelectedConnection}
          >
            <SelectTrigger id="connection" className="w-full">
              <SelectValue placeholder="Select a database connection" />
            </SelectTrigger>
            <SelectContent>
              {dummyConnections.map((conn) => (
                <SelectItem key={conn.id} value={conn.id.toString()}>
                  {conn.name} ({conn.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedConnection && (
          <div className="bg-gray-50 p-4 rounded-md border">
            <h3 className="font-medium mb-2">Connection Details</h3>
            {(() => {
              const conn = dummyConnections.find(c => c.id.toString() === selectedConnection);
              return conn ? (
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Name:</span>
                    <span>{conn.name}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Type:</span>
                    <span>{conn.type}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Host:</span>
                    <span>{conn.host}</span>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>

      <div className="flex justify-end mt-8">
        <Button onClick={handleNext} disabled={!selectedConnection}>
          Next
        </Button>
      </div>
    </div>
  );
}