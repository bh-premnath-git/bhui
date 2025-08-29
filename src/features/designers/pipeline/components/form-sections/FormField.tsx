import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { lazy } from 'react';
import * as monaco from 'monaco-editor';
import { Schema } from '../../types/formTypes';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { PythonEditor } from '@/components/ui/python-editor';
import { Hammer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Autocomplete } from '@/components/ui/autocomplete';

interface FormFieldProps {
  className?: string;
  fieldSchema: Schema;
  name: string;
  fieldKey: string;
  enumValues?: string[];
  value: string | { expression: string };
  isExpression?: boolean;
  required?: boolean;
  onExpressionClick?: () => void;
  onHammerClick?: () => void;
  onBlur?: () => void;
  sourceColumns?: SourceColumn[];
  additionalColumns?: string[] | Array<{ name: string; dataType: string; }>;
  error?: any;
  disabled?: boolean;
  onValidate?: (value: string) => string | undefined;
  onChange?: (...event: any[]) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  isAiEnabled?: boolean;
  isLoading?: boolean;
  control?: any;
  formInitialValues?: any;
  columnSuggestions?: any;
  setValue?: any;
}

interface SourceColumn {
  name: string;
  dataType: string;
}

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

// Move SQL keywords outside to prevent recreating on each mount
const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL', 'TRUE', 'FALSE',
  'ORDER BY', 'GROUP BY', 'HAVING', 'ASC', 'DESC', 'DISTINCT', 'LIMIT',
  'CONCAT', 'COALESCE', 'NULLIF', 'CAST', 'SUBSTRING', 'TRIM',
  'UPPER', 'LOWER', 'LENGTH', 'REPLACE', 'ROUND',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX'
];

// Add this helper function to normalize column format
const normalizeColumn = (col: string | { name: string; dataType?: string }) => {
  if (typeof col === 'string') {
    return {
      name: col,
      dataType: 'string' // default type
    };
  }
  return {
    name: col.name,
    dataType: col.dataType || 'string'
  };
}; 

// Dynamic height calculation function
const calculateEditorHeight = (content: string): number => {
  const lines = content.split('\n');
  const lineHeight = 20; // Monaco editor line height
  const padding = 16; // Top and bottom padding
  const minHeight = 40; // Same as regular input field
  const maxHeight = 300; // Maximum height to prevent excessive growth
  
  const calculatedHeight = Math.max(
    minHeight,
    Math.min(maxHeight, (lines.length * lineHeight) + padding)
  );
  
  return calculatedHeight;
};

