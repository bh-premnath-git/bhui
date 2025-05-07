import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import CommandPalette from './components/CommandPalette';
import {  ProcessedNote } from '@/types/data-catalog/notebook/note';
import { FilePlus2, ChevronLeft, GitBranch, Share2, Save, Code, PlusCircle, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNotes } from '@/context/datacatalog/NotebookContext';
import EditorToolbar from './components/EditorToolbar';
import { debounce } from '@/lib/debounce';
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

// Add new interfaces for pipeline requirements
interface DataSource {
  type: string;
  connection: string;
  description: string;
  schema?: string;
  table?: string;
  query?: string;
  validation?: string;
}

interface Transformation {
  id: string;
  type: string;
  description: string;
  rules: string[];
}

interface DQRule {
  id: string;
  type: string;
  column?: string;
  rule: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface DataTarget {
  type: string;
  connection: string;
  format?: string;
  path?: string;
  table?: string;
}

interface PipelineRequirement {
  id: string;
  version: number;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
  source: DataSource;
  transformations: Transformation[];
  dqRules: DQRule[];
  target: DataTarget;
  history: Array<{
    timestamp: string;
    version: number;
    changes: string;
  }>;
}

// Add interface for AI suggestions
interface AISuggestion {
  section: string;
  suggestion: string;
  confidence: number;
}

// Add these new interfaces
interface SourceTypeOption {
  label: string;
  value: string;
}

// Add template interfaces
interface TemplateSection {
  title: string;
  content: string;
}

interface SourceTemplate {
  type: string;
  sections: TemplateSection[];
}

// Add new interfaces for connection options
interface ConnectionOption {
  label: string;
  value: string;
  type: string; // to filter options based on source/target type
}

// Add connection options
const connectionOptions: ConnectionOption[] = [
  // Database connections
  { label: 'MySQL Production DB', value: 'mysql://prod-db:3306/main', type: 'database' },
  { label: 'PostgreSQL Data Warehouse', value: 'postgresql://dw.example.com:5432/dw', type: 'database' },
  { label: 'Oracle ERP System', value: 'oracle://erp.internal:1521/erp', type: 'database' },
  
  // File system connections
  { label: 'S3 Data Lake', value: 's3://data-lake/raw/', type: 'file' },
  { label: 'HDFS Cluster', value: 'hdfs://namenode:8020/data/', type: 'file' },
  { label: 'Azure Blob Storage', value: 'azure://storage/container/', type: 'file' },
  
  // API connections
  { label: 'Sales API', value: 'https://api.sales.com/v1', type: 'api' },
  { label: 'Customer Service API', value: 'https://api.support.com/v2', type: 'api' },
  { label: 'Analytics API', value: 'https://api.analytics.com/v1', type: 'api' },
  
  // Data Warehouse connections
  { label: 'Snowflake DW', value: 'snowflake://org-account/warehouse', type: 'warehouse' },
  { label: 'Redshift Cluster', value: 'redshift://cluster.region/db', type: 'warehouse' },
  { label: 'BigQuery Project', value: 'bigquery://project-id', type: 'warehouse' }
];

// Add template definitions
const sourceTemplates: Record<string, SourceTemplate> = {
  database: {
    type: 'Database',
    sections: [
      {
        title: 'Connection Details',
        content: `Database Type: [MySQL/PostgreSQL/Oracle/SQL Server]
Host: [hostname]
Port: [port number]
Database Name: [db name]
Schema: [schema name]`
      },
      {
        title: 'Authentication',
        content: `Username: [username]
Authentication Method: [password/IAM/certificate]
Security Requirements: [encryption/SSL/VPN]`
      },
      {
        title: 'Data Access',
        content: `Tables Required: [list of tables]
Views Required: [list of views]
Access Pattern: [full load/incremental]
Refresh Frequency: [how often to sync]`
      }
    ]
  },
  file: {
    type: 'File',
    sections: [
      {
        title: 'File Details',
        content: `File Type: [CSV/JSON/Parquet/Excel]
Location: [S3/HDFS/Local Path]
File Pattern: [filename pattern]
Compression: [none/gzip/zip]`
      },
      {
        title: 'Structure',
        content: `Header Row: [yes/no]
Delimiter: [comma/tab/pipe]
File Format Version: [version if applicable]
Schema Definition: [column definitions]`
      }
    ]
  },
  api: {
    type: 'API',
    sections: [
      {
        title: 'Endpoint Details',
        content: `API Type: [REST/GraphQL/SOAP]
Base URL: [endpoint URL]
API Version: [version number]
Rate Limits: [requests per second/minute]`
      },
      {
        title: 'Authentication',
        content: `Auth Type: [API Key/OAuth/Basic]
Token Management: [how to obtain/refresh tokens]
Security Requirements: [HTTPS/Custom Headers]`
      },
      {
        title: 'Request Details',
        content: `HTTP Method: [GET/POST/PUT]
Request Format: [JSON/XML]
Required Headers: [list of headers]
Query Parameters: [list of parameters]`
      }
    ]
  }
};

const NoteEditor: React.FC = () => {
  const { 
    currentNote, 
    updateNote, 
    processedNote, 
    processNote, 
    createNote, 
    deleteNote,
    saveProcessedNote,
    setProcessedNote,
    setCurrentNote,
    notes 
  } = useNotes();
  
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [requirement, setRequirement] = useState<PipelineRequirement | null>(null);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'history'>('editor');
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [activeSection, setActiveSection] = useState<string>('');

  // Add new state for source section
  const [sourceType, setSourceType] = useState<string>('');
  const [sourceConnection, setSourceConnection] = useState<string>('');
  const [sourceDescription, setSourceDescription] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Add new state for transformations, DQ rules, and target
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [dqRules, setDqRules] = useState<DQRule[]>([]);
  const [targetConfig, setTargetConfig] = useState<DataTarget>({
    type: '',
    connection: '',
    format: '',
    path: '',
    table: ''
  });

  // Add new state variables
  const [transformationType, setTransformationType] = useState('');
  const [transformationDescription, setTransformationDescription] = useState('');
  const [dqRuleType, setDQRuleType] = useState('');
  const [dqRuleSeverity, setDQRuleSeverity] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [dqRuleDefinition, setDQRuleDefinition] = useState('');

  const sourceTypes: SourceTypeOption[] = [
    { label: 'Database', value: 'database' },
    { label: 'File', value: 'file' },
    { label: 'API', value: 'api' },
    { label: 'Streaming', value: 'streaming' },
    { label: 'Data Warehouse', value: 'warehouse' }
  ];

  // Add transformation types
  const transformationTypes = [
    { label: 'Filter', value: 'filter' },
    { label: 'Join', value: 'join' },
    { label: 'Aggregate', value: 'aggregate' },
    { label: 'Sort', value: 'sort' },
    { label: 'Custom', value: 'custom' }
  ];

  // Add DQ rule types
  const dqRuleTypes = [
    { label: 'Null Check', value: 'null_check' },
    { label: 'Range Check', value: 'range_check' },
    { label: 'Format Check', value: 'format_check' },
    { label: 'Uniqueness Check', value: 'uniqueness_check' }
  ];

  // Add target types
  const targetTypes = [
    { label: 'Database', value: 'database' },
    { label: 'File', value: 'file' },
    { label: 'Data Warehouse', value: 'warehouse' },
    { label: 'Data Lake', value: 'lake' }
  ];

  // Update local state when currentNote changes
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setIsEditing(true);
    } else {
      setTitle('');
      setContent('');
    }
  }, [currentNote]);

  // Auto-focus the content area
  useEffect(() => {
    if (isEditing && contentRef.current && !processedNote) {
      contentRef.current.focus();
    }
  }, [isEditing, currentNote, processedNote]);

  // Create debounced function for updating preview
  const updatePreviewDebounced = useMemo(
    () =>
      debounce(() => {
        if (!currentNote) return;
        
        // Calculate word count
        const wordCount = content.trim().split(/\s+/).length || 0;
        
        // Extract tags from content (words prefixed with #)
        const tags = [
          ...(content.match(/#[a-zA-Z0-9_]+/g) || []).map(tag => tag.substring(1))
        ];
        
        const previewData = {
          id: currentNote.id,
          title: title || 'Untitled Note',
          content: content,
          tags,
          wordCount,
          updatedAt: new Date().toISOString(),
        };
        
        setPreviewData(previewData);
      }, 500),
    [content, title, currentNote]
  );

  // Effect to update preview when content changes
  useEffect(() => {
    if (content && showPreview) {
      updatePreviewDebounced();
    }
  }, [content, title, showPreview, updatePreviewDebounced]);

  const handleSave = () => {
    if (!currentNote) return;
    
    updateNote(currentNote.id, {
      title,
      content
    });
    
    toast.success('Note saved');
  };

  const handleProcess = () => {
    if (!currentNote) return;
    
    // First save any changes
    updateNote(currentNote.id, {
      title,
      content
    });
    
    setShowCommandPalette(true);
  };

  const handleProcessedNote = (processed: ProcessedNote) => {
    setProcessedNote(processed);
    setIsEditing(false);
  };

  const handleSaveProcessed = () => {
    if (!processedNote) return;
    saveProcessedNote(processedNote);
    setIsEditing(true);
  };

  const handleDelete = () => {
    if (!currentNote) return;
    deleteNote(currentNote.id);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
    if (!showPreview && content) {
      updatePreviewDebounced();
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check for '/' at the beginning of the line to trigger command palette
    if (e.key === '/' && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      const cursorPosition = e.currentTarget.selectionStart;
      const textBeforeCursor = content.substring(0, cursorPosition);
      
      // Check if the cursor is at the start of a line (either at the beginning of the text or after a newline)
      if (cursorPosition === 0 || textBeforeCursor.endsWith('\n')) {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    }
  };

  const handleAddBullets = () => {
    if (!contentRef.current) return;

    // Get the current selection
    const selectionStart = contentRef.current.selectionStart;
    const selectionEnd = contentRef.current.selectionEnd;
    
    // If there's selected text, convert each line to a bullet point
    if (selectionStart !== selectionEnd) {
      // Get the selected text
      const selectedText = content.substring(selectionStart, selectionEnd);
      
      // Split into lines and add bullets
      const bulletedText = selectedText
        .split('\n')
        .map(line => line.trim() ? `• ${line}` : line)
        .join('\n');
      
      // Replace the selected text with the bulleted text
      const newContent = 
        content.substring(0, selectionStart) + 
        bulletedText + 
        content.substring(selectionEnd);
      
      setContent(newContent);
      
      // Set cursor position after the modification
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.selectionStart = selectionStart;
          contentRef.current.selectionEnd = selectionStart + bulletedText.length;
          contentRef.current.focus();
        }
      }, 0);
      
      toast.success('Text converted to bullet points');
    } else {
      // If no text is selected, insert a bullet point at the cursor position
      const cursorPosition = selectionStart;
      const newContent = 
        content.substring(0, cursorPosition) + 
        '• ' + 
        content.substring(cursorPosition);
      
      setContent(newContent);
      
      // Position cursor after the bullet point
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.selectionStart = cursorPosition + 2;
          contentRef.current.selectionEnd = cursorPosition + 2;
          contentRef.current.focus();
        }
      }, 0);
    }
  };

  const renderEditor = () => (
    <Card className="w-full h-full flex flex-col overflow-hidden animate-fade-in bg-white/95 shadow-sm glassmorphism">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="text-lg font-medium border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          />
        </div>
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={togglePreview}
            className={showPreview ? "bg-secondary/50" : ""}
          >
            <Code className="h-4 w-4 mr-1" />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className={cn(
        "flex-grow min-h-0 overflow-auto pb-0", 
        showPreview ? "flex gap-4" : ""
      )}>
        <div className={showPreview ? "w-1/2 h-full flex flex-col" : "w-full h-full flex flex-col"}>
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder="Start typing... (Use '/' at the beginning of a line to open command palette)"
            className="note-editor w-full resize-none border-none bg-transparent focus:outline-none text-base"
            style={{ height: 'calc(50vh - 6rem)' }}
          />
        </div>
        
        {showPreview && previewData && (
          <div className="w-1/2 border-l pl-4 overflow-auto">
            <div className="border rounded-md p-4 bg-muted/30">
              <p className="text-sm font-medium mb-2">JSON Preview</p>
              <pre className="text-xs overflow-auto p-2 bg-muted rounded-md">
                {JSON.stringify(previewData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-shrink-0">
        <EditorToolbar
          onBack={() => setCurrentNote(null)}
          onSave={handleSave}
          onProcess={handleProcess}
          onDelete={handleDelete}
          onAddBullets={handleAddBullets}
          hasContent={!!content.trim()}
        />
      </CardFooter>
    </Card>
  );

  const renderProcessedView = () => {
    if (!processedNote) return null;
    
    return (
      <Card className="w-full h-full flex flex-col overflow-hidden animate-fade-in glassmorphism">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">{processedNote.title}</h2>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="mr-2">{processedNote.wordCount} words</span>
              <span>{processedNote.readingTime}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow min-h-0 overflow-auto pb-0">
          <div className="space-y-6">
            {processedNote.summary && (
              <div className="bg-secondary/50 p-3 rounded-md">
                <p className="text-sm font-medium">Summary</p>
                <p className="text-sm">{processedNote.summary}</p>
              </div>
            )}
            
            {processedNote.tags.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {processedNote.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {processedNote.pipeline && (
              <div className="border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <GitBranch className="h-4 w-4" />
                  <p className="text-sm font-medium">Pipeline</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{processedNote.pipeline.description}</p>
                <ol className="space-y-2 pl-5">
                  {processedNote.pipeline.steps.map((step, index) => (
                    <li key={index} className="text-sm">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            
            {processedNote.flow && (
              <div className="border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Share2 className="h-4 w-4" />
                  <p className="text-sm font-medium">Flow</p>
                </div>
                <div className="space-y-2">
                  <div className="bg-muted/30 p-3 rounded-md">
                    <p className="text-xs font-medium mb-1">Nodes</p>
                    <ul className="text-xs space-y-1 pl-4">
                      {processedNote.flow.nodes.map((node, i) => (
                        <li key={i}>{node.label}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {processedNote.flow.edges.length > 0 && (
                    <div className="bg-muted/30 p-3 rounded-md">
                      <p className="text-xs font-medium mb-1">Connections</p>
                      <ul className="text-xs space-y-1 pl-4">
                        {processedNote.flow.edges.map((edge, i) => {
                          const sourceNode = processedNote.flow?.nodes.find(n => n.id === edge.source);
                          const targetNode = processedNote.flow?.nodes.find(n => n.id === edge.target);
                          return (
                            <li key={i}>
                              {sourceNode?.label || edge.source} → {targetNode?.label || edge.target}
                              {edge.label && ` (${edge.label})`}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium mb-2">Content</p>
              <div className="whitespace-pre-wrap">{processedNote.content}</div>
            </div>
            
            <div className="border rounded-md p-4 bg-muted/30">
              <p className="text-sm font-medium mb-2">JSON Preview</p>
              <pre className="text-xs overflow-auto p-2 bg-muted rounded-md">
                {JSON.stringify(processedNote, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-shrink-0 flex justify-between border-t bg-white/50 backdrop-blur-sm p-2">
          <Button variant="ghost" size="sm" onClick={() => { setProcessedNote(null); setIsEditing(true); }}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to editing
          </Button>
          <Button variant="default" size="sm" onClick={handleSaveProcessed}>
            <Save className="h-4 w-4 mr-1" />
            Create Note
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
      <div className="text-center space-y-4 max-w-md mx-auto p-8 rounded-lg glassmorphism">
        <h2 className="text-2xl font-semibold tracking-tight">Welcome to Notes</h2>
        <p className="text-muted-foreground">
          Create beautiful notes, process them with powerful commands, and preview the structured data.
        </p>
        <Button onClick={createNote} className="mt-4">
          <FilePlus2 className="h-4 w-4 mr-2" />
          Create a new note
        </Button>
        
        {notes.length > 0 && (
          <div className="mt-8">
            <p className="text-sm font-medium mb-2">Recent notes</p>
            <div className="space-y-2">
              {notes.slice(0, 3).map(note => (
                <div 
                  key={note.id}
                  onClick={() => setCurrentNote(note)}
                  className="p-3 rounded-md bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                >
                  <p className="font-medium truncate">{note.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {note.content.substring(0, 60)}{note.content.length > 60 ? '...' : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Update the transformation section render function
  const renderTransformationsSection = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Transformations</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleAIAssist('transformations')}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Assist
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="text-sm font-medium mb-2 block">Type</label>
              <select
                value={transformationType}
                onChange={(e) => setTransformationType(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select type</option>
                {transformationTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Transformation Logic</label>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleAddTemplate('transformation')}
                disabled={!transformationType}
                className="flex items-center"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Template
              </Button>
            </div>
            <Textarea
              placeholder={transformationType 
                ? `Describe your ${transformationType} transformation logic...` 
                : "Select a transformation type to get started..."
              }
              className="min-h-[200px] p-4 resize-vertical font-mono text-sm"
              value={transformationDescription}
              onChange={(e) => handleTransformationDescriptionChange(e.target.value)}
              onFocus={() => setActiveSection('transformations')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Update the DQ Rules section render function
  const renderDQRulesSection = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Data Quality Rules</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleAIAssist('dqrules')}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Assist
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="text-sm font-medium mb-2 block">Rule Type</label>
              <select
                value={dqRuleType}
                onChange={(e) => setDQRuleType(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select type</option>
                {dqRuleTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="w-1/3">
              <label className="text-sm font-medium mb-2 block">Severity</label>
              <select
                value={dqRuleSeverity}
                onChange={(e) => setDQRuleSeverity(e.target.value as 'HIGH' | 'MEDIUM' | 'LOW')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Rule Definition</label>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleAddTemplate('dqrule')}
                disabled={!dqRuleType}
                className="flex items-center"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Template
              </Button>
            </div>
            <Textarea
              placeholder={dqRuleType 
                ? `Define your ${dqRuleType} rule...` 
                : "Select a rule type to get started..."
              }
              className="min-h-[200px] p-4 resize-vertical font-mono text-sm"
              value={dqRuleDefinition}
              onChange={(e) => handleDQRuleDefinitionChange(e.target.value)}
              onFocus={() => setActiveSection('dqrules')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Update the renderStructuredEditor function to use the new sections
  const renderStructuredEditor = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Data Source</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleAIAssist('datasource')}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Assist
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/3">
                <label className="text-sm font-medium mb-2 block">Source Type</label>
                <select
                  value={sourceType}
                  onChange={(e) => handleSourceTypeChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select source type</option>
                  {sourceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Connection Details</label>
                {renderConnectionSelect(
                  sourceType, 
                  sourceConnection, 
                  handleSourceConnectionChange
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Description</label>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleAddTemplate('datasource')}
                    disabled={!sourceType}
                    className="flex items-center"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    {sourceType ? `Add ${sourceType} Template` : 'Add Template'}
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Textarea
                  placeholder={sourceType 
                    ? `Describe your ${sourceType} source requirements...` 
                    : "Select a source type to get started..."
                  }
                  className="min-h-[200px] p-4 resize-vertical font-mono text-sm"
                  value={sourceDescription}
                  onChange={(e) => handleSourceDescriptionChange(e.target.value)}
                  onFocus={() => setActiveSection('datasource')}
                />
              </div>
            </div>

            {activeSection === 'datasource' && aiSuggestions.length > 0 && (
              <div className="mt-4 border rounded-md p-4 bg-secondary/10">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">AI Suggestions</p>
                </div>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {aiSuggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="p-3 bg-white rounded-md cursor-pointer hover:bg-secondary/20 transition-colors"
                        onClick={() => applySuggestion(suggestion)}
                      >
                        <p className="text-sm">{suggestion.suggestion}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1 bg-secondary/30 rounded-full">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${suggestion.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {suggestion.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {requirement?.source?.validation && (
              <div className="flex items-start gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Validation Message</p>
                  <p className="text-sm">{requirement.source.validation}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {renderTransformationsSection()}
      {renderDQRulesSection()}

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Target Configuration</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/3">
                <label className="text-sm font-medium mb-2 block">Target Type</label>
                <select
                  value={targetConfig.type}
                  onChange={(e) => setTargetConfig(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select type</option>
                  {targetTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Connection Details</label>
                {renderConnectionSelect(
                  targetConfig.type,
                  targetConfig.connection,
                  (value) => handleTargetConnectionChange(value)
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/3">
                <label className="text-sm font-medium mb-2 block">Format</label>
                <Input 
                  value={targetConfig.format || ''}
                  onChange={(e) => setTargetConfig(prev => ({ ...prev, format: e.target.value }))}
                  placeholder="Data format"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Path/Table</label>
                <Input 
                  value={targetConfig.path || ''}
                  onChange={(e) => setTargetConfig(prev => ({ ...prev, path: e.target.value }))}
                  placeholder="Target path or table name"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Pipeline Preview</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Source Section Preview */}
            <div className="border rounded-md p-4">
              <h4 className="text-sm font-medium mb-2">Source Configuration</h4>
              <pre className="text-xs bg-muted p-2 rounded">
                {JSON.stringify({
                  type: sourceType,
                  connection: sourceConnection,
                  description: sourceDescription,
                  connectionDetails: connectionOptions.find(opt => opt.value === sourceConnection)?.label || ''
                }, null, 2)}
              </pre>
            </div>
            
            {/* Transformations Preview */}
            <div className="border rounded-md p-4">
              <h4 className="text-sm font-medium mb-2">Transformation Logic</h4>
              <div className="space-y-2">
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs font-medium">Selected Type:</p>
                  <p className="text-xs">{transformationType || 'Not selected'}</p>
                </div>
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs font-medium">Description:</p>
                  <p className="text-xs whitespace-pre-wrap">{transformationDescription || 'No description provided'}</p>
                </div>
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs font-medium">Transformation Details:</p>
                  <pre className="text-xs">
                    {JSON.stringify(transformations, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
            
            {/* DQ Rules Preview */}
            <div className="border rounded-md p-4">
              <h4 className="text-sm font-medium mb-2">Data Quality Rules</h4>
              <div className="space-y-2">
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs font-medium">Current Rule:</p>
                  <div className="space-y-1">
                    <p className="text-xs">Type: {dqRuleType || 'Not selected'}</p>
                    <p className="text-xs">Severity: {dqRuleSeverity}</p>
                    <p className="text-xs">Definition: {dqRuleDefinition || 'No definition provided'}</p>
                  </div>
                </div>
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs font-medium">All Rules:</p>
                  <pre className="text-xs">
                    {JSON.stringify(dqRules, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
            
            {/* Target Preview */}
            <div className="border rounded-md p-4">
              <h4 className="text-sm font-medium mb-2">Target Configuration</h4>
              <div className="space-y-2">
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs font-medium">Target Details:</p>
                  <pre className="text-xs">
                    {JSON.stringify({
                      type: targetConfig.type,
                      connection: targetConfig.connection,
                      connectionDetails: connectionOptions.find(opt => opt.value === targetConfig.connection)?.label || '',
                      format: targetConfig.format,
                      path: targetConfig.path,
                      table: targetConfig.table
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Pipeline Status */}
            <div className="border rounded-md p-4">
              <h4 className="text-sm font-medium mb-2">Pipeline Status</h4>
              <div className="space-y-2">
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs font-medium">Completion Status:</p>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Source Configuration</span>
                      <span className={`text-xs ${sourceType && sourceConnection ? 'text-green-600' : 'text-yellow-600'}`}>
                        {sourceType && sourceConnection ? 'Complete' : 'Incomplete'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Transformation Logic</span>
                      <span className={`text-xs ${transformationType && transformationDescription ? 'text-green-600' : 'text-yellow-600'}`}>
                        {transformationType && transformationDescription ? 'Complete' : 'Incomplete'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Data Quality Rules</span>
                      <span className={`text-xs ${dqRuleType && dqRuleDefinition ? 'text-green-600' : 'text-yellow-600'}`}>
                        {dqRuleType && dqRuleDefinition ? 'Complete' : 'Incomplete'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Target Configuration</span>
                      <span className={`text-xs ${targetConfig.type && targetConfig.connection ? 'text-green-600' : 'text-yellow-600'}`}>
                        {targetConfig.type && targetConfig.connection ? 'Complete' : 'Incomplete'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Issues */}
      {validationIssues.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Validation Issues</h3>
              <span className="text-sm text-yellow-600">
                {validationIssues.length} {validationIssues.length === 1 ? 'issue' : 'issues'} found
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {validationIssues.map((issue, index) => (
                <div key={index} className="flex items-start gap-2 text-yellow-600 bg-yellow-50/50 p-2 rounded">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <p className="text-sm">{issue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderHistory = () => (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">Requirement History</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requirement?.history?.map((entry, index) => (
            <div key={index} className="border rounded-md p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-medium">Version {entry.version}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-sm mt-2">{entry.changes}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Add new helper functions
  const handleAIAssist = (section: string) => {
    // Simulate AI suggestions - replace with actual AI integration
    const mockSuggestions: AISuggestion[] = [
      {
        section,
        suggestion: "Consider adding schema validation to ensure data consistency",
        confidence: 95
      },
      {
        section,
        suggestion: "Specify the refresh frequency for this data source",
        confidence: 85
      },
      {
        section,
        suggestion: "Add authentication details for secure access",
        confidence: 75
      }
    ];
    setAiSuggestions(mockSuggestions);
  };

  const applySuggestion = (suggestion: AISuggestion) => {
    // Apply the selected suggestion to the appropriate section
    // This is where you'd update the requirement state
    toast.success("Suggestion applied");
  };

  const handleAddTemplate = (section: string) => {
    // If no source type is selected, show template selection
    if (!sourceType) {
      toast.error("Please select a source type first");
      return;
    }

    const template = sourceTemplates[sourceType];
    if (!template) {
      toast.error("No template available for selected source type");
      return;
    }

    // Create formatted template string
    const templateContent = template.sections
      .map(section => (
        `### ${section.title}\n${section.content}\n`
      ))
      .join('\n');

    // Update the description with the template
    setSourceDescription(prev => {
      // If there's existing content, append the template
      if (prev.trim()) {
        return `${prev}\n\n${templateContent}`;
      }
      return templateContent;
    });

    // Update the requirement state
    setRequirement(prev => ({
      ...prev,
      source: {
        ...prev?.source,
        type: sourceType,
        description: templateContent
      }
    }));

    toast.success(`${template.type} template applied`);
  };

  // Add handlers for source section
  const handleSourceTypeChange = (value: string) => {
    setSourceType(value);
    setRequirement(prev => ({
      ...prev,
      source: {
        ...prev?.source,
        type: value
      }
    }));
  };

  const handleSourceConnectionChange = (value: string) => {
    setSourceConnection(value);
    setRequirement(prev => ({
      ...prev,
      source: {
        ...prev?.source,
        connection: value
      }
    }));
  };

  const handleSourceDescriptionChange = (value: string) => {
    setSourceDescription(value);
    setRequirement(prev => ({
      ...prev,
      source: {
        ...prev?.source,
        description: value
      }
    }));
  };

  // Add handlers for transformations
  const handleAddTransformation = () => {
    const newTransformation: Transformation = {
      id: `tr-${transformations.length + 1}`,
      type: '',
      description: '',
      rules: []
    };
    setTransformations([...transformations, newTransformation]);
  };

  const handleUpdateTransformation = (id: string, updates: Partial<Transformation>) => {
    setTransformations(prev => 
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  };

  const handleRemoveTransformation = (id: string) => {
    setTransformations(prev => prev.filter(t => t.id !== id));
  };

  // Add handlers for DQ rules
  const handleAddDQRule = () => {
    const newRule: DQRule = {
      id: `dq-${dqRules.length + 1}`,
      type: '',
      rule: '',
      severity: 'MEDIUM'
    };
    setDqRules([...dqRules, newRule]);
  };

  const handleUpdateDQRule = (id: string, updates: Partial<DQRule>) => {
    setDqRules(prev => 
      prev.map(r => r.id === id ? { ...r, ...updates } : r)
    );
  };

  const handleRemoveDQRule = (id: string) => {
    setDqRules(prev => prev.filter(r => r.id !== id));
  };

  // Add validation handler
  const handleValidate = () => {
    const issues: string[] = [];

    // Validate source
    if (!sourceType) issues.push('Source type is required');
    if (!sourceConnection) issues.push('Source connection details are required');

    // Validate transformations
    transformations.forEach((t, i) => {
      if (!t.type) issues.push(`Transformation ${i + 1} type is required`);
      if (!t.description) issues.push(`Transformation ${i + 1} description is required`);
    });

    // Validate DQ rules
    dqRules.forEach((r, i) => {
      if (!r.type) issues.push(`DQ rule ${i + 1} type is required`);
      if (!r.rule) issues.push(`DQ rule ${i + 1} definition is required`);
    });

    // Validate target
    if (!targetConfig.type) issues.push('Target type is required');
    if (!targetConfig.connection) issues.push('Target connection details are required');

    setValidationIssues(issues);
    
    if (issues.length > 0) {
      toast.error(`Found ${issues.length} validation issues`);
    } else {
      toast.success('Validation passed successfully');
    }

    return issues.length === 0;
  };

  // Add new handlers for transformation rules
  const handleAddTransformationRule = (transformationId: string) => {
    setTransformations(prev => 
      prev.map(t => {
        if (t.id === transformationId) {
          return {
            ...t,
            rules: [...t.rules, '']
          };
        }
        return t;
      })
    );
  };

  const handleUpdateTransformationRule = (transformationId: string, ruleIndex: number, value: string) => {
    setTransformations(prev => 
      prev.map(t => {
        if (t.id === transformationId) {
          const newRules = [...t.rules];
          newRules[ruleIndex] = value;
          return {
            ...t,
            rules: newRules
          };
        }
        return t;
      })
    );
  };

  const handleRemoveTransformationRule = (transformationId: string, ruleIndex: number) => {
    setTransformations(prev => 
      prev.map(t => {
        if (t.id === transformationId) {
          const newRules = t.rules.filter((_, index) => index !== ruleIndex);
          return {
            ...t,
            rules: newRules
          };
        }
        return t;
      })
    );
  };

  // Add new helper function to render connection select
  const renderConnectionSelect = (type: string, value: string, onChange: (value: string) => void) => {
    const filteredOptions = connectionOptions.filter(opt => opt.type === type);
    
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        disabled={!type} // Disable if no type is selected
      >
        <option value="">Select connection</option>
        {filteredOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  // Add new handlers
  const handleTransformationDescriptionChange = (value: string) => {
    setTransformationDescription(value);
    // Update transformations array
    const updatedTransformation: Transformation = {
      id: transformations.length > 0 ? transformations[0].id : 'tr-1',
      type: transformationType,
      description: value,
      rules: []
    };
    
    if (transformations.length === 0) {
      setTransformations([updatedTransformation]);
    } else {
      setTransformations(prev => [updatedTransformation, ...prev.slice(1)]);
    }
  };

  const handleDQRuleDefinitionChange = (value: string) => {
    setDQRuleDefinition(value);
    // Update DQ rules array
    const updatedRule: DQRule = {
      id: dqRules.length > 0 ? dqRules[0].id : 'dq-1',
      type: dqRuleType,
      rule: value,
      severity: dqRuleSeverity
    };
    
    if (dqRules.length === 0) {
      setDqRules([updatedRule]);
    } else {
      setDqRules(prev => [updatedRule, ...prev.slice(1)]);
    }
  };

  // Update the handleTargetConnectionChange function
  const handleTargetConnectionChange = (value: string) => {
    setTargetConfig(prev => ({ 
      ...prev, 
      connection: value 
    }));
  };

  return (
    <div className="flex-1 overflow-hidden p-4 h-[calc(100vh-4rem)]">
      <div className="flex h-full">
        <div className="w-full space-y-4">
          <Card className="h-full">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <Button
                    variant={activeTab === 'editor' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('editor')}
                  >
                    Requirements
                  </Button>
                  <Button
                    variant={activeTab === 'preview' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('preview')}
                  >
                    Preview
                  </Button>
                  <Button
                    variant={activeTab === 'history' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('history')}
                  >
                    History
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => handleValidate()}>
                    Validate
                  </Button>
                  <Button variant="default" onClick={() => handleSave()}>
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100%-4rem)] overflow-auto">
              {activeTab === 'editor' && renderStructuredEditor()}
              {activeTab === 'preview' && renderPreview()}
              {activeTab === 'history' && renderHistory()}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {showCommandPalette && currentNote && (
        <CommandPalette
          note={currentNote}
          onProcess={handleProcessedNote}
          onClose={() => setShowCommandPalette(false)}
        />
      )}
    </div>
  );
};

export default NoteEditor;
