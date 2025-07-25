import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { ConditionalSchemaRenderer } from './ConditionalSchemaRenderer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Example schemas
const exampleSchemas = {
  simple: {
    name: "Simple Form",
    schema: {
      "type": "object",
      "title": "User Registration",
      "properties": {
        "name": {
          "type": "string",
          "title": "Full Name"
        },
        "email": {
          "type": "string",
          "title": "Email Address",
          "format": "email"
        },
        "age": {
          "type": "number",
          "title": "Age",
          "minimum": 18,
          "maximum": 100
        },
        "country": {
          "type": "string",
          "title": "Country",
          "enum": ["USA", "Canada", "UK", "Germany", "France"]
        }
      },
      "required": ["name", "email"]
    }
  },
  database: {
    name: "Database Connection",
    schema: {
      "type": "object",
      "title": "Database Connection",
      "properties": {
        "name": {
          "type": "string",
          "title": "Connection Name"
        },
        "database_type": {
          "type": "string",
          "title": "Database Type",
          "enum": ["postgresql", "mysql", "mongodb", "redis"]
        }
      },
      "required": ["name", "database_type"],
      "allOf": [
        {
          "if": {
            "properties": {
              "database_type": {
                "const": "postgresql"
              }
            }
          },
          "then": {
            "properties": {
              "host": {
                "type": "string",
                "title": "Host"
              },
              "port": {
                "type": "number",
                "title": "Port",
                "default": 5432
              },
              "database": {
                "type": "string",
                "title": "Database Name"
              },
              "username": {
                "type": "string",
                "title": "Username"
              },
              "password": {
                "type": "string",
                "title": "Password"
              },
              "ssl_mode": {
                "type": "string",
                "title": "SSL Mode",
                "enum": ["disable", "require", "verify-ca", "verify-full"],
                "default": "disable"
              }
            },
            "required": ["host", "database", "username"]
          }
        },
        {
          "if": {
            "properties": {
              "database_type": {
                "const": "mysql"
              }
            }
          },
          "then": {
            "properties": {
              "host": {
                "type": "string",
                "title": "Host"
              },
              "port": {
                "type": "number",
                "title": "Port",
                "default": 3306
              },
              "database": {
                "type": "string",
                "title": "Database Name"
              },
              "username": {
                "type": "string",
                "title": "Username"
              },
              "password": {
                "type": "string",
                "title": "Password"
              }
            },
            "required": ["host", "database", "username"]
          }
        },
        {
          "if": {
            "properties": {
              "database_type": {
                "const": "mongodb"
              }
            }
          },
          "then": {
            "properties": {
              "connection_string": {
                "type": "string",
                "title": "MongoDB Connection String"
              },
              "database": {
                "type": "string",
                "title": "Database Name"
              },
              "collection": {
                "type": "string",
                "title": "Collection Name"
              }
            },
            "required": ["connection_string", "database"]
          }
        }
      ]
    }
  },
  repartition: {
    name: "Repartition (Nested allOf)",
    schema: {
      "type": "object",
      "title": "Repartition Transformation",
      "properties": {
        "name": {
          "type": "string",
          "title": "Transformation Name"
        },
        "repartition_type": {
          "type": "string",
          "title": "Repartition Type",
          "enum": ["coalesce", "repartition", "hash_repartition", "repartition_by_range"]
        }
      },
      "required": ["name", "repartition_type"],
      "allOf": [
        {
          "if": {
            "properties": {
              "repartition_type": {
                "enum": ["coalesce", "repartition"]
              }
            }
          },
          "then": {
            "properties": {
              "repartition_value": {
                "type": "integer",
                "title": "Number of Partitions",
                "minimum": 1
              }
            },
            "required": ["repartition_value"]
          }
        },
        {
          "if": {
            "properties": {
              "repartition_type": {
                "enum": ["hash_repartition", "repartition_by_range"]
              }
            }
          },
          "then": {
            "properties": {
              "override_partition": {
                "type": "string",
                "title": "Override Partition Count",
                "enum": ["yes", "no"],
                "default": "no"
              },
              "repartition_expression": {
                "type": "array",
                "title": "Repartition Expressions",
                "items": {
                  "type": "object",
                  "properties": {
                    "expression": {
                      "type": "string",
                      "title": "Expression"
                    },
                    "sort_order": {
                      "type": "string",
                      "title": "Sort Order",
                      "enum": ["asc", "desc"],
                      "default": "asc"
                    }
                  },
                  "required": ["expression"]
                }
              }
            },
            "allOf": [
              {
                "if": {
                  "properties": {
                    "override_partition": {
                      "const": "yes"
                    }
                  }
                },
                "then": {
                  "properties": {
                    "repartition_value": {
                      "type": "integer",
                      "title": "Number of Partitions",
                      "minimum": 1
                    }
                  },
                  "required": ["repartition_value"]
                }
              }
            ]
          }
        }
      ]
    }
  }
};

export const SchemaExamplesDemo: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState<string>('');
  const [currentSchema, setCurrentSchema] = useState<any>(null);

  const form = useForm({
    defaultValues: {}
  });

  const handleExampleChange = (exampleKey: string) => {
    setSelectedExample(exampleKey);
    const example = exampleSchemas[exampleKey as keyof typeof exampleSchemas];
    if (example) {
      setCurrentSchema(example.schema);
      form.reset({}); // Reset form when changing examples
    }
  };

  const onSubmit = (data: any) => {
    console.log('Form submitted:', data);
    alert('Form submitted! Check console for data.');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Custom Schema Examples</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select an Example:</label>
        <Select onValueChange={handleExampleChange} value={selectedExample}>
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="Choose an example schema..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="simple">Simple Form (Basic Fields)</SelectItem>
            <SelectItem value="database">Database Connection (Conditional)</SelectItem>
            <SelectItem value="repartition">Repartition (Nested allOf)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {currentSchema && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Generated Form</h2>
            <div className="border rounded-lg p-4 bg-white">
              <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <ConditionalSchemaRenderer 
                    schema={currentSchema}
                    twoColumnLayout={false}
                    useTabs={false}
                    sourceColumns={[
                      { name: 'id', dataType: 'integer' },
                      { name: 'name', dataType: 'string' },
                      { name: 'email', dataType: 'string' },
                      { name: 'created_at', dataType: 'timestamp' }
                    ]}
                  />
                  
                  <Button type="submit" className="w-full">
                    Submit Form
                  </Button>
                </form>
              </FormProvider>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Current Values & Schema</h2>
            
            {/* Current Form Values */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Form Values:</h3>
              <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                {JSON.stringify(form.watch(), null, 2)}
              </pre>
            </div>

            {/* Schema JSON */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-medium mb-2">Schema JSON:</h3>
              <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-60">
                {JSON.stringify(currentSchema, null, 2)}
              </pre>
            </div>

            {/* Instructions */}
            <div className="border rounded-lg p-4 bg-green-50">
              <h3 className="font-medium mb-2">Instructions:</h3>
              <div className="text-sm space-y-1">
                <p>• Watch how fields appear/disappear based on your selections</p>
                <p>• Notice the required field indicators (*) change dynamically</p>
                <p>• Try different values to see conditional logic in action</p>
                <p>• Copy the schema JSON to use in your custom schema feature</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!currentSchema && (
        <div className="text-center py-12 text-gray-500">
          <p>Select an example above to see the dynamic form generation in action!</p>
        </div>
      )}
    </div>
  );
};