# Pipeline Transformation Form Components

This directory contains a set of reusable components for dynamically generating forms based on pipeline transformation schemas. The components are designed to work with the `usePipelineModules` hook and automatically generate forms for different transformation types like "reader", "filter", "writer", etc.

## Components Overview

### Core Components

1. **TransformationForm** - Main form component that renders the complete transformation configuration UI
2. **TransformationFormFields** - Handles rendering of individual form fields based on schema
3. **TransformationFormWrapper** - Wrapper component that handles schema loading and error states
4. **TransformationSelector** - Component for selecting transformation types
5. **PipelineNodeConfigurator** - Complete node configuration interface
6. **PipelineEditor** - Example pipeline editor implementation

### Hooks

1. **useTransformationSchema** - Hook to get transformation schemas from pipeline modules
2. **useTransformationConfig** - Hook to get specific transformation configuration

## Usage Examples

### Basic Transformation Form

```tsx
import { TransformationFormWrapper } from '@/components/pipeline';

function MyComponent() {
  const handleSave = (data: any) => {
    console.log('Transformation data:', data);
  };

  return (
    <TransformationFormWrapper
      transformationType="filter"
      selectedEngineType="pyspark"
      onSave={handleSave}
      mode="new"
    />
  );
}
```

### Pipeline Node Configurator

```tsx
import { PipelineNodeConfigurator } from '@/components/pipeline';

function PipelineCanvas() {
  const [selectedNode, setSelectedNode] = useState(null);

  const handleNodeUpdate = (nodeId: string, data: any) => {
    // Update your pipeline state
    console.log(`Node ${nodeId} updated:`, data);
  };

  return (
    <PipelineNodeConfigurator
      selectedNode={selectedNode}
      selectedEngineType="pyspark"
      onNodeUpdate={handleNodeUpdate}
      onClose={() => setSelectedNode(null)}
    />
  );
}
```

### Transformation Selector

```tsx
import { TransformationSelector } from '@/components/pipeline';

function TransformationPicker() {
  const handleSelect = (transformationType: string) => {
    console.log('Selected transformation:', transformationType);
  };

  return (
    <TransformationSelector
      selectedEngineType="pyspark"
      onTransformationSelect={handleSelect}
    />
  );
}
```

### Using Hooks Directly

```tsx
import { useTransformationConfig } from '@/hooks/useTransformationSchema';

function CustomComponent() {
  const {
    schema,
    operator,
    isValid,
    displayName,
    moduleInfo
  } = useTransformationConfig('filter', 'pyspark');

  if (!isValid) {
    return <div>Transformation not found</div>;
  }

  return (
    <div>
      <h2>{displayName}</h2>
      <p>{operator.description}</p>
      {/* Render your custom form using the schema */}
    </div>
  );
}
```

## Schema Structure

The components expect transformation schemas to follow this structure:

```json
{
  "type": "object",
  "title": "Filter Configuration",
  "description": "Configure filter conditions",
  "properties": {
    "type": {
      "type": "string",
      "const": "filter"
    },
    "task_id": {
      "type": "string",
      "minLength": 1
    },
    "filter_condition": {
      "type": "string",
      "title": "Filter Condition",
      "description": "SQL-like filter condition",
      "minLength": 1
    },
    "columns": {
      "type": "array",
      "title": "Columns",
      "description": "Columns to apply filter on",
      "items": {
        "type": "string"
      }
    }
  },
  "required": ["type", "task_id", "filter_condition"]
}
```

## Field Types Supported

The form generator supports various field types:

- **String**: Regular text input
- **Number/Integer**: Numeric input with validation
- **Boolean**: Switch/toggle component
- **Enum**: Select dropdown
- **Array**: Dynamic list with add/remove functionality
- **Object**: Key-value pairs or nested objects
- **Textarea**: Multi-line text input
- **Password**: Password input with show/hide toggle

## Customization

### Custom Field Rendering

You can extend the `TransformationFormFields` component to add custom field types:

```tsx
// In TransformationFormFields.tsx
case 'custom-type':
  return (
    <FormItem>
      {/* Your custom field implementation */}
    </FormItem>
  );
```

### Custom Validation

Extend the schema generator to add custom validation rules:

```tsx
// In transformationFormSchema.ts
if (field.customValidation) {
  fieldSchema = fieldSchema.refine(
    (value) => customValidationFunction(value),
    { message: 'Custom validation failed' }
  );
}
```

## Integration with React Flow

For React Flow integration, you can use the components like this:

```tsx
import { PipelineNodeConfigurator } from '@/components/pipeline';
import ReactFlow, { Node, Edge } from 'reactflow';

function FlowEditor() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const handleNodeUpdate = (nodeId: string, data: any) => {
    setNodes(nodes => 
      nodes.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          onNodeClick={onNodeClick}
          // ... other ReactFlow props
        />
      </div>
      
      {selectedNode && (
        <div style={{ width: '400px', borderLeft: '1px solid #ccc' }}>
          <PipelineNodeConfigurator
            selectedNode={selectedNode}
            onNodeUpdate={handleNodeUpdate}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      )}
    </div>
  );
}
```

## Error Handling

The components include comprehensive error handling:

- Schema validation errors
- Missing transformation types
- Invalid field values
- Network/loading errors

All errors are displayed with user-friendly messages and appropriate fallback UI.

## Testing

To test the components:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TransformationFormWrapper } from '@/components/pipeline';

test('renders transformation form', () => {
  render(
    <TransformationFormWrapper
      transformationType="filter"
      selectedEngineType="pyspark"
      onSave={jest.fn()}
    />
  );
  
  expect(screen.getByText('Configure Filter')).toBeInTheDocument();
});
```

## Dependencies

The components depend on:

- React Hook Form for form management
- Zod for schema validation
- Shadcn/ui components for UI elements
- Lucide React for icons
- Sonner for toast notifications

Make sure these are installed in your project.