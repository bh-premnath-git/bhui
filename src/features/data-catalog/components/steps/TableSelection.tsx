import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useImport } from '@/context/datacatalog/ImportContext';
import { ScrollArea } from '@/components/ui/scroll-area';

// Dummy data for tables
const dummyTables = [
  { id: 1, name: 'customers', description: 'Customer information table' },
  { id: 2, name: 'orders', description: 'Order details and history' },
  { id: 3, name: 'products', description: 'Product catalog and inventory' },
  { id: 4, name: 'employees', description: 'Employee records' },
  { id: 5, name: 'suppliers', description: 'Supplier information' },
  { id: 6, name: 'transactions', description: 'Financial transactions' },
  { id: 7, name: 'inventory', description: 'Inventory tracking' },
  { id: 8, name: 'shipping', description: 'Shipping details and tracking' },
  { id: 9, name: 'returns', description: 'Product returns and exchanges' },
  { id: 10, name: 'analytics', description: 'Analytics and reporting data' },
];

export function TableSelection() {
  const { setStep } = useImport();
  const [selectedTables, setSelectedTables] = useState<number[]>([]);

  const handlePrevious = () => {
    setStep(3);
  };

  const handleNext = () => {
    // In a real implementation, you would save the selected tables to context
    setStep(5);
  };

  const toggleTable = (tableId: number) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId) 
        : [...prev, tableId]
    );
  };

  const toggleAll = () => {
    if (selectedTables.length === dummyTables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(dummyTables.map(table => table.id));
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">Select Tables to Import</h2>
      <p className="text-gray-600 mb-6">
        Select one or more tables from the schema to import into your data catalog.
      </p>

      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="select-all" 
            checked={selectedTables.length === dummyTables.length}
            onCheckedChange={toggleAll}
          />
          <label htmlFor="select-all" className="text-sm font-medium">
            Select All Tables
          </label>
        </div>
        <div className="text-sm text-gray-500">
          {selectedTables.length} of {dummyTables.length} selected
        </div>
      </div>

      <ScrollArea className="h-[300px] border rounded-md p-4">
        <div className="space-y-2">
          {dummyTables.map((table) => (
            <div key={table.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
              <Checkbox 
                id={`table-${table.id}`} 
                checked={selectedTables.includes(table.id)}
                onCheckedChange={() => toggleTable(table.id)}
              />
              <div>
                <label htmlFor={`table-${table.id}`} className="font-medium cursor-pointer">
                  {table.name}
                </label>
                <p className="text-sm text-gray-500">{table.description}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={handlePrevious}>
          Previous
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={selectedTables.length === 0}
        >
          Next
        </Button>
      </div>
    </div>
  );
} 