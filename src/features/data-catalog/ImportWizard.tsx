import React, { useState } from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { X, ChevronRight, Database, Table2, Eye, Check } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Dummy data for database connections
const dummyConnections = [
  { id: 1, name: 'Production Database', type: 'Oracle', host: 'prod-db.example.com' },
  { id: 2, name: 'Development Database', type: 'MySQL', host: 'dev-db.example.com' },
  { id: 3, name: 'Analytics Database', type: 'PostgreSQL', host: 'analytics.example.com' },
  { id: 4, name: 'Legacy System', type: 'Oracle', host: 'legacy.example.com' },
  { id: 5, name: 'Customer Data', type: 'MySQL', host: 'customers.example.com' },
];

// Dummy data for schemas
const dummySchemas = [
  { id: 1, name: 'sales_data', tables: 24, size: '1.2 GB' },
  { id: 2, name: 'customer_data', tables: 15, size: '850 MB' },
  { id: 3, name: 'product_catalog', tables: 8, size: '320 MB' },
  { id: 4, name: 'analytics', tables: 42, size: '3.5 GB' },
  { id: 5, name: 'reporting', tables: 17, size: '780 MB' },
  { id: 6, name: 'archive', tables: 56, size: '7.2 GB' },
];

// Dummy data for tables
const dummyTables = [
  { 
    id: 1, 
    name: 'customers', 
    description: 'Customer information table',
    columns: ['id', 'name', 'email', 'created_at'],
    sampleData: [
      { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2023-01-15' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2023-02-20' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', created_at: '2023-03-10' }
    ]
  },
  { 
    id: 2, 
    name: 'orders', 
    description: 'Order details and history',
    columns: ['id', 'customer_id', 'amount', 'status', 'order_date'],
    sampleData: [
      { id: 101, customer_id: 1, amount: 125.99, status: 'completed', order_date: '2023-04-05' },
      { id: 102, customer_id: 2, amount: 89.50, status: 'processing', order_date: '2023-04-10' },
      { id: 103, customer_id: 1, amount: 45.25, status: 'completed', order_date: '2023-04-15' }
    ]
  },
  { 
    id: 3, 
    name: 'products', 
    description: 'Product catalog and inventory',
    columns: ['id', 'name', 'price', 'category', 'in_stock'],
    sampleData: [
      { id: 201, name: 'Laptop', price: 1299.99, category: 'Electronics', in_stock: true },
      { id: 202, name: 'Desk Chair', price: 249.99, category: 'Furniture', in_stock: true },
      { id: 203, name: 'Coffee Maker', price: 89.99, category: 'Appliances', in_stock: false }
    ]
  },
  { id: 4, name: 'employees', description: 'Employee records' },
  { id: 5, name: 'suppliers', description: 'Supplier information' },
  { id: 6, name: 'transactions', description: 'Financial transactions' },
  { id: 7, name: 'inventory', description: 'Inventory tracking' },
  { id: 8, name: 'shipping', description: 'Shipping details and tracking' },
  { id: 9, name: 'returns', description: 'Product returns and exchanges' },
  { id: 10, name: 'analytics', description: 'Analytics and reporting data' },
];

export function ImportWizard() {
  const { handleNavigation } = useNavigation();
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [selectedSchema, setSelectedSchema] = useState<string>('');
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [previewTable, setPreviewTable] = useState<number | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const connection = selectedConnection ? 
    dummyConnections.find(c => c.id.toString() === selectedConnection) : null;
  
  const schema = selectedSchema ? 
    dummySchemas.find(s => s.id.toString() === selectedSchema) : null;

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

  const handleImport = () => {
    setIsImporting(true);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      setIsImporting(false);
      // Navigate back to data catalog after successful import
      handleNavigation(ROUTES.DATA_CATALOG);
    }, 2000);
  };

  const goBack = () => {
    handleNavigation(ROUTES.DATA_CATALOG);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 relative">
        <div className="bg-white rounded-lg shadow-lg p-8 relative">
          <X
            className="absolute top-4 right-4 w-6 h-6 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
            onClick={goBack}
          />
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">Import Database Metadata</h1>
            
            <div className="grid grid-cols-3 gap-8">
              {/* Main selection area - 2/3 width */}
              <div className="col-span-2 space-y-8">
                {/* Connection Selection */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 mr-2 text-primary" />
                    <h2 className="text-lg font-semibold">Database Connection</h2>
                  </div>
                  <Select
                    value={selectedConnection}
                    onValueChange={(value) => {
                      setSelectedConnection(value);
                      setSelectedSchema('');
                      setSelectedTables([]);
                      setPreviewTable(null);
                    }}
                  >
                    <SelectTrigger className="w-full">
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

                {/* Schema Selection - only show if connection is selected */}
                {selectedConnection && (
                  <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                    <div className="flex items-center">
                      <ChevronRight className="h-5 w-5 mr-2 text-primary" />
                      <h2 className="text-lg font-semibold">Database Schema</h2>
                    </div>
                    <Select
                      value={selectedSchema}
                      onValueChange={(value) => {
                        setSelectedSchema(value);
                        setSelectedTables([]);
                        setPreviewTable(null);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a schema" />
                      </SelectTrigger>
                      <SelectContent>
                        {dummySchemas.map((schema) => (
                          <SelectItem key={schema.id} value={schema.id.toString()}>
                            {schema.name} ({schema.tables} tables)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Table Selection - only show if schema is selected */}
                {selectedSchema && (
                  <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                    <div className="flex items-center">
                      <Table2 className="h-5 w-5 mr-2 text-primary" />
                      <h2 className="text-lg font-semibold">Select Tables</h2>
                    </div>
                    
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
                          <div key={table.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                            <div className="flex items-center space-x-3">
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
                            {table.columns && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setPreviewTable(previewTable === table.id ? null : table.id)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                {previewTable === table.id ? 'Hide Preview' : 'Preview'}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Preview Data - shown when a table is selected for preview */}
                    {previewTable && (
                      <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                        <div className="flex items-center">
                          <Eye className="h-5 w-5 mr-2 text-primary" />
                          <h2 className="text-lg font-semibold">Data Preview</h2>
                        </div>
                        
                        {(() => {
                          const table = dummyTables.find(t => t.id === previewTable);
                          if (!table || !table.columns || !table.sampleData) return null;
                          
                          return (
                            <Card>
                              <CardContent className="p-4">
                                <div className="mb-2 flex justify-between items-center">
                                  <h3 className="font-medium">{table.name}</h3>
                                  <Badge variant="outline">Sample Data</Badge>
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
                                    {table.sampleData.map((row, idx) => (
                                      <TableRow key={idx}>
                                        {table.columns.map((column) => (
                                          <TableCell key={column}>
                                            {row[column as keyof typeof row]?.toString()}
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </CardContent>
                            </Card>
                          );
                        })()}
                      </div>
                    )}

                    {/* Import Button */}
                    {selectedTables.length > 0 && (
                      <div className="pt-4">
                        <Button 
                          onClick={handleImport} 
                          disabled={isImporting}
                          className="min-w-[120px]"
                        >
                          {isImporting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Importing Metadata...
                            </>
                          ) : (
                            'Import Metadata'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Summary panel - 1/3 width */}
              <div className="col-span-1">
                <div className="bg-gray-50 p-6 rounded-lg border sticky top-4">
                  <h3 className="text-lg font-medium mb-4">Import Summary</h3>
                  
                  <div className="space-y-4">
                    {connection ? (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-600">Connection</h4>
                        <div className="bg-white p-3 rounded border">
                          <div className="font-medium">{connection.name}</div>
                          <div className="text-sm text-gray-600">Type: {connection.type}</div>
                          <div className="text-sm text-gray-600">Host: {connection.host}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">No connection selected</div>
                    )}

                    {schema && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-600">Schema</h4>
                        <div className="bg-white p-3 rounded border">
                          <div className="font-medium">{schema.name}</div>
                          <div className="text-sm text-gray-600">{schema.tables} tables</div>
                        </div>
                      </div>
                    )}

                    {selectedTables.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-600">Selected Tables</h4>
                        <div className="bg-white p-3 rounded border">
                          <div className="text-sm mb-2">{selectedTables.length} tables selected</div>
                          <div className="flex flex-wrap gap-1">
                            {selectedTables.map(id => {
                              const table = dummyTables.find(t => t.id === id);
                              return table ? (
                                <Badge key={id} variant="secondary" className="mb-1">
                                  {table.name}
                                </Badge>
                              ) : null;
                            })}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}