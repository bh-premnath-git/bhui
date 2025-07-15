import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Info, Play } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

interface PythonEditorProps {
  label?: string;
  description?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  containerClassName?: string;
  minHeight?: string;
  maxHeight?: string;
  readOnly?: boolean;
  showMinimap?: boolean;
  showLineNumbers?: boolean;
  fontSize?: number;
  onValidate?: (markers: monaco.editor.IMarker[]) => void;
  onRun?: (code: string) => void;
}

export const PythonEditor: React.FC<PythonEditorProps> = ({ 
  label, 
  description, 
  error, 
  value, 
  onChange, 
  className, 
  containerClassName,
  minHeight = "300px",
  maxHeight = "600px",
  readOnly = false,
  showMinimap = false,
  showLineNumbers = true,
  fontSize = 14,
  onValidate,
  onRun
}) => {
  const [editorValue, setEditorValue] = useState(value || '');
  const [markers, setMarkers] = useState<monaco.editor.IMarker[]>([]);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    setEditorValue(value || '');
  }, [value]);

  const handleEditorChange = (newValue: string | undefined) => {
    const val = newValue || '';
    // Don't update parent if it's just the placeholder text
    if (val === '# Enter your custom PySpark code...') {
      setEditorValue('');
      onChange('');
    } else {
      setEditorValue(val);
      onChange(val);
    }
  };



  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    // Only add placeholder functionality if no initial value is provided
    const hasInitialContent = editorValue && editorValue.trim() && 
                             !editorValue.includes('# Enter your custom PySpark code...');
    
    if (!hasInitialContent) {
      // Add placeholder text functionality
      const updatePlaceholder = () => {
        const model = editor.getModel();
        if (model) {
          const isEmpty = model.getValue().trim() === '';
          const placeholder = isEmpty ? '# Enter your custom PySpark code...' : '';
          
          if (isEmpty && !model.getValue()) {
            model.setValue(placeholder);
            // Set selection to after the placeholder
            editor.setPosition({ lineNumber: 1, column: placeholder.length + 1 });
          }
        }
      };

      // Set initial placeholder if editor is empty
      if (!editorValue.trim()) {
        updatePlaceholder();
      }

      // Handle focus/blur for placeholder behavior
      editor.onDidFocusEditorText(() => {
        const model = editor.getModel();
        if (model && model.getValue() === '# Enter your custom PySpark code...') {
          model.setValue('');
        }
      });

      editor.onDidBlurEditorText(() => {
        const model = editor.getModel();
        if (model && model.getValue().trim() === '') {
          model.setValue('# Enter your custom PySpark code...');
        }
      });
    }
    
    // Add custom Python snippets and completions
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model, position, context, token) => {
        const word = model.getWordUntilPosition(position);
        const range = new monaco.Range(
          position.lineNumber,
          word.startColumn,
          position.lineNumber,
          word.endColumn
        );

        const suggestions: monaco.languages.CompletionItem[] = [
          {
            label: 'pyspark_template',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              '# --- Begin Custom Logic ---',
              '',
              '# Your transformation logic here',
              'result = input_df.withColumn("${1:new_column}", ${2:lit("value")})',
              '',
              '# Optional: Create additional outputs',
              '# result_summary = result.groupBy("${3:column}").agg(count("*").alias("count"))',
              '# result_clean = result.filter(col("${4:column}").isNotNull())',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '# --- End Custom Logic ---'
            ].join('\n'),
            documentation: 'PySpark transformation template structure with proper spacing',
            range: range,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          },
          {
            label: 'pyspark_transform',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'def transform(df):',
              '    """',
              '    Custom PySpark transformation function.',
              '    ',
              '    Args:',
              '        df: Input DataFrame',
              '    ',
              '    Returns:',
              '        Transformed DataFrame',
              '    """',
              '    # Your transformation code here',
              '    return df'
            ].join('\n'),
            documentation: 'PySpark transformation function template',
            range: range,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          },
          {
            label: 'pyspark_filter',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'df.filter(F.col("${1:column_name}") == "${2:value}")',
            documentation: 'Filter DataFrame rows',
            range: range,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          },
          {
            label: 'pyspark_select',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'df.select("${1:col1}", "${2:col2}", F.col("${3:col3}").alias("${4:new_col3}"))',
            documentation: 'Select columns from DataFrame',
            range: range,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          },
          {
            label: 'pyspark_withColumn',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'df.withColumn("${1:new_column}", F.${2:lit}("${3:value}"))',
            documentation: 'Add or replace a column',
            range: range,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          },
          {
            label: 'pyspark_groupBy',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'df.groupBy("${1:column}").agg(F.${2:sum}("${3:agg_column}"))',
            documentation: 'Group by and aggregate',
            range: range,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          }
        ];
        
        return { suggestions };
      }
    });
  };

  const handleValidationChange = (markers: monaco.editor.IMarker[]) => {
    setMarkers(markers);
    if (onValidate) {
      onValidate(markers);
    }
  };



  const runCode = () => {
    if (onRun) {
      onRun(editorValue);
    }
  };

  return (
    <div className={cn("space-y-3", containerClassName)}>
      {label && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-900">{label}</Label>
            {description && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-500 cursor-help hover:text-gray-700" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-gray-900 text-white">{description}</TooltipContent>
              </Tooltip>
            )}
          </div>
          
          {/* Toolbar */}
          {onRun && (
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={runCode}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Run code</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      )}
      
      <div className={cn(
        "relative border border-gray-300 rounded-lg overflow-hidden shadow-sm",
        { "border-red-300": error },
        className
      )}>
        <Editor
          height={minHeight}
          defaultLanguage="python"
          value={editorValue}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          onValidate={handleValidationChange}
          options={{
            theme: 'vs', // Light theme
            fontSize: fontSize,
            lineNumbers: showLineNumbers ? 'on' : 'off',
            minimap: { enabled: showMinimap },
            readOnly: readOnly,
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            roundedSelection: false,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            mouseWheelZoom: true,
            contextmenu: true,
            folding: true,
            foldingHighlight: true,
            foldingImportsByDefault: false,
            showFoldingControls: 'always',
            unfoldOnClickAfterEndOfLine: false,
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              bracketPairsHorizontal: true,
              highlightActiveIndentation: true,
              indentation: true
            },
            suggest: {
              showWords: true,
              showKeywords: true,
              showSnippets: true,
              showFunctions: true,
              showConstructors: true,
              showFields: true,
              showVariables: true,
              showClasses: true,
              showModules: true,
              showMethods: true,
              showProperties: true,
              showValues: true,
              showEnums: true,
              showConstants: true,
              showStructs: true,
              showInterfaces: true,
              showOperators: true,
              showUnits: true,
              showColors: true,
              showFiles: true,
              showReferences: true,
              showFolders: true,
              showTypeParameters: true,
              showIssues: true,
              showUsers: true
            },
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true
            },
            parameterHints: {
              enabled: true,
              cycle: true
            },
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            snippetSuggestions: 'top',
            wordBasedSuggestions: 'matchingDocuments',
            semanticHighlighting: { enabled: true },
            occurrencesHighlight: 'singleFile',
            codeLens: true,
            lightbulb: { enabled: 'on' },
            definitionLinkOpensInPeek: false,
            gotoLocation: {
              multipleReferences: 'peek',
              multipleTypeDefinitions: 'peek',
              multipleDeclarations: 'peek',
              multipleImplementations: 'peek'
            }
          }}
        />
        
        {/* Status Bar */}
        <div className="flex items-center justify-between px-3 py-1 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <span>Python</span>
            <span>Lines: {editorValue.split('\n').length}</span>
            <span>Chars: {editorValue.length}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {markers.length > 0 && (
              <span className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded text-xs",
                markers.some(m => m.severity === 8) ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
              )}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {markers.length} issue{markers.length !== 1 ? 's' : ''}
              </span>
            )}
            {markers.length === 0 && editorValue.trim() && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                <span className="w-2 h-2 rounded-full bg-current"></span>
                No issues
              </span>
            )}
          </div>
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-200">
          {error}
        </p>
      )}
    </div>
  );
};

PythonEditor.displayName = "PythonEditor";