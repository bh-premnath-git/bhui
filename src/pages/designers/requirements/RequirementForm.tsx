import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { Table, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';

const mockTables = [
  { id: '1', name: 'customers' },
  { id: '2', name: 'orders' },
  { id: '3', name: 'products' },
  { id: '4', name: 'returns' },
  { id: '5', name: 'product_master' },
  { id: '6', name: 'product_csv' },
  { id: '7', name: 'category_lookup' },
];
const mockColumns = [
  { id: '1', name: 'customer_id' },
  { id: '2', name: 'name' },
  { id: '3', name: 'date_of_birth' },
  { id: '4', name: 'first_name' },
  { id: '5', name: 'last_name' },
  { id: '6', name: 'order_id' },
  { id: '7', name: 'order_date' },
  { id: '8', name: 'order_amount' },
  { id: '9', name: 'category_code' },
  { id: '10', name: 'category' },
  { id: '11', name: 'product_name' },
  { id: '12', name: 'return_flag' },
  { id: '13', name: '*' },
];
const mockDataTypes = ['INT', 'VARCHAR', 'DATE', 'DECIMAL(10,2)', 'CHAR(1)', '-'];

type Mapping = {
  targetTable: string;
  targetColumn: string;
  sourceTable: string;
  sourceColumns: string[];
  businessRule: string;
  technicalRule: string;
  joinDetails: string;
};

const emptyMapping: Mapping = {
  targetTable: '',
  targetColumn: '',
  sourceTable: '',
  sourceColumns: [],
  businessRule: '',
  technicalRule: '',
  joinDetails: '',
};

const validateMapping = (mapping: Mapping) => {
  const errors: Partial<Record<keyof Mapping, string>> = {};
  if (!mapping.targetTable) errors.targetTable = 'Target Table is required';
  if (!mapping.targetColumn) errors.targetColumn = 'Target Column is required';
  if (!mapping.sourceTable) errors.sourceTable = 'Source Table is required';
  if (!mapping.sourceColumns || mapping.sourceColumns.length === 0) errors.sourceColumns = 'At least one Source Column is required';
  if (!mapping.businessRule) errors.businessRule = 'Business Rule is required';
  // technicalRule is auto-generated
  return errors;
};

const RequirementForm: React.FC = () => {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [editingRows, setEditingRows] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Record<number, Partial<Record<keyof Mapping, string>>>>({});
  const [formErrors, setFormErrors] = useState<{ [k: string]: string }>({});
  const [activeTab, setActiveTab] = useState<string>('output');
  
  // Get pipeline name and project name from context
  const context = usePipelineContext();
  const { pipelineName: contextPipelineName, projectName: contextProjectName } = context;
  // Use context values if available, otherwise use local state
  const [localPipelineName, setLocalPipelineName] = useState('');
  const [localProjectName, setLocalProjectName] = useState('');
  
  const pipelineName = contextPipelineName || localPipelineName;
  const projectName = contextProjectName || localProjectName;
  useEffect(() => {
    if (contextPipelineName) {
      setLocalPipelineName(contextPipelineName);
    }
    if (contextProjectName) {
      setLocalProjectName(contextProjectName);
    }
  }, [contextPipelineName, contextProjectName]);



  // Multi-select component for source columns
  const MultiSelectColumns: React.FC<{
    value: string[];
    onValueChange: (value: string[]) => void;
    disabled?: boolean;
  }> = ({ value = [], onValueChange, disabled }) => {
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
                {value.slice(0, 2).map((columnName) => (
                  <Badge key={columnName} variant="secondary" className="text-xs">
                    {columnName}
                  </Badge>
                ))}
                {value.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{value.length - 2} more
                  </Badge>
                )}
              </div>
            ) : (
              "Select columns..."
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0">
          <div className="p-4 space-y-2">
            <div className="text-sm font-medium">Select Columns</div>
            {mockColumns.map((column) => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`column-${column.id}`}
                  checked={value.includes(column.name)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onValueChange([...value, column.name]);
                    } else {
                      onValueChange(value.filter(name => name !== column.name));
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

  // Generate mock sample data for output
  const generateSampleRows = (cols: string[], n = 5) => {
    return Array.from({ length: n }, (_, i) =>
      Object.fromEntries(cols.map(col => [col, `${col}_val${i + 1}`]))
    );
  };
  
  // Output columns: all target columns in mappings
  const outputColumns = mappings.map(m => m.targetColumn).filter(Boolean);
  const outputSampleRows = generateSampleRows(outputColumns);

  // Unique source tables from mappings
  const uniqueSourceTables = Array.from(new Set(mappings.map(m => m.sourceTable).filter(Boolean)));
  // Sample data for each source table
  const tableSampleData = uniqueSourceTables.reduce((acc, tbl) => {
    // Use mockColumns filtered by table name
    const columns = mockColumns.map(c => c.name); // fallback: all columns
    acc[tbl] = {
      columns,
      rows: generateSampleRows(columns),
    };
    return acc;
  }, {} as Record<string, { columns: string[]; rows: any[] }>);

  const handleSubmit = () => {
    const newErrors: { [k: string]: string } = {};
    if (!pipelineName.trim()) newErrors.pipelineName = 'Pipeline Name is required';
    if (!projectName.trim()) newErrors.projectName = 'Project Name is required';
    if (mappings.length === 0) newErrors.mappings = 'At least one mapping is required';
    
    // Validate all mappings
    const mappingErrors: Record<number, Partial<Record<keyof Mapping, string>>> = {};
    let hasErrors = false;
    
    mappings.forEach((mapping, idx) => {
      const validation = validateMapping(mapping);
      if (Object.keys(validation).length > 0) {
        mappingErrors[idx] = validation;
        hasErrors = true;
      }
    });
    
    setFormErrors(newErrors);
    setErrors(mappingErrors);
    
    if (Object.keys(newErrors).length > 0 || hasErrors) return;
    
    // Submit logic here
    alert('Requirement submitted!');
  };

  const handleAddMapping = () => {
    const newMapping = { ...emptyMapping };
    const newMappings = [...mappings, newMapping];
    setMappings(newMappings);
    
    // Set the new row to editing mode
    const newEditingRows = new Set(editingRows);
    newEditingRows.add(newMappings.length - 1);
    setEditingRows(newEditingRows);
  };

  const handleEdit = (idx: number) => {
    const newEditingRows = new Set(editingRows);
    newEditingRows.add(idx);
    setEditingRows(newEditingRows);
  };

  const handleSave = (idx: number) => {
    const validation = validateMapping(mappings[idx]);
    if (Object.keys(validation).length > 0) {
      setErrors(prev => ({ ...prev, [idx]: validation }));
      return;
    }
    
    // Remove from editing mode and clear errors
    const newEditingRows = new Set(editingRows);
    newEditingRows.delete(idx);
    setEditingRows(newEditingRows);
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[idx];
      return newErrors;
    });
  };

  const handleCancel = (idx: number) => {
    const newEditingRows = new Set(editingRows);
    newEditingRows.delete(idx);
    setEditingRows(newEditingRows);
    
    // Clear errors for this row
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[idx];
      return newErrors;
    });
  };

  const handleDelete = (idx: number) => {
    setMappings(mappings.filter((_, i) => i !== idx));
    
    // Remove from editing mode and clear errors
    const newEditingRows = new Set(editingRows);
    newEditingRows.delete(idx);
    setEditingRows(newEditingRows);
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[idx];
      return newErrors;
    });
  };

  const updateMapping = (idx: number, field: keyof Mapping, value: any) => {
    const newMappings = [...mappings];
    newMappings[idx] = { ...newMappings[idx], [field]: value };
    
    // Auto-generate technical rule when business rule changes
    if (field === 'businessRule') {
      const businessRule = value as string;
      let technicalRule = '';
      if (businessRule.toLowerCase().includes('direct')) {
        technicalRule = 'Direct Mapping';
      } else if (businessRule.toLowerCase().includes('uppercase')) {
        technicalRule = 'UPPER(<column>)';
      } else if (businessRule.toLowerCase().includes('date')) {
        technicalRule = 'TO_DATE(<column>, "YYYY-MM-DD")';
      } else if (businessRule.trim() === '') {
        technicalRule = '';
      } else {
        technicalRule = 'Custom logic generated from business rule';
      }
      newMappings[idx].technicalRule = technicalRule;
    }
    
    setMappings(newMappings);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Main Form */}
      <div className="space-y-4 mt-2">
        {/* Basic Details - Always Visible */}
        <div className="bg-card rounded-lg border p-4">
         
          
          {/* Mappings Header */}
          <div className="flex justify-between items-center ">
            <div>
              <h3 className="font-semibold text-sm">Data Mappings</h3>
              <p className="text-xs text-muted-foreground">Define how data flows from source to target</p>
            </div>
            <Button 
              size="sm"
              onClick={handleAddMapping}
            >
              + Add Mapping
            </Button>
          </div>
        </div>

        {/* Mappings Table */}
        <div className="bg-card rounded-lg border">
          {mappings.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="mb-4">
                <Table className="w-12 h-12 mx-auto opacity-50" />
              </div>
              <h3 className="font-medium mb-2">No mappings defined yet</h3>
              <p className="text-sm">Start by adding your first data mapping above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-sm">Target Table</th>
                    <th className="text-left p-3 font-medium text-sm">Target Column</th>
                    <th className="text-left p-3 font-medium text-sm">Source Table</th>
                    <th className="text-left p-3 font-medium text-sm">Source Columns</th>
                    <th className="text-left p-3 font-medium text-sm">Business Rule</th>
                    <th className="text-left p-3 font-medium text-sm">Technical Rule</th>
                    <th className="text-left p-3 font-medium text-sm">Join Details</th>
                    <th className="text-left p-3 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((mapping, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/30">
                      {editingRows.has(idx) ? (
                        <>
                          {/* Target Table */}
                          <td className="p-3">
                            <Select 
                              value={mapping.targetTable} 
                              onValueChange={val => updateMapping(idx, 'targetTable', val)}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Select table..." />
                              </SelectTrigger>
                              <SelectContent style={{zIndex: 9999}}>
                                {mockTables.map(tbl => (
                                  <SelectItem key={tbl.id} value={tbl.name}>{tbl.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors[idx]?.targetTable && (
                              <div className="text-xs text-destructive mt-1">{errors[idx].targetTable}</div>
                            )}
                          </td>

                          {/* Target Column */}
                          <td className="p-3">
                            <Select 
                              value={mapping.targetColumn} 
                              onValueChange={val => updateMapping(idx, 'targetColumn', val)}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Select column..." />
                              </SelectTrigger>
                              <SelectContent style={{zIndex: 9999}}>
                                {mockColumns.map(col => (
                                  <SelectItem key={col.id} value={col.name}>{col.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors[idx]?.targetColumn && (
                              <div className="text-xs text-destructive mt-1">{errors[idx].targetColumn}</div>
                            )}
                          </td>

                          {/* Source Table */}
                          <td className="p-3">
                            <Select 
                              value={mapping.sourceTable} 
                              onValueChange={val => updateMapping(idx, 'sourceTable', val)}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Select table..." />
                              </SelectTrigger>
                              <SelectContent style={{zIndex: 9999}}>
                                {mockTables.map(tbl => (
                                  <SelectItem key={tbl.id} value={tbl.name}>{tbl.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors[idx]?.sourceTable && (
                              <div className="text-xs text-destructive mt-1">{errors[idx].sourceTable}</div>
                            )}
                          </td>

                          {/* Source Columns */}
                          <td className="p-3">
                            <MultiSelectColumns
                              value={mapping.sourceColumns}
                              onValueChange={val => updateMapping(idx, 'sourceColumns', val)}
                              disabled={!mapping.sourceTable}
                            />
                            {errors[idx]?.sourceColumns && (
                              <div className="text-xs text-destructive mt-1">{errors[idx].sourceColumns}</div>
                            )}
                          </td>

                          {/* Business Rule */}
                          <td className="p-3">
                            <Input
                              value={mapping.businessRule}
                              onChange={e => updateMapping(idx, 'businessRule', e.target.value)}
                              placeholder="Business rule..."
                              className="h-8 text-sm"
                            />
                            {errors[idx]?.businessRule && (
                              <div className="text-xs text-destructive mt-1">{errors[idx].businessRule}</div>
                            )}
                          </td>

                          {/* Technical Rule (readonly) */}
                          <td className="p-3">
                            <Input
                              value={mapping.technicalRule}
                              readOnly
                              className="h-8 text-sm bg-muted"
                            />
                          </td>

                          {/* Join Details */}
                          <td className="p-3">
                            <Input
                              value={mapping.joinDetails}
                              onChange={e => updateMapping(idx, 'joinDetails', e.target.value)}
                              placeholder="Join details..."
                              className="h-8 text-sm"
                            />
                          </td>

                          {/* Actions */}
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-green-600 hover:bg-green-100"
                                onClick={() => handleSave(idx)}
                                title="Save"
                              >
                                ✓
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-600 hover:bg-red-100"
                                onClick={() => handleCancel(idx)}
                                title="Cancel"
                              >
                                ✕
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Display Mode */}
                          <td className="p-3 text-sm">{mapping.targetTable || '-'}</td>
                          <td className="p-3 text-sm">{mapping.targetColumn || '-'}</td>
                          <td className="p-3 text-sm">{mapping.sourceTable || '-'}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(mapping.sourceColumns) ? (
                                mapping.sourceColumns.slice(0, 2).map((col, colIdx) => (
                                  <Badge key={colIdx} variant="secondary" className="text-xs h-5">
                                    {col}
                                  </Badge>
                                ))
                              ) : (
                                <Badge variant="secondary" className="text-xs h-5">
                                  {mapping.sourceColumns || '-'}
                                </Badge>
                              )}
                              {Array.isArray(mapping.sourceColumns) && mapping.sourceColumns.length > 2 && (
                                <Badge variant="secondary" className="text-xs h-5">
                                  +{mapping.sourceColumns.length - 2}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-sm max-w-xs truncate" title={mapping.businessRule}>
                            {mapping.businessRule || '-'}
                          </td>
                          <td className="p-3 text-sm max-w-xs truncate" title={mapping.technicalRule}>
                            {mapping.technicalRule || '-'}
                          </td>
                          <td className="p-3 text-sm max-w-xs truncate" title={mapping.joinDetails}>
                            {mapping.joinDetails || '-'}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => handleEdit(idx)}
                                title="Edit"
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(idx)}
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Submit Button */}
          {mappings.length > 0 && (
            <div className="p-4 border-t flex justify-end">
              <Button onClick={handleSubmit} disabled={mappings.length === 0}>
                Submit Requirement
              </Button>
            </div>
          )}
        </div>

        {/* Preview Section - Only show if mappings exist */}
        {mappings.length > 0 && (
          <div className="bg-card rounded-lg border">
            <div className="border-b">
              <div className="flex gap-1 p-1">
                <button
                  className={`px-3 py-2 text-sm font-medium rounded transition-colors ${activeTab === 'output' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  onClick={() => setActiveTab('output')}
                >
                  Output Preview
                </button>
                {uniqueSourceTables.map(tbl => (
                  <button
                    key={tbl}
                    className={`px-3 py-2 text-sm font-medium rounded transition-colors ${activeTab === `table-${tbl}` ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => setActiveTab(`table-${tbl}`)}
                  >
                    {tbl}
                  </button>
                ))}
                <button
                  className={`px-3 py-2 text-sm font-medium rounded transition-colors ${activeTab === 'pipeline' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  onClick={() => setActiveTab('pipeline')}
                >
                  Pipeline
                </button>
              </div>
            </div>
            <div className="p-4">
              {activeTab === 'output' && (
                <div>
                  <h4 className="font-medium mb-3 text-sm">Expected Output Structure</h4>
                  {outputColumns.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No output columns defined yet.</p>
                  ) : (
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            {outputColumns.map(col => (
                              <th key={col} className="px-3 py-2 text-left font-medium">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {outputSampleRows.slice(0, 3).map((row, idx) => (
                            <tr key={idx} className="border-t">
                              {outputColumns.map(col => (
                                <td key={col} className="px-3 py-2 text-muted-foreground">{row[col] || '-'}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              
              {uniqueSourceTables.map(tbl => (
                activeTab === `table-${tbl}` && (
                  <div key={tbl}>
                    <h4 className="font-medium mb-3 text-sm">{tbl} Sample Data</h4>
                    {tableSampleData[tbl] ? (
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              {tableSampleData[tbl].columns.slice(0, 6).map(col => (
                                <th key={col} className="px-3 py-2 text-left font-medium">{col}</th>
                              ))}
                              {tableSampleData[tbl].columns.length > 6 && (
                                <th className="px-3 py-2 text-left font-medium text-muted-foreground">...</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {tableSampleData[tbl].rows.slice(0, 3).map((row, idx) => (
                              <tr key={idx} className="border-t">
                                {tableSampleData[tbl].columns.slice(0, 6).map(col => (
                                  <td key={col} className="px-3 py-2 text-muted-foreground">{row[col] || '-'}</td>
                                ))}
                                {tableSampleData[tbl].columns.length > 6 && (
                                  <td className="px-3 py-2 text-muted-foreground">...</td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No data available.</p>
                    )}
                  </div>
                )
              ))}
              
              {activeTab === 'pipeline' && (
                <div>
                  <h4 className="font-medium mb-3 text-sm">Pipeline Visualization</h4>
                  <div className="border rounded-md" style={{ height: 250 }}>
                    <ReactFlow 
                      nodes={mappings.map((m, idx) => ({
                        id: String(idx + 1),
                        data: { label: m.targetColumn || `Mapping ${idx + 1}` },
                        position: { x: idx * 200, y: 100 },
                      }))} 
                      edges={mappings.length > 1
                        ? mappings.slice(1).map((_, idx) => ({
                          id: `e${idx + 1}-${idx + 2}`,
                          source: String(idx + 1),
                          target: String(idx + 2),
                        }))
                        : []} 
                      fitView
                    >
                      <Background />
                      <Controls />
                    </ReactFlow>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequirementForm;