import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ConditionalSchemaRenderer } from './ConditionalSchemaRenderer';
import { generateDynamicZodSchema } from './dynamicZodSchema';
import { SchemaProperty } from './schemaUtils';

// Example schema that demonstrates conditional fields
const exampleSchema: SchemaProperty = {
  type: 'object',
  properties: {
    source_type: {
      type: 'string',
      title: 'Source Type',
      description: 'Select the type of data source',
      enum: ['File', 'Relational', 'API'],
      default: 'File'
    },
    name: {
      type: 'string',
      title: 'Source Name',
      description: 'Name of the data source'
    }
  },
  required: ['source_type', 'name'],
  allOf: [
    {
      if: {
        properties: {
          source_type: {
            const: 'File'
          }
        }
      },
      then: {
        properties: {
          file_name: {
            type: 'string',
            title: 'File Name',
            description: 'Name of the file to read'
          },
          file_format: {
            type: 'string',
            title: 'File Format',
            enum: ['CSV', 'JSON', 'Parquet'],
            default: 'CSV'
          }
        },
        required: ['file_name']
      }
    },
    {
      if: {
        properties: {
          source_type: {
            const: 'Relational'
          }
        }
      },
      then: {
        properties: {
          table_name: {
            type: 'string',
            title: 'Table Name',
            description: 'Name of the database table'
          },
          connection_string: {
            type: 'string',
            title: 'Connection String',
            description: 'Database connection string'
          }
        },
        required: ['table_name', 'connection_string']
      }
    },
    {
      if: {
        properties: {
          source_type: {
            const: 'API'
          }
        }
      },
      then: {
        properties: {
          api_url: {
            type: 'string',
            title: 'API URL',
            description: 'URL of the API endpoint'
          },
          api_key: {
            type: 'string',
            title: 'API Key',
            description: 'Authentication key for the API'
          },
          headers: {
            type: 'object',
            title: 'Headers',
            description: 'Additional headers to send with the request'
          }
        },
        required: ['api_url']
      }
    }
  ]
};

export const ConditionalFormExample: React.FC = () => {
  const form = useForm({
    resolver: zodResolver(generateDynamicZodSchema(exampleSchema)),
    defaultValues: {
      source_type: 'File',
      name: '',
    },
    mode: 'onChange',
  });

  const onSubmit = (data: any) => {
    console.log('Form submitted:', data);
    alert('Form submitted! Check console for data.');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Conditional Form Example</h2>
        <p className="text-sm text-muted-foreground">
          This form demonstrates conditional fields based on the selected source type:
        </p>
        <ul className="text-sm text-muted-foreground mt-2 ml-4 list-disc">
          <li><strong>File:</strong> Shows file_name and file_format fields</li>
          <li><strong>Relational:</strong> Shows table_name and connection_string fields</li>
          <li><strong>API:</strong> Shows api_url, api_key, and headers fields</li>
        </ul>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ConditionalSchemaRenderer schema={exampleSchema} />
          
          <div className="flex justify-end pt-4">
            <Button type="submit">
              Submit Form
            </Button>
          </div>
        </form>
      </Form>

      {/* Debug section */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium mb-2">Current Form Values:</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(form.watch(), null, 2)}
        </pre>
      </div>
    </div>
  );
};