import React, { useEffect } from 'react';
import Editor, { OnChange, OnMount } from '@monaco-editor/react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from 'lucide-react';

interface CodeEditorProps {
  id: string;
  label?: string;
  value: string;
  language?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  mandatory: boolean;
  default?: string; // Assuming default is a string containing default code
  description: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  id,
  label,
  value,
  language = 'javascript',
  onChange,
  readOnly = false,
  className = '',
  description,
  default: defaultValue,
  mandatory
}) => {
  // If value is empty and defaultValue is provided, set the editor's value to defaultValue.
  useEffect(() => {
    if (!value && defaultValue) {
      onChange(defaultValue);
    }
  }, [value, defaultValue, onChange]);

  const handleEditorChange: OnChange = (value) => {
    if (typeof value === 'string') {
      onChange(value);
    }
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    // Optional: Additional setup or configurations
  };

  return (
    <div className={cn('w-full max-w-sm space-y-4', className)}>
      {label && (
        <div className="flex items-center space-x-1">
          <label
            htmlFor={id}
            className="text-sm text-gray-600"
          >
            {label} {mandatory && <span className="text-red-500">*</span>}
          </label>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-2 bg-white text-gray-700 border border-gray-200 rounded shadow-sm">
                  {description}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
      <div className="border rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 border-gray-300">
        <Editor
          height="150px"
          defaultLanguage={language}
          language={language}
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            selectOnLineNumbers: true,
            readOnly: readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
          }}
          aria-label={label || 'Code Editor'}
          className="text-sm"
        />
      </div>
    </div>
  );
};

export default CodeEditor;
