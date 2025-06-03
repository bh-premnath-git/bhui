import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SearchableDropdown from '@/components/ui/SearchableDropdown';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { Table, Pencil, Trash2 } from 'lucide-react';

// Mock data for connections, tables, columns, and logos
const mockConnections = [
  { id: '1', name: 'Postgres DB', type: 'postgres', logo: '🟦' },
  { id: '2', name: 'AWS S3', type: 's3', logo: '🟧' },
  { id: '3', name: 'BigQuery', type: 'bigquery', logo: '🟩' },
  { id: '4', name: 'CRM_DB', type: 'crm', logo: '🟪' },
  { id: '5', name: 'SALES_DB', type: 'sales', logo: '🟥' },
];
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
  targetDataType: string;
  sourceConnection: string;
  sourceTable: string;
  sourceColumns: string[];
  businessRule: string;
  technicalRule: string;
  joinDetails: string;
};

const emptyMapping: Mapping = {
  targetTable: '',
  targetColumn: '',
  targetDataType: '',
  sourceConnection: '',
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
  if (!mapping.targetDataType) errors.targetDataType = 'Target Data Type is required';
  if (!mapping.sourceConnection) errors.sourceConnection = 'Source Connection is required';
  if (!mapping.sourceTable) errors.sourceTable = 'Source Table is required';
  if (!mapping.sourceColumns || mapping.sourceColumns.length === 0) errors.sourceColumns = 'At least one Source Column is required';
  if (!mapping.businessRule) errors.businessRule = 'Business Rule is required';
  // technicalRule is auto-generated
  return errors;
};

