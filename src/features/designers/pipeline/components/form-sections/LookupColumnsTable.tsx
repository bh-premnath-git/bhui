import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2, Loader2, Database, Search, X, ChevronDown, Settings2 } from 'lucide-react';
import { getColumnsForDataSource } from '@/lib/pipelineAutoSuggestion';
import './LookupColumnsTable.css';

interface LookupColumn {
  column: string;
  out_column_name: string;
}

interface LookupColumnsTableProps {
  value: LookupColumn[];
  onChange: (data: LookupColumn[]) => void;
  availableColumns: string[];
  disabled?: boolean;
  selectedSource?: any; // Selected source from lookup config
  lookupType?: string; // 'Column Based' or 'Literal'
  lookupData?: any[]; // Lookup data for Literal type
}

type UIVersion = 'v1' | 'v2';

export const LookupColumnsTable: React.FC<LookupColumnsTableProps> = ({
  value = [],
  onChange,
  availableColumns = [],
  disabled = false,
  selectedSource,
  lookupType,
  lookupData
}) => {
  const [uiVersion, setUiVersion] = useState<UIVersion>('v2');
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(value.map(item => item.column))
  );
  const [fetchedColumns, setFetchedColumns] = useState<string[]>([]);
  const [isLoadingColumns, setIsLoadingColumns] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Update selected columns when value changes
  React.useEffect(() => {
    setSelectedColumns(new Set(value.map(item => item.column)));
  }, [value]);

  // Fetch columns from selected source
  useEffect(() => {
    const fetchColumns = async () => {
      if (lookupType === 'Column Based' && selectedSource?.data_src_id) {
        setIsLoadingColumns(true);
        setError(null);
        try {
          const columns = await getColumnsForDataSource(selectedSource.data_src_id);
          setFetchedColumns(columns);
        } catch (err) {
          setError('Failed to fetch columns from selected source');
          console.error('Error fetching columns:', err);
        } finally {
          setIsLoadingColumns(false);
        }
      } else if (lookupType === 'Literal' && lookupData && lookupData.length > 0) {
        // For literal type, get columns from lookup data
        const columns = Object.keys(lookupData[0]);
        setFetchedColumns(columns);
      } else {
        setFetchedColumns([]);
      }
    };

    fetchColumns();
  }, [selectedSource, lookupType, lookupData]);

  // Get final available columns (prioritize fetched columns over passed availableColumns)
  const finalAvailableColumns = useMemo(() => {
    if (fetchedColumns.length > 0) {
      return fetchedColumns;
    }
    return availableColumns;
  }, [fetchedColumns, availableColumns]);

  // Filter columns based on search term
  const filteredColumns = useMemo(() => {
    if (!searchTerm) return finalAvailableColumns;
    return finalAvailableColumns.filter(column => 
      column.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [finalAvailableColumns, searchTerm]);

  const handleColumnToggle = (columnName: string, checked: boolean) => {
    const newSelectedColumns = new Set(selectedColumns);
    
    if (checked) {
      newSelectedColumns.add(columnName);
      // Add new entry to the form data
      const newEntry: LookupColumn = {
        column: columnName,
        out_column_name: columnName
      };
      onChange([...value, newEntry]);
    } else {
      newSelectedColumns.delete(columnName);
      // Remove entry from the form data
      const newValue = value.filter(item => item.column !== columnName);
      onChange(newValue);
    }
    
    setSelectedColumns(newSelectedColumns);
  };

  const handleOutputColumnNameChange = (columnName: string, newOutputName: string) => {
    const newValue = value.map(item => 
      item.column === columnName 
        ? { ...item, out_column_name: newOutputName }
        : item
    );
    onChange(newValue);
  };

  const handleRemoveColumn = (columnName: string) => {
    const newSelectedColumns = new Set(selectedColumns);
    newSelectedColumns.delete(columnName);
    setSelectedColumns(newSelectedColumns);
    
    const newValue = value.filter(item => item.column !== columnName);
    onChange(newValue);
  };

  // Render skeleton loading state
  const renderSkeletonLoader = () => (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-40 skeleton-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-20 skeleton-pulse"></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded skeleton-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md flex-1 skeleton-pulse"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16 skeleton-pulse"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Render Version 1 (Original Design)
  const renderVersionOne = () => {
    // Show loading state
    if (isLoadingColumns) {
      return (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-500 mb-2">Loading columns...</p>
          <p className="text-sm text-gray-400">
            Fetching columns from selected source
          </p>
        </div>
      );
    }

    // Show error state
    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-sm text-gray-400">
            Please check your source configuration and try again
          </p>
        </div>
      );
    }

    // If no available columns, show message
    if (!finalAvailableColumns || finalAvailableColumns.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No columns available</p>
          <p className="text-sm text-gray-400">
            {lookupType === 'Column Based' 
              ? 'Please select a data source in the lookup config tab'
              : 'Please add lookup data first'
            }
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
       

        {/* Available Columns Section */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-3">Available Columns</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {finalAvailableColumns.map((column) => (
              <div key={column} className="flex items-center space-x-2">
                <Checkbox
                  id={`column-${column}`}
                  checked={selectedColumns.has(column)}
                  onCheckedChange={(checked) => handleColumnToggle(column, checked as boolean)}
                  disabled={disabled}
                />
                <label
                  htmlFor={`column-${column}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {column}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Columns Configuration */}
        {selectedColumns.size > 0 && (
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">
                      Source Column
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">
                      Output Column Name
                    </th>
                    <th className="px-4 py-3 w-12 border-b"></th>
                  </tr>
                </thead>
                <tbody>
                  {value.map((item, index) => (
                    <tr key={item.column} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-b">
                        <span className="text-sm font-medium text-gray-900">
                          {item.column}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b">
                        <Input
                          value={item.out_column_name}
                          onChange={(e) => handleOutputColumnNameChange(item.column, e.target.value)}
                          className="h-8 text-sm"
                          disabled={disabled}
                          placeholder="Enter output column name"
                        />
                      </td>
                      <td className="px-4 py-3 border-b">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveColumn(item.column)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedColumns.size === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No columns selected</p>
            <p className="text-sm">Select columns from the available list above</p>
          </div>
        )}
      </div>
    );
  };

  // Add new column handler
  const handleAddNewColumn = () => {
    const newEntry: LookupColumn = {
      column: '',
      out_column_name: ''
    };
    onChange([...value, newEntry]);
  };

  // Update column selection from dropdown
  const handleColumnSelection = (index: number, columnName: string) => {
    const newValue = [...value];
    newValue[index] = {
      ...newValue[index],
      column: columnName,
      out_column_name: columnName // Auto-populate output name
    };
    onChange(newValue);
    
    // Update selected columns set
    const newSelectedColumns = new Set(selectedColumns);
    newSelectedColumns.add(columnName);
    setSelectedColumns(newSelectedColumns);
  };

  // Remove column by index
  const handleRemoveColumnByIndex = (index: number) => {
    const columnToRemove = value[index]?.column;
    if (columnToRemove) {
      const newSelectedColumns = new Set(selectedColumns);
      newSelectedColumns.delete(columnToRemove);
      setSelectedColumns(newSelectedColumns);
    }
    
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  // Render Version 2 (Enhanced Design)
  const renderVersionTwo = () => {
    // Show loading state with skeleton
    if (isLoadingColumns) {
      return renderSkeletonLoader();
    }

    // Show error state
    if (error) {
      return (
        <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
              <Database className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-red-900 dark:text-red-100">
              Connection Error
            </h3>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300 text-center max-w-md">
              {error}
            </p>
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 text-center">
              Please check your source configuration and try again
            </p>
          </CardContent>
        </Card>
      );
    }

    // If no available columns, show message
    if (!finalAvailableColumns || finalAvailableColumns.length === 0) {
      return (
        <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
              <Settings2 className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              No Columns Available
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
              {lookupType === 'Column Based' 
                ? 'Please select a data source in the lookup config tab to see available columns'
                : 'Please add lookup data first to see available columns'
              }
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Columns Configuration</CardTitle>
            <CardDescription>
              Select input columns and configure their output names
            </CardDescription>
          </CardHeader>
          <CardContent>
            {value.length > 0 ? (
              <div className="space-y-4">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 pb-3 border-b border-border/40">
                  <div className="col-span-4">
                    <span className="text-sm font-semibold text-foreground">Input Column</span>
                  </div>
                  <div className="col-span-4">
                    <span className="text-sm font-semibold text-foreground">Select Column</span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-sm font-semibold text-foreground">Output Name</span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-sm font-semibold text-foreground">Actions</span>
                  </div>
                </div>
                
                {/* Table Rows */}
                {value.map((item, index) => (
                  <div
                    key={`${item.column}-${index}`}
                    className="grid grid-cols-12 gap-4 items-center p-4 rounded-lg border border-border/40 hover:border-border transition-colors lookup-columns-slide-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Input Column Display */}
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Input
                        </Badge>
                        <span className="text-sm font-medium text-foreground truncate">
                          {item.column || 'Not selected'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Select Column Dropdown */}
                    <div className="col-span-4">
                      <Select
                        value={item.column}
                        onValueChange={(value) => handleColumnSelection(index, value)}
                        disabled={disabled}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent style={{zIndex:9999}}>
                          {finalAvailableColumns.map((column) => (
                            <SelectItem key={column} value={column}>
                              <div className="flex items-center gap-2">
                                <Database className="h-3 w-3 text-muted-foreground" />
                                <span>{column}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Output Name Input */}
                    <div className="col-span-3">
                      <Input
                        value={item.out_column_name}
                        onChange={(e) => handleOutputColumnNameChange(item.column, e.target.value)}
                        className="h-9 text-sm"
                        disabled={disabled}
                        placeholder="Output name..."
                      />
                    </div>
                    
                    {/* Actions */}
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveColumnByIndex(index)}
                        className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        disabled={disabled}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove column</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="rounded-full bg-muted p-3 mx-auto w-fit">
                  <PlusCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No Columns Configured</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
                  Click "Add Column" to start configuring your lookup columns
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddNewColumn}
                  className="mt-4"
                  disabled={disabled}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Your First Column
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Version Selector */}
      <div className="flex justify-end">
        <Select value={uiVersion} onValueChange={(value: UIVersion) => setUiVersion(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{zIndex:9999}}>
            <SelectItem value="v1">Version 1</SelectItem>
            <SelectItem value="v2">Version 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Render selected version */}
      {uiVersion === 'v1' ? renderVersionOne() : renderVersionTwo()}
    </div>
  );
};