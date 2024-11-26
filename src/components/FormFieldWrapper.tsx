import React from 'react';
import { Label } from './ui/label';
import { ErrorMessage } from 'formik';
import RequiredLabel from './RequiredFieldLabel';

interface FormFieldWrapperProps {
  name: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormFieldWrapper({
  name,
  label,
  required = false,
  children,
  className = '',
}: FormFieldWrapperProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {required ? (
        <RequiredLabel>
          <Label htmlFor={name} className="text-base">{label}</Label>
        </RequiredLabel>
      ) : (
        <Label htmlFor={name} className="text-base">{label}</Label>
      )}
      {children}
      <ErrorMessage name={name} component="div" className="text-red-500 text-sm" />
    </div>
  );
} 