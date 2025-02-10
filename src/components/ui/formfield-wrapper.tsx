import React from "react"
import { Label } from "@/components/ui/label"
import { RequiredLabel } from "./required-fields"

interface FormFieldWrapperProps {
  name: string
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
  error?: string
}

export function FormFieldWrapper({
  name,
  label,
  required = false,
  children,
  className = "",
  error,
}: FormFieldWrapperProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {required ? (
        <RequiredLabel>
          <Label htmlFor={name} className="text-base">
            {label}
          </Label>
        </RequiredLabel>
      ) : (
        <Label htmlFor={name} className="text-base">
          {label}
        </Label>
      )}

      {children}

      {/* Display any validation error */}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
