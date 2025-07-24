# Pipeline Form with Array Support

This directory contains the enhanced PipelineForm component that supports array fields in transformation schemas.

## Components

### PipelineForm.tsx
The main form component that handles pipeline transformation configuration. It supports:
- Two-step form process (selection → configuration)
- Dynamic schema-based form generation
- Array field support
- Object field support
- Proper validation with Zod

### ArrayField.tsx
A specialized component for handling array fields in forms. Features:
- Add/remove array items
- Support for primitive arrays (string, number, boolean)
- Support for object arrays with nested properties
- Support for nested arrays (displayed as textarea with line-separated values)
- Proper validation and error handling

### FlowControls.tsx
Enhanced flow controls with an "Add Node" button that opens the PipelineForm.

## Array Field Types Supported

1. **String Arrays** (e.g., `select_columns`, `drop_columns`)
   - Simple text input for each item
   - Add/remove functionality

2. **Object Arrays** (e.g., `derived_fields`)
   - Each item is a card with form fields for object properties
   - Supports nested properties like `name`, `expression`, `functions`
   - Handles complex validation rules

3. **Nested Arrays** (within objects)
   - Displayed as textarea with line-separated values
   - Automatically converts between array and string representation

## Usage Example

For a schema like SchemaTransformation:

```json
{
  "derived_fields": {
    "type": "array",
    "uniqueItems": true,
    "minItems": 1,
    "items": {
      "required": ["name"],
      "properties": {
        "name": {
          "type": "string",
          "minLength": 1
        },
        "expression": {
          "type": "string",
          "minLength": 1
        },
        "functions": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "minLength": 1,
                "description": "Name of the registered function to apply"
              },
              "parameters": {
                "type": "object",
                "description": "Parameters to pass to the function",
                "additionalProperties": true
              }
            },
            "required": ["name"]
          }
        }
      },
      "anyOf": [
        { "required": ["expression"] },
        { "required": ["functions"] }
      ]
    }
  },
  "select_columns": {
    "type": "array",
    "description": "List of column names to select from the dataset",
    "items": {
      "type": "string",
      "minLength": 1
    },
    "uniqueItems": true
  },
  "drop_columns": {
    "type": "array",
    "description": "List of column names to drop from the dataset",
    "items": {
      "type": "string",
      "minLength": 1
    },
    "uniqueItems": true
  },
  "rename_columns": {
    "type": "object",
    "description": "Mapping of old column names to new column names",
    "additionalProperties": {
      "type": "string",
      "minLength": 1
    }
  }
}
```

The form will render:
- `derived_fields`: Array of cards, each with:
  - `name` field (required text input)
  - `expression` field (text input)
  - `functions` field (array displayed as textarea, one function per line)
- `select_columns`: Array of text inputs for column names
- `drop_columns`: Array of text inputs for column names  
- `rename_columns`: Object field with JSON editor

## Features

- **Dynamic Schema Processing**: Automatically generates appropriate form fields based on JSON schema
- **Validation**: Full Zod validation support for arrays and nested objects
- **User-Friendly UI**: Intuitive add/remove buttons and clear visual hierarchy
- **Type Safety**: Full TypeScript support with proper type inference
- **Responsive Design**: Works well on different screen sizes

## Integration

The PipelineForm is integrated into the DataPipelineCanvasNew through the FlowControls component. Users can click the "Add Node" button to open the form and add new transformation nodes to their pipeline.