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
    <div className="w-full max-w-sm space-y-4">
      <label 
        htmlFor={id} 
        className="text-sm text-gray-600"
      >
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
        className={`w-full border border-gray-300 px-3 py-2 text-sm bg-white rounded-md 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${displayError ? 'border-red-500' : 'border-gray-300'}`}
      />
      {displayError && (
        <p className="text-red-500 text-xs flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {displayError}
        </p>
      )}
    </div>
  );
};

export default InputField;