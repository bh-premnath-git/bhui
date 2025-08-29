import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Autocomplete } from '@/components/ui/autocomplete';
import { PythonEditor } from '@/components/ui/python-editor';
import { Hammer, Loader2 } from 'lucide-react';
import { lazy } from 'react';
import * as monaco from 'monaco-editor';
import { KeyValueEditor } from './KeyValueEditor';
import { ArrayField } from './ArrayField';
import { NestedObjectRenderer } from './NestedObjectRenderer';
import { getCustomComponent } from './custom-components/componentRegistry';
import { formatFieldTitle } from './schemaUtils';
import { apiService } from '@/lib/api/api-service';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

interface FieldRendererProps {
  fieldKey: string;
  field: any;
  form: any;
  isRequired?: boolean;
  parentKey?: string;
  sourceColumns?: Array<{ name: string; dataType: string }>;
  onExpressionGenerate?: (fieldName: string) => Promise<void>;
  isFieldGenerating?: (fieldName: string) => boolean;
  compact?: boolean;
  hideLabel?: boolean;
  customEndpointOptions?: any[]; // For overriding endpoint options (e.g., filtered connections)
}

// SQL keywords for Monaco editor autocomplete
const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL', 'TRUE', 'FALSE',
  'ORDER BY', 'GROUP BY', 'HAVING', 'ASC', 'DESC', 'DISTINCT', 'LIMIT',
  'CONCAT', 'COALESCE', 'NULLIF', 'CAST', 'SUBSTRING', 'TRIM',
  'UPPER', 'LOWER', 'LENGTH', 'REPLACE', 'ROUND',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'FIRST', 'LAST',
  'SPLIT', 'REGEXP_REPLACE', 'REGEXP_EXTRACT', 'DATE_FORMAT',
  'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND',
  'DATEDIFF', 'DATE_ADD', 'DATE_SUB', 'CURRENT_DATE', 'CURRENT_TIMESTAMP'
];

// PySpark transformation template
const PYSPARK_TEMPLATE = `# =============================================================================
# 🧩 CUSTOM PYSPARK TRANSFORMATION TEMPLATE
# =============================================================================
# 💡 INSTRUCTIONS :
# - Input DataFrames are auto-injected and named using their transformation names.
# - You must return at least one DataFrame named \`result\` or \`result_<suffix>\`.
# - Returned DataFrames will be made available for downstream transformations.
#     • result         → <transformation_name>
#     • result_clean   → <transformation_name>_clean
#     • result_summary → <transformation_name>_summary
# =============================================================================

# Your Code Starts Here 

# =============================================================================
# 📦 IMPORTS
# =============================================================================
# Add required imports below
# Example:
# from pyspark.sql.functions import col, lit, when, avg, count
# from pyspark.sql.types import StringType, IntegerType, DoubleType

# --- Your Imports Here ---

# =============================================================================
# 📥 INPUT DATAFRAMES
# =============================================================================
# Input DataFrames are available as variables named after their source transformations.
# For example:
# input_df = read_input_data      # If a previous transformation is named "read_input_data"

# --- Initialize or reference your input DataFrame(s) ---

# =============================================================================
# ✨ YOUR TRANSFORMATION LOGIC
# =============================================================================
# Write your PySpark code here.
# ✅ At least one DataFrame must be assigned to a variable starting with "result"
#    Examples:
#    result = input_df.withColumn("flag", lit("Y"))
#    result_main = input_df.filter(col("status") == "active")
#    result_summary = result_main.groupBy("category").agg(count("*").alias("cnt"))

# --- Begin Custom Logic ---

# --- End Custom Logic ---

# =============================================================================
# 📤 OUTPUT DATAFRAMES
# =============================================================================
# 🚨 At least one result DataFrame is required!
#    - Use \`result\` for single-output transformations.
#    - Use \`result_<suffix>\` for multiple outputs.
#
# These outputs will be wired for downstream transformations as:
#    • result → <transformation_name>
#    • result_<suffix> → <transformation_name>_<suffix>
#
# ✅ Example:
# result = input_df.withColumn("processed", lit("yes"))
# result_agg = result.groupBy("type").agg(count("*").alias("cnt"))

# --- Save or define your result DataFrame(s) ---

# Your Code Ends Here `;

