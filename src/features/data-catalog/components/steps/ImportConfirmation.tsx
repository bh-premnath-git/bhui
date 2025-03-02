import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useImport } from '@/context/datacatalog/ImportContext';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { Loader2 } from 'lucide-react';

export function ImportConfirmation() {
  const { setStep } = useImport();
  const { handleNavigation } = useNavigation();
  const [isImporting, setIsImporting] = useState(false);

  const handlePrevious = () => {
    setStep(4);
  };

  const handleImport = () => {
    setIsImporting(true);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      setIsImporting(false);
      // Navigate back to data catalog after successful import
      handleNavigation(ROUTES.DATA_CATALOG);
    }, 2000);
  };

  // Dummy summary data
  const summaryData = {
    connection: 'Production Database (Oracle)',
    schema: 'sales_data',
    tables: ['customers', 'orders', 'products', 'transactions'],
    estimatedRows: '1.2M',
    estimatedSize: '450 MB'
  };

  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">Import Confirmation</h2>
      <p className="text-gray-600 mb-6">
        Please review your selection before importing the data.
      </p>

      <div className="bg-gray-50 p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-medium mb-4">Import Summary</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Database Connection:</span>
            <span className="font-medium">{summaryData.connection}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Schema:</span>
            <span className="font-medium">{summaryData.schema}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tables to Import:</span>
            <span className="font-medium">{summaryData.tables.length}</span>
          </div>
          <div className="border-t pt-3">
            <div className="mb-2 font-medium">Selected Tables:</div>
            <div className="grid grid-cols-2 gap-2">
              {summaryData.tables.map(table => (
                <div key={table} className="bg-white px-3 py-2 rounded border text-sm">
                  {table}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t pt-3 flex justify-between">
            <span className="text-gray-600">Estimated Rows:</span>
            <span className="font-medium">{summaryData.estimatedRows}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated Size:</span>
            <span className="font-medium">{summaryData.estimatedSize}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-blue-200 border p-4 rounded-md mb-6">
        <p className="text-blue-800 text-sm">
          The import process will run in the background. You'll be notified when it's complete.
        </p>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={handlePrevious} disabled={isImporting}>
          Previous
        </Button>
        <Button 
          onClick={handleImport} 
          disabled={isImporting}
          className="min-w-[120px]"
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            'Start Import'
          )}
        </Button>
      </div>
    </div>
  );
} 