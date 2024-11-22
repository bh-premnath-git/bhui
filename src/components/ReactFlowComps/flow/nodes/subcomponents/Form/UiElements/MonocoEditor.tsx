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
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {mandatory && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="border-2 border-gray-200 rounded-lg hover:border-slate-500 transition-colors">
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
        />
      </div>
    </div>
  );
};