// Helper function to calculate editor height based on content
const calculateEditorHeight = (content: string): number => {
  const lines = content.split('\n').length;
  const minHeight = 40; // Minimum height for single line
  const maxHeight = 300; // Maximum height
  const lineHeight = 20; // Approximate line height
  const padding = 10; // Padding
  
  const calculatedHeight = Math.max(minHeight, Math.min(maxHeight, lines * lineHeight + padding));
  return calculatedHeight;
};

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  fieldKey,
  field,
  form,
  isRequired = false,
  parentKey = '',
  sourceColumns = [],
  onExpressionGenerate,
  isFieldGenerating,
  compact = false,
  hideLabel = false,
  customEndpointOptions,
}) => {
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [editorHeight, setEditorHeight] = useState(40);
  const [endpointOptions, setEndpointOptions] = useState<any[]>([]);
  const [isLoadingEndpoint, setIsLoadingEndpoint] = useState(false);
  const completionProviderRef = useRef<monaco.IDisposable | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  const fullFieldKey = parentKey ? `${parentKey}.${fieldKey}` : fieldKey;
  const fieldTitle = field.title || formatFieldTitle(fieldKey);
  const isFieldTitleNumeric = !isNaN(parseInt(fieldTitle)) && isFinite(parseInt(fieldTitle));

  // Check for UI hints
  const uiHint = field['ui-hint'];
  const isExpressionField = uiHint === 'expression' || field.type === 'expression' || fieldKey === 'expression';
  const isPythonEditor = uiHint === 'python_editor' || field.type === 'python_editor';
  const isAutoComplete = uiHint === 'auto-complete' || uiHint === 'autocomplete' || field.type === 'autocomplete';
  const isCustomComponent = uiHint === 'custom' && field.component;
  const isEndpointField = uiHint === 'endpoint' && field.endpoint;
  
  // Debug field rendering for key fields
  if (process.env.NODE_ENV === 'development' && (fieldKey === 'connection' || fieldKey === 'name' || fieldKey === 'source_type' || fieldKey === 'table_name')) {
    const currentValue = form.getValues(fullFieldKey);
    const isNestedField = parentKey === 'source';
    console.log(`🔧 FieldRenderer: Field rendering debug for ${fieldKey} ${isNestedField ? '(NESTED)' : '(ROOT)'}`, {
      fieldKey,
      fullFieldKey,
      parentKey,
      isNestedField,
      currentValue,
      fieldType: field.type,
      uiHint,
      hasEndpoint: !!field.endpoint,
      endpoint: field.endpoint,
      isEndpointField,
      formControlExists: !!form.control,
      fieldStructure: Object.keys(field)
    });
  }
  

  // Fetch endpoint data for endpoint fields
  useEffect(() => {
    if (isEndpointField) {
      console.log(`🔧 FieldRenderer: Fetching endpoint data for ${fieldKey}`, {
        endpoint: field.endpoint,
        customEndpointOptions: !!customEndpointOptions
      });
      // If custom endpoint options are provided, use them instead of fetching
      if (customEndpointOptions) {
        setEndpointOptions(customEndpointOptions);
        setIsLoadingEndpoint(false);
        return;
      }

      // Otherwise, fetch from the endpoint if available
      if (field.endpoint) {
        const fetchEndpointData = async () => {
          setIsLoadingEndpoint(true);
          try {
            // Use ApiService to make the API call
            const data : any= await apiService.get({
              baseUrl: CATALOG_REMOTE_API_URL,
              url: field.endpoint,
              method: 'GET',
              usePrefix: true // This will add /api/v1 prefix
            });
            
            console.log(`🔧 FieldRenderer: API response for ${fieldKey}:`, data);
            
            // Handle different response formats
            if (Array.isArray(data)) {
              setEndpointOptions(data);
              console.log(`🔧 FieldRenderer: Set ${data.length} options from array response`);
            } else if (data.results && Array.isArray(data.results)) {
              setEndpointOptions(data.results);
              console.log(`🔧 FieldRenderer: Set ${data.results.length} options from data.results`);
            } else if (data.data && Array.isArray(data.data)) {
              setEndpointOptions(data.data);
              console.log(`🔧 FieldRenderer: Set ${data.data.length} options from data.data`);
            } else {
              setEndpointOptions([]);
              console.log(`🔧 FieldRenderer: No valid array found in response, set empty options`);
            }
          } catch (error) {
            console.error('Error fetching endpoint data:', error);
            setEndpointOptions([]);
          } finally {
            setIsLoadingEndpoint(false);
          }
        };

        fetchEndpointData();
      }
    }
  }, [isEndpointField, field.endpoint, customEndpointOptions]);

  // Monaco editor setup for expression fields
  useEffect(() => {
    if (isEditorReady && editorRef.current && monacoRef.current && isExpressionField) {
      // Dispose of the previous completion provider
      if (completionProviderRef.current) {
        completionProviderRef.current.dispose();
      }

      // Register new completion provider with updated sourceColumns
      completionProviderRef.current = monacoRef.current.languages.registerCompletionItemProvider('sql', {
        triggerCharacters: [' ', '.', '(', ',', '[', '"', "'"],
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };

          const suggestions: monaco.languages.CompletionItem[] = [];

          // Add columns first
          if (Array.isArray(sourceColumns)) {
            sourceColumns.forEach(col => {
              suggestions.push({
                label: col.name,
                kind: monacoRef.current!.languages.CompletionItemKind.Field,
                insertText: col.name,
                detail: `Column (${col.dataType})`,
                documentation: {
                  value: `**${col.name}**\nType: ${col.dataType}`
                },
                range: range,
                sortText: '0' + col.name
              });
            });
          }

          // Add SQL Keywords
          SQL_KEYWORDS.forEach(keyword => {
            suggestions.push({
              label: keyword,
              kind: monacoRef.current!.languages.CompletionItemKind.Keyword,
              insertText: keyword,
              detail: 'SQL Keyword',
              documentation: {
                value: `SQL Keyword: ${keyword}`
              },
              range: range,
              sortText: '1' + keyword // Keywords appear after columns
            });
          });

          return { suggestions };
        }
      });
    }

    return () => {
      if (completionProviderRef.current) {
        completionProviderRef.current.dispose();
      }
    };
  }, [isEditorReady, sourceColumns, isExpressionField]);

  // Update editor height when content changes
  useEffect(() => {
    if (isExpressionField && form) {
      const content = form.watch(fullFieldKey) || '';
      const newHeight = calculateEditorHeight(content);
      setEditorHeight(newHeight);
    }
  }, [form?.watch(fullFieldKey), isExpressionField, fullFieldKey, form]);

  // Watch for form value changes and update Monaco Editor programmatically
  // Note: Removed this effect as it was causing focus issues by programmatically updating the editor
  // The Monaco editor now relies on the value prop for updates, which preserves focus

  // Monaco editor mount handler
  const handleEditorMount = useCallback((editor: monaco.editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
    try {
      editorRef.current = editor;
      monacoRef.current = monaco;
      setIsEditorReady(true);

      // Register SQL language if not already registered
      if (!monaco.languages.getLanguages().some(lang => lang.id === 'sql')) {
        monaco.languages.register({ id: 'sql' });
      }

      // Add command for manual trigger
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
        editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
      });

      // Listen for content changes to update height
      editor.onDidChangeModelContent(() => {
        const content = editor.getValue();
        const newHeight = calculateEditorHeight(content);
        setEditorHeight(newHeight);
      });

      // Initial height calculation
      const initialContent = editor.getValue();
      const initialHeight = calculateEditorHeight(initialContent);
      setEditorHeight(initialHeight);
    } catch (error) {
      console.error('Error in Monaco Editor:', error);
    }
  }, []);

  // Handle expression generation
  const handleExpressionGenerate = useCallback(async () => {
    const isCurrentlyGenerating = isFieldGenerating ? isFieldGenerating(fullFieldKey) : false;
    
    if (onExpressionGenerate && !isCurrentlyGenerating) {
      try {
        await onExpressionGenerate(fullFieldKey);
      } catch (error) {
        console.error('Error generating expression:', error);
      }
    }
  }, [onExpressionGenerate, isFieldGenerating, fullFieldKey, fieldKey, parentKey]);

  // Handle complex objects with properties or conditional logic outside of FormField
  // But skip if it's an endpoint field (endpoint ui-hint overrides object type)
  if (field.type === 'object' && (field.properties || field.allOf) && !isEndpointField) {
    return (
      <NestedObjectRenderer
        fieldKey={fieldKey}
        field={field}
        form={form}
        parentKey={parentKey}
        isRequired={isRequired}
        title={fieldTitle}
      />
    );
  }

  // Handle anyOf patterns (like in SchemaTransformation derived_fields)
  if (field.anyOf) {
    // For anyOf, we'll render based on the first valid schema
    // This is a simplified approach - in a full implementation, you might want to let users choose
    const firstSchema = field.anyOf[0];
    return (
      <FieldRenderer
        fieldKey={fieldKey}
        field={firstSchema}
        form={form}
        isRequired={isRequired}
        parentKey={parentKey}
      />
    );
  }

  // Handle allOf patterns - merge all schemas
  if (field.allOf) {
    // For allOf, merge all properties and render as a single field
    // This is a simplified approach for basic allOf patterns
    let mergedField = { ...field };
    
    field.allOf.forEach((subSchema: any) => {
      if (subSchema.properties) {
        mergedField.properties = { ...mergedField.properties, ...subSchema.properties };
      }
      if (subSchema.type && !mergedField.type) {
        mergedField.type = subSchema.type;
      }
      if (subSchema.enum && !mergedField.enum) {
        mergedField.enum = subSchema.enum;
      }
    });

    return (
      <FieldRenderer
        fieldKey={fieldKey}
        field={mergedField}
        form={form}
        isRequired={isRequired}
        parentKey={parentKey}
      />
    );
  }

  return (
    <FormField
      control={form.control}
      name={fullFieldKey}
      render={({ field: formField }) => {
        // Get the current value for expression fields without causing unnecessary re-renders
        const watchedValue = formField.value;
        
        return (
        <FormItem>
          {!compact && !isFieldTitleNumeric && !hideLabel && (
            <div className="flex items-center justify-between mb-2">
              <FormLabel className="text-sm font-medium">
                {fieldTitle}
                {isRequired && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              {field.description && (
                <div className="group relative">
                  <div className="w-4 h-4 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs cursor-help">
                    ?
                  </div>
                  <div className="absolute right-0 top-6 w-64 p-2 bg-popover border rounded-md shadow-md text-xs text-popover-foreground opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {field.description}
                  </div>
                </div>
              )}
            </div>
          )}
          <FormControl>
            {/* Handle Python Editor UI hint */}
            {isPythonEditor ? (
              <PythonEditor
                label={fieldTitle}
                value={formField.value || PYSPARK_TEMPLATE}
                onChange={formField.onChange}
                minHeight="400px"
                containerClassName="w-full"
              />
            ) : /* Handle Expression UI hint */
            isExpressionField ? (
              <div className="relative">
                <div
                  role="textbox"
                  aria-label={`SQL expression editor for ${fieldTitle}`}
                  className="relative"
                  tabIndex={0}
                  onFocus={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <div className="border rounded-md bg-white border-gray-300">
                    <MonacoEditor
                      key={fullFieldKey}
                      height={`${editorHeight}px`}
                      language="sql"
                      theme="vs-light"
                      value={watchedValue || ''}
                      onChange={(newValue) => {
                        formField.onChange(newValue || '');
                      }}
                      options={{
                        minimap: { enabled: false },
                        lineNumbers: 'off',
                        folding: false,
                        wordWrap: 'on',
                        contextmenu: false,
                        scrollBeyondLastLine: false,
                        overviewRulerBorder: false,
                        hideCursorInOverviewRuler: true,
                        overviewRulerLanes: 0,
                        renderLineHighlight: 'none',
                        selectionHighlight: false,
                        fontSize: 14,
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                        padding: { top: 8, bottom: 8 },
                        quickSuggestions: {
                          other: true,
                          comments: false,
                          strings: true
                        },
                        suggestOnTriggerCharacters: true,
                        acceptSuggestionOnCommitCharacter: true,
                        acceptSuggestionOnEnter: 'on',
                        suggest: {
                          showWords: true,
                          showProperties: true,
                          showFunctions: true,
                          showIcons: true,
                          showStatusBar: true,
                          preview: true,
                          showInlineDetails: true,
                          filterGraceful: true,
                          selectionMode: 'always'
                        },
                        automaticLayout: true
                      }}
                      onMount={handleEditorMount}
                    />
                  </div>
                </div>
                {onExpressionGenerate && (() => {
                  const isCurrentlyGenerating = isFieldGenerating ? isFieldGenerating(fullFieldKey) : false;
                  return (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleExpressionGenerate}
                      disabled={isCurrentlyGenerating}
                      className={`absolute right-2 top-2 p-1 h-auto ${
                        true ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } ${isCurrentlyGenerating ? 'opacity-70' : ''}`}
                      title={isCurrentlyGenerating ? "Generating expression..." : "Generate expression with AI"}
                    >
                      {isCurrentlyGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Hammer className="h-4 w-4" />
                      )}
                    </Button>
                  );
                })()}
              </div>
            ) : /* Handle Custom Components */
            isCustomComponent ? (
              (() => {
                const CustomComponent = getCustomComponent(field.component);
                
                if (!CustomComponent) {
                  console.error(`Custom component not found: ${field.component}`);
                  return (
                    <div className="text-red-500 text-sm">
                      Custom component "{field.component}" not found
                    </div>
                  );
                }

                
                return (
                  <CustomComponent
                    fieldKey={fieldKey}
                    field={field}
                    form={form}
                    sourceColumns={sourceColumns}
                    value={formField.value}
                    onChange={formField.onChange}
                    onExpressionGenerate={onExpressionGenerate}
                    isGenerating={isGenerating}
                  />
                );
              })()
            ) : /* Handle Endpoint UI hint */
            isEndpointField ? (
              <Select
                value={(() => {
                  // For complex connection objects, use connection_config_id
                  if (formField.value && typeof formField.value === 'object' && formField.value.connection_config_id) {
                    const val = formField.value.connection_config_id.toString();
                    return val;
                  }
                  // For simple values (like connection_config_id fields), use the value directly
                  const val = formField.value?.toString() || '';
                  return val;
                })()}
                onValueChange={(value) => {
                  // For specific connection fields that need full connection objects, we set the complete object
                  // For general endpoint fields (like connection_config_id), we just set the ID value
                  const isComplexConnectionField = (fieldKey === 'connection' || fullFieldKey.includes('connection')) && 
                                                   !fieldKey.includes('connection_config_id') && 
                                                   !fullFieldKey.includes('connection_config_id');
                  
                  if (isComplexConnectionField) {
                    // Find the selected connection object
                    const selectedConnection = endpointOptions.find((option: any) => {
                      const optionValue = option.id || option.value || option.connection_config_id || option;
                      const matches = optionValue.toString() === value;
                      
                      return matches;
                    });
                    
                    if (selectedConnection) {
                      // Create a complete connection object with the actual ID
                      const baseConnectionObject = {
                        connection_config_id: String(selectedConnection.id || selectedConnection.connection_config_id || value),
                        connection_type: selectedConnection.custom_metadata?.connection_type || 
                                       selectedConnection.connection_type || 
                                       selectedConnection.custom_metadata?.type || 
                                       selectedConnection.type,
                        name: selectedConnection.connection_config_name || 
                              selectedConnection.name || 
                              selectedConnection.connection_name,
                        id: selectedConnection.id, // Preserve the original database ID
                      };
                      
                      // Add custom_metadata fields if they exist
                      if (selectedConnection.custom_metadata && typeof selectedConnection.custom_metadata === 'object') {
                        Object.keys(selectedConnection.custom_metadata).forEach(key => {
                          if (selectedConnection.custom_metadata[key] !== undefined && selectedConnection.custom_metadata[key] !== null) {
                            baseConnectionObject[key] = selectedConnection.custom_metadata[key];
                          }
                        });
                      }
                      
                      // Remove any undefined or null values to prevent validation issues
                      const connectionObject = {};
                      Object.keys(baseConnectionObject).forEach(key => {
                        if (baseConnectionObject[key] !== undefined && baseConnectionObject[key] !== null && baseConnectionObject[key] !== '') {
                          connectionObject[key] = baseConnectionObject[key];
                        }
                      });
                      
                      try {
                        formField.onChange(connectionObject);
                        
                        // Check form validation state after setting the connection
                        setTimeout(() => {
                          const formState = form?.formState;
                        }, 100);
                      } catch (error) {
                        console.error('🔧 FieldRenderer: Error setting connection object:', error);
                        console.error('🔧 FieldRenderer: Connection object that caused error:', connectionObject);
                      }
                    } else {
                      // Fallback to just the connection_config_id
                      formField.onChange({ connection_config_id: String(value) });
                    }
                  } else {
                    // For endpoint fields (like connection_config_id), just set the ID value
                    formField.onChange(value);
                  }
                }}
                disabled={isLoadingEndpoint}
              >
                <SelectTrigger className={compact ? "h-9 text-sm" : "h-9 text-sm"}>
                  <SelectValue placeholder={isLoadingEndpoint ? "Loading..." : `Select ${fieldTitle.toLowerCase()}...`} />
                </SelectTrigger>
                <SelectContent style={{ zIndex: 99999 }} className="max-h-48">
                  {isLoadingEndpoint ? (
                    <SelectItem value="loading" disabled>
                      Loading options...
                    </SelectItem>
                  ) : endpointOptions.length > 0 ? (
                    endpointOptions.map((option: any) => {
                      // Handle different option formats
                      const value = option.id || option.value || option.connection_config_id || option;
                      // Prioritize connection_config_name for display, fallback to connection_name, then other options
                      const label = option.connection_config_name || 
                                  option.connection_name || 
                                  option.name || 
                                  option.label || 
                                  option.title || 
                                  value;
                      
                      // Debug logging for connection options
                      const isComplexConnectionField = (fieldKey === 'connection' || fullFieldKey.includes('connection')) && 
                                                       !fieldKey.includes('connection_config_id') && 
                                                       !fullFieldKey.includes('connection_config_id');
                      
                      return (
                        <SelectItem key={value} value={value.toString()}>
                          {label || `[No Label - ${value}]`}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="no-options" disabled>
                      No options available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            ) : /* Handle Auto-complete UI hint */
            isAutoComplete ? (
              (() => {
                const columnOptions = sourceColumns?.map(col => col.name) || [];
                return (
                  <Autocomplete
                    options={columnOptions}
                    value={formField.value || ''}
                    onChange={(newValue) => {
                      formField.onChange(newValue);
                    }}
                    placeholder={`Select ${fieldTitle}`}
                    className={compact ? "w-full text-sm h-9" : "w-full h-9"}
                  />
                );
              })()
            ) : field.type === 'boolean' ? (
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formField.value || false}
                  onCheckedChange={formField.onChange}
                />
                <span className="text-sm">
                  {`Enable ${fieldTitle}`}
                </span>
              </div>
            ) : field.enum ? (
              <Select
                value={formField.value?.toString() || ''}
                onValueChange={(value) => {
                  if (process.env.NODE_ENV === 'development' && fieldKey.includes('source_type')) {
                    console.log(`🔧 FieldRenderer: source_type changed to "${value}" for field key "${fieldKey}"`);
                  }
                  formField.onChange(value);
                }}
              >
                <SelectTrigger className={compact ? "h-9 text-sm" : "h-9 text-sm"}>
                  <SelectValue placeholder={`Select ${fieldTitle.toLowerCase()}...`} />
                </SelectTrigger>
                <SelectContent style={{ zIndex: 99999 }} className="max-h-48">
                  {field.enum
                    .filter((option: string) => option !== null && option !== undefined && option !== '')
                    .map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            ) : field.type === 'string' && (field.format === 'textarea' || field.minLength > 100 || fieldKey === 'expression') ? (
              <>
                <Textarea
                  {...formField}
                  placeholder={field.examples?.[0] || field.default || (fieldKey === 'expression' ? 'Enter SQL expression...' : '')}
                  rows={compact ? 1 : (fieldKey === 'expression' ? 2 : (field.format === 'textarea' ? 4 : 3))}
                  className={compact ? `text-sm resize-none h-9 ${fieldKey === 'expression' ? 'font-mono' : ''}` : `text-sm resize-none ${fieldKey === 'expression' ? 'font-mono' : ''}`}
                />
              </>
            ) : field.type === 'array' ? (
              // Handle array fields - check if it's a simple string array or complex array
              field.items?.type === 'string' ? (
                // Simple string array - use a better UI for column selection
                <div className="space-y-2">
                  {!hideLabel && (
                    <div className="text-sm font-medium text-muted-foreground">
                      {fieldTitle} (one per line)
                    </div>
                  )}
                  <Textarea
                    {...formField}
                    value={Array.isArray(formField.value) ? formField.value.join('\n') : formField.value || ''}
                    onChange={(e) => {
                      const arrayValue = e.target.value.split('\n')
                        .map(line => line.trim())
                        .filter(line => line !== '');
                      formField.onChange(arrayValue);
                    }}
                    placeholder={hideLabel ? `Enter ${fieldTitle.toLowerCase()}, one per line` : "Enter column names, one per line"}
                    rows={compact ? 2 : Math.max(3, Math.min(8, (formField.value?.length || 0) + 2))}
                    className={`font-mono text-sm ${compact ? 'text-xs' : ''}`}
                  />
                  {!hideLabel && sourceColumns && sourceColumns.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Available columns: {sourceColumns.map(col => col.name).join(', ')}
                    </div>
                  )}
                </div>
              ) : (
                // Complex array - fallback to simple textarea
                <div className="space-y-2">
                  {!hideLabel && (
                    <div className="text-sm text-muted-foreground">
                      Array field: {fieldTitle}
                    </div>
                  )}
                  <Textarea
                    {...formField}
                    value={Array.isArray(formField.value) ? formField.value.join('\n') : formField.value || ''}
                    onChange={(e) => {
                      const arrayValue = e.target.value.split('\n').filter(line => line.trim() !== '');
                      formField.onChange(arrayValue);
                    }}
                    placeholder={hideLabel ? `Enter ${fieldTitle.toLowerCase()}, one per line` : "Enter one item per line"}
                    rows={compact ? 2 : 3}
                    className={compact ? 'text-xs' : ''}
                  />
                </div>
              )
            ) : field.type === 'object' ? (
              // Handle object fields - check if it's a key-value object or structured object
              (() => {
                const useKeyValueEditor = (field.additionalProperties && !field.properties && !field.allOf) || fieldKey === 'rename_columns';
                return useKeyValueEditor;
              })() ? (
                // Key-value object (like parameters) or specifically rename_columns
                (() => {
                 
                  return (
                    <KeyValueEditor
                      value={formField.value || {}}
                      onChange={(newValue) => {
                        formField.onChange(newValue);
                      }}
                      placeholder={fieldKey === 'rename_columns' ? "Add column rename" : "Add parameter"}
                    />
                  );
                })()
              ) : field.properties || field.allOf ? (
                // Complex structured object with properties or conditional logic
                <div className="w-full">
                  <NestedObjectRenderer
                    fieldKey={fieldKey}
                    field={field}
                    form={form}
                    parentKey={parentKey}
                    isRequired={isRequired}
                    title={fieldTitle}
                  />
                </div>
              ) : (
                // Simple object or fallback to JSON editor
                <div className="p-3 border rounded-md bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-2">
                    Object field: {fieldTitle}
                  </div>
                  <Textarea
                    {...formField}
                    value={typeof formField.value === 'object' ? JSON.stringify(formField.value, null, 2) : formField.value || ''}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        formField.onChange(parsed);
                      } catch {
                        formField.onChange(e.target.value);
                      }
                    }}
                    placeholder="Enter JSON object"
                    rows={4}
                  />
                </div>
              )
            ) : (
              <Input
                {...formField}
                type={
                  field.type === 'number' || field.type === 'integer'
                    ? 'number'
                    : field.format === 'password'
                    ? 'password'
                    : 'text'
                }
                placeholder={field.examples?.[0] || field.default || ''}
                className={compact ? "h-9 text-sm" : "h-9"}
                onChange={(e) => {
                  const value = e.target.value;
                  if (field.type === 'number' || field.type === 'integer') {
                    // Convert string to number for number/integer fields
                    if (value === '' || value === null || value === undefined) {
                      formField.onChange(undefined);
                    } else {
                      const numValue = field.type === 'integer' ? parseInt(value, 10) : parseFloat(value);
                      formField.onChange(isNaN(numValue) ? value : numValue);
                    }
                  } else {
                    formField.onChange(value);
                  }
                }}
              />
            )}
          </FormControl>

          <FormMessage className="text-xs" />
        </FormItem>
        );
      }}
    />
  );
};