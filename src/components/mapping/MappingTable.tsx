import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2,AlertCircle, Check } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConnectionSelector } from './ConnectionSelector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { mockConnections, mockTables, mockColumns, dataTypes } from '@/utils/mockData';

interface MappingTableProps {
  mappings: any[];
  setMappings: React.Dispatch<React.SetStateAction<any[]>>;
}

const MappingTable: React.FC<MappingTableProps> = ({ mappings, setMappings }) => {
  const handleDelete = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index));
  };

  const updateMapping = (index: number, field: string, value: any) => {
    const newMappings = [...mappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    
    // Auto-populate related fields based on selection
    if (field === 'targetTable') {
      // Reset target column when table changes
      newMappings[index].targetColumn = '';
    }
    
    if (field === 'sourceConnection') {
      // Reset source table and column when connection changes
      newMappings[index].sourceTable = '';
      newMappings[index].sourceColumn = '';
    }
    
    if (field === 'sourceTable') {
      // Reset source column when table changes
      newMappings[index].sourceColumn = '';
    }

    setMappings(newMappings);
  };

  // Get available tables based on selected connection
  const getAvailableTables = (connectionId: string) => {
    return mockTables.filter(table => table.connectionId === connectionId);
  };

  // Get available columns based on selected table
  const getAvailableColumns = (tableId: string) => {
    return mockColumns.filter(column => column.tableId === tableId);
  };

  // Validate mapping
  const validateMapping = (mapping: any) => {
    const requiredFields = [
      'targetConnection', 
      'targetTable', 
      'targetColumn', 
      'targetDataType',
      'sourceConnection',
      'sourceTable',
      'sourceColumn'
    ];
    
    return requiredFields.every(field => mapping && mapping[field]);
  };
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Target Connection</TableHead>
            <TableHead>Target Table</TableHead>
            <TableHead>Target Column</TableHead>
            <TableHead>Data Type</TableHead>
            <TableHead>Source Connection</TableHead>
            <TableHead>Source Table</TableHead>
            <TableHead>Source Column</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mappings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center h-32 text-muted-foreground">
                No mappings defined. Click "Add Mapping" to create your first mapping.
              </TableCell>
            </TableRow>
          ) : (
            mappings.map((mapping, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <ConnectionSelector
                    value={mapping.targetConnection || ''}
                    onValueChange={(value) => updateMapping(index, 'targetConnection', value)}
                    connections={mockConnections}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={mapping.targetTable || ''}
                    onValueChange={(value) => updateMapping(index, 'targetTable', value)}
                    disabled={!mapping.targetConnection}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      {mapping.targetConnection ? (
                        getAvailableTables(mapping.targetConnection).map((table) => (
                          <SelectItem key={table.id} value={table.id}>
                            {table.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Select connection first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={mapping.targetColumn || ''}
                    onValueChange={(value) => updateMapping(index, 'targetColumn', value)}
                    disabled={!mapping.targetTable}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {mapping.targetTable ? (
                        getAvailableColumns(mapping.targetTable).map((column) => (
                          <SelectItem key={column.id} value={column.id}>
                            {column.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Select table first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={mapping.targetDataType || ''}
                    onValueChange={(value) => updateMapping(index, 'targetDataType', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Data type" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <ConnectionSelector
                    value={mapping.sourceConnection || ''}
                    onValueChange={(value) => updateMapping(index, 'sourceConnection', value)}
                    connections={mockConnections}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={mapping.sourceTable || ''}
                    onValueChange={(value) => updateMapping(index, 'sourceTable', value)}
                    disabled={!mapping.sourceConnection}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      {mapping.sourceConnection ? (
                        getAvailableTables(mapping.sourceConnection).map((table) => (
                          <SelectItem key={table.id} value={table.id}>
                            {table.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Select connection first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={mapping.sourceColumn || ''}
                    onValueChange={(value) => updateMapping(index, 'sourceColumn', value)}
                    disabled={!mapping.sourceTable}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {mapping.sourceTable ? (
                        getAvailableColumns(mapping.sourceTable).map((column) => (
                          <SelectItem key={column.id} value={column.id}>
                            {column.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Select table first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex justify-center">
                          {validateMapping(mapping) ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {validateMapping(mapping) 
                          ? "Mapping is valid" 
                          : "Please complete all required fields"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(index)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default MappingTable;