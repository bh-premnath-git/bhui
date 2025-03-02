import React from 'react';
import { Button } from '@/components/ui/button';
import { useImport } from '@/context/datacatalog/ImportContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Dummy data for preview
const dummyPreviewData = {
  schema: 'sales_data',
  tableCount: 24,
  sampleTables: [
    { 
      name: 'customers', 
      columns: ['id', 'name', 'email', 'created_at'],
      rowCount: 15243
    },
    { 
      name: 'orders', 
      columns: ['id', 'customer_id', 'amount', 'status', 'order_date'],
      rowCount: 87621
    },
    { 
      name: 'products', 
      columns: ['id', 'name', 'price', 'category', 'in_stock'],
      rowCount: 3542
    }
  ]
};

export function PreviewData() {
  const { setStep } = useImport();

  const handlePrevious = () => {
    setStep(2);
  };

  const handleNext = () => {
    setStep(4);
  };

  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">Preview Schema Data</h2>
      <p className="text-gray-600 mb-6">
        Review the schema structure before proceeding to table selection.
      </p>

      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-md border">
          <h3 className="font-medium mb-2">Schema Overview</h3>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2">
              <span className="text-gray-600">Schema Name:</span>
              <span>{dummyPreviewData.schema}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-gray-600">Total Tables:</span>
              <span>{dummyPreviewData.tableCount}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">Sample Tables</h3>
          <div className="space-y-6">
            {dummyPreviewData.sampleTables.map((table) => (
              <div key={table.name} className="border rounded-md overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                  <h4 className="font-medium">{table.name}</h4>
                  <span className="text-sm text-gray-600">{table.rowCount.toLocaleString()} rows</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {table.columns.map((column) => (
                        <TableHead key={column}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Just showing column names, not actual data */}
                    <TableRow>
                      {table.columns.map((column) => (
                        <TableCell key={column} className="text-gray-500 italic">
                          {column === 'id' ? 'integer' : 
                           column.includes('date') ? 'timestamp' :
                           column.includes('price') || column.includes('amount') ? 'decimal' :
                           column.includes('status') || column.includes('in_stock') ? 'boolean' : 'varchar'}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={handlePrevious}>
          Previous
        </Button>
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
}