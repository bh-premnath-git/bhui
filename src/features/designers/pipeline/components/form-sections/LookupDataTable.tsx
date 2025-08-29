import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, X, Plus, Edit, Save, Check } from 'lucide-react';

interface LookupDataTableProps {
  value: any[];
  onChange: (data: any[]) => void;
  disabled?: boolean;
}

export const LookupDataTable: React.FC<LookupDataTableProps> = ({
  value = [],
  onChange,
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(true); // Start in edit mode
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState<string>('');

  // Extract columns from data
  const columns: string[] = useMemo(() => {
    if (!value || value.length === 0) return [];
    return Object.keys(value[0]);
  }, [value]);

  // Initialize with 2x2 table
  const initializeTable = () => {
    const initialData = [
      { column1: '', column2: '' },
      { column1: '', column2: '' }
    ];
    onChange(initialData);
  };

  const handleCellChange = (rowIndex: number, columnName: string, newValue: string) => {
    const newData = [...value];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [columnName]: newValue
    };
    onChange(newData);
  };

  const handleAddColumn = () => {
    const newColumnName = `column${columns.length + 1}`;
    const newData = value.map(row => ({
      ...row,
      [newColumnName]: ''
    }));
    onChange(newData);
  };

  const handleRemoveColumn = (columnName: string) => {
    if (columns.length <= 1) return; // Don't allow removing the last column
    
    const newData = value.map(row => {
      const { [columnName]: removed, ...rest } = row;
      return rest;
    });
    onChange(newData);
  };

  const handleAddRow = () => {
    const newRow = columns.reduce((acc, col) => {
      acc[col] = '';
      return acc;
    }, {} as any);
    onChange([...value, newRow]);
  };

  const handleRemoveRow = (rowIndex: number) => {
    if (value.length <= 1) return; // Don't allow removing the last row
    
    const newData = value.filter((_, index) => index !== rowIndex);
    onChange(newData);
  };

  const handleStartEditingColumn = (columnName: string) => {
    setEditingColumn(columnName);
    setEditingColumnName(columnName);
  };

  const handleSaveColumnName = () => {
    if (editingColumnName.trim() && editingColumn && editingColumnName !== editingColumn) {
      const newData = value.map(row => {
        const { [editingColumn]: oldValue, ...rest } = row;
        return {
          ...rest,
          [editingColumnName]: oldValue
        };
      });
      onChange(newData);
    }
    setEditingColumn(null);
    setEditingColumnName('');
  };

  const handleCancelEditingColumn = () => {
    setEditingColumn(null);
    setEditingColumnName('');
  };

  const handleSaveTable = () => {
    setIsEditing(false);
    setEditingColumn(null);
    setEditingColumnName('');
  };

  const handleEditTable = () => {
    setIsEditing(true);
  };

  // Check if table has any data
  const hasData = value.some(row => 
    Object.values(row).some(cellValue => cellValue && cellValue.toString().trim() !== '')
  );

  // If no data, show "Add lookup data" button
  if (!value || value.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No lookup data available</p>
        <Button
          type="button"
          variant="outline"
          onClick={initializeTable}
          disabled={disabled}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Lookup Data
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg font-medium">Lookup Data</h3>
        <div className="flex items-center space-x-2 flex-wrap">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddColumn}
                disabled={disabled}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Column
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRow}
                disabled={disabled}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
              
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleSaveTable}
                disabled={disabled || !hasData}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEditTable}
              disabled={disabled}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Custom Table with fixed height and scrollable content */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div 
          className="overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300"
          style={{ maxHeight: '500px', maxWidth: '100%' }}
        >
          <table className="w-full" style={{ minWidth: `${Math.max(columns.length * 180, 400)}px` }}>
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {columns.map((column, colIndex) => (
                  <th
                    key={column}
                    className="px-2 sm:px-4 py-3 text-left text-sm font-medium text-gray-900 border-b relative bg-gray-50"
                    style={{ minWidth: '150px' }}
                    onMouseEnter={() => isEditing && setHoveredColumn(column)}
                    onMouseLeave={() => setHoveredColumn(null)}
                  >
                    <div className="flex items-center justify-between">
                      {isEditing && editingColumn === column ? (
                        <div className="flex items-center space-x-2 w-full">
                          <Input
                            value={editingColumnName}
                            onChange={(e) => setEditingColumnName(e.target.value)}
                            onBlur={handleSaveColumnName}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveColumnName();
                              } else if (e.key === 'Escape') {
                                handleCancelEditingColumn();
                              }
                            }}
                            className="h-8 text-sm font-medium border-gray-300 bg-white px-2 flex-1 min-w-0"
                            disabled={disabled}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div
                          className={`flex-1 ${isEditing ? 'cursor-pointer' : ''}`}
                          onClick={() => isEditing && !disabled && handleStartEditingColumn(column)}
                        >
                          <span className="text-sm font-medium">{column}</span>
                        </div>
                      )}
                      {isEditing && hoveredColumn === column && columns.length > 1 && editingColumn !== column && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveColumn(column)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 ml-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-2 sm:px-4 py-3 w-12 border-b bg-gray-50"></th>
              </tr>
            </thead>
            <tbody>
              {value.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column} className="px-2 sm:px-4 py-3 border-b" style={{ minWidth: '150px' }}>
                      {isEditing ? (
                        <Input
                          value={row[column] || ''}
                          onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
                          className="h-8 text-sm w-full min-w-0"
                          disabled={disabled}
                          placeholder={`Enter ${column}`}
                        />
                      ) : (
                        <div className="h-8 flex items-center text-sm text-gray-900">
                          {row[column] || '-'}
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="px-2 sm:px-4 py-3 border-b">
                    {isEditing && value.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRow(rowIndex)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};