import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputFieldProps {
  label: string;
  id: string;
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  spanCol?: number;
  mandatory: boolean;
  error?: string;
  type?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  value,
  placeholder,
  onChange,
  mandatory,
  error,
  type = 'text'
}) => {
  const [touched, setTouched] = useState(false);
  const [fieldError, setFieldError] = useState(error);

  const handleBlur = () => {
    setTouched(true);
    if (mandatory && !value.trim()) {
      setFieldError(`${label} is required`);
    } else {
      setFieldError(error);
    }
  };

  const displayError = touched ? fieldError : error;

  return (
    <div className="p-1 border-gray-200 hover:border-slate-500 transition-colors">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {mandatory && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={label}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={handleBlur}
        className={`block w-full rounded-md border-2 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm
          ${displayError ? 'border-red-500' : 'border-gray-300'}`}
      />
      {displayError && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {displayError}
        </p>
      )}
    </div>
  );
};