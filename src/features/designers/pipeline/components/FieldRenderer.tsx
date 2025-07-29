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
}) => {
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [editorHeight, setEditorHeight] = useState(40);
  const [forceRender, setForceRender] = useState(0);
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
  
  // Debug logging for expression fields
  if (fieldKey === 'expression') {
    console.log('🎯 Expression field debug:', {
      fieldKey,
      uiHint,
      fieldType: field.type,
      isExpressionField,
      fullFieldKey,
      currentValue: form.watch(fullFieldKey)
    });
  }
  
  // Debug logging for autocomplete fields
  if (uiHint === 'auto-complete' || uiHint === 'autocomplete' || field.type === 'autocomplete') {
    console.log('🔍 Autocomplete field detected:', {
      fieldKey,
      fullFieldKey,
      uiHint,
      fieldType: field.type,
      isAutoComplete,
      sourceColumns: sourceColumns?.length || 0,
      sourceColumnsData: sourceColumns,
      field
    });
  }

  // Debug logging for custom components
  if (isCustomComponent) {
    console.log('🔧 Custom component field detected:', {
      fieldKey,
      fullFieldKey,
      uiHint,
      component: field.component,
      field
    });
  }

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
  useEffect(() => {
    if (isExpressionField && editorRef.current && form) {
      const currentFormValue = form.watch(fullFieldKey) || '';
      const currentEditorValue = editorRef.current.getValue();
      
      // Only update if the values are different to avoid infinite loops
      if (currentFormValue !== currentEditorValue) {
        console.log('🎯 Updating Monaco Editor value programmatically:', {
          fullFieldKey,
          currentFormValue,
          currentEditorValue
        });
        
        // Update the editor value programmatically
        editorRef.current.setValue(currentFormValue);
        
        // Update height based on new content
        const newHeight = calculateEditorHeight(currentFormValue);
        setEditorHeight(newHeight);
        
        // Force a re-render to ensure the UI updates
        setForceRender(prev => prev + 1);
      }
    }
  }, [form?.watch(fullFieldKey), isExpressionField, fullFieldKey, form]);

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
    
    console.log('🎯 FieldRenderer handleExpressionGenerate called:', {
      fieldKey,
      parentKey,
      fullFieldKey,
      hasOnExpressionGenerate: !!onExpressionGenerate,
      isCurrentlyGenerating,
      isExpressionField,
      uiHint: field['ui-hint']
    });
    
    if (onExpressionGenerate && !isCurrentlyGenerating) {
      try {
        await onExpressionGenerate(fullFieldKey);
      } catch (error) {
        console.error('Error generating expression:', error);
      }
    }
  }, [onExpressionGenerate, isFieldGenerating, fullFieldKey, fieldKey, parentKey]);

  // Handle complex objects with properties or conditional logic outside of FormField
  if (field.type === 'object' && (field.properties || field.allOf)) {
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
        // Force re-render when form value changes for expression fields
        const watchedValue = form.watch(fullFieldKey);
        
        return (
        <FormItem>
          {!isFieldTitleNumeric && (
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
                description={field.description}
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
                      key={`${fullFieldKey}-${watchedValue || 'empty'}-${forceRender}`}
                      height={`${editorHeight}px`}
                      language="sql"
                      theme="vs-light"
                      value={watchedValue || ''}
                      onChange={(newValue) => {
                        console.log('🎯 Monaco Editor onChange:', { fullFieldKey, newValue, oldValue: formField.value });
                        formField.onChange(newValue || '');
                      }}
                      onMount={(editor) => {
                        console.log('🎯 Monaco Editor mounted for:', fullFieldKey, 'with value:', watchedValue);
                        // Store editor reference for potential programmatic updates
                        editorRef.current = editor;
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

                console.log('🔧 Rendering custom component:', field.component);
                
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
            ) : /* Handle Auto-complete UI hint */
            isAutoComplete ? (
              (() => {
                console.log('🎯 Rendering Autocomplete for:', fieldKey, 'with options:', sourceColumns?.map(col => col.name) || []);
                return (
                  <Autocomplete
                    options={sourceColumns?.map(col => col.name) || []}
                    value={formField.value || ''}
                    onChange={formField.onChange}
                    placeholder={`Select ${fieldTitle}`}
                    className="w-full"
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
                  {field.description || `Enable ${fieldTitle}`}
                </span>
              </div>
            ) : field.enum ? (
              <Select
                value={formField.value?.toString() || ''}
                onValueChange={formField.onChange}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={`Select ${fieldTitle.toLowerCase()}...`} />
                </SelectTrigger>
                <SelectContent style={{ zIndex: 99999 }} className="max-h-48">
                  {field.enum.map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'string' && (field.format === 'textarea' || field.minLength > 100 || fieldKey === 'expression') ? (
              <>
                {fieldKey === 'expression' && console.log('🎯 Using Textarea for expression field:', { fullFieldKey, value: formField.value })}
                <Textarea
                  {...formField}
                  placeholder={field.examples?.[0] || field.default || (fieldKey === 'expression' ? 'Enter SQL expression...' : '')}
                  rows={fieldKey === 'expression' ? 2 : (field.format === 'textarea' ? 4 : 3)}
                  className={`text-sm resize-none ${fieldKey === 'expression' ? 'font-mono' : ''}`}
                />
              </>
            ) : field.type === 'array' ? (
              // Handle array fields with simple textarea for now
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Array field: {fieldTitle}
                </div>
                <Textarea
                  {...formField}
                  value={Array.isArray(formField.value) ? formField.value.join('\n') : formField.value || ''}
                  onChange={(e) => {
                    const arrayValue = e.target.value.split('\n').filter(line => line.trim() !== '');
                    formField.onChange(arrayValue);
                  }}
                  placeholder="Enter one item per line"
                  rows={3}
                />
              </div>
            ) : field.type === 'object' ? (
              // Handle object fields - check if it's a key-value object or structured object
              field.additionalProperties && !field.properties && !field.allOf ? (
                // Key-value object (like parameters)
                <KeyValueEditor
                  value={formField.value || {}}
                  onChange={formField.onChange}
                  placeholder="Add parameter"
                />
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
                className="h-9"
              />
            )}
          </FormControl>
          {field.description && (
            <FormDescription>
              {field.description}
            </FormDescription>
          )}
          <FormMessage className="text-xs" />
        </FormItem>
        );
      }}
    />
  );
};