import React from 'react';
import Editor, { OnChange, OnMount } from '@monaco-editor/react';
import { cn } from '@/lib/utils'; 

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
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  id,
  label,
  value,
  language = 'javascript',
  onChange,
  readOnly = false,
  className = '',
  mandatory
}) => {
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
        <label 
          htmlFor={id} 
          className="text-sm text-gray-600"
        >
          {label} {mandatory && <span className="text-red-500">*</span>}
        </label>
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