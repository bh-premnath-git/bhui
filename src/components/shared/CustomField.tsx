"use client";

import React from "react";
import { useController, UseControllerProps, FieldValues } from "react-hook-form";

// shadcn/ui imports
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomFieldProps<T extends FieldValues> extends UseControllerProps<T> {
  label?: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  disabled?: boolean;
  controlName?: "input" | "select";
  options?: Array<Record<string, any>>;
  valueKey?: string;
  labelKey?: string;
  required?: boolean;
}

// A reusable form field that integrates react-hook-form with
// shadcn/ui's Input or Select components, plus optional label/error display.
export function CustomField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = "text",
  disabled = false,
  controlName = "input",
  options = [],
  valueKey = "value",
  labelKey = "label",
  required = false,
}: CustomFieldProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: { required },
  });

  return (
    <div className="space-y-1">
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      {controlName === "input" ? (
        <Input
          {...field}
          id={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={error ? "border-red-500" : ""}
        />
      ) : (
        <Select
          value={field.value?.toString()}
          onValueChange={field.onChange}
          disabled={disabled}
        >
          <SelectTrigger className={error ? "border-red-500" : ""}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option: any) => (
              <SelectItem
                key={option[valueKey]}
                value={option[valueKey]?.toString()}
              >
                {option[labelKey]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {error && (
        <span className="text-sm text-red-500">{error.message}</span>
      )}
    </div>
  );
}
