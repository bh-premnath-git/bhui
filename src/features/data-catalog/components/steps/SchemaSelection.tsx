import React, { useEffect } from 'react';
import { useImport } from '@/context/datacatalog/ImportContext';
import { useDatabase } from '@/features/data-catalog/hooks/useDatabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export function SchemaSelection() {
  const { selectedSchema, setSelectedSchema, setStep, databaseConfig } = useImport();
  const { schemas, connectToDatabase, fetchTables } = useDatabase();

  useEffect(() => {
    const initializeSchemas = async () => {
      try {
        const success = await connectToDatabase(databaseConfig);
        if (!success) {
          toast.error('Failed to connect to database');
          setStep(1);
        }
      } catch (error) {
        console.error('Error connecting to database:', error);
        toast.error('Failed to connect to database');
        setStep(1);
      }
    };

    initializeSchemas();
  }, [databaseConfig, connectToDatabase, setStep]);

  const handleNext = async () => {
    if (selectedSchema) {
      try {
        await fetchTables(selectedSchema);
        setStep(3);
      } catch (error) {
        console.error('Error fetching tables:', error);
        toast.error('Failed to fetch tables');
      }
    }
  };

  return (
    <Card className="p-6 w-full max-w-md mx-auto animate-fadeIn">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Schema</label>
          <Select
            value={selectedSchema}
            onValueChange={setSelectedSchema}
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
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(1)}>
            Back
          </Button>
          <Button onClick={handleNext} disabled={!selectedSchema}>
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}