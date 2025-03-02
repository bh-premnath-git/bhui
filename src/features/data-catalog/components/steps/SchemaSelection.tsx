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
import { ScrollArea } from '@/components/ui/scroll-area';

// Dummy data for schemas
const dummySchemas = [
  { id: 1, name: 'sales_data', tables: 24, size: '1.2 GB' },
  { id: 2, name: 'customer_data', tables: 15, size: '850 MB' },
  { id: 3, name: 'product_catalog', tables: 8, size: '320 MB' },
  { id: 4, name: 'analytics', tables: 42, size: '3.5 GB' },
  { id: 5, name: 'reporting', tables: 17, size: '780 MB' },
  { id: 6, name: 'archive', tables: 56, size: '7.2 GB' },
];

export function SchemaSelection() {
  const { setStep } = useImport();
  const [selectedSchema, setSelectedSchema] = useState<string>('');

  const handlePrevious = () => {
    setStep(1);
  };

  const handleNext = () => {
    // In a real implementation, you would save the selected schema to context
    setStep(3);
  };

  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">Select Database Schema</h2>
      <p className="text-gray-600 mb-6">
        Choose a schema from the database to import data from.
      </p>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="schema" className="text-sm font-medium">
            Database Schema
          </label>
          <Select
            value={selectedSchema}
            onValueChange={setSelectedSchema}
          >
            <SelectTrigger id="schema" className="w-full">
              <SelectValue placeholder="Select a schema" />
            </SelectTrigger>
            <SelectContent>
              {dummySchemas.map((schema) => (
                <SelectItem key={schema.id} value={schema.id.toString()}>
                  {schema.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSchema && (
          <div className="bg-gray-50 p-4 rounded-md border">
            <h3 className="font-medium mb-2">Schema Details</h3>
            {(() => {
              const schema = dummySchemas.find(s => s.id.toString() === selectedSchema);
              return schema ? (
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Name:</span>
                    <span>{schema.name}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Tables:</span>
                    <span>{schema.tables}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Size:</span>
                    <span>{schema.size}</span>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={handlePrevious}>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={!selectedSchema}>
          Next
        </Button>
      </div>
    </div>
  );
}