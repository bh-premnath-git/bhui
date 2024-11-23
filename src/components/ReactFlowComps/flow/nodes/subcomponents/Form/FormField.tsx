import React from "react";
import { Property } from "@/types/flow";
import { InputField } from "./UiElements/InputField";
import { JsonInput } from "./UiElements/JsonInput";
import { DropdownField } from "./UiElements/Dropdown";
import { EnumDropdown } from "./UiElements/EnumDropdown";
import { CheckboxField } from "./UiElements/CheckboxField";
import { MultiWordInput } from "./UiElements/MultiWordInput";
import { CodeEditor } from "./UiElements/MonocoEditor";
import { useDropdownOptions } from '@/hooks/useDropdownOptions';

interface FormFieldProps {
  property: Property;
  value: string;
  onChange: (key: string, value: string) => void;
  dependsOn?: string[];
}

export const FormField: React.FC<FormFieldProps> = React.memo(
  ({ property, value, onChange }) => {
    const {
      property_name,
      property_key,
      ui_type,
      spancol,
      mandatory,
      endpoint,
      language,
    } = property.ui_properties;

    const columnSpan = spancol && spancol > 0 && spancol <= 2 ? spancol : 1;
    const { options, isLoading } = useDropdownOptions(endpoint, "24");

    const renderField = () => {
      switch (ui_type) {
        case 'json':
          return (
            <JsonInput
              id={property_key}
              label={property_name}
              value={value || ''}
              onChange={(e) => onChange(property_key, e.target.value)}
              placeholder={property_name}
              mandatory={mandatory}
            />
          );
        case 'list[string]':
          let parsedValues: string[] = [];
          try {
            parsedValues = value ? JSON.parse(value) : [];
            if (!Array.isArray(parsedValues)) {
              console.warn(`Expected an array for property_key "${property_key}", but got:`, parsedValues);
              parsedValues = [];
            }
          } catch (error) {
            console.error(`Invalid JSON string for property_key "${property_key}":`, error);
            parsedValues = [];
          }

          return (
            <MultiWordInput
              id={property_key}
              label={property_name}
              values={parsedValues}
              onChange={(newValues) => onChange(property_key, JSON.stringify(newValues))}
              placeholder={property_name}
              mandatory={mandatory}
            />
          );
        case 'checkbox':
          return (
            <CheckboxField
              id={property_key}
              label={property_name}
              property_key={property_key}
              property_name={property_name}
              value={value}
              onChange={onChange}
              mandatory={mandatory}
            />
          );
        case 'dropdown':
          return (
            <DropdownField
              id={property_key}
              label={property_name}
              property_key={property_key}
              property_name={property_name}
              options={options}
              isLoading={isLoading}
              value={value}
              onChange={onChange}
              mandatory={mandatory}
            />
          );
        case 'enum':
          return (
            <EnumDropdown
              id={property_key}
              label={property_name}
              property_key={property_key}
              property_name={property_name}
              value={value}
              onChange={onChange}
              enumValues={property.enum || []}
              mandatory={mandatory}
            />
          );
        case 'number':
          return (
            <InputField
              id={property_key}
              label={property_name}
              value={value || ""}
              onChange={(e) => onChange(property_key, e.target.value)}
              placeholder={property_name}
              mandatory={mandatory}
              type="number"
            />
          );
        case "textbox":
          return (
            <CodeEditor
              id={property_key}
              label={property_name}
              value={value || ''}
              language={language || 'javascript'}
              onChange={(newValue) => onChange(property_key, newValue)}
              placeholder={`Enter ${property_name} code`}
              readOnly={false}
              mandatory={mandatory}
              className={`col-span-${columnSpan}`}
            />
          );
        default:
          return (
            <InputField
              id={property_key}
              label={property_name}
              value={value || ""}
              onChange={(e) => onChange(property_key, e.target.value)}
              placeholder={property_name}
              mandatory={mandatory}
            />
          );
      }
    };

    return (
      <div className={`space-y-2 ${columnSpan > 1 ? 'col-span-2' : ''}`}>
        {renderField()}
      </div>
    );
  }
);

FormField.displayName = "FormField";