const RequirementForm: React.FC = () => {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newMapping, setNewMapping] = useState<Mapping>(emptyMapping);
  const [errors, setErrors] = useState<Partial<Record<keyof Mapping, string>>>({});
  const [pipelineName, setPipelineName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [formErrors, setFormErrors] = useState<{ [k: string]: string }>({});
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('output');

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
    setFormErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    // Submit logic here
    alert('Requirement submitted!');
  };

  const handleAddMapping = () => {
    const validation = validateMapping(newMapping);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    if (editIndex !== null) {
      const updated = [...mappings];
      updated[editIndex] = { ...newMapping };
      setMappings(updated);
      setEditIndex(null);
    } else {
      setMappings([...mappings, { ...newMapping }]);
    }
    setShowModal(false);
    setNewMapping(emptyMapping);
    setErrors({});
  };

  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    setNewMapping(mappings[idx]);
    setShowModal(true);
    setErrors({});
  };

  const handleDelete = (idx: number) => {
    setMappings(mappings.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-7xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">New Pipeline Requirement</h1>
      {/* Project & Pipeline Info */}
      <div className="mb-6 bg-white rounded-xl shadow border">
        <button
          className="w-full flex items-center justify-between px-4 py-2 text-left font-semibold text-primary bg-gray-50 rounded-t-xl focus:outline-none"
          onClick={() => setDetailsOpen((v) => !v)}
        >
          <span>Pipeline & Project Details</span>
          <span className="ml-2 text-xs text-muted-foreground">
            {detailsOpen ? '▲' : '▼'}
          </span>
        </button>
        {detailsOpen ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 px-4 py-4">
            <div>
              <label className="block font-medium mb-1">Pipeline Name</label>
              <Input value={pipelineName} onChange={e => setPipelineName(e.target.value)} placeholder="Enter pipeline name" />
              {formErrors.pipelineName && <div className="text-xs text-red-500 mt-1">{formErrors.pipelineName}</div>}
            </div>
            <div>
              <label className="block font-medium mb-1">Project Name</label>
              <Input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Enter project name" />
              {formErrors.projectName && <div className="text-xs text-red-500 mt-1">{formErrors.projectName}</div>}
            </div>
          </div>
        ) : (
          <div className="px-4 py-2 text-muted-foreground text-sm">
            <span className="font-semibold">Pipeline:</span> {pipelineName || <span className="italic">(not set)</span>}<br />
            <span className="font-semibold">Project:</span> {projectName || <span className="italic">(not set)</span>}
          </div>
        )}
      </div>
      <div className="mb-4 flex justify-between items-center">
        <span className="text-muted-foreground">Define your pipeline mappings below</span>
        <Button onClick={() => { setShowModal(true); setEditIndex(null); setNewMapping(emptyMapping); }}>+ Add Mapping</Button>
      </div>
      {/* Mapping Table */}
      <div className="bg-white rounded-xl shadow border p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Table className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Mappings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-xs md:text-sm">
            {mappings.length > 0 && (
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-2 py-1">S.No</th>
                  <th className="border px-2 py-1">Target Table</th>
                  <th className="border px-2 py-1">Target Column</th>
                  <th className="border px-2 py-1">Target Data Type</th>
                  <th className="border px-2 py-1">Source Connection</th>
                  <th className="border px-2 py-1">Source Table(s)</th>
                  <th className="border px-2 py-1">Source Column(s)</th>
                  <th className="border px-2 py-1">Business Rule</th>
                  <th className="border px-2 py-1">Technical Rule</th>
                  <th className="border px-2 py-1">Join/Lookup Details</th>
                  <th className="border px-2 py-1">Actions</th>
                </tr>
              </thead>
            )}
            <tbody>
              {mappings.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <span style={{ fontSize: 48 }}>🗂️</span>
                      <div className="text-lg font-semibold text-gray-500">No mappings added yet</div>
                      <div className="text-sm text-gray-400 mb-2">Start by clicking <b>+ Add Mapping</b> to define your first pipeline mapping.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                mappings.map((m, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1 text-center">{idx + 1}</td>
                    <td className="border px-2 py-1">{m.targetTable}</td>
                    <td className="border px-2 py-1">{m.targetColumn}</td>
                    <td className="border px-2 py-1">{m.targetDataType}</td>
                    <td className="border px-2 py-1">{m.sourceConnection}</td>
                    <td className="border px-2 py-1">{m.sourceTable}</td>
                    <td className="border px-2 py-1">{Array.isArray(m.sourceColumns) ? m.sourceColumns.join(', ') : m.sourceColumns}</td>
                    <td className="border px-2 py-1">{m.businessRule}</td>
                    <td className="border px-2 py-1">{m.technicalRule}</td>
                    <td className="border px-2 py-1">{m.joinDetails}</td>
                    <td className="border px-2 py-1">
                      <button
                        className="p-1 rounded hover:bg-gray-100 text-primary"
                        onClick={() => handleEdit(idx)}
                        aria-label="Edit Mapping"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-red-50 text-red-600 ml-1"
                        onClick={() => handleDelete(idx)}
                        aria-label="Delete Mapping"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-8 flex justify-end">
          <Button variant="default" onClick={handleSubmit} disabled={mappings.length === 0}>Submit Requirement</Button>
        </div>
      </div>
      {/* Tabbed Sample Data & Pipeline View */}
      <div className="bg-white rounded-xl shadow border p-4 mb-8">
        <div className="flex gap-2 border-b mb-4">
          <button
            className={`px-3 py-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'output' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}
            onClick={() => setActiveTab('output')}
          >
            Output Data
          </button>
          {uniqueSourceTables.map(tbl => (
            <button
              key={tbl}
              className={`px-3 py-1 text-sm font-medium border-b-2 transition-colors ${activeTab === `table-${tbl}` ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}
              onClick={() => setActiveTab(`table-${tbl}`)}
            >
              {tbl} Table
            </button>
          ))}
          <button
            className={`px-3 py-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pipeline' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}
            onClick={() => setActiveTab('pipeline')}
          >
            Pipeline View
          </button>
        </div>
        {/* Tab Content */}
        {activeTab === 'output' && (
          <div>
            <div className="font-semibold mb-2">Sample Output Data</div>
            {outputColumns.length === 0 ? (
              <div className="text-gray-400 text-sm">No output columns defined yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-xs md:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {outputColumns.map(col => (
                        <th key={col} className="border px-2 py-1">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {outputSampleRows.map((row, i) => (
                      <tr key={i}>
                        {outputColumns.map(col => (
                          <td key={col} className="border px-2 py-1">{row[col]}</td>
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
          activeTab === `table-${tbl}` ? (
            <div key={tbl}>
              <div className="font-semibold mb-2">Sample Data: {tbl} Table</div>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-xs md:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {tableSampleData[tbl].columns.map(col => (
                        <th key={col} className="border px-2 py-1">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableSampleData[tbl].rows.map((row, i) => (
                      <tr key={i}>
                        {tableSampleData[tbl].columns.map(col => (
                          <td key={col} className="border px-2 py-1">{row[col]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null
        ))}
        {activeTab === 'pipeline' && (
          <div>
            <div className="font-semibold mb-2">Pipeline View</div>
            <div style={{ width: '100%', height: 350 }}>
              <ReactFlow nodes={mappings.map((m, idx) => ({
                id: String(idx + 1),
                data: { label: m.targetColumn || `Mapping ${idx + 1}` },
                position: { x: idx * 200, y: 100 },
              }))} edges={mappings.length > 1
                ? mappings.slice(1).map((_, idx) => ({
                  id: `e${idx + 1}-${idx + 2}`,
                  source: String(idx + 1),
                  target: String(idx + 2),
                }))
                : []} fitView>
                <Background />
                <Controls />
              </ReactFlow>
            </div>
          </div>
        )}
      </div>
      {/* Add/Edit Mapping Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <style dangerouslySetInnerHTML={{
            __html: `
              .mapping-modal-container::-webkit-scrollbar {
                width: 8px !important;
                display: block !important;
              }
              .mapping-modal-container::-webkit-scrollbar-track {
                background: #f1f1f1 !important;
                border-radius: 4px !important;
              }
              .mapping-modal-container::-webkit-scrollbar-thumb {
                background: #888 !important;
                border-radius: 4px !important;
              }
              .mapping-modal-container::-webkit-scrollbar-thumb:hover {
                background: #555 !important;
              }
              .mapping-modal-container {
                scrollbar-width: thin !important;
                scrollbar-color: #888 #f1f1f1 !important;
              }
            `
          }} />
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-scroll mapping-modal-container"
          >
            <h2 className="text-lg font-bold mb-4">{editIndex !== null ? 'Edit' : 'Add'} Mapping</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Target Table</label>
                <SearchableDropdown
                  options={mockTables.map(tbl => ({ value: tbl.name, label: tbl.name }))}
                  value={newMapping.targetTable}
                  onChange={val => setNewMapping({ ...newMapping, targetTable: val })}
                  placeholder="Select table..."
                />
                {errors.targetTable && <div className="text-xs text-red-500 mt-1">{errors.targetTable}</div>}
              </div>
              <div>
                <label className="block font-medium mb-1">Target Column</label>
                <select className="w-full border rounded p-2" value={newMapping.targetColumn} onChange={e => setNewMapping({ ...newMapping, targetColumn: e.target.value })}>
                  <option value="">Select column...</option>
                  {mockColumns.map(col => (
                    <option key={col.id} value={col.name}>{col.name}</option>
                  ))}
                  <option value="new">+ Add new column</option>
                </select>
                {errors.targetColumn && <div className="text-xs text-red-500 mt-1">{errors.targetColumn}</div>}
              </div>
              <div>
                <label className="block font-medium mb-1">Target Data Type</label>
                <select className="w-full border rounded p-2" value={newMapping.targetDataType} onChange={e => setNewMapping({ ...newMapping, targetDataType: e.target.value })}>
                  <option value="">Select data type...</option>
                  {mockDataTypes.map(dt => (
                    <option key={dt} value={dt}>{dt}</option>
                  ))}
                </select>
                {errors.targetDataType && <div className="text-xs text-red-500 mt-1">{errors.targetDataType}</div>}
              </div>
              <div>
                <label className="block font-medium mb-1">Source Connection</label>
                <SearchableDropdown
                  options={mockConnections.map(conn => ({ value: conn.name, label: conn.name, logo: conn.logo }))}
                  value={newMapping.sourceConnection}
                  onChange={val => setNewMapping({ ...newMapping, sourceConnection: val })}
                  placeholder="Select connection..."
                />
                {errors.sourceConnection && <div className="text-xs text-red-500 mt-1">{errors.sourceConnection}</div>}
              </div>
              <div>
                <label className="block font-medium mb-1">Source Table</label>
                <SearchableDropdown
                  options={mockTables.map(tbl => ({ value: tbl.name, label: tbl.name }))}
                  value={newMapping.sourceTable}
                  onChange={val => setNewMapping({ ...newMapping, sourceTable: val })}
                  placeholder="Select table..."
                />
                {errors.sourceTable && <div className="text-xs text-red-500 mt-1">{errors.sourceTable}</div>}
              </div>
              <div>
                <label className="block font-medium mb-1">Source Column(s)</label>
                <select multiple className="w-full border rounded p-2 h-24" value={newMapping.sourceColumns} onChange={e => setNewMapping({ ...newMapping, sourceColumns: Array.from(e.target.selectedOptions, opt => opt.value) })}>
                  {mockColumns.map(col => (
                    <option key={col.id} value={col.name}>{col.name}</option>
                  ))}
                </select>
                <div className="text-xs text-muted-foreground mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple columns.</div>
                {errors.sourceColumns && <div className="text-xs text-red-500 mt-1">{errors.sourceColumns}</div>}
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium mb-1">Business Rule</label>
                <textarea
                  className="w-full border rounded p-2 min-h-[60px]"
                  value={newMapping.businessRule}
                  onChange={e => {
                    const businessRule = e.target.value;
                    // Simple auto-generation logic for technical rule
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
                    setNewMapping({ ...newMapping, businessRule, technicalRule });
                  }}
                  placeholder="Describe the business rule for this mapping (e.g. Direct mapping, Convert to uppercase, Format date, etc.)"
                />
                {errors.businessRule && <div className="text-xs text-red-500 mt-1">{errors.businessRule}</div>}
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium mb-1">Technical Rule (auto-generated)</label>
                <textarea
                  className="w-full border rounded p-2 min-h-[60px] bg-gray-100"
                  value={newMapping.technicalRule}
                  readOnly
                  placeholder="Technical rule will be generated from business rule."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium mb-1">Join/Lookup Details</label>
                <Input value={newMapping.joinDetails} onChange={e => setNewMapping({ ...newMapping, joinDetails: e.target.value })} placeholder="e.g. INNER JOIN on orders.customer_id = customers.customer_id" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => { setShowModal(false); setEditIndex(null); setNewMapping(emptyMapping); setErrors({}); }}>Cancel</Button>
              <Button variant="default" onClick={handleAddMapping}>{editIndex !== null ? 'Save Changes' : 'Add Mapping'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementForm;