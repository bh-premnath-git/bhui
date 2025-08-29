import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertCircle, Check } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ConnectionSelector } from './ConnectionSelector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { mockConnections, mockTables, mockColumns } from '@/utils/mockData';

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
    
    if (field === 'targetConnection') {
      // Reset source table and columns when connection changes
      newMappings[index].sourceTable = '';
      newMappings[index].sourceColumns = [];
    }
    
    if (field === 'sourceTable') {
      // Reset source columns when table changes
      newMappings[index].sourceColumns = [];
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
      'sourceTable',
      'sourceColumns'
    ];
    
    return requiredFields.every(field => {
      if (field === 'sourceColumns') {
        return mapping && mapping[field] && Array.isArray(mapping[field]) && mapping[field].length > 0;
      }
      return mapping && mapping[field];
    });
  };

  // Multi-select component for source columns
  const MultiSelectColumns: React.FC<{
    value: string[];
    onValueChange: (value: string[]) => void;
    tableId: string;
    disabled?: boolean;
  }> = ({ value = [], onValueChange, tableId, disabled }) => {
    const availableColumns = getAvailableColumns(tableId);
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
            disabled={disabled}
          >
            {value.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {value.slice(0, 2).map((columnId) => {
                  const column = availableColumns.find(c => c.id === columnId);
                  return (
                    <Badge key={columnId} variant="secondary" className="text-xs">
                      {column?.name}
                    </Badge>
                  );
                })}
                {value.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{value.length - 2} more
                  </Badge>
                )}
              </div>
            ) : (
              "Select columns..."
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0">
          <div className="p-4 space-y-2">
            <div className="text-sm font-medium">Select Columns</div>
            {availableColumns.map((column) => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`column-${column.id}`}
                  checked={value.includes(column.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onValueChange([...value, column.id]);
                    } else {
                      onValueChange(value.filter(id => id !== column.id));
                    }
                  }}
                />
                <label
                  htmlFor={`column-${column.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {column.name}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
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
            <TableHead>Source Table</TableHead>
            <TableHead>Source Columns</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mappings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-32 text-muted-foreground">
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
                        <SelectItem value="no-connection-selected" disabled>
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
                        <SelectItem value="no-table-selected" disabled>
                          Select table first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={mapping.sourceTable || ''}
                    onValueChange={(value) => updateMapping(index, 'sourceTable', value)}
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
                        <SelectItem value="no-source-connection-selected" disabled>
                          Select connection first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <MultiSelectColumns
                    value={mapping.sourceColumns || []}
                    onValueChange={(value) => updateMapping(index, 'sourceColumns', value)}
                    tableId={mapping.sourceTable || ''}
                    disabled={!mapping.sourceTable}
                  />
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex justify-center">
                          {validateMapping(mapping) ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                              <Check className="h-3 w-3 mr-1" />
                              Valid
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Incomplete
                            </Badge>
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
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
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