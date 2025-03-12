import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { lazy } from 'react';
import * as monaco from 'monaco-editor';
import { Schema } from '../../types/formTypes';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface FormFieldProps {
  fieldSchema: Schema;
  name: string;
  fieldKey: string;
  enumValues?: string[];
  value: string | { expression: string };
  isExpression?: boolean;
  required?: boolean;
  onExpressionClick?: () => void;
  onBlur?: () => void;
  sourceColumns?: SourceColumn[];
  additionalColumns?: string[] | Array<{ name: string; dataType: string; }>;
  error?: any;
  disabled?: boolean;
  onValidate?: (value: string) => string | undefined;
  onChange?: (...event: any[]) => void;
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

// Define the handleEditorError function
const handleEditorError = (error: any) => {
  console.error('Error loading Monaco Editor:', error);
  // Optionally, you can display a user-friendly message or take other actions
};

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

// Add these styles at the top of the file
const expressionEditorStyles = {
  wrapper: 'relative rounded-md border border-gray-300 shadow-sm hover:border-gray-400 focus-within:border-gray-400 my-2',
  header: 'flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50',
  headerTitle: 'text-sm font-medium text-gray-700',
  editorContainer: 'p-0.5 bg-white',
  editor: 'min-h-[200px] max-h-[400px] overflow-auto'
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
  onBlur,
  sourceColumns = [],
  additionalColumns = [],
  error,
  disabled,
  onValidate,
  onChange,
}) => {
  const { control, setValue, setError, formState: { errors } } = useForm();
  const [isEditorReady, setIsEditorReady] = React.useState(false);
  const [editorError, setEditorError] = React.useState<string | null>(null);

  // Memoized label to prevent unnecessary rerenders
  const label = React.useMemo(() => (
    <span>
      {fieldKey.replace(/_/g, ' ').split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')}
      {required && <span style={{ color: 'red' }} aria-label="required field"> *</span>}
    </span>
  ), [fieldKey, required]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (value && typeof value === 'object' && 'expression' in value) {
      onChange({ ...value as Record<string, unknown>, expression: newValue });
    } else {
      onChange(newValue);
    }
  };
console.log(additionalColumns,"sourceColumns")
  if (enumValues) {
    return (  
      <Controller
        control={control}
        name={name}
        rules={{ validate: onValidate }}
        render={({ field }) => (
          <div className="relative">
            <Select>
              <SelectTrigger
                {...field}
                // required={required}
                disabled={disabled}
                className={`block w-full mt-1 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                aria-label={`Select ${fieldKey}`}
              >
                <SelectValue placeholder={`Select ${fieldKey}`} />
              </SelectTrigger>
              <SelectContent>
                {enumValues.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <span className="text-red-500 text-sm">{typeof error === 'string' ? error : error?.message}</span>}
          </div>
        )}
      />
    );
  }

  return (
    <div className="form-field">
      {isExpression ? (
        <div className={expressionEditorStyles.wrapper}>
          {/* <div className={expressionEditorStyles.header}>
            <span className={expressionEditorStyles.headerTitle}>Expression Editor</span>
            <button
              type="button"
              onClick={() => onExpressionClick?.()}
              className="px-2 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
            >
              Generate
            </button>
          </div> */}
          <div className={expressionEditorStyles.editorContainer}>
            <MonacoEditor
              height="200px"
              language="sql"
              theme="vs-light"
              value={typeof value === 'object' && 'expression' in value ? value.expression : value}
              onChange={(newValue) => onChange(newValue || '')}
              options={{
                minimap: { enabled: false },
                lineNumbers: 'off',
                folding: false,
                wordWrap: 'on',
                contextmenu: false,
                scrollBeyondLastLine: false
              }}
              onMount={(editor, monaco) => {
                try {
                  setIsEditorReady(true);

                  // Register SQL language features if not already registered
                  if (!monaco.languages.getLanguages().some(lang => lang.id === 'sql')) {
                    monaco.languages.register({ id: 'sql' });

                    // Add SQL syntax highlighting
                    monaco.languages.setMonarchTokensProvider('sql', {

                      defaultToken: '',
                      tokenPostfix: '.sql',
                      ignoreCase: true,

                      keywords: [
                        // SQL Keywords
                        'SELECT', 'FROM', 'WHERE', 'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
                        'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL', 'TRUE', 'FALSE',
                        'ORDER', 'BY', 'GROUP', 'HAVING', 'ASC', 'DESC', 'DISTINCT', 'LIMIT',
                        // PostgreSQL Functions
                        'CONCAT', 'CONCAT_WS', 'COALESCE', 'NULLIF', 'CAST', 'SUBSTRING', 'TRIM',
                        'UPPER', 'LOWER', 'INITCAP', 'LENGTH', 'REPLACE', 'ROUND', 'TO_CHAR',
                        'TO_DATE', 'DATE_PART', 'NOW', 'CURRENT_TIMESTAMP', 'EXTRACT', 'ARRAY',
                        'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'STRING_AGG', 'ARRAY_AGG'
                      ],

                      builtins: [
                        'int', 'integer', 'text', 'char', 'varchar', 'date', 'timestamp',
                        'boolean', 'bool', 'float', 'double', 'decimal', 'numeric'
                      ],

                      operators: [
                        '=', '<=>', '>=', '>', '<=', '<', '<>', '!=', '||', '+', '-', '*', '/',
                        '&', '|', '^', '%', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN', 'IS NOT',
                        'IS NULL', 'IS NOT NULL', 'BETWEEN', 'NOT BETWEEN'
                      ],

                      symbols: /[=><!~?:&|+\-*\/\^%]+/,

                      tokenizer: {
                        root: [
                          // Identifiers and keywords
                          [/[a-zA-Z_]\w*/, {
                            cases: {
                              '@keywords': 'keyword',
                              '@builtins': 'type',
                              '@default': 'identifier'
                            }
                          }],

                          // Whitespace
                          { include: '@whitespace' },

                          // Delimiters and operators
                          [/[{}()\[\]]/, '@brackets'],
                          [/@symbols/, {
                            cases: {
                              '@operators': 'operator',
                              '@default': 'delimiter'
                            }
                          }],

                          // Numbers
                          [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
                          [/\d+/, 'number'],

                          // Strings
                          [/'([^'\\]|\\.)*$/, 'string.invalid'],
                          [/'/, { token: 'string.quote', bracket: '@open', next: '@string' }],
                          [/"([^"\\]|\\.)*$/, 'string.invalid'],
                          [/"/, { token: 'string.quote', bracket: '@open', next: '@string_double' }],

                          // Comments
                          [/--.*$/, 'comment'],
                          [/\/\*/, { token: 'comment.quote', next: '@comment' }]
                        ],

                        string: [
                          [/[^']+/, 'string'],
                          [/''/, 'string'],
                          [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
                        ],

                        string_double: [
                          [/[^"]+/, 'string'],
                          [/""/, 'string'],
                          [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
                        ],

                        comment: [
                          [/[^/*]+/, 'comment'],
                          [/\*\//, { token: 'comment.quote', next: '@pop' }],
                          [/[/*]/, 'comment']
                        ],

                        whitespace: [
                          [/\s+/, 'white']
                        ]
                      }
                      // ... existing token provider setup ...
                    });
                  }

                  // Register completion provider
                  const disposable = monaco.languages.registerCompletionItemProvider('sql', {
                    triggerCharacters: [' ', '.', '(', ',', '['],
                    provideCompletionItems: (model, position) => {
                      const wordInfo = model.getWordUntilPosition(position);
                      const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: wordInfo.startColumn,
                        endColumn: wordInfo.endColumn
                      };

                      const suggestions = new Map();

                      // Add SQL Keywords suggestions
                      SQL_KEYWORDS.forEach(keyword => {
                        if (!wordInfo.word || keyword.toLowerCase().includes(wordInfo.word.toLowerCase())) {
                          suggestions.set(`keyword-${keyword}`, {
                            label: keyword,
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: keyword,
                            detail: 'SQL Keyword',
                            documentation: { value: `SQL Keyword: ${keyword}` },
                            range
                          });
                        }
                      });

                      // Debugging: Log sourceColumns
                      console.log('Source Columns:', sourceColumns);

                      // Add source columns suggestions
                      sourceColumns.forEach(col => {
                        if (!wordInfo.word || col.name.toLowerCase().includes(wordInfo.word.toLowerCase())) {
                          suggestions.set(`source-${col.name}`, {
                            label: col.name,
                            kind: monaco.languages.CompletionItemKind.Field,
                            insertText: col.name,
                            detail: `(${col.dataType})`,
                            documentation: { value: `**${col.name}**\nType: ${col.dataType}` },
                            range
                          });
                        }
                      });

                      // Debugging: Log additionalColumns
                      console.log('Additional Columns:', additionalColumns);

                      // Add additional columns suggestions
                      const processedColumns = new Set(sourceColumns.map(col => col.name));
                      const normalizedAdditionalColumns = (additionalColumns as Array<any>).map(normalizeColumn);
                      normalizedAdditionalColumns.forEach(col => {
                        if (!processedColumns.has(col.name) && 
                          (!wordInfo.word || col.name.toLowerCase().includes(wordInfo.word.toLowerCase()))) {
                          suggestions.set(`additional-${col.name}`, {
                            label: col.name,
                            kind: monaco.languages.CompletionItemKind.Field,
                            insertText: col.name,
                            detail: `(${col.dataType})`,
                            documentation: { value: `**${col.name}**\nAdditional Column` },
                            range
                          });
                        }
                      });

                      return {
                        suggestions: Array.from(suggestions.values())
                      };
                    }
                  });

                  // Add command for manual trigger
                  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
                    editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
                  });

                  // Ensure to dispose of the completion provider when unmounting
                  return () => {
                    disposable.dispose();
                  };
                } catch (error) {
                  console.error('Error in Monaco Editor:', error);
                  setEditorError(error?.message || 'Error initializing editor');
                }
              }}
            />
          </div>
        </div>
      ) : (
        <Controller
          control={control}
          name={name}
          rules={{ validate: onValidate }}
          render={({ field }) => (
            <Input
              {...field}
              placeholder={`Enter ${fieldKey}`}
              value={typeof value === 'object' && 'expression' in value ? value.expression : value}
              required={required}
              disabled={disabled}
              className={`border ${errors[name] || error ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              aria-label={fieldKey}
            />
          )}
        />
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