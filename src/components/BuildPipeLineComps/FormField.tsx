import React from 'react';
import { Field } from 'formik';
import { TextField, MenuItem } from '@mui/material';
import { commonTextFieldStyles } from './styles/formStyles';
import { Schema } from './types/formTypes';
import { lazy } from 'react';
import * as monaco from 'monaco-editor';

interface FormFieldProps {
  fieldSchema: Schema;
  name: string;
  fieldKey: string;
  enumValues?: string[];
  value: string;
  isExpression?: boolean;
  required?: boolean;
  onExpressionClick?: () => void;
  sourceColumns?: SourceColumn[];
  error?: string;
  disabled?: boolean;
  onValidate?: (value: string) => string | undefined;
}

interface SourceColumn {
  name: string;
  dataType: string;
}

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

// Define the handleEditorError function
const handleEditorError = (error: any) => {
  console.error('Error loading Monaco Editor:', error);
  // Optionally, you can display a user-friendly message or take other actions
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
  sourceColumns = [],
  error,
  disabled,
  onValidate,
}) => {
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
      <Field name={name} validate={onValidate}>
        {({ field, meta }: any) => (
          <TextField
            {...field}
            select
            size='small'
            fullWidth
            value={value}
            required={required}
            // label={label}
            variant="outlined"
            disabled={disabled}
            error={Boolean(meta.error || error)}
            helperText={meta.error || error}
            sx={commonTextFieldStyles}
            aria-label={`Select ${fieldKey}`}
          >
            {enumValues.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Field>
    );
  }

  return (
    <Field name={name} validate={onValidate}>
      {({ field, form, meta }: any) => (
        isExpression ? (
          <div
            role="textbox"
            aria-label={`SQL expression editor for ${fieldKey}`}
            onClick={() => !disabled && onExpressionClick?.()}
            className={`cursor-pointer ${disabled ? 'opacity-50' : ''}`}
          >
            {!isEditorReady && (
              <div className="h-[100px] w-full flex items-center justify-center bg-gray-50">
                Loading editor...
              </div>
            )}
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
                  // Register SQL language features
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

                  // Single completion provider
                  const disposable = monaco.languages.registerCompletionItemProvider('sql', {
                    triggerCharacters: [' ', '.', '(', ',', '['],
                    provideCompletionItems: (model, position) => {
                      const suggestions = [];

                      // Get the current word and its range
                      const wordInfo = model.getWordUntilPosition(position);
                      const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: wordInfo.startColumn,
                        endColumn: wordInfo.endColumn
                      };

                      // Add SQL Keywords suggestions
                      const sqlKeywords = [
                        'SELECT', 'FROM', 'WHERE', 'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
                        'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL', 'TRUE', 'FALSE',
                        'ORDER BY', 'GROUP BY', 'HAVING', 'ASC', 'DESC', 'DISTINCT', 'LIMIT',
                        'CONCAT', 'COALESCE', 'NULLIF', 'CAST', 'SUBSTRING', 'TRIM',
                        'UPPER', 'LOWER', 'LENGTH', 'REPLACE', 'ROUND',
                        'COUNT', 'SUM', 'AVG', 'MIN', 'MAX'
                      ];

                      // Add keyword suggestions without duplicates
                      sqlKeywords.forEach(keyword => {
                        if (!wordInfo.word || keyword.toLowerCase().includes(wordInfo.word.toLowerCase())) {
                          suggestions.push({
                            label: keyword,
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: keyword,
                            detail: 'SQL Keyword',
                            documentation: { value: `SQL Keyword: ${keyword}` },
                            range
                          });
                        }
                      });

                      // Add column suggestions without duplicates
                      sourceColumns.forEach(col => {
                        if (!wordInfo.word || col.name.toLowerCase().includes(wordInfo.word.toLowerCase())) {
                          suggestions.push({
                            label: col.name,
                            kind: monaco.languages.CompletionItemKind.Field,
                            insertText: col.name,
                            detail: `(${col.dataType})`,
                            documentation: { value: `**${col.name}**\nType: ${col.dataType}` },
                            range
                          });
                        }
                      });

                      return { suggestions };
                    }
                  });

                  // Add command for manual trigger
                  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
                    editor.trigger('', 'editor.action.triggerSuggest', {});
                  });

                  return () => disposable.dispose();
                } catch (error) {
                  console.error('Error in Monaco Editor:', error);
                  setEditorError(error?.message || 'Error initializing editor');
                }
              }}
              onChange={(newValue) => {
                form.setFieldValue(name, newValue);
                if (onValidate) {
                  const error = onValidate(newValue);
                  form.setFieldError(name, error);
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
                scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
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
                readOnly: disabled,
                ariaLabel: `SQL expression editor for ${fieldKey}`,
              }}
            />
            {editorError && (
              <div className="text-red-500 text-sm mt-1">{editorError}</div>
            )}
          </div>
        ) : (
          <TextField
            {...field}
            size='small'
            placeholder={`Enter ${fieldKey}`}
            fullWidth
            value={value}
            required={required}
            disabled={disabled}
            error={Boolean(meta.error || error)}
            helperText={meta.error || error || fieldSchema.description}
            variant="outlined"
            sx={commonTextFieldStyles}
            aria-label={fieldKey}
          />
        )
      )}
    </Field>
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