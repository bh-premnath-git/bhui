import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface SimpleJSONSchemaFormProps {
  schema: any;
  uiSchema?: any;
  formData?: any;
  onChange?: (formData: any) => void;
  onSubmit: (formData: any) => void;
  submitLabel?: string;
}

const SimpleJSONSchemaForm: React.FC<SimpleJSONSchemaFormProps> = ({
  schema,
  uiSchema = {},
  formData: initialFormData = {},
  onChange,
  onSubmit,
  submitLabel = "Submit"
}) => {
  const [formData, setFormData] = useState<any>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleChange = (name: string, value: any) => {
    // Handle nested properties with dot notation (e.g., "source.type")
    if (name.includes('.')) {
      const parts = name.split('.');
      const newFormData = { ...formData };
      
      // Navigate to the nested object
      let current = newFormData;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      
      // Set the value
      current[parts[parts.length - 1]] = value;
      
      setFormData(newFormData);
      
      if (onChange) {
        onChange(newFormData);
      }
    } else {
      // Handle top-level properties
      const newFormData = {
        ...formData,
        [name]: value
      };
      
      setFormData(newFormData);
      
      if (onChange) {
        onChange(newFormData);
      }
    }
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleArrayItemChange = (arrayName: string, index: number, fieldName: string, value: any) => {
    const arrayItems = [...(formData[arrayName] || [])];
    if (!arrayItems[index]) {
      arrayItems[index] = {};
    }
    arrayItems[index] = {
      ...arrayItems[index],
      [fieldName]: value
    };
    
    const newFormData = {
      ...formData,
      [arrayName]: arrayItems
    };
    
    setFormData(newFormData);
    
    if (onChange) {
      onChange(newFormData);
    }
  };

  const addArrayItem = (arrayName: string, template: any = {}) => {
    const newFormData = {
      ...formData,
      [arrayName]: [...(formData[arrayName] || []), { ...template }]
    };
    
    setFormData(newFormData);
    
    if (onChange) {
      onChange(newFormData);
    }
  };

  const removeArrayItem = (arrayName: string, index: number) => {
    const newFormData = {
      ...formData,
      [arrayName]: formData[arrayName].filter((_: any, i: number) => i !== index)
    };
    
    setFormData(newFormData);
    
    if (onChange) {
      onChange(newFormData);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Basic validation for required fields
    if (schema.required && Array.isArray(schema.required)) {
      schema.required.forEach((fieldName: string) => {
        if (formData[fieldName] === undefined || formData[fieldName] === '') {
          newErrors[fieldName] = `${fieldName} is required`;
        }
      });
    }
    
    // Validate properties
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([fieldName, fieldSchema]: [string, any]) => {
        // Check if field is required
        const isRequired = schema.required && schema.required.includes(fieldName);
        
        // Skip validation if field is not required and value is empty
        if (!isRequired && (formData[fieldName] === undefined || formData[fieldName] === '')) {
          return;
        }
        
        // Validate based on type
        if (fieldSchema.type === 'string' && fieldSchema.minLength && formData[fieldName]) {
          if (formData[fieldName].length < fieldSchema.minLength) {
            newErrors[fieldName] = `${fieldName} must be at least ${fieldSchema.minLength} characters`;
          }
        }
        
        if (fieldSchema.type === 'array' && fieldSchema.minItems && Array.isArray(formData[fieldName])) {
          if (formData[fieldName].length < fieldSchema.minItems) {
            newErrors[fieldName] = `${fieldName} must have at least ${fieldSchema.minItems} items`;
          }
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (fieldName: string, fieldSchema: any, parentPath = '') => {
    const path = parentPath ? `${parentPath}.${fieldName}` : fieldName;
    const fieldUiSchema = uiSchema[fieldName] || {};
    const value = formData[fieldName] !== undefined ? formData[fieldName] : '';
    const label = fieldSchema.title || fieldName;
    const description = fieldSchema.description || '';
    const isRequired = schema.required && schema.required.includes(fieldName);
    
    // Handle different field types
    switch (fieldSchema.type) {
      case 'string':
        // Handle enum as select
        if (fieldSchema.enum) {
          return (
            <div className="mb-3" key={path}>
              <Label htmlFor={path} className="mb-1 block text-sm font-medium">
                {label}{isRequired ? ' *' : ''}
              </Label>
              {description && (
                <p className="text-xs text-muted-foreground mb-1">{description}</p>
              )}
              <Select 
                value={value} 
                onValueChange={(val) => handleChange(fieldName, val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Select ${label}`} />
                </SelectTrigger>
                <SelectContent>
                  {fieldSchema.enum.map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors[fieldName] && (
                <p className="text-xs text-red-500 mt-1">{errors[fieldName]}</p>
              )}
            </div>
          );
        }
        
        // Handle format textarea
        if (fieldSchema.format === 'textarea' || fieldUiSchema.textarea) {
          return (
            <div className="mb-3" key={path}>
              <Label htmlFor={path} className="mb-1 block text-sm font-medium">
                {label}{isRequired ? ' *' : ''}
              </Label>
              {description && (
                <p className="text-xs text-muted-foreground mb-1">{description}</p>
              )}
              <Textarea
                id={path}
                value={value}
                onChange={(e) => handleChange(fieldName, e.target.value)}
                placeholder={fieldUiSchema.placeholder || ''}
                className="w-full"
                rows={3}
              />
              {errors[fieldName] && (
                <p className="text-xs text-red-500 mt-1">{errors[fieldName]}</p>
              )}
            </div>
          );
        }
        
        // Default to text input
        return (
          <div className="mb-3" key={path}>
            <Label htmlFor={path} className="mb-1 block text-sm font-medium">
              {label}{isRequired ? ' *' : ''}
            </Label>
            {description && (
              <p className="text-xs text-muted-foreground mb-1">{description}</p>
            )}
            <Input
              id={path}
              type="text"
              value={value}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              placeholder={fieldUiSchema.placeholder || ''}
              className="w-full"
            />
            {errors[fieldName] && (
              <p className="text-xs text-red-500 mt-1">{errors[fieldName]}</p>
            )}
          </div>
        );
        
      case 'number':
      case 'integer':
        return (
          <div className="mb-3" key={path}>
            <Label htmlFor={path} className="mb-1 block text-sm font-medium">
              {label}{isRequired ? ' *' : ''}
            </Label>
            {description && (
              <p className="text-xs text-muted-foreground mb-1">{description}</p>
            )}
            <Input
              id={path}
              type="number"
              value={value}
              onChange={(e) => handleChange(fieldName, e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={fieldUiSchema.placeholder || ''}
              className="w-full"
            />
            {errors[fieldName] && (
              <p className="text-xs text-red-500 mt-1">{errors[fieldName]}</p>
            )}
          </div>
        );
        
      case 'boolean':
        return (
          <div className="mb-3 flex items-center space-x-2" key={path}>
            <Checkbox
              id={path}
              checked={!!value}
              onCheckedChange={(checked) => handleChange(fieldName, checked)}
            />
            <Label htmlFor={path} className="text-sm font-medium">
              {label}
            </Label>
            {errors[fieldName] && (
              <p className="text-xs text-red-500 ml-2">{errors[fieldName]}</p>
            )}
          </div>
        );
        
      case 'array':
        if (!fieldSchema.items) return null;
        
        return (
          <div className="mb-4 border rounded-md p-3" key={path}>
            <Label className="mb-1 block text-sm font-medium">
              {label}{isRequired ? ' *' : ''}
            </Label>
            {description && (
              <p className="text-xs text-muted-foreground mb-2">{description}</p>
            )}
            
            {Array.isArray(formData[fieldName]) && formData[fieldName].map((item: any, index: number) => (
              <div key={`${path}-${index}`} className="mb-3 border-b pb-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-medium">Item {index + 1}</h4>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeArrayItem(fieldName, index)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                
                {fieldSchema.items.type === 'object' && fieldSchema.items.properties && 
                  Object.entries(fieldSchema.items.properties).map(([itemFieldName, itemFieldSchema]: [string, any]) => {
                    const itemValue = item[itemFieldName] !== undefined ? item[itemFieldName] : '';
                    const itemLabel = itemFieldSchema.title || itemFieldName;
                    const itemDescription = itemFieldSchema.description || '';
                    const isItemRequired = fieldSchema.items.required && fieldSchema.items.required.includes(itemFieldName);
                    
                    if (itemFieldSchema.type === 'string') {
                      if (itemFieldSchema.format === 'textarea' || (uiSchema[fieldName]?.items?.[itemFieldName]?.textarea)) {
                        return (
                          <div key={`${path}-${index}-${itemFieldName}`} className="mb-2">
                            <Label htmlFor={`${path}-${index}-${itemFieldName}`} className="mb-1 block text-xs font-medium">
                              {itemLabel}{isItemRequired ? ' *' : ''}
                            </Label>
                            {itemDescription && (
                              <p className="text-xs text-muted-foreground mb-1">{itemDescription}</p>
                            )}
                            <Textarea
                              id={`${path}-${index}-${itemFieldName}`}
                              value={itemValue}
                              onChange={(e) => handleArrayItemChange(fieldName, index, itemFieldName, e.target.value)}
                              placeholder={uiSchema[fieldName]?.items?.[itemFieldName]?.placeholder || ''}
                              className="w-full"
                              rows={3}
                            />
                          </div>
                        );
                      }
                      
                      return (
                        <div key={`${path}-${index}-${itemFieldName}`} className="mb-2">
                          <Label htmlFor={`${path}-${index}-${itemFieldName}`} className="mb-1 block text-xs font-medium">
                            {itemLabel}{isItemRequired ? ' *' : ''}
                          </Label>
                          {itemDescription && (
                            <p className="text-xs text-muted-foreground mb-1">{itemDescription}</p>
                          )}
                          <Input
                            id={`${path}-${index}-${itemFieldName}`}
                            type="text"
                            value={itemValue}
                            onChange={(e) => handleArrayItemChange(fieldName, index, itemFieldName, e.target.value)}
                            placeholder={uiSchema[fieldName]?.items?.[itemFieldName]?.placeholder || ''}
                            className="w-full"
                          />
                        </div>
                      );
                    }
                    
                    return null;
                  })
                }
              </div>
            ))}
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => addArrayItem(fieldName)}
              className="mt-1 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add {label}
            </Button>
            
            {errors[fieldName] && (
              <p className="text-xs text-red-500 mt-1">{errors[fieldName]}</p>
            )}
          </div>
        );
        
      case 'object':
        if (!fieldSchema.properties) return null;
        
        // Get the current value of this object
        const objectValue = formData[fieldName] || {};
        
        // Check if this is a conditional field that should be shown based on another field's value
        // For example, if source.type is 'File', show file-specific fields
        const shouldShowConditionalField = () => {
          // Handle specific conditional logic for Reader schema
          if (path === 'source' && fieldName === 'connection') {
            return formData.source?.type === 'Relational';
          }
          
          if (fieldName === 'read_options') {
            return formData.file_type === 'CSV';
          }
          
          return true;
        };
        
        if (!shouldShowConditionalField()) {
          return null;
        }
        
        return (
          <div className="mb-4 border rounded-md p-3" key={path}>
            <Label className="mb-1 block text-sm font-medium">
              {label}
            </Label>
            {description && (
              <p className="text-xs text-muted-foreground mb-2">{description}</p>
            )}
            
            {Object.entries(fieldSchema.properties).map(([subFieldName, subFieldSchema]: [string, any]) => {
              // Create the full path for this nested field
              const subPath = path ? `${path}.${subFieldName}` : subFieldName;
              
              // Get the current value for this field
              const subValue = objectValue[subFieldName];
              
              // Create a modified schema that includes the current value
              const modifiedSchema = {
                ...subFieldSchema,
                // Add any additional properties needed for rendering
              };
              
              return renderField(subFieldName, modifiedSchema, fieldName);
            })}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card className="w-full mt-2">
      <CardHeader>
        <CardTitle>{schema.title || 'Form'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-2">
          {schema.properties && Object.entries(schema.properties).map(([fieldName, fieldSchema]: [string, any]) => 
            renderField(fieldName, fieldSchema)
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" className="flex items-center gap-1">
            <Check className="h-4 w-4" />
            {submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SimpleJSONSchemaForm;