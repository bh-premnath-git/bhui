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
  value: string;
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
                required={required}
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
    <Controller
      control={control}
      name={name}
      rules={{ validate: onValidate }}
      render={({ field }) => (
        isExpression ? (
          <div
            role="textbox"
            aria-label={`SQL expression editor for ${fieldKey}`}
            onClick={() => !disabled && onExpressionClick?.()}
            className={`cursor-pointer ${disabled ? 'opacity-50' : ''}`}
            tabIndex={0}
            onFocus={(e) => {
              e.stopPropagation();
            }}
          >
            <MonacoEditor
              className='w-full shadow-sm border-gray-300 rounded-sm'
              height="100px"
              defaultLanguage="sql"
              value={value}
              loading={<div>Loading...</div>}
              beforeMount={(monaco) => {
                // Define custom SQL theme
                monaco.editor.defineTheme('sqlTheme', {
                  base: 'vs',
                  inherit: true,
                  rules: [],
                  colors: {
                    'editor.background': '#FAFAFA',
                  }
                });

                // Add custom CSS for suggestion widget
                const styleSheet = document.createElement('style');
                styleSheet.textContent = `
                  .monaco-editor .suggest-widget {
                    width: 150px !important;
                    background-color: #fff !important;
                  }
                `;
                document.head.appendChild(styleSheet);
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
                    });
                  }

                  // Register completion provider with a single registration
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

                      // Add additional columns suggestions (without duplicating)
                      const processedColumns = new Set(sourceColumns.map(col => col.name));
                      const normalizedAdditionalColumns = (additionalColumns as Array<any>).map(normalizeColumn);
                      normalizedAdditionalColumns.forEach(col => {
                        // Only add if not already in sourceColumns
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

                  // Inside the onMount function, update the editor configuration
                  editor.addCommand(monaco.KeyCode.Tab, () => {
                    if (isExpression) {
                      onBlur?.();  // Call onBlur when Tab is pressed
                    }
                  });

                  editor.focus();

                  // Make sure to dispose of the completion provider when unmounting
                  return () => {
                    disposable.dispose();
                  };
                } catch (error) {
                  console.error('Error in Monaco Editor:', error);
                  setEditorError(error?.message || 'Error initializing editor');
                }
              }}
              onChange={(newValue) => {
                setValue(name, newValue);
                if (onValidate) {
                  const error = onValidate(newValue);
                  setError(name, { type: 'manual', message: error });
                }
              }}
              options={{
                minimap: { enabled: false },
                automaticLayout: true,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                theme: 'sqlTheme',
                fontSize: 13,
                padding: { top: 8, bottom: 8 },
                scrollbar: { vertical: 'visible', horizontal: 'visible' },
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                overviewRulerLanes: 0,
                renderLineHighlight: 'none',
                quickSuggestions: {
                  other: true,
                  comments: false,
                  strings: true
                },
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnCommitCharacter: true,
                acceptSuggestionOnEnter: 'on',
                suggest: {
                  showIcons: true,
                  showStatusBar: true,
                  preview: true,
                  showInlineDetails: true,
                  filterGraceful: true,
                  selectionMode: 'always',
                },
                bracketPairColorization: { enabled: true },
                matchBrackets: 'always',
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                readOnly: false,
                ariaLabel: `SQL expression editor for ${fieldKey}`,
                tabCompletion: 'on',
                snippetSuggestions: 'none',
                renderValidationDecorations: 'on',
                fixedOverflowWidgets: true,
              }}
            />
            {editorError && (
              <div className="text-red-500 text-sm mt-1">{editorError}</div>
            )}
          </div>
        ) : (
          <Input
            {...field}
            placeholder={`Enter ${fieldKey}`}
            value={value}
            required={required}
            disabled={disabled}
            className={`border ${errors[name] || error ? 'border-red-500' : 'border-gray-300'} rounded-md`}
            aria-label={fieldKey}
          />
        )
      )}
    />
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