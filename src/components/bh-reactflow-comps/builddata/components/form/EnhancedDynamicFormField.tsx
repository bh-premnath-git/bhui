import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, Plus, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Utility function to format field labels
const formatFieldLabel = (fieldKey: string, title?: string): string => {
  if (title) return title;
  
  // Extract the last part of nested field keys (e.g., "source.name" -> "name")
  const lastKey = fieldKey.split('.').pop() || fieldKey;
  
  // Convert snake_case and camelCase to Title Case
  return lastKey
    .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Utility function to get nested value from object
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Utility function to set nested value in object
const setNestedValue = (obj: any, path: string, value: any): any => {
  const keys = path.split('.');
  const result = { ...obj };
  let current = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    } else {
      current[keys[i]] = { ...current[keys[i]] };
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
  return result;
};

interface EnhancedDynamicFormFieldProps {
  name: string;
  schema: any;
  value: any;
  onChange: (name: string, value: any) => void;
  formData?: any;
  errors?: Record<string, string>;
  level?: number;
}

export const EnhancedDynamicFormField: React.FC<EnhancedDynamicFormFieldProps> = React.memo(({
  name,
  schema,
  value,
  onChange,
  formData = {},
  errors,
  level = 0
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const fieldError = errors?.[name];
  
  // Handle field change
  const handleChange = useCallback((newValue: any) => {
    onChange(name, newValue);
  }, [name, onChange]);

  // Render different field types based on schema
  const renderField = () => {
    const fieldType = schema.type;
    const isRequired = schema.minLength > 0 || schema.required === true;
    const isSecret = schema.bh_secret === true;
    
    // String fields
    if (fieldType === 'string') {
      // Enum/Select field
      if (schema.enum) {
        const options = schema.enum;
        const labels = schema.enumLabels || options;
        
        return (
          <Select value={value || ''} onValueChange={handleChange}>
            <SelectTrigger className={fieldError ? 'border-red-500' : ''}>
              <SelectValue placeholder={`Select ${formatFieldLabel(name, schema.title)}`} />
            </SelectTrigger>
            <SelectContent style={{zIndex:99999}}>
              {options.map((option: string, index: number) => (
                <SelectItem key={option} value={option}>
                  {labels[index] || option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      
      // Password/Secret field
      if (isSecret) {
        return (
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={schema.description || `Enter ${formatFieldLabel(name, schema.title)}`}
              className={fieldError ? 'border-red-500 pr-10' : 'pr-10'}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        );
      }
      
      // Textarea for long text
      if (schema.format === 'textarea' || (schema.maxLength && schema.maxLength > 100)) {
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={schema.description || `Enter ${formatFieldLabel(name, schema.title)}`}
            className={fieldError ? 'border-red-500' : ''}
            rows={3}
          />
        );
      }
      
      // Regular text input
      return (
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={schema.description || `Enter ${formatFieldLabel(name, schema.title)}`}
          className={fieldError ? 'border-red-500' : ''}
        />
      );
    }
    
    // Number fields
    if (fieldType === 'number' || fieldType === 'integer') {
      return (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => handleChange(fieldType === 'integer' ? parseInt(e.target.value) || 0 : parseFloat(e.target.value) || 0)}
          placeholder={schema.description || `Enter ${formatFieldLabel(name, schema.title)}`}
          className={fieldError ? 'border-red-500' : ''}
          min={schema.minimum}
          max={schema.maximum}
          step={fieldType === 'integer' ? 1 : 0.01}
        />
      );
    }
    
    // Boolean fields
    if (fieldType === 'boolean') {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={value || false}
            onCheckedChange={handleChange}
          />
          <Label className="text-sm text-gray-600">
            {value ? 'Enabled' : 'Disabled'}
          </Label>
        </div>
      );
    }
    
    // Array fields
    if (fieldType === 'array') {
      const arrayValue = Array.isArray(value) ? value : [];
      
      const addItem = () => {
        const newItem = schema.items?.type === 'object' ? {} : '';
        handleChange([...arrayValue, newItem]);
      };
      
      const removeItem = (index: number) => {
        const newArray = arrayValue.filter((_, i) => i !== index);
        handleChange(newArray);
      };
      
      const updateItem = (index: number, newValue: any) => {
        const newArray = [...arrayValue];
        newArray[index] = newValue;
        handleChange(newArray);
      };
      
      return (
        <div className="space-y-2">
          {arrayValue.map((item: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="flex-1">
                {schema.items?.type === 'object' ? (
                  <Card className="p-3">
                    <div className="space-y-3">
                      {Object.entries(schema.items.properties || {}).map(([key, itemSchema]) => (
                        <EnhancedDynamicFormField
                          key={key}
                          name={key}
                          schema={itemSchema}
                          value={item[key]}
                          onChange={(_, newValue) => {
                            const updatedItem = { ...item, [key]: newValue };
                            updateItem(index, updatedItem);
                          }}
                          formData={formData}
                          level={level + 1}
                        />
                      ))}
                    </div>
                  </Card>
                ) : (
                  <Input
                    value={item || ''}
                    onChange={(e) => updateItem(index, e.target.value)}
                    placeholder={`Item ${index + 1}`}
                  />
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeItem(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      );
    }
    
    // Object fields
    if (fieldType === 'object') {
      const objectValue = value || {};
      
      return (
        <Card className={`${level > 0 ? 'border-gray-200' : ''}`}>
          <CardContent className="p-4 space-y-4">
            {Object.entries(schema.properties || {}).map(([key, fieldSchema]) => (
              <EnhancedDynamicFormField
                key={key}
                name={`${name}.${key}`}
                schema={fieldSchema}
                value={objectValue[key]}
                onChange={(fieldName, newValue) => {
                  const updatedObject = { ...objectValue, [key]: newValue };
                  handleChange(updatedObject);
                }}
                formData={formData}
                level={level + 1}
              />
            ))}
          </CardContent>
        </Card>
      );
    }
    
    // Fallback for unknown types
    return (
      <Input
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={`Enter ${formatFieldLabel(name, schema.title)}`}
        className={fieldError ? 'border-red-500' : ''}
      />
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Label htmlFor={name} className="text-sm font-medium">
          {formatFieldLabel(name, schema.title)}
          {(schema.minLength > 0 || schema.required === true) && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </Label>
        {schema.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{schema.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {renderField()}
      
      {fieldError && (
        <p className="text-sm text-red-500">{fieldError}</p>
      )}
    </div>
  );
});

EnhancedDynamicFormField.displayName = 'EnhancedDynamicFormField';