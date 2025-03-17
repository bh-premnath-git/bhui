import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { lazy } from 'react';
import * as monaco from 'monaco-editor';
import { Schema } from '../../types/formTypes';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';

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
  wrapper: 'relative rounded-md border border-gray-200 shadow-sm hover:border-gray-300 focus-within:border-gray-300 my-2',
  header: 'flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50',
  headerTitle: 'text-sm font-medium text-gray-700',
  editorContainer: 'p-0.5 bg-white ',
  editor: 'min-h-[200px] max-h-[400px] overflow-auto bg-white'
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
  sourceColumns = [
],
  additionalColumns = [
],
  error,
  disabled,
  onValidate,
  onChange,
}) => {
  const { control, setValue, setError, formState: { errors } } = useForm();
  const [isEditorReady, setIsEditorReady] = React.useState(false);
  const [editorError, setEditorError] = React.useState<string | null>(null);

console.log(sourceColumns,"sourceColumns")
  // Check for select type
  const isSelectField = 
    fieldSchema?.type === 'select' || 
    (enumValues && enumValues.length > 0);

  // If it's a select field, use the Select component
  if (isSelectField && !isExpression) {
    const options = enumValues || fieldSchema?.enum || [];
    
    return (
      <div className="form-field">
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
                  className={`w-full mt-1 ${error ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <SelectValue placeholder={`Select ${fieldKey}`} />
                </SelectTrigger>
                <SelectContent>
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
                <span className="text-red-500 text-sm">
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
        <div className={expressionEditorStyles.wrapper}>
          <div className={expressionEditorStyles.editorContainer}>
            <MonacoEditor
              height="100px"
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
                suggest: {
                  showWords: false,
                  snippetsPreventQuickSuggestions: false,
                  showProperties: true,
                  showFunctions: true,
                }
              }}
              onMount={(editor, monaco) => {
                try {
                  setIsEditorReady(true);

                  // Register completion provider first
                  const disposable = monaco.languages.registerCompletionItemProvider('sql', {
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

                      // Add SQL Keywords
                      SQL_KEYWORDS.forEach(keyword => {
                        suggestions.push({
                          label: keyword,
                          kind: monaco.languages.CompletionItemKind.Keyword,
                          insertText: keyword,
                          range: range
                        });
                      });

                      // Add source columns
                      if (sourceColumns) {
                        sourceColumns.forEach(col => {
                          suggestions.push({
                            label: col.name,
                            kind: monaco.languages.CompletionItemKind.Field,
                            insertText: col.name,
                            detail: `Source Column (${col.dataType})`,
                            range: range
                          });
                        });
                      }

                      // Add additional columns
                      if (additionalColumns) {
                        const columns = Array.isArray(additionalColumns) 
                          ? additionalColumns.map(normalizeColumn)
                          : [];
                        
                        columns.forEach(col => {
                          suggestions.push({
                            label: col.name,
                            kind: monaco.languages.CompletionItemKind.Field,
                            insertText: col.name,
                            detail: `Additional Column (${col.dataType})`,
                            range: range
                          });
                        });
                      }

                      return {
                        suggestions: suggestions
                      };
                    }
                  });

                  // Trigger suggestions manually with Ctrl+Space
                  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
                    editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
                  });

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

  // Inside the FormField component, before the return statement
  if (fieldSchema.type === 'boolean') {
    return (
      <div className="form-field">
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
              className={`border ${errors[name] || error ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              aria-label={fieldKey}
              disabled={disabled}
            >
              {field.value ? 'On' : 'Off'}
            </Toggle>
          )}
        />
        {error && (
          <span className="text-red-500 text-sm">
            {typeof error === 'string' ? error : error?.message}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="form-field">
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
            className={`border ${errors[name] || error ? 'border-red-500' : 'border-gray-300'} rounded-md`}
            aria-label={fieldKey}
            onBlur={onBlur}
          />
        )}
      />
      {error && (
        <span className="text-red-500 text-sm">
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