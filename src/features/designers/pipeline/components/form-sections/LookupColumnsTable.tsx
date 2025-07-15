import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Loader2, Plus, Edit2, Save, X } from 'lucide-react';
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
  onLookupDataChange?: (data: any[]) => void; // Callback to update lookup data
}

export const LookupColumnsTable: React.FC<LookupColumnsTableProps> = ({
  value = [],
  onChange,
  availableColumns = [],
  disabled = false,
  selectedSource,
  lookupType,
  lookupData,
  onLookupDataChange
}) => {
  // Debug props to understand why button might not be visible
  console.log('LookupColumnsTable props:', {
    lookupType,
    hasOnLookupDataChange: !!onLookupDataChange,
    lookupDataLength: lookupData?.length || 0,
    disabled
  });
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(value.map(item => item.column))
  );
  const [fetchedColumns, setFetchedColumns] = useState<string[]>([]);
  const [isLoadingColumns, setIsLoadingColumns] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddColumnInput, setShowAddColumnInput] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingRowData, setEditingRowData] = useState<any>({});

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
        
        // Clean up lookup_columns to remove columns that no longer exist in lookup data
        if (value.length > 0) {
          const validColumns = new Set(columns);
          const invalidColumns = value.filter(item => !validColumns.has(item.column));
          
          // Only update if there are invalid columns to remove
          if (invalidColumns.length > 0) {
            const filteredLookupColumns = value.filter(item => validColumns.has(item.column));
            console.log('Cleaning up invalid lookup_columns:', {
              original: value,
              invalidColumns: invalidColumns.map(item => item.column),
              filtered: filteredLookupColumns,
              availableColumns: columns
            });
            onChange(filteredLookupColumns);
          }
        }
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

  // Additional cleanup effect that runs when finalAvailableColumns change
  useEffect(() => {
    if (lookupType === 'Literal' && finalAvailableColumns.length > 0 && value.length > 0) {
      const validColumns = new Set(finalAvailableColumns);
      const invalidColumns = value.filter(item => !validColumns.has(item.column));
      
      // Only update if there are invalid columns to remove
      if (invalidColumns.length > 0) {
        const filteredLookupColumns = value.filter(item => validColumns.has(item.column));
        console.log('Additional cleanup of invalid lookup_columns:', {
          original: value,
          invalidColumns: invalidColumns.map(item => item.column),
          filtered: filteredLookupColumns,
          availableColumns: finalAvailableColumns
        });
        onChange(filteredLookupColumns);
      }
    }
  }, [finalAvailableColumns, lookupType]);



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

  // Add new column to lookup data (for literal type)
  const handleAddNewColumn = () => {
    if (lookupType === 'Literal' && onLookupDataChange && lookupData) {
      const existingColumns = finalAvailableColumns;
      let columnIndex = 1;
      let defaultColumnName = `column${columnIndex}`;
      
      // Find a unique column name
      while (existingColumns.includes(defaultColumnName)) {
        columnIndex++;
        defaultColumnName = `column${columnIndex}`;
      }
      
      // Add the new column to all existing rows with empty value
      const updatedLookupData = lookupData.map(row => ({
        ...row,
        [defaultColumnName]: ''
      }));
      
      // If no data exists, create first row with the new column
      if (updatedLookupData.length === 0) {
        updatedLookupData.push({ [defaultColumnName]: '' });
      }
      
      onLookupDataChange(updatedLookupData);
    }
  };

  // Add custom column with user-specified name
  const handleAddCustomColumn = () => {
    if (lookupType === 'Literal' && onLookupDataChange && newColumnName.trim()) {
      const trimmedColumnName = newColumnName.trim();
      const existingColumns = finalAvailableColumns;
      
      // Validate column name
      if (trimmedColumnName.length === 0) {
        setError('Column name cannot be empty');
        return;
      }
      
      // Check for invalid characters (basic validation)
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedColumnName)) {
        setError('Column name must start with a letter or underscore and contain only letters, numbers, and underscores');
        return;
      }
      
      // Check if column name already exists
      if (existingColumns.includes(trimmedColumnName)) {
        setError(`Column "${trimmedColumnName}" already exists`);
        return;
      }
      
      // Clear any previous errors
      setError(null);
      
      // Add the new column to all existing rows with empty value
      const currentData = lookupData || [];
      let updatedLookupData = currentData.map(row => ({
        ...row,
        [trimmedColumnName]: ''
      }));
      
      // If no data exists, create first row with the new column
      if (updatedLookupData.length === 0) {
        updatedLookupData.push({ [trimmedColumnName]: '' });
      }
      
      // Auto-cleanup: Remove default columns (column1, column2, etc.) if they exist and are empty
      // This helps clean up the initial default columns when users add meaningful columns
      const defaultColumnPattern = /^column\d+$/;
      updatedLookupData = updatedLookupData.map(row => {
        const cleanedRow = { ...row };
        Object.keys(cleanedRow).forEach(key => {
          if (defaultColumnPattern.test(key)) {
            // Check if this default column is empty across all rows
            const isEmptyAcrossAllRows = updatedLookupData.every(r => !r[key] || r[key].trim() === '');
            if (isEmptyAcrossAllRows) {
              delete cleanedRow[key];
            }
          }
        });
        return cleanedRow;
      });
      
      onLookupDataChange(updatedLookupData);
      
      // Reset the input state
      setNewColumnName('');
      setShowAddColumnInput(false);
    }
  };

  // Cancel adding custom column
  const handleCancelAddColumn = () => {
    setNewColumnName('');
    setShowAddColumnInput(false);
    setError(null);
  };

  // Remove column from lookup data (for literal type)
  const handleRemoveColumnFromLookupData = (columnName: string) => {
    if (lookupType === 'Literal' && onLookupDataChange && lookupData) {
      // Remove the column from all rows
      const updatedLookupData = lookupData.map(row => {
        const { [columnName]: removed, ...rest } = row;
        return rest;
      });
      
      onLookupDataChange(updatedLookupData);
      
      // Also remove from selected columns
      handleRemoveColumn(columnName);
    }
  };

  // Add new row to lookup data (for literal type)
  const handleAddNewRow = () => {
    console.log('handleAddNewRow called', { 
      lookupType, 
      onLookupDataChange: !!onLookupDataChange, 
      finalAvailableColumns: finalAvailableColumns.length,
      currentLookupData: lookupData?.length || 0
    });
    
    if (lookupType === 'Literal' && onLookupDataChange) {
      // Create a new row with empty values for all existing columns
      const newRow: any = {};
      finalAvailableColumns.forEach(column => {
        newRow[column] = '';
      });
      
      console.log('Creating new row:', newRow);
      
      // Add the new row to lookup data (handle case when lookupData is empty/undefined)
      const currentData = lookupData || [];
      const updatedLookupData = [...currentData, newRow];
      
      console.log('Calling onLookupDataChange with:', updatedLookupData);
      onLookupDataChange(updatedLookupData);
      
      // Start editing the new row
      setEditingRowIndex(updatedLookupData.length - 1);
      setEditingRowData(newRow);
    } else {
      console.log('Conditions not met for adding row:', {
        isLiteral: lookupType === 'Literal',
        hasCallback: !!onLookupDataChange
      });
    }
  };

  // Start editing a row
  const handleEditRow = (rowIndex: number) => {
    if (lookupData && lookupData[rowIndex]) {
      setEditingRowIndex(rowIndex);
      setEditingRowData({ ...lookupData[rowIndex] });
    }
  };

  // Save edited row
  const handleSaveRow = () => {
    if (lookupType === 'Literal' && onLookupDataChange && lookupData && editingRowIndex !== null) {
      const updatedLookupData = [...lookupData];
      updatedLookupData[editingRowIndex] = { ...editingRowData };
      onLookupDataChange(updatedLookupData);
      
      // Reset editing state
      setEditingRowIndex(null);
      setEditingRowData({});
    }
  };

  // Cancel editing row
  const handleCancelEditRow = () => {
    setEditingRowIndex(null);
    setEditingRowData({});
  };

  // Update cell value during editing
  const handleCellValueChange = (column: string, value: string) => {
    setEditingRowData(prev => ({
      ...prev,
      [column]: value
    }));
  };

  // Delete a row
  const handleDeleteRow = (rowIndex: number) => {
    if (lookupType === 'Literal' && onLookupDataChange && lookupData) {
      const updatedLookupData = lookupData.filter((_, index) => index !== rowIndex);
      onLookupDataChange(updatedLookupData);
      
      // If we were editing this row, cancel editing
      if (editingRowIndex === rowIndex) {
        setEditingRowIndex(null);
        setEditingRowData({});
      }
    }
  };

  // Main render function
  const renderTable = () => {
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

    // Show error state (only for loading errors, not custom column validation errors)
    if (error && !error.includes('already exists') && !error.includes('Column name')) {
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
        {/* Columns Configuration Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              {lookupType === 'Literal' ? 'Select Columns from Lookup Data' : 'Available Columns Configuration'}
            </h4>
            {lookupType === 'Literal' && onLookupDataChange && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddNewColumn}
                  disabled={disabled || showAddColumnInput || editingRowIndex !== null}
                  className="h-8 px-3 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Quick Add
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddColumnInput(true)}
                  disabled={disabled || showAddColumnInput || editingRowIndex !== null}
                  className="h-8 px-3 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Custom Column
                </Button>
              </div>
            )}
          </div>
          
          {/* Custom Column Input */}
          {lookupType === 'Literal' && onLookupDataChange && showAddColumnInput && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Input
                  value={newColumnName}
                  onChange={(e) => {
                    setNewColumnName(e.target.value);
                    // Clear error when user starts typing
                    if (error && (error.includes('already exists') || error.includes('Column name'))) {
                      setError(null);
                    }
                  }}
                  placeholder="Enter column name"
                  className="h-8 text-sm flex-1"
                  disabled={disabled}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomColumn();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      handleCancelAddColumn();
                    }
                  }}
                  autoFocus
                />
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleAddCustomColumn}
                  disabled={disabled || !newColumnName.trim()}
                  className="h-8 px-3 text-xs"
                >
                  Add
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelAddColumn}
                  disabled={disabled}
                  className="h-8 px-3 text-xs"
                >
                  Cancel
                </Button>
              </div>
              {/* Show custom column validation error */}
              {error && (error.includes('already exists') || error.includes('Column name')) && (
                <div className="text-sm text-red-600 px-3">
                  {error}
                </div>
              )}
            </div>
          )}
          <div className="border rounded-lg overflow-hidden bg-white lookup-columns-fade-in">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b w-12">
                      Select
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">
                      {lookupType === 'Literal' ? 'Lookup Data Columns' : 'Available Columns'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">
                      Source Column
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">
                      Output Column Name
                    </th>
                    {lookupType === 'Literal' && onLookupDataChange && (
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b w-12">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {finalAvailableColumns.map((column, index) => {
                    const isSelected = selectedColumns.has(column);
                    const selectedItem = value.find(item => item.column === column);
                    
                    return (
                      <tr 
                        key={column} 
                        className={`hover:bg-gray-50 transition-colors lookup-columns-slide-in ${isSelected ? 'bg-blue-50' : ''}`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-4 py-3 border-b">
                          <Checkbox
                            id={`column-${column}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => handleColumnToggle(column, checked as boolean)}
                            disabled={disabled}
                          />
                        </td>
                        <td className="px-4 py-3 border-b">
                          <label
                            htmlFor={`column-${column}`}
                            className="text-sm font-medium text-gray-900 cursor-pointer"
                          >
                            {column}
                          </label>
                        </td>
                        <td className="px-4 py-3 border-b">
                          {isSelected && (
                            <span className="text-sm font-medium text-gray-900 lookup-columns-fade-in">
                              {column}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 border-b">
                          {isSelected && (
                            <Input
                              value={selectedItem?.out_column_name || ''}
                              onChange={(e) => handleOutputColumnNameChange(column, e.target.value)}
                              className="h-8 text-sm lookup-columns-scale-in"
                              disabled={disabled}
                              placeholder="Enter output column name"
                            />
                          )}
                        </td>
                        {lookupType === 'Literal' && onLookupDataChange && (
                          <td className="px-4 py-3 border-b">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveColumnFromLookupData(column)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              disabled={disabled}
                              title="Remove column from lookup data"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  
                  {/* Add Column Row - Only for Literal type */}
                  {lookupType === 'Literal' && onLookupDataChange && (
                    <tr className="bg-gray-50 hover:bg-gray-100 transition-colors">
                      <td className="px-4 py-3 border-b"></td>
                      <td className="px-4 py-3 border-b" colSpan={lookupType === 'Literal' && onLookupDataChange ? 3 : 2}>
                        {showAddColumnInput ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={newColumnName}
                              onChange={(e) => {
                                setNewColumnName(e.target.value);
                                // Clear error when user starts typing
                                if (error && (error.includes('already exists') || error.includes('Column name'))) {
                                  setError(null);
                                }
                              }}
                              placeholder="Enter new column name"
                              className="h-8 text-sm flex-1"
                              disabled={disabled}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddCustomColumn();
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  handleCancelAddColumn();
                                }
                              }}
                              autoFocus
                            />
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              onClick={handleAddCustomColumn}
                              disabled={disabled || !newColumnName.trim()}
                              className="h-8 px-3 text-xs"
                            >
                              Add
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelAddColumn}
                              disabled={disabled}
                              className="h-8 px-3 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAddNewColumn}
                              disabled={disabled || editingRowIndex !== null}
                              className="h-8 px-3 text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Quick Add Column
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowAddColumnInput(true)}
                              disabled={disabled || editingRowIndex !== null}
                              className="h-8 px-3 text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Custom Column
                            </Button>
                          </div>
                        )}
                      </td>
                      {lookupType === 'Literal' && onLookupDataChange && (
                        <td className="px-4 py-3 border-b"></td>
                      )}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Show custom column validation error for inline input */}
          {lookupType === 'Literal' && onLookupDataChange && showAddColumnInput && error && (error.includes('already exists') || error.includes('Column name')) && (
            <div className="text-sm text-red-600 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
        </div>

       
        {/* Add Row Button - Only for Literal type */}
        {(() => {
          const shouldShowButton = lookupType === 'Literal' && onLookupDataChange;
          console.log('Add Row Button visibility check:', {
            lookupType,
            isLiteral: lookupType === 'Literal',
            hasCallback: !!onLookupDataChange,
            shouldShowButton,
            finalAvailableColumnsLength: finalAvailableColumns.length
          });
          return shouldShowButton;
        })() && (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={handleAddNewRow}
              disabled={disabled || finalAvailableColumns.length === 0 || editingRowIndex !== null}
              className="h-10 px-6 text-sm font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              {lookupData && lookupData.length > 0 ? 'Add Another Row' : 'Add First Row'}
            </Button>
          </div>
        )}

        {/* Message when no columns exist */}
        {lookupType === 'Literal' && onLookupDataChange && finalAvailableColumns.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">Add columns first using the "Add Column" button above</p>
          </div>
        )}

        {/* Summary */}
        {selectedColumns.size > 0 && (
          <div className="text-sm text-gray-600 lookup-columns-fade-in">
            <p>{selectedColumns.size} column{selectedColumns.size !== 1 ? 's' : ''} selected</p>
          </div>
        )}

        {selectedColumns.size === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">Select columns from the table above to configure lookup</p>
          </div>
        )}
      </div>
    );
  };

  return renderTable();
};