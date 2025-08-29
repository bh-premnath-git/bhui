// components/TableSelection.tsx
import React, { useEffect, useState } from 'react';
import { Table2, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useDatabase } from '../../hooks/useDatabase';

interface TableSelectionProps {
  selectedConnection: string;
  selectedSchema: string;
  tables: string[];
  setTables: (tables: string[]) => void;
  selectedTables: string[];
  toggleTable: (tableName: string) => void;
  toggleAll: () => void;
  isImporting: boolean;
  onSubmit: (data: string[], createDescription: boolean, identifyPII: boolean) => Promise<void>
}

export const TableSelection: React.FC<TableSelectionProps> = ({
  selectedConnection,
  selectedSchema,
  tables,
  setTables,
  selectedTables,
  toggleTable,
  toggleAll,
  isImporting,
  onSubmit,
}) => {
  const [createDescription, setCreateDescription] = useState(false);
  const [identifyPII, setIdentifyPII] = useState(false);
  const { fetchTable } = useDatabase();
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    let isMounted = true;

    const loadTables = async () => {
      if (!selectedConnection || !selectedSchema) return;
      
      try {
        const result = await fetchTable(selectedConnection, selectedSchema);
        if (isMounted) {
          setTables(result);
        }
      } catch (error) {
        console.error("Failed to load tables:", error);
      }
    };

    loadTables();
    
    return () => {
      isMounted = false;
    };
  }, [selectedConnection, selectedSchema, fetchTable, setTables]);

  const handleSubmit = async () => {
    try {
      setFormState("submitting");
      await onSubmit(selectedTables, createDescription, identifyPII);
      setFormState("success");
    } catch (error) {
      setFormState("error");
    }
  };

  return (
    <div className="space-y-4 pl-6 border-l-2 border-gray-200">
      <div className="flex items-center">
        <Table2 className="h-5 w-5 mr-2 text-primary" />
        <h2 className="text-lg font-semibold">Select Tables</h2>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={selectedTables.length === tables.length && tables.length > 0}
            onCheckedChange={toggleAll}
          />
          <label htmlFor="select-all" className="text-sm font-medium">
            Select All Tables
          </label>
        </div>
        <div className="text-sm text-gray-500">
          {selectedTables.length} of {tables.length} selected
        </div>
      </div>

      <ScrollArea className="h-[300px] border rounded-md p-4">
        <div className="space-y-2">
          {tables.map((table) => (
            <div key={table} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={`table-${table}`}
                  checked={selectedTables.includes(table)}
                  onCheckedChange={() => toggleTable(table)}
                />
                <label htmlFor={`table-${table}`} className="font-medium cursor-pointer">
                  {table}
                </label>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex items-center space-x-4">
        <Checkbox
          id="create-description"
          checked={createDescription}
          onCheckedChange={() => setCreateDescription(!createDescription)}
        />
        <label htmlFor="create-description" className="text-sm font-medium">
          Create Description for Tables
        </label>
      </div>

      <div className="flex items-center space-x-4">
        <Checkbox
          id="create-description"
          checked={identifyPII}
          onCheckedChange={() => setIdentifyPII(!identifyPII)}
        />
        <label htmlFor="create-description" className="text-sm font-medium">
          Identify PII Columns
        </label>
      </div>

      {selectedTables.length > 0 && (
        <div className="pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isImporting}
            className="min-w-[120px]"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing Metadata...
              </>
            ) : (
              "Import Metadata"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