export const FormField: React.FC<FormFieldProps> = React.memo(({
  fieldSchema,
  name,
  fieldKey,
  enumValues,
  value,
  isExpression,
  required,
  onExpressionClick,
  onHammerClick,
  onBlur,
  sourceColumns = [],
  additionalColumns = [
],
  error,
  disabled, 
  onValidate,
  onChange, 
  onKeyDown,
  isAiEnabled = false,
  isLoading = false,
}) => {
  const { control, setValue, setError, formState: { errors } } = useForm();
  const [isEditorReady, setIsEditorReady] = React.useState(false);
  const [editorError, setEditorError] = React.useState<string | null>(null);
  const [editorHeight, setEditorHeight] = React.useState(40); // Start with input field height
  const completionProviderRef = React.useRef<monaco.IDisposable | null>(null);
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = React.useRef<typeof monaco | null>(null);

  useEffect(() => {
    if (isEditorReady && editorRef.current && monacoRef.current && isExpression) {
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

          // Add additional columns
          if (additionalColumns && additionalColumns.length > 0) {
            const processedColumns = new Set(sourceColumns.map(col => col.name));
            const normalizedColumns = (additionalColumns as Array<any>).map(normalizeColumn);
            
            normalizedColumns.forEach(col => {
              if (!processedColumns.has(col.name)) {
                suggestions.push({
                  label: col.name,
                  kind: monacoRef.current!.languages.CompletionItemKind.Field,
                  insertText: col.name,
                  detail: `Additional Column (${col.dataType})`,
                  documentation: {
                    value: `**${col.name}**\nType: ${col.dataType}`
                  },
                  range: range,
                  sortText: '2' + col.name // Additional columns appear last
                });
              }
            });
          }

          return { suggestions };
        }
      });
    }

    return () => {
      if (completionProviderRef.current) {
        completionProviderRef.current.dispose();
      }
    };
  }, [isEditorReady, sourceColumns, isExpression]);

  // Update editor height when content changes
  useEffect(() => {
    if (isExpression && value) {
      const content = typeof value === 'object' && 'expression' in value ? value.expression : value;
      const newHeight = calculateEditorHeight(content || '');
      setEditorHeight(newHeight);
    }
  }, [value, isExpression]);

  // Update the MonacoEditor onMount handler
  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
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
      setEditorError(error?.message || 'Error initializing editor');
    }
  };

  // Check for autocomplete type
  const isAutocompleteField = fieldSchema?.type === 'autocomplete';
  
  // Check for select type
  const isSelectField = 
    fieldSchema?.type === 'select' || 
    (enumValues && enumValues.length > 0);

  // If it's an autocomplete field, use the Autocomplete component
  if (isAutocompleteField && !isExpression) {
    const options = sourceColumns?.map(col => col.name) || [];
    
    return (
      <div className="form-field">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {fieldKey.replace(/_/g, ' ').split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <Controller
          control={control}
          name={name}
          defaultValue={value || ''}
          render={({ field }) => (
            <div className="relative">
              <Autocomplete
                options={options}
                value={field.value || ''}
                onChange={(newValue) => {
                  field.onChange(newValue);
                  onChange?.(newValue);
                }}
                placeholder={`Select ${fieldKey}`}
                className={`w-full ${error ? 'border-red-500' : ''}`}
                disabled={disabled}
              />
              {error && (
                <span className="text-red-500 text-sm mt-1 block">
                  {typeof error === 'string' ? error : error?.message}
                </span>
              )}
            </div>
          )}
        />
      </div>
    );
  }

  // If it's a select field, use the Select component
  if (isSelectField && !isExpression) {
    const options = enumValues || fieldSchema?.enum || [];
    
    return (
      <div className="form-field">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {fieldKey.replace(/_/g, ' ').split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <Controller
          control={control}
          name={name}
          defaultValue={value || ''}
          render={({ field }) => (
            <div className="relative">
              <Select
                defaultValue={field.value}
                onValueChange={(newValue) => {
                  field.onChange(newValue);
                  onChange?.(newValue);
                }}
                disabled={disabled}
              >
                <SelectTrigger 
                  className={`w-full ${error ? 'border-red-500' : ''}`}
                >
                  <SelectValue placeholder={`Select ${fieldKey}`} />
                </SelectTrigger>
                <SelectContent style={{zIndex:9999}}>
                  {options.map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option.replace(/_/g, ' ').split(' ').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error && (
                <span className="text-red-500 text-sm mt-1 block">
                  {typeof error === 'string' ? error : error?.message}
                </span>
              )}
            </div>
          )}
        />
      </div>
    );
  }

  // Handle expression fields
  if (isExpression) {
    return (
      <div className="form-field">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {fieldKey.replace(/_/g, ' ').split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <div
            role="textbox"
            aria-label={`SQL expression editor for ${fieldKey}`}
            className={`relative ${disabled ? 'opacity-50' : ''}`}
            tabIndex={0}
            onFocus={(e) => {
              e.stopPropagation();
            }}
          >
            <div className={`
              border rounded-md bg-white
              ${error ? 'border-red-500' : 'border-gray-300'}
              ${disabled ? 'bg-gray-50' : ''}
            `}>
              <MonacoEditor
                height={`${editorHeight}px`}
                language="sql"
                theme="vs-light"
                value={typeof value === 'object' && 'expression' in value ? value.expression : value}
                onChange={(newValue) => onChange?.(newValue || '')}
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
            {editorError && (
              <div className="text-red-500 text-sm mt-1">{editorError}</div>
            )}
            {error && (
              <span className="text-red-500 text-sm mt-1 block">
                {typeof error === 'string' ? error : error?.message}
              </span>
            )}
          </div>
          {onHammerClick && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onHammerClick}
              disabled={disabled || isLoading}
              className={`absolute right-2 top-2 p-1 h-auto ${
                isAiEnabled ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${isLoading ? 'opacity-70' : ''}`}
              title={isLoading ? "Generating expression..." : "Generate expression with AI"}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Hammer className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Default input field
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (value && typeof value === 'object' && 'expression' in value) {
      onChange?.({ ...value as Record<string, unknown>, expression: newValue });
    } else {
      onChange?.(newValue);
    }
  };

  // Handle Python editor
  if (fieldSchema.type === 'python_editor') {
    return (
      <div className="form-field">
        <Controller
          control={control}
          name={name}
          defaultValue={value || ''}
          render={({ field }) => (
            <PythonEditor
              label={fieldKey}
              description={fieldSchema.description}
              value={field.value}
              onChange={(newValue) => {
                field.onChange(newValue);
                onChange?.(newValue);
              }}
              error={error ? (typeof error === 'string' ? error : error?.message) : undefined}
              minHeight="400px"
              containerClassName="w-full"
              
            />
          )}
        />
      </div>
    );
  }

  // Handle number type
  if (fieldSchema.type === 'number') {
    return (
      <div className="form-field">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {fieldKey.replace(/_/g, ' ').split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <Controller
          control={control}
          name={name}
          defaultValue={value || ''}
          render={({ field }) => (
            <Input
              {...field}
              type="number"
              value={field.value || ''}
              onChange={(e) => {
                const numValue = e.target.value === '' ? '' : Number(e.target.value);
                field.onChange(numValue);
                onChange?.(numValue);
              }}
              placeholder={`Enter ${fieldKey}`}
              required={required}
              disabled={disabled}
              className={`${error ? 'border-red-500' : ''}`}
              aria-label={fieldKey}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
            />
          )}
        />
        {error && (
          <span className="text-red-500 text-sm mt-1 block">
            {typeof error === 'string' ? error : error?.message}
          </span>
        )}
      </div>
    );
  }

  // Inside the FormField component, before the return statement
  if (fieldSchema.type === 'boolean') {
    return (
      <div className="form-field">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {fieldKey.replace(/_/g, ' ').split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <Controller
          control={control}
          name={name}
          defaultValue={value || false}
          render={({ field }) => (
            <Toggle
              pressed={field.value}
              onPressedChange={(pressed) => {
                field.onChange(pressed);
                onChange?.(pressed);
              }}
              variant="outline"
              className={`${errors[name] || error ? 'border-red-500' : ''}`}
              aria-label={fieldKey}
              disabled={disabled}
            >
              {field.value ? 'On' : 'Off'}
            </Toggle>
          )}
        />
        {error && (
          <span className="text-red-500 text-sm mt-1 block">
            {typeof error === 'string' ? error : error?.message}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="form-field">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {fieldKey.replace(/_/g, ' ').split(' ').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Controller
        control={control}
        name={name}
        defaultValue={value || ''}
        rules={{ validate: onValidate }}
        render={({ field }) => (
          <Input
            {...field}
            value={field.value || ''}
            onChange={(e) => {
              field.onChange(e);
              handleInputChange(e);
            }}
            placeholder={`Enter ${fieldKey}`}
            required={required}
            disabled={disabled}
            className={`${errors[name] || error ? 'border-red-500' : ''}`}
            aria-label={fieldKey}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
          />
        )}
      />
      {error && (
        <span className="text-red-500 text-sm mt-1 block">
          {typeof error === 'string' ? error : error?.message}
        </span>
      )}
    </div>
  );
});

// Add prop types validation
FormField.defaultProps = {
  isExpression: false,
  required: false,
  disabled: false,
  sourceColumns: [],
};

FormField.displayName = 'FormField'; 